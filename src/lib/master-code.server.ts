import { createHash, randomBytes, timingSafeEqual } from "crypto";
import { createClient } from "@supabase/supabase-js";

const SETTINGS_KEY = "admin_master_code";

export type MasterCodeSettings = {
  hash?: string;
  salt?: string;
  /** Cópia legível para exibição no painel do administrador. */
  plain?: string;
  updated_at?: string;
  updated_by?: string;
};

/** Gera um código mestre aleatório e fácil de digitar. */
export function generateCodeValue(): string {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const bytes = randomBytes(12);
  let out = "";
  for (let i = 0; i < 12; i += 1) {
    if (i > 0 && i % 4 === 0) out += "-";
    out += alphabet[bytes[i]! % alphabet.length];
  }
  return out;
}

/** Código mestre em texto para exibição (banco ou segredo de ambiente). */
export async function revealMasterCodeValue(): Promise<{ code: string | null; source: "custom" | "env" | "none" }> {
  const settings = await readMasterCodeSettings();
  if (settings?.plain) return { code: settings.plain, source: "custom" };
  if (settings?.hash) return { code: null, source: "custom" };
  const envCode = (process.env["ADMIN_MASTER_CODE"] ?? "").trim();
  if (envCode) return { code: envCode, source: "env" };
  return { code: null, source: "none" };
}

function hashCode(code: string, salt: string) {
  return createHash("sha256").update(`${salt}:${code}`).digest("hex");
}

function safeEqual(a: string, b: string) {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) return false;
  return timingSafeEqual(bufA, bufB);
}

/** Lê o registro do código mestre em app_settings. */
export async function readMasterCodeSettings(): Promise<MasterCodeSettings | null> {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data } = await supabaseAdmin
    .from("app_settings")
    .select("value, updated_at")
    .eq("key", SETTINGS_KEY)
    .maybeSingle();
  if (!data) return null;
  const value = (data.value ?? {}) as MasterCodeSettings;
  return { ...value, updated_at: value.updated_at ?? (data as any).updated_at };
}

/**
 * Confere o código informado. Prioriza o hash salvo no banco; se ainda não
 * houver redefinição, valida contra o segredo de ambiente ADMIN_MASTER_CODE.
 */
export async function checkMasterCode(code: string): Promise<boolean> {
  const candidate = code.trim();
  if (!candidate) return false;

  const settings = await readMasterCodeSettings();
  if (settings?.hash && settings.salt) {
    return safeEqual(hashCode(candidate, settings.salt), settings.hash);
  }

  const envCode = (process.env["ADMIN_MASTER_CODE"] ?? "").trim();
  if (!envCode) return false;
  return safeEqual(candidate, envCode);
}

/** Grava o novo código mestre apenas como hash + salt aleatório. */
export async function writeMasterCode(newCode: string, actorId: string) {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const salt = randomBytes(16).toString("hex");
  const payload: MasterCodeSettings = {
    hash: hashCode(newCode.trim(), salt),
    salt,
    plain: newCode.trim(),
    updated_at: new Date().toISOString(),
    updated_by: actorId,
  };
  const { error } = await supabaseAdmin
    .from("app_settings")
    .upsert({ key: SETTINGS_KEY, value: payload as any, updated_by: actorId }, { onConflict: "key" });
  if (error) throw new Error("Não foi possível salvar o novo código mestre.");
}

/** Reautenticação: confirma a senha da conta administrativa. */
export async function verifyAdminPassword(email: string, password: string): Promise<boolean> {
  const client = createClient(
    process.env["SUPABASE_URL"]!,
    process.env["SUPABASE_PUBLISHABLE_KEY"] ?? process.env["SUPABASE_ANON_KEY"]!,
    { auth: { storage: undefined, persistSession: false, autoRefreshToken: false } },
  );
  const { data, error } = await client.auth.signInWithPassword({ email, password });
  if (error || !data.session) return false;
  await client.auth.signOut().catch(() => undefined);
  return true;
}
