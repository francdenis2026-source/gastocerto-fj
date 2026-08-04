import { Link, useRouterState } from "@tanstack/react-router";
import { LayoutDashboard, ArrowLeftRight, PiggyBank, BarChart3, Menu, X, LogOut, Baby } from "lucide-react";
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
    { to: "/relatorios", icon: BarChart3, label: "Relatórios" },
    { to: "/filhos", icon: Baby, label: "Kids" },
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
          <div className="flex h-14 items-center justify-between border-b border-border px-4">
            <span className="text-[11px] font-black uppercase tracking-[0.2em] text-brand">Navegação</span>
            <Button variant="ghost" size="icon" onClick={() => setMenuOpen(false)} className="rounded-full size-9">
              <X className="size-4" />
            </Button>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 space-y-6 pb-4">
            {navSections.map((section) => (
              <div key={section.key} className="space-y-2">
                <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/60 px-1">
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
                          "flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-[12px] font-bold transition-all active:scale-[0.98]",
                          isActive 
                            ? "bg-brand/10 text-brand shadow-inner border border-brand/20" 
                            : "bg-secondary/40 text-muted-foreground hover:bg-secondary/60"
                        )}
                      >
                        <div className={cn(
                          "grid size-7 place-items-center rounded-lg border",
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
                className="w-full justify-start gap-3 rounded-xl py-5 text-[13px] font-bold"
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
      <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-border/30 bg-background/90 p-1 pb-safe backdrop-blur-xl lg:hidden">
        <div className="mx-auto flex max-w-md items-center justify-around">
          {mainActions.map((item) => {
            const isActive = pathname === item.to;
            const Icon = item.icon;
            return (
              <Link
                key={item.to}
                to={item.to as any}
                className={cn(
                  "flex flex-1 flex-col items-center gap-1 rounded-lg py-1.5 transition-all active:scale-90",
                  isActive ? "text-brand" : "text-muted-foreground/60"
                )}
              >
                <div className={cn(
                  "relative grid size-8 place-items-center rounded-xl transition-all duration-300",
                  isActive ? "bg-brand/10 shadow-sm border border-brand/20" : "hover:bg-secondary/40"
                )}>
                  <Icon className={cn("size-4.5", isActive && "animate-pulse")} />
                  {isActive && (
                    <span className="absolute -bottom-1 size-1 rounded-full bg-brand shadow-[0_0_8px_var(--brand)]" />
                  )}
                </div>
                <span className="text-[9px] font-black uppercase tracking-tighter leading-none">{item.label}</span>
              </Link>
            );
          })}
          
          <button
            onClick={() => setMenuOpen(true)}
            className="flex flex-1 flex-col items-center gap-1 rounded-lg py-1.5 text-muted-foreground/60 active:scale-90"
          >
            <div className="grid size-8 place-items-center rounded-xl hover:bg-secondary/40 border border-transparent">
              <Menu className="size-4.5" />
            </div>
            <span className="text-[9px] font-black uppercase tracking-tighter leading-none">Mais</span>
          </button>
        </div>
      </div>
    </>
  );
}
