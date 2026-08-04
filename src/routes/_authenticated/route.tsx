import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";

import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated")({
  ssr: false,
  beforeLoad: async () => {
    // Usamos getSession para validar a sessão local; se falhar com 429 (rate limit)
    // ou 401 (expirada), tentamos uma abordagem resiliente ou redirecionamos.
    try {
      const { data, error } = await supabase.auth.getSession();
      
      if (error || !data.session) {
        // Se for erro de rate limit (429), podemos estar em um loop de refresh.
        // Nesses casos, limpar o estado local ajuda a interromper o loop.
        if (error?.status === 429) {
          console.error("[auth] Rate limit atingido no refresh token. Limpando sessão local.");
          await supabase.auth.signOut().catch(() => {});
        }
        
        console.warn("[auth] sessão inválida ou expirada, redirecionando para login", error);
        throw redirect({ to: "/auth" });
      }

      return { user: data.session.user };
    } catch (err) {
      if (err instanceof Error && err.message.includes('429')) {
        console.error("[auth] Erro crítico de rate limit detectado.");
        throw redirect({ to: "/auth" });
      }
      throw err;
    }
  },
  component: () => <Outlet />,
});
