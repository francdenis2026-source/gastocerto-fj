import type { Session, User } from "@supabase/supabase-js";
import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { toast } from "sonner";
import { AlertCircle, RefreshCcw } from "lucide-react";

import { supabase } from "@/integrations/supabase/client";
import { clearBrowserCredentials, ensureLocalDataOwner } from "@/lib/local-session";

type AuthContextValue = {
  session: Session | null;
  user: User | null;
  loading: boolean;
  signOut: (silent?: boolean) => Promise<void>;
};

const AuthContext = createContext<AuthContextValue>({
  session: null,
  user: null,
  loading: true,
  signOut: async () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const { data: subscription } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      // Troca de conta no mesmo navegador: apaga preferências da conta anterior.
      ensureLocalDataOwner(nextSession?.user?.id ?? null);
      setSession(nextSession);
      setLoading(false);
    });

    supabase.auth.getSession().then(({ data }) => {
      ensureLocalDataOwner(data.session?.user?.id ?? null);
      setSession(data.session);
      setLoading(false);
    });

    return () => subscription.subscription.unsubscribe();
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      session,
      user: session?.user ?? null,
      loading,
      signOut: async (silent = false) => {
        if (!silent) {
          const confirmed = window.confirm("Tem certeza que deseja sair?");
          if (!confirmed) return;
        }

        const toastId = silent ? undefined : toast.loading("Saindo com segurança...", {
          description: "Limpando dados do navegador.",
          icon: <RefreshCcw className="size-4 animate-spin" />
        });

        try {
          await supabase.auth.signOut();
          clearBrowserCredentials();
          window.localStorage.clear();
          window.sessionStorage.clear();
          
          if (toastId) {
            toast.success("Até logo!", {
              id: toastId,
              description: "Sua sessão foi encerrada com sucesso.",
              icon: <AlertCircle className="size-4 text-emerald-500" />
            });
          }

          setTimeout(() => {
            window.location.href = "/";
          }, 800);
        } catch (error) {
          if (toastId) toast.error("Erro ao encerrar sessão", { id: toastId });
          window.location.href = "/";
        }
      },
    }),
    [session, loading],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
