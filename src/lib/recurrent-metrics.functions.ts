import { createServerFn } from "@tanstack/react-start";
import { supabase } from "@/integrations/supabase/client";

export const getRecurrentExpenses = createServerFn({ method: "GET" })
  .handler(async () => {
    const { data, error } = await supabase
      .from("transactions")
      .select("amount, transaction_type, categories(name)")
      .eq("is_recurring", true);
    
    if (error) throw error;
    return (data || []) as any[];
  });
