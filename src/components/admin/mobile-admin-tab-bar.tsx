import { LayoutDashboard, Users, KeyRound, Menu, X, Wallet, LogOut } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { AdminSection } from "./admin-console-shell";

export function MobileAdminTabBar({
  sections,
  active,
  onSelect,
}: {
  sections: AdminSection[];
  active: string;
  onSelect: (id: string) => void;
}) {
  const { signOut } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  const mainActions = [
    { id: "overview", icon: LayoutDashboard, label: "Dashboard" },
    { id: "users", icon: Users, label: "Contas" },
    { id: "financial", icon: Wallet, label: "Financeiro" },
    { id: "temporary", icon: KeyRound, label: "Trials" },
  ].filter((item) => sections.some((section) => section.id === item.id));

  return (
    <>
      <div
        className={cn(
          "fixed inset-0 z-[60] bg-background/80 backdrop-blur-sm transition-opacity motion-reduce:transition-none lg:hidden",
          menuOpen ? "opacity-100" : "pointer-events-none opacity-0",
        )}
        onClick={() => setMenuOpen(false)}
        aria-hidden={!menuOpen}
      >
        <aside
          role="dialog"
          aria-modal="true"
          aria-label="Menu administrativo"
          className={cn(
            "fixed inset-y-0 right-0 flex w-[min(22rem,92vw)] flex-col border-l border-border bg-card shadow-2xl transition-transform duration-200 motion-reduce:transition-none lg:hidden",
            menuOpen ? "translate-x-0" : "translate-x-full",
          )}
          onClick={(event) => event.stopPropagation()}
        >
          <div className="flex min-h-16 items-center justify-between gap-3 border-b border-border px-4">
            <span className="text-sm font-bold uppercase tracking-widest text-brand">
              Menu administrativo
            </span>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setMenuOpen(false)}
              aria-label="Fechar menu administrativo"
            >
              <X className="size-5" aria-hidden="true" />
            </Button>
          </div>

          <nav aria-label="Seções administrativas" className="flex-1 overflow-y-auto p-4">
            <div className="space-y-1">
              {sections.map((section) => {
                const Icon = section.icon;
                const isActive = section.id === active;
                return (
                  <button
                    key={section.id}
                    type="button"
                    aria-current={isActive ? "page" : undefined}
                    onClick={() => {
                      onSelect(section.id);
                      setMenuOpen(false);
                    }}
                    className={cn(
                      "flex min-h-11 w-full items-center gap-3 rounded-xl px-4 py-2.5 text-left text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 motion-reduce:transition-none",
                      isActive
                        ? "bg-brand/10 text-brand"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground",
                    )}
                  >
                    <Icon className="size-4 shrink-0" aria-hidden="true" />
                    <span>{section.label}</span>
                  </button>
                );
              })}
            </div>
          </nav>

          <div className="mt-auto border-t border-border p-4">
            <Button
              variant="destructive"
              className="min-h-11 w-full justify-start gap-3 rounded-xl"
              onClick={() => {
                setMenuOpen(false);
                signOut();
              }}
            >
              <LogOut className="size-4" aria-hidden="true" />
              Sair da gestão
            </Button>
          </div>
        </aside>
      </div>

      <nav
        aria-label="Navegação administrativa móvel"
        className="fixed inset-x-0 bottom-0 z-50 border-t border-border bg-background/95 px-1.5 pb-[max(0.375rem,env(safe-area-inset-bottom))] pt-1.5 backdrop-blur-md lg:hidden"
      >
        <div className="mx-auto flex max-w-md items-stretch justify-around gap-1">
          {mainActions.map((item) => {
            const isActive = active === item.id;
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                type="button"
                aria-current={isActive ? "page" : undefined}
                onClick={() => onSelect(item.id)}
                className={cn(
                  "flex min-h-14 flex-1 flex-col items-center justify-center gap-1 rounded-xl px-1 py-1.5 text-center transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring motion-reduce:transition-none",
                  isActive ? "bg-brand/10 text-brand" : "text-muted-foreground hover:bg-muted/70",
                )}
              >
                <Icon className="size-5" aria-hidden="true" />
                <span className="text-[11px] font-bold leading-none">{item.label}</span>
              </button>
            );
          })}

          <button
            type="button"
            aria-expanded={menuOpen}
            aria-label="Abrir mais opções administrativas"
            onClick={() => setMenuOpen(true)}
            className="flex min-h-14 flex-1 flex-col items-center justify-center gap-1 rounded-xl px-1 py-1.5 text-muted-foreground transition-colors hover:bg-muted/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring motion-reduce:transition-none"
          >
            <Menu className="size-5" aria-hidden="true" />
            <span className="text-[11px] font-bold leading-none">Mais</span>
          </button>
        </div>
      </nav>
    </>
  );
}
