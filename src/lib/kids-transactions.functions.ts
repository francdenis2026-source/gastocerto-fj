import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

export const getKidTransactions = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => z.object({
    dependentId: z.string().uuid(),
    month: z.number().optional(),
    year: z.number().optional(),
    yearly: z.boolean().optional(),
  }).parse(data))
  .handler(async ({ data, context }) => {
    const { dependentId, month, year, yearly } = data;
    const tag = `dependente:${dependentId}`;
    
    let query = context.supabase
      .from("transactions")
      .select("id, description, amount, transaction_type, transaction_date, status, tags, category_id, user_id")
      .contains("tags", [tag])
      .is("deleted_at", null)
      .order("transaction_date", { ascending: false });

    if (yearly && year) {
      query = query.gte("transaction_date", `${year}-01-01`).lte("transaction_date", `${year}-12-31T23:59:59`);
    } else if (year && month) {
      const start = `${year}-${String(month).padStart(2, '0')}-01`;
      const end = new Date(year, month, 0).toISOString().split('T')[0] + 'T23:59:59';
      query = query.gte("transaction_date", start).lte("transaction_date", end);
    }

    const { data: transactions, error } = await query.limit(yearly ? 500 : 100);

    if (error) throw new Error(error.message);
    return transactions;
  });
