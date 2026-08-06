import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

export const cleanupDuplicatedKidTransactions = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) =>
    z.object({
      kidUserId: z.string().uuid(),
    }).parse(data)
  )
  .handler(async ({ data }) => {
    const { kidUserId } = data;

    // Busca transações da criança que vieram do pai
    const { data: txs, error } = await supabaseAdmin
      .from("transactions")
      .select("id, amount, transaction_date, description, tags")
      .eq("user_id", kidUserId)
      .eq("transaction_type", "income")
      .contains("tags", ["from_parent"]);

    if (error || !txs) return { success: false, message: error?.message };

    const toDelete: string[] = [];
    const seen = new Set<string>();

    // Agrupa por valor e data para identificar duplicatas óbvias
    // (Aquelas criadas no mesmo segundo pelo bug de inserção dupla)
    for (const tx of txs) {
      const key = `${tx.amount}_${tx.transaction_date}`;
      if (seen.has(key)) {
        toDelete.push(tx.id);
      } else {
        seen.add(key);
      }
    }

    if (toDelete.length > 0) {
      const { error: delError } = await supabaseAdmin
        .from("transactions")
        .delete()
        .in("id", toDelete);
      
      if (delError) return { success: false, message: delError.message };
    }

    return { success: true, count: toDelete.length };
  });
