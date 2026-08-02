import { supabase } from "@/integrations/supabase/client";

export type HomeRoute = "/admin" | "/painel" | "/meu-espaco";

/** Descobre o destino correto após o login: crianças, administradores e clientes. */
export async function resolveHomeRoute(userId?: string | null): Promise<HomeRoute> {
  if (!userId) return "/painel";
  try {
    // Contas de criança têm painel próprio e nenhum acesso ao painel do adulto.
    if (typeof supabase.from === "function") {
      const { data: kid } = await supabase
        .from("dependents")
        .select("id")
        .eq("kid_user_id", userId)
        .maybeSingle();
      if (kid) return "/meu-espaco";
    }

    const { data } = await supabase.rpc("has_role", {
      _user_id: userId,
      _role: "admin",
    });

    if (data === true) return "/admin";

    const { data: isSupport } = await supabase.rpc("has_role", {
      _user_id: userId,
      _role: "support",
    });
    if (isSupport === true) return "/admin";

    return "/painel";
  } catch {
    return "/painel";
  }
}

/** Destino após autenticação usando a sessão corrente. */
export async function resolveHomeRouteForSession(): Promise<HomeRoute> {
  const { data } = await supabase.auth.getUser();
  return resolveHomeRoute(data.user?.id);
}
