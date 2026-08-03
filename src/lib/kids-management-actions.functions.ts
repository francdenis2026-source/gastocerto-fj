import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

/**
 * Espelho na área da criança.
 *
 * Lançamentos novos gravam a tag `origin:<id do lançamento do responsável>`, o
 * que permite localizar o espelho com precisão. Lançamentos antigos não têm
 * essa marca, então continuamos com o casamento por valor + `from_parent`
 * como plano B (apenas para registros legados).
 */
async function findMirrorIds(params: {
  parentTxId: string;
  kidUserId: string;
  amount: number;
}): Promise<string[]> {
  const { data: byOrigin } = await supabaseAdmin
    .from("transactions")
    .select("id")
    .eq("user_id", params.kidUserId)
    .contains("tags", [`origin:${params.parentTxId}`]);

  if (byOrigin && byOrigin.length > 0) return byOrigin.map((row) => row.id);

  const { data: legacy } = await supabaseAdmin
    .from("transactions")
    .select("id")
    .eq("user_id", params.kidUserId)
    .eq("amount", params.amount)
    .contains("tags", ["from_parent"])
    .order("created_at", { ascending: false })
    .limit(1);

  return (legacy ?? []).map((row) => row.id);
}

async function resolveKidUserId(tags: string[] | null): Promise<string | null> {
  const dependentIdTag = (tags ?? []).find((t) => t.startsWith("dependente:"));
  const dependentId = dependentIdTag?.split(":")[1];
  if (!dependentId) return null;

  const { data: dependent } = await supabaseAdmin
    .from("dependents")
    .select("kid_user_id")
    .eq("id", dependentId)
    .maybeSingle();

  return dependent?.kid_user_id ?? null;
}

export const deleteKidManagementTransaction = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) =>
    z
      .object({
        transactionId: z.string().uuid(),
      })
      .parse(data),
  )
  .handler(async ({ data, context }) => {
    const { transactionId } = data;
    const userId = context.userId;

    const { data: parentTx, error: fetchError } = await supabaseAdmin
      .from("transactions")
      .select("id, amount, tags")
      .eq("id", transactionId)
      .eq("user_id", userId)
      .single();

    if (fetchError || !parentTx || !parentTx.tags?.includes("kids_management")) {
      throw new Error("Transação não encontrada ou não é permitida a exclusão.");
    }

    const kidUserId = await resolveKidUserId(parentTx.tags);

    if (kidUserId) {
      const mirrorIds = await findMirrorIds({
        parentTxId: parentTx.id,
        kidUserId,
        amount: Number(parentTx.amount),
      });
      if (mirrorIds.length > 0) {
        await supabaseAdmin.from("transactions").delete().in("id", mirrorIds);
      }
    }

    const { error: deleteError } = await supabaseAdmin
      .from("transactions")
      .delete()
      .eq("id", transactionId);

    if (deleteError) throw deleteError;

    return { success: true, mirrorRemoved: Boolean(kidUserId) };
  });

export const updateKidManagementTransaction = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) =>
    z
      .object({
        transactionId: z.string().uuid(),
        amount: z.number().positive(),
        description: z.string().min(1),
      })
      .parse(data),
  )
  .handler(async ({ data, context }) => {
    const { transactionId, amount, description } = data;
    const userId = context.userId;

    const { data: parentTx, error: fetchError } = await supabaseAdmin
      .from("transactions")
      .select("id, amount, tags")
      .eq("id", transactionId)
      .eq("user_id", userId)
      .single();

    if (fetchError || !parentTx || !parentTx.tags?.includes("kids_management")) {
      throw new Error("Transação não encontrada.");
    }

    const kidUserId = await resolveKidUserId(parentTx.tags);

    if (kidUserId) {
      const mirrorIds = await findMirrorIds({
        parentTxId: parentTx.id,
        kidUserId,
        amount: Number(parentTx.amount),
      });
      if (mirrorIds.length > 0) {
        // A criança nunca vê a descrição interna do responsável.
        await supabaseAdmin
          .from("transactions")
          .update({ amount, description: "Recebido do responsável" })
          .in("id", mirrorIds);
      }
    }

    const nextTags = (parentTx.tags ?? [])
      .filter((tag) => !tag.startsWith("parent_desc:"))
      .concat(`parent_desc:${description}`);

    await supabaseAdmin
      .from("transactions")
      .update({ amount, description: `[Envio] ${description}`, tags: nextTags })
      .eq("id", transactionId);

    return { success: true };
  });
