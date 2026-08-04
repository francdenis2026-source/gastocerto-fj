import { Link, useRouterState } from "@tanstack/react-router";
import { LayoutDashboard, ArrowLeftRight, PiggyBank, BarChart3, Menu, X, LogOut } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { navSections } from "@/lib/nav-model";
import { useAuth } from "@/hooks/use-auth";

export function MobileTabBar() {
  const { signOut } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = useRouterState({ select: (state) => state.location.pathname });

  const mainActions = [
    { to: "/painel", icon: LayoutDashboard, label: "Início" },
    { to: "/lancamentos", icon: ArrowLeftRight, label: "Lançamentos" },
    { to: "/orcamentos", icon: PiggyBank, label: "Planejar" },
    { to: "/relatorios", icon: BarChart3, label: "Análise" },
  ];

  return (
    <>
      {/* Menu Drawer Mobile */}
      <div className={cn(
        "fixed inset-0 z-[60] bg-background/80 backdrop-blur-sm transition-opacity lg:hidden",
        menuOpen ? "opacity-100" : "pointer-events-none opacity-0"
      )} onClick={() => setMenuOpen(false)}>
        <div className={cn(
          "fixed inset-y-0 right-0 w-[300px] bg-card border-l border-border shadow-2xl transition-transform duration-300 lg:hidden flex flex-col",
          menuOpen ? "translate-x-0" : "translate-x-full"
        )} onClick={e => e.stopPropagation()}>
          <div className="flex h-16 items-center justify-between border-b border-border px-5">
            <span className="text-sm font-black uppercase tracking-[0.2em] text-brand">Navegação</span>
            <Button variant="ghost" size="icon" onClick={() => setMenuOpen(false)} className="rounded-full">
              <X className="size-5" />
            </Button>
          </div>
          
          <div className="flex-1 overflow-y-auto p-5 space-y-8 pb-4">
            {navSections.map((section) => (
              <div key={section.key} className="space-y-3">
                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 px-1">
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
                        className={cn(
                          "flex items-center gap-3 rounded-2xl px-4 py-3.5 text-[13px] font-bold transition-all active:scale-[0.98]",
                          isActive 
                            ? "bg-brand/10 text-brand shadow-inner border border-brand/20" 
                            : "bg-secondary/40 text-muted-foreground hover:bg-secondary/60"
                        )}
                      >
                        <div className={cn(
                          "grid size-8 place-items-center rounded-xl border",
                          isActive ? "border-brand/30 bg-brand/10" : "border-border/50 bg-background/50"
                        )}>
                          <Icon className="size-4" />
                        </div>
                        <div className="flex flex-col">
                          <span>{group.label}</span>
                          {group.hint && <span className="text-[10px] font-medium opacity-60 leading-none mt-0.5">{group.hint}</span>}
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}

            <div className="pt-4 border-t border-border mt-4">
              <Button 
                variant="destructive" 
                className="w-full justify-start gap-3 rounded-2xl py-6 text-sm font-bold"
                onClick={() => {
                  setMenuOpen(false);
                  signOut();
                }}
              >
                <LogOut className="size-4" />
                Sair da Conta
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Tab Bar Fixo Inferior */}
      <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-background/90 p-1.5 pb-safe backdrop-blur-lg lg:hidden">
        <div className="mx-auto flex max-w-md items-center justify-around gap-1">
          {mainActions.map((item) => {
            const isActive = pathname === item.to;
            const Icon = item.icon;
            return (
              <Link
                key={item.to}
                to={item.to as any}
                className={cn(
                  "flex flex-1 flex-col items-center gap-1 rounded-2xl py-2 transition-all active:scale-90",
                  isActive ? "text-brand" : "text-muted-foreground/70"
                )}
              >
                <div className={cn(
                  "relative grid size-11 place-items-center rounded-2xl transition-all duration-300",
                  isActive ? "bg-brand/10 shadow-sm border border-brand/20" : "hover:bg-secondary"
                )}>
                  <Icon className={cn("size-5.5", isActive && "animate-pulse")} />
                  {isActive && (
                    <span className="absolute -bottom-1 size-1.5 rounded-full bg-brand shadow-[0_0_8px_var(--brand)]" />
                  )}
                </div>
                <span className="text-[10px] font-black uppercase tracking-tighter">{item.label}</span>
              </Link>
            );
          })}
          
          <button
            onClick={() => setMenuOpen(true)}
            className="flex flex-1 flex-col items-center gap-1 rounded-2xl py-2 text-muted-foreground/70 active:scale-90"
          >
            <div className="grid size-11 place-items-center rounded-2xl hover:bg-secondary border border-transparent">
              <Menu className="size-5.5" />
            </div>
            <span className="text-[10px] font-black uppercase tracking-tighter">Mais</span>
          </button>
        </div>
      </div>
    </>
  );
}
