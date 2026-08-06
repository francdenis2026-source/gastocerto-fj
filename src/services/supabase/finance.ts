import { supabase } from "@/integrations/supabase/client";
import { Transaction, TransactionRange, Account, Budget } from "@/types/finance";

export const transactionService = {
  async getAll(userId: string, range?: TransactionRange): Promise<Transaction[]> {
    let query = supabase
      .from("transactions")
      .select("*")
      .eq("user_id", userId)
      .is("deleted_at", null)
      .order("transaction_date", { ascending: false })
      .order("created_at", { ascending: false });

    if (range) {
      query = query.gte("transaction_date", range.start).lte("transaction_date", range.end);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data ?? [];
  },

  async getLast(userId: string, kind: string): Promise<Transaction | null> {
    const { data, error } = await supabase
      .from("transactions")
      .select("*")
      .eq("user_id", userId)
      .eq("transaction_type", kind)
      .is("deleted_at", null)
      .order("transaction_date", { ascending: false })
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (error) throw error;
    return data ?? null;
  },
};

export const accountService = {
  async getAll(userId: string): Promise<Account[]> {
    const { data, error } = await supabase
      .from("accounts")
      .select("*")
      .eq("user_id", userId)
      .eq("active", true)
      .order("name");
    if (error) throw error;
    return data ?? [];
  },
};

export const budgetService = {
  async getForPeriod(userId: string, year: number, month: number): Promise<Budget[]> {
    const { data, error } = await supabase
      .from("budgets")
      .select("*")
      .eq("user_id", userId)
      .eq("year", year)
      .eq("month", month);
    if (error) throw error;
    return data ?? [];
  },
};
