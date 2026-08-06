import { Tables } from "@/integrations/supabase/types";

export type Transaction = Tables<"transactions">;
export type Category = Tables<"categories">;
export type Account = Tables<"accounts">;
export type Budget = Tables<"budgets">;
export type CategoryFeedback = Tables<"category_suggestion_feedback">;

export type TransactionRange = { start: string; end: string };

export type TransactionType = Transaction["transaction_type"];
export type TransactionStatus = Transaction["status"];
