import { Link, useRouterState } from "@tanstack/react-router";
import { LayoutDashboard, Users, KeyRound, TrendingUp, ShieldCheck, LifeBuoy, Lock, FileClock, Menu, X, Wallet, LogOut } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { AdminSection } from "./admin-console-shell";

export function MobileAdminTabBar({ 
  sections, 
  active, 
  onSelect 
}: { 
  sections: AdminSection[];
  active: string;
  onSelect: (id: string) => void;
}) {
  const { signOut } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  // Define as seções principais para o tab bar fixo
  const mainActions = [
    { id: "overview", icon: LayoutDashboard, label: "Dashboard" },
    { id: "users", icon: Users, label: "Contas" },
    { id: "financial", icon: Wallet, label: "Financeiro" },
    { id: "temporary", icon: KeyRound, label: "Trials" },
  ];

  return (
    <>
      {/* Menu Drawer Mobile */}
      <div className={cn(
        "fixed inset-0 z-[60] bg-background/80 backdrop-blur-sm transition-opacity lg:hidden",
        menuOpen ? "opacity-100" : "pointer-events-none opacity-0"
      )} onClick={() => setMenuOpen(false)}>
        <div className={cn(
          "fixed inset-y-0 right-0 w-[280px] bg-card border-l border-border shadow-2xl transition-transform duration-300 lg:hidden",
          menuOpen ? "translate-x-0" : "translate-x-full"
        )} onClick={e => e.stopPropagation()}>
          <div className="flex h-16 items-center justify-between border-b border-border px-4">
            <span className="text-sm font-bold uppercase tracking-widest text-brand">Menu Administrativo</span>
            <Button variant="ghost" size="icon" onClick={() => setMenuOpen(false)}>
              <X className="size-5" />
            </Button>
          </div>
          <div className="flex flex-col h-[calc(100%-4rem)]">
            <div className="flex-1 overflow-y-auto p-4 space-y-6">
              <div className="space-y-1">
              {sections.map((section) => {
                const Icon = section.icon;
                const isActive = section.id === active;
                return (
                  <button
                    key={section.id}
                    onClick={() => {
                      onSelect(section.id);
                      setMenuOpen(false);
                    }}
                    className={cn(
                      "flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-bold transition-all active:scale-[0.98]",
                      isActive 
                        ? "bg-brand/10 text-brand shadow-inner" 
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    )}
                  >
                    <Icon className="size-4" />
                    {section.label}
                  </button>
                );
              })}
            </div>
          </div>
          
          <div className="p-4 border-t border-border mt-auto">
            <Button 
              variant="destructive" 
              className="w-full justify-start gap-3 rounded-xl py-5 text-sm font-bold"
              onClick={() => {
                setMenuOpen(false);
                signOut();
              }}
            >
              <LogOut className="size-4" />
              Sair da Gestão
            </Button>
          </div>
        </div>
      </div>

      {/* Tab Bar Fixo Inferior */}
      <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-background/95 p-1.5 backdrop-blur-md lg:hidden">
        <div className="mx-auto flex max-w-md items-center justify-around gap-1">
          {mainActions.map((item) => {
            const isActive = active === item.id;
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => onSelect(item.id)}
                className={cn(
                  "flex flex-1 flex-col items-center gap-1 rounded-xl py-2 transition-all active:scale-90",
                  isActive ? "text-brand" : "text-muted-foreground"
                )}
              >
                <div className={cn(
                  "relative grid size-10 place-items-center rounded-xl transition-all duration-300",
                  isActive ? "bg-brand/10 shadow-sm" : "group-hover:bg-muted"
                )}>
                  <Icon className={cn("size-5", isActive && "animate-pulse")} />
                  {isActive && (
                    <span className="absolute -bottom-1 size-1 rounded-full bg-brand" />
                  )}
                </div>
                <span className="text-[10px] font-black uppercase tracking-tighter">{item.label}</span>
              </button>
            );
          })}
          
          <button
            onClick={() => setMenuOpen(true)}
            className="flex flex-1 flex-col items-center gap-1 rounded-xl py-2 text-muted-foreground active:scale-90"
          >
            <div className="grid size-10 place-items-center rounded-xl hover:bg-muted">
              <Menu className="size-5" />
            </div>
            <span className="text-[10px] font-black uppercase tracking-tighter">Mais</span>
          </button>
        </div>
      </div>
    </>
  );
}
