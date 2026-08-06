import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { requireSupabaseAuth } from "@/lib/integrations/supabase/auth-middleware";

const SETTINGS_KEY = "admin_master_code";

/** Garante que o chamador é administrador. */
async function assertAdmin(context: { supabase: any; userId: string }) {
  const { data, error } = await context.supabase.rpc("has_role", {
    _user_id: context.userId,
    _role: "admin",
  });
  if (error) throw new Error("Não foi possível validar as permissões");
  if (!data) throw new Error("Acesso restrito a administradores");
}

/** Situação atual do código mestre (nunca devolve o código em si). */
export const getMasterCodeStatus = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context);
    const { readMasterCodeSettings } = await import("./master-code.server");
    const settings = await readMasterCodeSettings();
    return {
      isCustom: Boolean(settings?.hash),
      updatedAt: settings?.updated_at ?? null,
      hasEnvFallback: Boolean(process.env["ADMIN_MASTER_CODE"]),
    };
  });

/** Revela o código mestre em texto (somente administradores). */
export const revealMasterCode = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context);
    const { revealMasterCodeValue } = await import("./master-code.server");
    return await revealMasterCodeValue();
  });

/** Gera e salva um novo código mestre aleatório, devolvendo-o uma vez. */
export const generateMasterCode = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context);
    const { generateCodeValue, writeMasterCode } = await import("./master-code.server");
    const code = generateCodeValue();
    await writeMasterCode(code, context.userId);
    await context.supabase.from("admin_logs").insert({
      actor_id: context.userId,
      target_user_id: context.userId,
      action: "master_code_generated",
      details: { method: "panel_generate" },
    });
    return { code, updatedAt: new Date().toISOString() };
  });

/** Confere o código mestre informado antes de uma ação crítica. */
export const verifyMasterCode = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ code: z.string().min(4).max(80) }).parse(input))
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    const { checkMasterCode } = await import("./master-code.server");
    const valid = await checkMasterCode(data.code);
    if (!valid) throw new Error("Código mestre incorreto.");
    return { valid: true };
  });

const resetSchema = z.object({
  currentCode: z.string().min(4).max(80),
  newCode: z
    .string()
    .min(8, "Use pelo menos 8 caracteres")
    .max(80)
    .regex(/^[A-Za-z0-9!@#$%*_-]+$/, "Use apenas letras, números e !@#$%*_-"),
  confirmCode: z.string().min(8).max(80),
  password: z.string().min(6).max(72),
  confirmation: z.string(),
});

/**
 * Redefine o código mestre com verificação extra: código atual + senha da
 * conta do administrador + frase de confirmação. O novo valor é gravado
 * apenas como hash seguro (nunca em texto puro).
 */
export const resetMasterCode = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => resetSchema.parse(input))
  .handler(async ({ data, context }) => {
    await assertAdmin(context);

    if (data.newCode !== data.confirmCode) {
      throw new Error("O novo código e a confirmação não são iguais.");
    }
    if (data.confirmation.trim().toUpperCase() !== "REDEFINIR") {
      throw new Error('Digite REDEFINIR para confirmar a operação.');
    }

    const { checkMasterCode, writeMasterCode, verifyAdminPassword } = await import(
      "./master-code.server"
    );

    const currentOk = await checkMasterCode(data.currentCode);
    if (!currentOk) throw new Error("O código mestre atual está incorreto.");

    if (await checkMasterCode(data.newCode)) {
      throw new Error("O novo código precisa ser diferente do atual.");
    }

    const email = (context.claims as any)?.email as string | undefined;
    if (!email) throw new Error("Não foi possível identificar o e-mail do administrador.");

    const passwordOk = await verifyAdminPassword(email, data.password);
    if (!passwordOk) throw new Error("Senha da conta administrativa incorreta.");

    await writeMasterCode(data.newCode, context.userId);

    await context.supabase.from("admin_logs").insert({
      actor_id: context.userId,
      target_user_id: context.userId,
      action: "master_code_reset",
      details: { method: "panel", verified: ["master_code", "password", "phrase"] },
    });

    return { ok: true, updatedAt: new Date().toISOString() };
  });
