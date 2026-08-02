import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export const getKidTransactions = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => z.object({
    dependentId: z.string().uuid(),
  }).parse(data))
  .handler(async ({ data, context }) => {
    const tag = `dependente:${data.dependentId}`;
    
    const { data: transactions, error } = await context.supabase
      .from("transactions")
      .select("id, description, amount, transaction_type, transaction_date, status, tags")
      .contains("tags", [tag])
      .is("deleted_at", null)
      .order("transaction_date", { ascending: false })
      .limit(100);

    if (error) throw new Error(error.message);
    return transactions;
  });
