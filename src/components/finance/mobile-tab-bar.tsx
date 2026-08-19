import { Link, useRouterState } from "@tanstack/react-router";
import { LayoutDashboard, ArrowLeftRight, BarChart3, Menu, X, Baby, RefreshCcw } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { navSections } from "@/lib/nav-model";
import { useConfirm } from "@/components/ui/confirm-dialog";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { clearBrowserCredentials } from "@/lib/local-session";
import { toast } from "sonner";

export function MobileTabBar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  const { confirm, ConfirmDialog } = useConfirm();
  const queryClient = useQueryClient();

  const mainActions = [
    { to: "/painel", icon: LayoutDashboard, label: "Início" },
    { to: "/lancamentos", icon: ArrowLeftRight, label: "Lançamentos" },
    { to: "/relatorios", icon: BarChart3, label: "Relatórios" },
    { to: "/filhos", icon: Baby, label: "Kids" },
  ];

  async function handleSignOut() {
    setMenuOpen(false);
    confirm({
      title: "Encerrar sessão",
      description: "Tem certeza que deseja encerrar sua sessão com segurança?",
      type: "warning",
      confirmLabel: "Sair agora",
      onConfirm: async () => {
        const toastId = toast.loading("Finalizando acesso...", {
          description: "Estamos encerrando sua sessão com segurança.",
          icon: <RefreshCcw className="size-4 animate-spin" aria-hidden />,
        });

        try {
          await queryClient.cancelQueries();
          queryClient.clear();
          await supabase.auth.signOut();
          clearBrowserCredentials();
          window.localStorage.clear();
          window.sessionStorage.clear();
          toast.success("Sessão encerrada", { id: toastId, description: "Até logo!" });
          window.location.replace("/");
        } catch (error) {
          console.error("Erro durante logout mobile:", error);
          toast.error("Erro ao encerrar sessão", { id: toastId });
          window.location.replace("/");
        }
      },
    });
  }

  return (
    <>
      <ConfirmDialog />

      <div
        className={cn(
          "fixed inset-0 z-[60] bg-background/75 backdrop-blur-sm transition-opacity lg:hidden",
          menuOpen ? "opacity-100" : "pointer-events-none opacity-0",
        )}
        aria-hidden={!menuOpen}
        onClick={() => setMenuOpen(false)}
      >
        <aside
          role="dialog"
          aria-modal="true"
          aria-label="Menu de navegação"
          className={cn(
            "fixed inset-y-0 right-0 flex w-[min(88vw,320px)] flex-col border-l border-border bg-background/98 shadow-2xl transition-transform duration-200 lg:hidden",
            menuOpen ? "translate-x-0" : "translate-x-full",
          )}
          onClick={(event) => event.stopPropagation()}
        >
          <div className="flex min-h-14 items-center justify-between border-b border-border px-4">
            <span className="text-xs font-extrabold uppercase tracking-[0.16em] text-primary">Navegação</span>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setMenuOpen(false)}
              className="rounded-full"
              aria-label="Fechar menu"
            >
              <X className="size-5" aria-hidden />
            </Button>
          </div>

          <div className="flex-1 space-y-6 overflow-y-auto overscroll-contain p-4 pb-[calc(1rem+env(safe-area-inset-bottom))]">
            {navSections.map((section) => (
              <section key={section.key} className="space-y-2" aria-labelledby={`mobile-nav-${section.key}`}>
                <p id={`mobile-nav-${section.key}`} className="px-1 text-[10px] font-extrabold uppercase tracking-[0.14em] text-muted-foreground">
                  {section.label}
                </p>
                <div className="grid gap-2">
                  {section.groups.map((group) => {
                    const Icon = group.icon;
                    const isActive = pathname === group.to;
                    return (
                      <Link
                        key={group.key}
                        to={group.to as any}
                        onClick={() => setMenuOpen(false)}
                        aria-current={isActive ? "page" : undefined}
                        className={cn(
                          "flex min-h-12 items-center gap-3 rounded-xl border px-3 py-2.5 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                          isActive
                            ? "border-primary/25 bg-primary/10 text-foreground"
                            : "border-transparent bg-muted/40 text-foreground hover:bg-muted",
                        )}
                      >
                        <div className={cn("grid size-9 shrink-0 place-items-center rounded-lg border", isActive ? "border-primary/25 bg-primary/10 text-primary" : "border-border bg-background text-muted-foreground") }>
                          <Icon className="size-5" aria-hidden />
                        </div>
                        <div className="min-w-0">
                          <span className="block truncate">{group.label}</span>
                          {group.hint ? <span className="mt-0.5 block text-[11px] font-medium leading-snug text-muted-foreground">{group.hint}</span> : null}
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </section>
            ))}

            <div className="border-t border-border pt-4">
              <Button variant="destructive" className="w-full justify-start gap-3" onClick={handleSignOut}>
                Sair da conta
              </Button>
            </div>
          </div>
        </aside>
      </div>

      <nav
        aria-label="Navegação principal mobile"
        className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-background/95 px-1 pt-1 pb-[max(.25rem,env(safe-area-inset-bottom))] shadow-[0_-8px_30px_rgba(15,23,42,.08)] backdrop-blur-xl lg:hidden"
      >
        <div className="mx-auto flex max-w-md items-stretch justify-around">
          {mainActions.map((item) => {
            const isActive = pathname === item.to;
            const Icon = item.icon;
            return (
              <Link
                key={item.to}
                to={item.to as any}
                aria-current={isActive ? "page" : undefined}
                className={cn(
                  "flex min-h-14 flex-1 flex-col items-center justify-center gap-1 rounded-xl px-1 py-1.5 text-[10px] font-bold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset",
                  isActive ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted/60 hover:text-foreground",
                )}
              >
                <Icon className="size-5" aria-hidden />
                <span className="leading-none">{item.label}</span>
              </Link>
            );
          })}

          <button
            type="button"
            onClick={() => setMenuOpen(true)}
            aria-expanded={menuOpen}
            aria-haspopup="dialog"
            className="flex min-h-14 flex-1 flex-col items-center justify-center gap-1 rounded-xl px-1 py-1.5 text-[10px] font-bold text-muted-foreground transition-colors hover:bg-muted/60 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset"
          >
            <Menu className="size-5" aria-hidden />
            <span className="leading-none">Mais</span>
          </button>
        </div>
      </nav>
    </>
  );
}
