import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

/** Janela em que a exclusão pode ser desfeita (10 minutos). */
export const UNDO_WINDOW_MS = 10 * 60 * 1000;

/**
 * Desfaz a exclusão de um lançamento do Espaço Kids (responsável ou filho).
 * A exclusão é reversível (soft delete) e pode ser cancelada por até 10 minutos.
 */
export const undoKidTransactionDeletion = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) =>
    z
      .object({
        transactionId: z.string().uuid(),
        extraIds: z.array(z.string().uuid()).optional(),
      })
      .parse(data),
  )
  .handler(async ({ data, context }) => {
    const parentUserId = context.userId;
    const ids = [data.transactionId, ...(data.extraIds ?? [])];

    const { data: rows } = await supabaseAdmin
      .from("transactions")
      .select("id, user_id, deleted_at")
      .in("id", ids);

    if (!rows || rows.length === 0) throw new Error("Lançamento não encontrado.");

    const { data: kids } = await supabaseAdmin
      .from("dependents")
      .select("kid_user_id")
      .eq("user_id", parentUserId);

    const allowedOwners = new Set<string>([
      parentUserId,
      ...(kids ?? []).map((k) => k.kid_user_id).filter((id): id is string => Boolean(id)),
    ]);

    const restorable = rows.filter((row) => {
      if (!allowedOwners.has(row.user_id)) return false;
      if (!row.deleted_at) return false;
      return Date.now() - new Date(row.deleted_at).getTime() <= UNDO_WINDOW_MS;
    });

    if (restorable.length === 0) {
      throw new Error(
        "O prazo de 10 minutos para desfazer esta exclusão já passou ou você não tem permissão.",
      );
    }

    const { error } = await supabaseAdmin
      .from("transactions")
      .update({ deleted_at: null })
      .in(
        "id",
        restorable.map((row) => row.id),
      );

    if (error) throw new Error(error.message);

    return { success: true, restored: restorable.length };
  });
