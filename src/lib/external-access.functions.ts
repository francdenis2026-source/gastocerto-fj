import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/lib/integrations/supabase/auth-middleware";

const createSchema = z.object({
  label: z.string().min(2).max(50),
  password: z.string().min(4).max(30),
  expiresDays: z.number().min(1).max(365).default(7),
  permissions: z.object({
    totals: z.boolean(),
    charts: z.boolean(),
    categories: z.boolean(),
    transactions: z.boolean(),
  }),
});

export const createExternalCode = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) => createSchema.parse(data))
  .handler(async ({ data, context }) => {
    const { hashSharePassword, generateShareToken } = await import("./share-hash.server");
    const { hash, salt } = await hashSharePassword(data.password);
    const accessCode = generateShareToken().slice(0, 12).toUpperCase();
    
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + data.expiresDays);

    const { data: row, error } = await (context.supabase as any)
      .from("external_access_codes")
      .insert({
        user_id: context.userId,
        label: data.label,
        access_code: accessCode,
        password_hash: hash,
        password_salt: salt,
        permissions: data.permissions,
        expires_at: expiresAt.toISOString(),
      })
      .select()
      .single();

    if (error) throw error;
    return row;
  });

export const listExternalCodes = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await (context.supabase as any)
      .from("external_access_codes")
      .select("*")
      .eq("user_id", context.userId)
      .is("revoked_at", null)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data;
  });

export const revokeExternalCode = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) => z.object({ id: z.string() }).parse(data))
  .handler(async ({ data, context }) => {
    const { error } = await (context.supabase as any)
      .from("external_access_codes")
      .update({ revoked_at: new Date().toISOString() })
      .eq("id", data.id)
      .eq("user_id", context.userId);

    if (error) throw error;
    return { success: true };
  });

export const updateExternalCodeExpiry = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) => z.object({ id: z.string(), expiresDays: z.number().min(1).max(365) }).parse(data))
  .handler(async ({ data, context }) => {
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + data.expiresDays);

    const { error } = await (context.supabase as any)
      .from("external_access_codes")
      .update({ expires_at: expiresAt.toISOString(), revoked_at: null })
      .eq("id", data.id)
      .eq("user_id", context.userId);

    if (error) throw error;
    return { success: true, expires_at: expiresAt.toISOString() };
  });

export const getExternalAccessLogs = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) => z.object({ codeId: z.string() }).parse(data))
  .handler(async ({ data, context }) => {
    const { data: logs, error } = await (context.supabase as any)
      .from("external_access_logs")
      .select("*")
      .eq("code_id", data.codeId)
      .order("created_at", { ascending: false })
      .limit(50);

    if (error) throw error;
    return logs;
  });
