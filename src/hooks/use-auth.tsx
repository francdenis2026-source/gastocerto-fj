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
    let mounted = true;

    // 1. Carregar sessão inicial de forma resiliente
    const loadSession = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();
        if (!mounted) return;
        
        if (error) {
          console.error("[auth] Erro ao carregar sessão:", error);
          if (error.status === 429) {
            toast.error("Muitas tentativas. Aguarde um momento.");
          }
        }
        
        const currentUserId = data.session?.user?.id ?? null;
        ensureLocalDataOwner(currentUserId);
        setSession(data.session);
      } catch (err) {
        console.error("[auth] Falha crítica ao carregar sessão:", err);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    void loadSession();

    // 2. Escutar mudanças de estado (login/logout/token refreshed)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, nextSession) => {
      if (!mounted) return;
      
      console.log(`[auth] Evento: ${event}`, nextSession?.user?.id);
      
      const nextUserId = nextSession?.user?.id ?? null;
      
      // Se o ID do usuário mudou (incluindo login ou troca de conta)
      if (nextUserId !== (session?.user?.id ?? null)) {
        ensureLocalDataOwner(nextUserId);
        setSession(nextSession);
      } else if (nextSession?.access_token !== session?.access_token) {
        // Apenas refresh de token, mantendo o mesmo usuário
        setSession(nextSession);
      }
      
      setLoading(false);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [session?.user?.id, session?.access_token]);

  const value = useMemo<AuthContextValue>(
    () => ({
      session,
      user: session?.user ?? null,
      loading,
      signOut: async (silent = false) => {
        if (!silent) {
          const confirmed = silent ? true : window.confirm("Tem certeza que deseja sair?");
          if (!confirmed) return;
        }

        const toastId = silent ? undefined : toast.loading("Saindo com segurança...", {
          description: "Limpando dados do navegador.",
          icon: <RefreshCcw className="size-4 animate-spin" />
        });

        try {
          await supabase.auth.signOut();
          
          // Limpeza profunda de campos de formulário antes de limpar o storage
          const inputs = document.querySelectorAll('input:not([type="hidden"])');
          inputs.forEach((input) => {
            const el = input as HTMLInputElement;
            el.value = '';
            el.dispatchEvent(new Event('input', { bubbles: true }));
          });

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
