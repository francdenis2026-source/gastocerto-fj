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

function dependentIdFromTags(tags: string[] | null): string | null {
  const tag = (tags ?? []).find((t) => t.startsWith("dependente:"));
  return tag?.split(":")[1] ?? null;
}

async function resolveKidUserId(tags: string[] | null): Promise<string | null> {
  const dependentId = dependentIdFromTags(tags);
  if (!dependentId) return null;

  const { data: dependent } = await supabaseAdmin
    .from("dependents")
    .select("kid_user_id")
    .eq("id", dependentId)
    .maybeSingle();

  return dependent?.kid_user_id ?? null;
}

type ManagedRow = {
  id: string;
  amount: number;
  tags: string[] | null;
  user_id: string;
  description: string;
  transaction_date: string;
  /** true quando o registro pertence à criança (gasto lançado por ela). */
  kidOwned: boolean;
};

/**
 * Carrega um lançamento do Espaço Kids garantindo permissão:
 * o registro precisa ser do próprio responsável (tag `kids_management`) ou de
 * um filho vinculado à conta dele (`kid_self_expense`).
 */
async function loadManagedRow(transactionId: string, parentUserId: string): Promise<ManagedRow> {
  const { data: row } = await supabaseAdmin
    .from("transactions")
    .select("id, amount, tags, user_id, description, transaction_date")
    .eq("id", transactionId)
    .maybeSingle();

  if (!row) throw new Error("Lançamento não encontrado.");

  const tags = row.tags ?? [];

  if (row.user_id === parentUserId) {
    if (!tags.includes("kids_management")) {
      throw new Error("Você não tem permissão para alterar este lançamento por aqui.");
    }
    return { ...row, amount: Number(row.amount), kidOwned: false } as ManagedRow;
  }

  // Registro da criança: confirma que ela é filha deste responsável.
  const { data: dependent } = await supabaseAdmin
    .from("dependents")
    .select("id")
    .eq("kid_user_id", row.user_id)
    .eq("user_id", parentUserId)
    .maybeSingle();

  if (!dependent) {
    throw new Error("Sem permissão: este lançamento não pertence à sua família.");
  }

  return { ...row, amount: Number(row.amount), kidOwned: true } as ManagedRow;
}

/**
 * Exclusão reversível (soft delete). Mantemos `deleted_at` para permitir o
 * "Desfazer" por até 10 minutos, tanto no painel do responsável quanto no
 * espelho da criança.
 */
export const deleteKidManagementTransaction = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) =>
    z.object({ transactionId: z.string().uuid() }).parse(data),
  )
  .handler(async ({ data, context }) => {
    const row = await loadManagedRow(data.transactionId, context.userId);
    const now = new Date().toISOString();

    const mirrorIds: string[] = [];
    if (!row.kidOwned) {
      const kidUserId = await resolveKidUserId(row.tags);
      if (kidUserId) {
        mirrorIds.push(
          ...(await findMirrorIds({
            parentTxId: row.id,
            kidUserId,
            amount: row.amount,
          })),
        );
      }
    }

    if (mirrorIds.length > 0) {
      await supabaseAdmin.from("transactions").update({ deleted_at: now }).in("id", mirrorIds);
    }

    const { error } = await supabaseAdmin
      .from("transactions")
      .update({ deleted_at: now })
      .eq("id", row.id);

    if (error) throw new Error(error.message);

    return { success: true, ids: [row.id, ...mirrorIds], deletedAt: now };
  });

/** Restaura o lançamento (e o espelho) apagado nos últimos 10 minutos. */
export const restoreKidManagementTransaction = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) =>
    z.object({ ids: z.array(z.string().uuid()).min(1) }).parse(data),
  )
  .handler(async ({ data, context }) => {
    // Confirma permissão pelo registro principal.
    await loadManagedRow(data.ids[0]!, context.userId);

    const { error } = await supabaseAdmin
      .from("transactions")
      .update({ deleted_at: null })
      .in("id", data.ids);

    if (error) throw new Error(error.message);
    return { success: true };
  });

export const updateKidManagementTransaction = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) =>
    z
      .object({
        transactionId: z.string().uuid(),
        amount: z.number().positive(),
        description: z.string().min(1),
        transactionDate: z.string().optional(),
      })
      .parse(data),
  )
  .handler(async ({ data, context }) => {
    const { transactionId, amount, description, transactionDate } = data;
    const row = await loadManagedRow(transactionId, context.userId);

    // Gasto lançado pelo filho: o responsável pode corrigir valor, descrição e data.
    if (row.kidOwned) {
      const { error } = await supabaseAdmin
        .from("transactions")
        .update({
          amount,
          description,
          ...(transactionDate ? { transaction_date: transactionDate } : {}),
          updated_at: new Date().toISOString(),
        })
        .eq("id", row.id);
      if (error) throw new Error(error.message);
      return { success: true };
    }

    const kidUserId = await resolveKidUserId(row.tags);

    if (kidUserId) {
      const mirrorIds = await findMirrorIds({
        parentTxId: row.id,
        kidUserId,
        amount: row.amount,
      });
      if (mirrorIds.length > 0) {
        // A criança nunca vê a descrição interna do responsável.
        await supabaseAdmin
          .from("transactions")
          .update({ amount, description: "Recebido do responsável" })
          .in("id", mirrorIds);
      }
    }

    const nextTags = (row.tags ?? [])
      .filter((tag) => !tag.startsWith("parent_desc:"))
      .concat(`parent_desc:${description}`);

    const { error } = await supabaseAdmin
      .from("transactions")
      .update({
        amount,
        description: `[Envio] ${description}`,
        tags: nextTags,
        ...(transactionDate ? { transaction_date: transactionDate } : {}),
      })
      .eq("id", row.id);
    if (error) throw new Error(error.message);

    return { success: true };
  });
