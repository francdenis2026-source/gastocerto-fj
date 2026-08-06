import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export const deleteKidAccount = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => z.object({
    dependentId: z.string().uuid()
  }).parse(data))
  .handler(async ({ data, context }) => {
    // Primeiro pegamos os dados para deletar o usuário do auth se existir
    const { data: kid, error: fetchError } = await context.supabase
      .from("dependents")
      .select("kid_user_id, name")
      .eq("id", data.dependentId)
      .single();

    if (fetchError) throw fetchError;

    if (kid.kid_user_id) {
      const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
      await supabaseAdmin.auth.admin.deleteUser(kid.kid_user_id).catch(console.error);
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
