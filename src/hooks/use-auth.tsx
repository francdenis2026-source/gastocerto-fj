import type { Session, User } from "@supabase/supabase-js";
import { createContext, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
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
  const sessionRef = useRef<Session | null>(null);

  useEffect(() => {
    let mounted = true;

    // Uma única leitura e uma única assinatura durante toda a vida do provider.
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
        sessionRef.current = data.session;
        setSession(data.session);
      } catch (err) {
        console.error("[auth] Falha crítica ao carregar sessão:", err);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    void loadSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, nextSession) => {
      if (!mounted) return;

      const nextUserId = nextSession?.user?.id ?? null;
      const current = sessionRef.current;

      if (nextUserId !== (current?.user?.id ?? null)) {
        ensureLocalDataOwner(nextUserId);
      }
      if (nextSession?.access_token !== current?.access_token || nextUserId !== current?.user?.id) {
        sessionRef.current = nextSession;
        setSession(nextSession);
      }
      setLoading(false);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

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

        const toastId = silent ? undefined : toast.loading("Encerrando sessão...", {
          description: "Sua segurança é nossa prioridade.",
          icon: <RefreshCcw className="size-4 animate-spin text-brand" />
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

          // Respeitar persistência de sessão configurada
          document.documentElement.classList.add("dark");
          document.documentElement.style.colorScheme = "dark";

          if (toastId) {
            toast.success("Até logo!", {
              id: toastId,
              description: "Você foi desconectado com segurança.",
              icon: (
                <div className="flex size-6 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-500">
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M20 6 9 17l-5-5" />
                  </svg>
                </div>
              ),
            });
          }

          setTimeout(() => {
            window.location.replace("/");
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
