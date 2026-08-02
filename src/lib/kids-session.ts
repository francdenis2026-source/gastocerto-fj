import { useQuery } from "@tanstack/react-query";

import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";

export type KidSessionDependent = {
  id: string;
  user_id: string;
  name: string;
  nickname: string | null;
  color: string | null;
  monthly_allowance: number | null;
  monthly_limit: number | null;
  kid_login_code: string | null;
  gender: string | null;
  avatar_url: string | null;
};

/**
 * Descobre se a sessão atual pertence a uma criança. As políticas de acesso
 * garantem que só a própria linha do dependente seja visível para ela.
 */
export function useKidSession() {
  const { user, loading } = useAuth();
  const query = useQuery({
    queryKey: ["kid_session", user?.id],
    enabled: Boolean(user?.id),
    staleTime: 60_000,
    queryFn: async (): Promise<KidSessionDependent | null> => {
      const { data, error } = await supabase
        .from("dependents")
        .select("id, user_id, name, nickname, color, monthly_allowance, monthly_limit, kid_login_code")
        .eq("kid_user_id", user!.id)
        .maybeSingle();
      if (error) return null;
      return (data as unknown as KidSessionDependent | null) ?? null;
    },
  });

  return {
    dependent: query.data ?? null,
    isKid: Boolean(query.data),
    loading: loading || query.isLoading,
  };
}

/** Consulta direta (fora de React) usada no redirecionamento pós-login. */
export async function fetchKidDependent(userId: string) {
  const { data } = await supabase
    .from("dependents")
    .select("id")
    .eq("kid_user_id", userId)
    .maybeSingle();
  return data ? (data as { id: string }) : null;
}
