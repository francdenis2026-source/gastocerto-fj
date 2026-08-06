import { createServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/integrations/supabase/client";

export const getRecurrentExpenses = createServerFn({ method: "GET" })
  .handler(async () => {
    const { data, error } = await supabase
      .from("transactions")
      .select("amount, transaction_type, categories(name)")
      .eq("is_recurring", true);
    
    if (error) throw error;
    return (data || []) as any[];
  });

export function useRecurrentExpenses() {
  return useQuery({
    queryKey: ["recurrent-expenses-export"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("transactions")
        .select("amount, transaction_type, transaction_date, categories(name)")
        .eq("is_recurring", true);
      
      if (error) throw error;
      return (data || []) as any[];
    }
  });
}
