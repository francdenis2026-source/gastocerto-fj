import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { supabaseAdmin } from "@/lib/integrations/supabase/client.server";

export const getKidCardControl = createServerFn({ method: "GET" })
  .inputValidator(z.object({ kidUserId: z.string() }))
  .handler(async ({ data }) => {
    // 1. Get kid's assigned card (usually a sub-account card or shared one)
    const { data: cards, error } = await (supabaseAdmin as any)
      .from("credit_cards")
      .select("*")
      .eq("user_id", data.kidUserId)
      .eq("active", true)
      .limit(5);

    if (error) throw error;

    // 2. Get recent transactions for these cards
    const cardIds = cards?.map((c: any) => c.id) || [];
    let transactions = [];
    if (cardIds.length > 0) {
      const { data: txs } = await (supabaseAdmin as any)
        .from("card_transactions")
        .select("*")
        .in("card_id", cardIds)
        .order("transaction_date", { ascending: false })
        .limit(10);
      transactions = txs || [];
    }

    return {
      cards: cards || [],
      recentTransactions: transactions
    };
  });
