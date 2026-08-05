import { Link, useRouterState } from "@tanstack/react-router";
import { cn } from "@/lib/utils";
import { 
  LayoutDashboard, 
  ArrowLeftRight, 
  PiggyBank, 
  Zap, 
  BarChart3, 
  CalendarClock, 
  Baby, 
  Settings2,
  ChevronDown,
  LogOut,
  ChevronRight
} from "lucide-react";
import { useProfile } from "@/lib/queries";
import { Logo } from "@/components/logo";
import { useState } from "react";
import { navSections, type NavGroup } from "@/lib/nav-model";

interface SidebarProps {
  railCollapsed?: boolean;
  onSignOut?: () => void;
}

export function Sidebar({ railCollapsed, onSignOut }: SidebarProps) {
  const { data: profile } = useProfile();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <nav className={cn(
      "bg-[#0B0F14] border-r border-white/5 h-screen flex flex-col transition-all duration-300",
      railCollapsed ? "w-20" : "w-64"
    )}>
      {/* Header / Logo */}
      <div className="h-16 flex items-center px-6 border-b border-white/5">
        <Logo compact={railCollapsed} href="/painel" />
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden p-4 space-y-8 scrollbar-none">
        {navSections.map((section) => (
          <div key={section.key} className="space-y-1">
            {!railCollapsed && (
              <div className="text-[10px] text-slate-500 uppercase tracking-[0.2em] px-3 mb-3 font-black opacity-50">
                {section.label}
              </div>
            )}
            
            <div className="space-y-1">
              {section.groups.map((group) => (
                <SidebarItem 
                  key={group.key}
                  group={group}
                  collapsed={railCollapsed}
                  active={pathname === group.to || group.children?.some(c => pathname === c.to)}
                />
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Footer / User Profile */}
      <div className="p-4 border-t border-white/5">
        <div className={cn(
          "flex items-center gap-3 p-2 rounded-2xl transition-colors",
          !railCollapsed && "hover:bg-white/5"
        )}>
          <div className="size-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500 font-bold shrink-0">
            {profile?.full_name?.charAt(0) || "U"}
          </div>
          {!railCollapsed && (
            <div className="flex-1 min-w-0">
              <div className="text-sm font-bold text-white truncate">{profile?.full_name?.split(" ")[0]}</div>
              <div className="text-[10px] text-slate-500 font-medium truncate uppercase tracking-tighter">
                {profile?.full_name?.split(" ").slice(1).join(" ")}
              </div>
            </div>
          )}
          {!railCollapsed && onSignOut && (
            <button 
              onClick={onSignOut}
              className="p-2 text-slate-500 hover:text-rose-500 transition-colors"
              title="Sair"
            >
              <LogOut className="size-4" />
            </button>
          )}
        </div>
      </div>
    </nav>
  );
}

function SidebarItem({ 
  group, 
  collapsed, 
  active 
}: { 
  group: NavGroup; 
  collapsed?: boolean;
  active?: boolean;
}) {
  const [isOpen, setIsOpen] = useState(active);
  const Icon = group.icon;
  const hasChildren = (group.children?.length ?? 0) > 0;

  return (
    <div className="space-y-1">
      <Link
        to={group.to as any}
        className={cn(
          "flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group relative",
          active 
            ? "bg-emerald-500/5 text-emerald-500 border border-emerald-500/10" 
            : "text-slate-400 hover:text-white hover:bg-white/5 border border-transparent"
        )}
      >
        <div className={cn(
          "p-2 rounded-lg transition-colors shrink-0",
          active ? "bg-emerald-500/10 text-emerald-500" : "text-slate-500 group-hover:text-slate-300"
        )}>
          <Icon className="size-4" />
        </div>
        
        {!collapsed && (
          <span className="text-[13px] font-bold flex-1 truncate tracking-tight">
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
          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-4 bg-emerald-500 rounded-r-full shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
        )}
      </Link>

      {hasChildren && !collapsed && isOpen && (
        <div className="ml-11 space-y-1 animate-in slide-in-from-left-2 duration-200">
          {group.children?.filter(c => !c.hidden).map((child) => (
            <Link
              key={child.key}
              to={child.to as any}
              className={cn(
                "block py-1.5 text-[12px] font-medium transition-colors hover:text-white truncate",
                active ? "text-slate-400" : "text-slate-500"
              )}
              activeProps={{ className: "text-emerald-500 font-bold" }}
            >
              {child.label}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
