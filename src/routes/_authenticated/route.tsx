import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";

import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated")({
  ssr: false,
  beforeLoad: async () => {
    try {
      const { data, error } = await supabase.auth.getSession();
      
      if (error || !data.session) {
        if (error?.status === 429 || (error instanceof Error && error.message.includes('429'))) {
          // Um limite temporário não prova que a sessão terminou. Manter a rota
          // evita expulsar o usuário enquanto o cliente recupera o token.
          return { user: data.session?.user ?? null };
        } else {
          console.warn("[auth] sessão inválida ou expirada, redirecionando para login", error);
        }
        
        throw redirect({ to: "/auth" });
      }

      return { user: data.session.user };
    } catch (err) {
      // Se já for um objeto de redirecionamento do TanStack, apenas relançamos
      if (err && typeof err === 'object' && 'isRedirect' in err) throw err;
      
      if (err instanceof Error && err.message.includes('429')) return { user: null };
      throw err;
    }
  },
  component: () => <Outlet />,
});
