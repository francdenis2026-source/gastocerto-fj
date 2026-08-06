import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

export const getYearlyBalance = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => z.object({
    year: z.number(),
  }).parse(data))
  .handler(async ({ data, context }) => {
    const { year } = data;
    const userId = context.userId;

    const startDate = `${year}-01-01`;
    const endDate = `${year}-12-31T23:59:59`;

    const { data: transactions, error } = await supabaseAdmin
      .from("transactions")
      .select("amount, transaction_type, transaction_date, category_id, tags")
      .eq("user_id", userId)
      .is("deleted_at", null)
      .gte("transaction_date", startDate)
      .lte("transaction_date", endDate);

    if (error) throw error;

    const monthlyData = Array.from({ length: 12 }, (_, i) => ({
      month: i + 1,
      income: 0,
      expense: 0,
      balance: 0,
    }));

    transactions?.forEach(tx => {
      const month = new Date(tx.transaction_date).getMonth();
      const amount = Number(tx.amount);
      if (tx.transaction_type === "income") {
        monthlyData[month].income += amount;
      } else {
        monthlyData[month].expense += amount;
      }
    });

    monthlyData.forEach(m => {
      m.balance = m.income - m.expense;
    });

    return {
      year,
      monthlyData,
      totalIncome: monthlyData.reduce((acc, m) => acc + m.income, 0),
      totalExpense: monthlyData.reduce((acc, m) => acc + m.expense, 0),
    };
  });
