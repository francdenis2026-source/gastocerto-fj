import { useQuery } from "@tanstack/react-query";

import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";

export type KidAccessAuditRow = {
  id: string;
  dependent_id: string | null;
  dependent_name: string | null;
  action: string;
  code: string | null;
  expires_at: string | null;
  detail: Record<string, unknown>;
  created_at: string;
};

/** Histórico auditável das gerações, trocas e revogações de códigos. */
export function useKidAccessAudit(limit = 100) {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["kid_access_audit", user?.id, limit],
    enabled: Boolean(user?.id),
    queryFn: async (): Promise<KidAccessAuditRow[]> => {
      const { data, error } = await supabase
        .from("kid_access_audit" as never)
        .select("*")
        .order("created_at", { ascending: false })
        .limit(limit);
      if (error) throw error;
      return (data ?? []) as unknown as KidAccessAuditRow[];
    },
  });
}
