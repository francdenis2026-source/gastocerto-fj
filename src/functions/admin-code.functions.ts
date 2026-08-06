import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { requireSupabaseAuth } from "@/lib/integrations/supabase/auth-middleware";

/**
 * Acesso administrativo por código secreto único com logs e expiração.
 */
export const adminAccessByCode = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => z.object({ code: z.string() }).parse(input))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { getRequest } = await import("@tanstack/react-start/server");
    const { auditLog } = await import("@/lib/admin-guard.server");
    const request = getRequest();

    const code = data.code.trim().toUpperCase();

    // Primeiro buscamos o código sem o filtro de expiração para dar uma mensagem melhor
    const { data: accessCode, error } = await supabaseAdmin
      .from("admin_access_codes")
      .select("*")
      .eq("code", code)
      .is("revoked_at", null)
      .maybeSingle();

    if (error || !accessCode) {
      throw new Error("Código administrativo inválido ou revogado.");
    }

    if (new Date(accessCode.expires_at) < new Date()) {
      throw new Error(`O código ${code} expirou em ${new Date(accessCode.expires_at).toLocaleDateString()}.`);
    }

    if (accessCode.usage_count >= accessCode.max_uses) {
      throw new Error("Este código atingiu o limite máximo de utilizações.");
    }

    const userAgent = request.headers.get("user-agent");
    const forwarded = request.headers.get("x-forwarded-for");
    const ip = forwarded ? forwarded.split(",")[0] : null;

    // Log de uso detalhado
    await supabaseAdmin.from("admin_access_logs").insert({
      code_id: accessCode.id,
      ip_address: ip,
      user_agent: userAgent,
      success: true,
    });

    // Auditoria para o painel administrativo (usando o id do código como alvo se possível, ou apenas o log)
    // Nota: Como não temos um userId autenticado aqui, passamos um contexto mockado se auditLog exigir
    // Mas no momento auditLog exige context.userId. Vamos ignorar auditoria global se não houver sessão, 
    // ou apenas usar o log de acesso já criado.

    await supabaseAdmin
      .from("admin_access_codes")
      .update({ usage_count: accessCode.usage_count + 1 })
      .eq("id", accessCode.id);

    return { success: true, label: accessCode.label };
  });

/**
 * Lista todos os códigos de acesso (apenas equipe).
 */
export const listAdminAccessCodes = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { assertStaffCtx } = await import("@/lib/admin-guard.server");
    await assertStaffCtx(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data, error } = await supabaseAdmin
      .from("admin_access_codes")
      .select(`*, admin_access_logs(count)`)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data;
  });

/**
 * Gera um novo código de acesso.
 */
export const createAdminAccessCode = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z
      .object({
        label: z.string().min(3),
        expiresInDays: z.number().min(1).max(365),
        maxUses: z.number().min(1).max(1000),
      })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    const { assertAdminCtx, auditLog } = await import("@/lib/admin-guard.server");
    await assertAdminCtx(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { randomBytes } = await import("crypto");

    const random = randomBytes(5).toString("hex").slice(0, 8).toUpperCase();
    const code = `ADM-${random}`;

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + data.expiresInDays);
    expiresAt.setHours(23, 59, 59, 999); // Garante validade até o fim do último dia

    const { data: newCode, error } = await supabaseAdmin
      .from("admin_access_codes")
      .insert({
        code,
        label: data.label,
        expires_at: expiresAt.toISOString(),
        max_uses: data.maxUses,
        created_by: context.userId,
      })
      .select()
      .single();

    if (error) throw new Error(error.message || "Não foi possível gerar o código.");

    try {
      await auditLog(context, "generate_code", {
        code,
        label: data.label,
        expires_at: expiresAt.toISOString(),
        max_uses: data.maxUses,
      });
    } catch (auditError) {
      console.error("[admin-code] falha ao auditar", auditError);
    }

    return newCode;
  });

/**
 * Revoga um código.
 */
export const revokeAdminAccessCode = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ id: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    const { assertAdminCtx, auditLog } = await import("@/lib/admin-guard.server");
    await assertAdminCtx(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { data: revoked, error } = await supabaseAdmin
      .from("admin_access_codes")
      .update({ revoked_at: new Date().toISOString() })
      .eq("id", data.id)
      .select("code, label")
      .maybeSingle();

    if (error) throw error;

    await auditLog(context, "admin_code_revoked", {
      code: revoked?.code ?? null,
      label: revoked?.label ?? null,
    });

    return { success: true };
  });

/**
 * Busca logs de uso.
 */
export const getAdminAccessLogs = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ codeId: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    const { assertStaffCtx } = await import("@/lib/admin-guard.server");
    await assertStaffCtx(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: logs, error } = await supabaseAdmin
      .from("admin_access_logs")
      .select("*")
      .eq("code_id", data.codeId)
      .order("used_at", { ascending: false });

    if (error) throw error;
    return logs;
  });
