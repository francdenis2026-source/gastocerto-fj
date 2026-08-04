import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";

import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated")({
  ssr: false,
  beforeLoad: async () => {
    const { data, error } = await supabase.auth.getSession();
    
    // Se o erro for 429 ou 401 persistente, forçamos o login
    if (error || !data.session) {
      console.warn("[auth] sessão inválida ou expirada, redirecionando para login", error);
      throw redirect({ to: "/auth" });
    }

    // Pular Onboarding/Boas-vindas se solicitado ou após cadastro
    // Se o usuário acabou de logar e cair no onboarding, redirecionamos para o painel se quisermos pular
    // Nota: O requisito pede para "Remover tela de boas-vindas pós-cadastro".
    // Se a tela de boas-vindas for o Onboarding, vamos redirecionar.
    
    return { user: data.session.user };
  },
  component: () => <Outlet />,
});
