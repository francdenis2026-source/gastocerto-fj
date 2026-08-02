import { supabase } from "@/integrations/supabase/client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";

export type EnergyBill = {
  id: string;
  user_id: string;
  bill_date: string;
  amount: number;
  consumption_kwh: number;
  due_date: string | null;
  paid_at: string | null;
  notes: string | null;
  created_at: string;
};

export function useEnergyBills() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["energy-bills", user?.id],
    enabled: !!user?.id,
    queryFn: async (): Promise<EnergyBill[]> => {
      const { data, error } = await supabase
        .from("energy_bills" as any)
        .select("*")
        .order("bill_date", { ascending: false });
      if (error) throw error;
      return data as any[] as EnergyBill[];
    },
  });
}

export function useSaveEnergyBill() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (values: Partial<EnergyBill>) => {
      if (!user) throw new Error("Unauthorized");
      const { data, error } = await supabase
        .from("energy_bills" as any)
        .upsert({ ...values, user_id: user.id } as any)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["energy-bills"] });
    },
  });
}
