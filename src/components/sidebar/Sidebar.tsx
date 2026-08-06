import { Link, useRouterState } from "@tanstack/react-router";
import { cn } from "@/lib/utils";
import { 
  LayoutDashboard, 
  ChevronDown,
  LogOut,
  ChevronRight
} from "lucide-react";
import { useProfile } from "@/lib/queries";
import { Logo } from "@/components/logo";
import { useState } from "react";
import { navSections, type NavGroup } from "@/lib/nav-model";
import { usePlanAccess } from "@/lib/plan-features";
import { Badge } from "@/components/ui/badge";

interface SidebarProps {
  railCollapsed?: boolean;
  onSignOut?: () => void;
}

export function Sidebar({ railCollapsed, onSignOut }: SidebarProps) {
  const { data: profile } = useProfile();
  const { planSlug } = usePlanAccess();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  // Accordion state: keep track of which section is open
  const [openSection, setOpenSection] = useState<string | null>(() => {
    const activeSection = navSections.find(s => s.groups.some(g => pathname === g.to || g.children?.some(c => pathname === c.to)));
    return activeSection?.key || "main";
  });

  const toggleSection = (key: string) => {
    setOpenSection(prev => prev === key ? null : key);
  };

  return (
    <nav className={cn(
      "bg-card border-r border-border h-screen flex flex-col transition-all duration-300 relative z-40",
      railCollapsed ? "w-20" : "w-64"
    )}>
      {/* Header / Logo */}
      <div className="h-16 flex items-center px-6 border-b border-border">
        <Logo compact={railCollapsed} href="/painel" />
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden p-4 space-y-2 scrollbar-none">
        {navSections.map((section) => {
          const isSectionOpen = openSection === section.key;

          return (
            <div key={section.key} className="space-y-1">
              {section.groups.map((group) => (
                <SidebarItem 
                  key={group.key}
                  group={group}
                  collapsed={railCollapsed}
                  active={pathname === group.to || group.children?.some(c => pathname === c.to)}
                  isOpen={isSectionOpen}
                  onToggle={() => toggleSection(section.key)}
                />
              ))}
            </div>
          );
        })}
      </div>

      {/* Footer / User Profile */}
      <div className="p-4 border-t border-border">
        <div className={cn(
          "bg-muted/50 p-3 rounded-2xl border border-border shadow-sm",
          railCollapsed ? "flex flex-col items-center gap-3" : "space-y-3"
        )}>
          {!railCollapsed && (
             <div className="flex items-center justify-between px-1">
                <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">Saldo Mensal</span>
                <span className="text-[11px] font-bold text-primary">R$ 2.450,00</span>
             </div>
          )}

          <div className="flex items-center gap-3">
            <div className="size-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500 font-bold shrink-0">
              {profile?.full_name?.charAt(0) || "U"}
            </div>
            {!railCollapsed && (
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-[13px] font-bold text-foreground truncate">
                    {profile?.full_name?.split(" ")[0]}
                  </span>
                  <Badge variant="outline" className="h-4 px-1 text-[8px] font-black uppercase bg-emerald-500/10 text-emerald-500 border-emerald-500/20 shadow-[0_0_8px_rgba(34,197,94,0.2)]">
                    {planSlug === "premium_ia" ? "Premium IA" : "Premium"}
                  </Badge>
                </div>
                <div className="text-[10px] text-muted-foreground font-medium truncate uppercase tracking-tighter">
                  {profile?.full_name?.split(" ").slice(1).join(" ")}
                </div>
              </div>
            )}
            {!railCollapsed && onSignOut && (
              <button 
                onClick={onSignOut}
                className="p-1.5 text-muted-foreground hover:text-destructive transition-colors"
                title="Sair"
              >
                <LogOut className="size-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

function SidebarItem({ 
  group, 
  collapsed, 
  active,
  isOpen,
  onToggle
}: { 
  group: NavGroup; 
  collapsed?: boolean;
  active?: boolean;
  isOpen: boolean;
  onToggle: () => void;
}) {
  const Icon = group.icon;
  const hasChildren = (group.children?.length ?? 0) > 0;

  return (
    <div className="space-y-1">
      <button
        onClick={onToggle}
        className={cn(
          "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group relative",
          active 
            ? "bg-primary/10 text-primary" 
            : "text-muted-foreground hover:text-foreground hover:bg-muted"
        )}
      >
        <div className={cn(
          "rounded-lg transition-colors shrink-0",
          active ? "text-primary" : "group-hover:text-foreground"
        )}>
          <Icon className="size-5" />
        </div>
        
        {!collapsed && (
          <span className="text-[12px] font-bold flex-1 truncate tracking-wider text-left uppercase">
            {group.label}
          </span>
        )}

        {hasChildren && !collapsed && (
          <ChevronRight 
            className={cn(
              "size-3.5 opacity-40 transition-transform",
              isOpen && "rotate-90"
            )} 
          />
        )}

        {active && (
          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-primary rounded-r-full" />
        )}
      </button>

      {hasChildren && !collapsed && isOpen && (
        <div className="ml-11 space-y-1 animate-in slide-in-from-top-1 duration-200 overflow-hidden">
          {group.children?.filter(c => !c.hidden).map((child) => (
            <Link
              key={child.key}
              to={child.to as any}
              className={cn(
                "block py-1.5 text-[12px] font-bold transition-colors truncate pr-2 text-muted-foreground hover:text-foreground"
              )}
              activeProps={{ className: "text-primary!" }}
            >
              {child.label}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
