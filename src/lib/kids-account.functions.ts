import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { kidCodeToEmail, kidPassword, normalizeKidCode } from "@/lib/kids-account";

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
});

/**
 * Cria (ou atualiza) o acesso próprio da criança. Só o responsável dono do
 * cadastro consegue executar, pois o dependente é lido com a sessão dele.
 */
export const saveKidAccess = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => saveSchema.parse(data))
  .handler(async ({ data, context }) => {
    const { data: dependent, error } = await context.supabase
      .from("dependents")
      .select("id, name, kid_user_id")
      .eq("id", data.dependentId)
      .maybeSingle();

    if (error) throw new Error(error.message);
    if (!dependent) throw new Error("Dependente não encontrado.");

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const email = kidCodeToEmail(data.code);
    const password = kidPassword(data.code, data.pin);
    const metadata = { full_name: dependent.name, is_kid: true };

    let kidUserId = (dependent as { kid_user_id: string | null }).kid_user_id;

    if (kidUserId) {
      const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(kidUserId, {
        email,
        password,
        email_confirm: true,
        user_metadata: metadata,
      });
      if (updateError) throw new Error(traduzir(updateError.message));
    } else {
      const { data: created, error: createError } = await supabaseAdmin.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: metadata,
      });
      if (createError || !created?.user) throw new Error(traduzir(createError?.message ?? "Falha ao criar o acesso."));
      kidUserId = created.user.id;
    }

    const { error: linkError } = await context.supabase
      .from("dependents")
      .update({
        kid_login_code: data.code,
        kid_user_id: kidUserId,
        kids_mode_enabled: true,
      } as never)
      .eq("id", data.dependentId);

    if (linkError) throw new Error(linkError.message);

    return { code: data.code, email };
  });

/** Remove o acesso independente da criança (o cadastro do dependente permanece). */
export const revokeKidAccess = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => z.object({ dependentId: z.string().uuid() }).parse(data))
  .handler(async ({ data, context }) => {
    const { data: dependent, error } = await context.supabase
      .from("dependents")
      .select("id, kid_user_id")
      .eq("id", data.dependentId)
      .maybeSingle();

    if (error) throw new Error(error.message);
    if (!dependent) throw new Error("Dependente não encontrado.");

    const kidUserId = (dependent as { kid_user_id: string | null }).kid_user_id;
    if (kidUserId) {
      const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
      await supabaseAdmin.auth.admin.deleteUser(kidUserId).catch(() => undefined);
    }

    const { error: clearError } = await context.supabase
      .from("dependents")
      .update({ kid_login_code: null, kid_user_id: null } as never)
      .eq("id", data.dependentId);

    if (clearError) throw new Error(clearError.message);
    return { ok: true };
  });

function traduzir(message: string): string {
  if (/already been registered|already exists|duplicate/i.test(message)) {
    return "Este código já está em uso. Escolha outro.";
  }
  return message;
}
