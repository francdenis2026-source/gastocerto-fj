import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { kidCodeToEmail, kidPassword, normalizeKidCode } from "@/lib/kids-account";
import { KID_LOCK_MINUTES_SERVER, KID_MAX_ATTEMPTS_SERVER, traduzirErroKid } from "@/lib/kids-account.server";

const saveSchema = z.object({
  dependentId: z.string().uuid(),
  code: z
    .string()
    .transform((value) => normalizeKidCode(value))
    .refine((value) => value.length >= 4, "Código muito curto"),
  pin: z
    .string()
    .transform((value) => value.replace(/\D/g, ""))
    .refine((value) => value.length >= 4 && value.length <= 6, "A senha deve ter 4 a 6 dígitos"),
  expiresDays: z.number().min(1).max(3650).optional().default(365),
  reason: z.enum(["created", "updated", "rotated", "pin_customized"]).optional().default("updated"),
  autoUpgradeDays: z.number().min(30).max(3650).optional().default(365),
});

export const updateKidUpgradeConfig = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => z.object({
    dependentId: z.string().uuid(),
    days: z.number().min(30).max(3650)
  }).parse(data))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase
      .from("dependents")
      .update({ kid_auto_upgrade_days: data.days } as any)
      .eq("id", data.dependentId);

    if (error) throw new Error(error.message);

    await context.supabase.from("kid_access_audit" as any).insert({
      user_id: context.userId,
      dependent_id: data.dependentId,
      action: "upgrade_config",
      detail: { auto_upgrade_days: data.days },
    } as any);

    return { ok: true };
  });

/** Cria, troca ou rotaciona o acesso próprio da criança (código + senha). */
export const saveKidAccess = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => saveSchema.parse(data))
  .handler(async ({ data, context }) => {
    const { data: dependent, error } = await context.supabase
      .from("dependents")
      .select("id, name, kid_user_id, kid_login_code")
      .eq("id", data.dependentId)
      .maybeSingle();

    if (error) throw new Error(error.message);
    if (!dependent) throw new Error("Dependente não encontrado.");

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const email = kidCodeToEmail(data.code);
    const password = kidPassword(data.code, data.pin);
    const metadata = { full_name: dependent.name, is_kid: true };
    const row = dependent as { kid_user_id: string | null; kid_login_code: string | null; name: string };

    let kidUserId = row.kid_user_id;

    if (kidUserId) {
      const { data: existingUser } = await supabaseAdmin.auth.admin.getUserById(kidUserId);
      
      if (!existingUser?.user) {
        // User disappeared from Auth but exists in DB record, let's re-create
        const { data: created, error: createError } = await supabaseAdmin.auth.admin.createUser({
          email,
          password,
          email_confirm: true,
          user_metadata: metadata,
        });
        if (createError || !created?.user) {
          throw new Error(traduzirErroKid(createError?.message ?? "Falha ao criar o acesso."));
        }
        kidUserId = created.user.id;
      } else {
        const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(kidUserId, {
          email,
          password,
          email_confirm: true,
          user_metadata: metadata,
        });
        if (updateError) throw new Error(traduzirErroKid(updateError.message));
      }
    } else {
      const { data: created, error: createError } = await supabaseAdmin.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: metadata,
      });
      if (createError || !created?.user) {
        throw new Error(traduzirErroKid(createError?.message ?? "Falha ao criar o acesso."));
      }
      kidUserId = created.user.id;
    }

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + data.expiresDays);

    const { error: linkError } = await context.supabase
      .from("dependents")
      .update({
        kid_login_code: data.code,
        kid_user_id: kidUserId,
        kids_mode_enabled: true,
        kid_code_expires_at: expiresAt.toISOString(),
        pin_code: data.pin,
      } as never)
      .eq("id", data.dependentId);

    if (linkError) throw new Error(linkError.message);

    // Libera o bloqueio antigo e zera as tentativas do novo código.
    await supabaseAdmin.from("kid_login_attempts" as never).upsert(
      { code: data.code, attempts: 0, locked_until: null, updated_at: new Date().toISOString() } as never,
      { onConflict: "code" } as never,
    );

    await context.supabase.from("kid_access_audit" as never).insert({
      user_id: context.userId,
      dependent_id: data.dependentId,
      dependent_name: row.name,
      action: row.kid_login_code ? data.reason : "created",
      code: data.code,
      expires_at: expiresAt.toISOString(),
      detail: { previous_code: row.kid_login_code, expires_days: data.expiresDays },
    } as never);

    return { code: data.code, email, expiresAt: expiresAt.toISOString() };
  });

/** Remove o acesso independente da criança e registra na auditoria. */
export const revokeKidAccess = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => z.object({ dependentId: z.string().uuid() }).parse(data))
  .handler(async ({ data, context }) => {
    const { data: dependent, error } = await context.supabase
      .from("dependents")
      .select("id, name, kid_user_id, kid_login_code")
      .eq("id", data.dependentId)
      .maybeSingle();

    if (error) throw new Error(error.message);
    if (!dependent) throw new Error("Dependente não encontrado.");

    const row = dependent as { kid_user_id: string | null; kid_login_code: string | null; name: string };

    if (row.kid_user_id) {
      const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
      await supabaseAdmin.auth.admin.deleteUser(row.kid_user_id).catch(() => undefined);
    }

    const { error: clearError } = await context.supabase
      .from("dependents")
      .update({ kid_login_code: null, kid_user_id: null, kid_code_expires_at: null, pin_code: null } as never)
      .eq("id", data.dependentId);

    if (clearError) throw new Error(clearError.message);

    await context.supabase.from("kid_access_audit" as never).insert({
      user_id: context.userId,
      dependent_id: data.dependentId,
      dependent_name: row.name,
      action: "revoked",
      code: row.kid_login_code,
      detail: {},
    } as never);

    return { ok: true };
  });

/** Salva o que a criança pode ver no painel dela. */
export const saveKidVisibility = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) =>
    z
      .object({
        dependentId: z.string().uuid(),
        visibility: z.object({
          balance: z.boolean(),
          income: z.boolean(),
          goals: z.boolean(),
          history: z.boolean(),
          siblings: z.boolean(),
        }),
      })
      .parse(data),
  )
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase
      .from("dependents")
      .update({ kid_visibility: data.visibility } as never)
      .eq("id", data.dependentId);
    if (error) throw new Error(error.message);

    await context.supabase.from("kid_access_audit" as never).insert({
      user_id: context.userId,
      dependent_id: data.dependentId,
      action: "visibility",
      detail: data.visibility,
    } as never);

    return { ok: true };
  });

/** Consulta pública: informa se o código da criança está bloqueado agora. */
export const checkKidLock = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) =>
    z.object({ code: z.string().max(20).transform((value) => normalizeKidCode(value)) }).parse(data),
  )
  .handler(async ({ data }) => {
    if (!data.code) return { locked: false, secondsLeft: 0, remaining: KID_MAX_ATTEMPTS_SERVER };
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: row } = await supabaseAdmin
      .from("kid_login_attempts" as never)
      .select("attempts, locked_until")
      .eq("code", data.code)
      .maybeSingle();

    const record = row as { attempts: number; locked_until: string | null } | null;
    if (!record) return { locked: false, secondsLeft: 0, remaining: KID_MAX_ATTEMPTS_SERVER };

    const lockedUntil = record.locked_until ? new Date(record.locked_until).getTime() : 0;
    const secondsLeft = lockedUntil > Date.now() ? Math.ceil((lockedUntil - Date.now()) / 1000) : 0;
    return {
      locked: secondsLeft > 0,
      secondsLeft,
      remaining: Math.max(0, KID_MAX_ATTEMPTS_SERVER - (record.attempts ?? 0)),
    };
  });

/** Registra o resultado da tentativa de login da criança e aplica o bloqueio. */
export const registerKidAttempt = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) =>
    z
      .object({
        code: z.string().max(20).transform((value) => normalizeKidCode(value)),
        success: z.boolean(),
      })
      .parse(data),
  )
  .handler(async ({ data }) => {
    if (!data.code) return { locked: false, secondsLeft: 0, remaining: KID_MAX_ATTEMPTS_SERVER };
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    if (data.success) {
      await supabaseAdmin.from("kid_login_attempts" as never).upsert(
        { code: data.code, attempts: 0, locked_until: null, updated_at: new Date().toISOString() } as never,
        { onConflict: "code" } as never,
      );
      await supabaseAdmin
        .from("dependents")
        .update({ kid_last_login_at: new Date().toISOString() } as never)
        .eq("kid_login_code", data.code);
      return { locked: false, secondsLeft: 0, remaining: KID_MAX_ATTEMPTS_SERVER };
    }

    const { data: row } = await supabaseAdmin
      .from("kid_login_attempts" as never)
      .select("attempts")
      .eq("code", data.code)
      .maybeSingle();

    const attempts = ((row as { attempts: number } | null)?.attempts ?? 0) + 1;
    const shouldLock = attempts >= KID_MAX_ATTEMPTS_SERVER;
    const lockedUntil = shouldLock
      ? new Date(Date.now() + KID_LOCK_MINUTES_SERVER * 60_000).toISOString()
      : null;

    await supabaseAdmin.from("kid_login_attempts" as never).upsert(
      {
        code: data.code,
        attempts: shouldLock ? 0 : attempts,
        locked_until: lockedUntil,
        last_attempt_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      } as never,
      { onConflict: "code" } as never,
    );

    return {
      locked: shouldLock,
      secondsLeft: shouldLock ? KID_LOCK_MINUTES_SERVER * 60 : 0,
      remaining: shouldLock ? 0 : Math.max(0, KID_MAX_ATTEMPTS_SERVER - attempts),
    };
  });

export const blockKidSession = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => z.object({ sessionId: z.string().uuid() }).parse(data))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase.from("kid_session_logs" as never).update({ status: 'blocked' } as never).eq("id", data.sessionId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const getKidSessions = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => z.object({ dependentId: z.string().uuid() }).parse(data))
  .handler(async ({ data, context }) => {
    const { data: sessions, error } = await context.supabase
      .from("kid_session_logs" as never)
      .select("*")
      .eq("dependent_id", data.dependentId)
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return sessions;
  });

export const updateKidsSecuritySettings = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) =>
    z
      .object({
        notifications: z.object({
          failed_login: z.boolean(),
          code_revoked: z.boolean(),
          new_session: z.boolean(),
        }),
      })
      .parse(data),
  )
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase
      .from("profiles")
      .update({ kids_security_notifications: data.notifications } as any)
      .eq("id", context.userId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const updateKidNotificationPrefs = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({
    channels: z.object({
      email: z.boolean(),
      push: z.boolean(),
      whatsapp: z.boolean(),
    }),
    frequency: z.enum(["daily", "weekly", "instant"]),
    expiryWarningDays: z.number().min(1).max(30),
  }).parse(d))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase
      .from("profiles")
      .update({ 
        kid_notification_prefs: data 
      } as any)
      .eq("id", context.userId);
    if (error) throw error;
    return { ok: true };
  });

export const deleteKidAccount = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => z.object({
    dependentId: z.string().uuid()
  }).parse(data))
  .handler(async ({ data, context }) => {
    const { data: kid, error: fetchError } = await context.supabase
      .from("dependents")
      .select("kid_user_id, name")
      .eq("id", data.dependentId)
      .single();

    if (fetchError) throw fetchError;

    if (kid.kid_user_id) {
      const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
      await supabaseAdmin.auth.admin.deleteUser(kid.kid_user_id).catch(() => undefined);
    }

    const { error: deleteError } = await context.supabase
      .from("dependents")
      .delete()
      .eq("id", data.dependentId);

    if (deleteError) throw deleteError;

    await context.supabase.from("kid_access_audit" as any).insert({
      user_id: context.userId,
      dependent_id: data.dependentId,
      dependent_name: kid.name,
      action: "deleted",
      detail: { reason: "manual_delete" }
    } as any);

    return { ok: true };
  });

