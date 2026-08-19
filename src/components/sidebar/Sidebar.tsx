import { Link, useRouterState } from "@tanstack/react-router";
import { ChevronRight, LogOut } from "lucide-react";
import { useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/logo";
import { cn } from "@/lib/utils";
import { navSections, type NavGroup } from "@/lib/nav-model";
import { usePlanAccess } from "@/lib/plan-features";
import { useProfile } from "@/lib/queries";

interface SidebarProps {
  railCollapsed?: boolean;
  onSignOut?: () => void;
}

export function Sidebar({ railCollapsed, onSignOut }: SidebarProps) {
  const { data: profile } = useProfile();
  const { planSlug } = usePlanAccess();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  const [openSection, setOpenSection] = useState<string | null>(() => {
    const activeSection = navSections.find((section) =>
      section.groups.some(
        (group) => pathname === group.to || group.children?.some((child) => pathname === child.to),
      ),
    );
    return activeSection?.key || "main";
  });

  const toggleSection = (key: string) => {
    setOpenSection((previous) => (previous === key ? null : key));
  };

  return (
    <nav
      aria-label="Navegação principal"
      className={cn(
        "relative z-40 flex h-dvh flex-col border-r border-border bg-card transition-[width] duration-300 motion-reduce:transition-none",
        railCollapsed ? "w-20" : "w-64",
      )}
    >
      <div className="flex h-16 items-center border-b border-border px-6">
        <Logo compact={railCollapsed} href="/painel" />
      </div>

      <div className="flex-1 space-y-2 overflow-y-auto overflow-x-hidden p-4 scrollbar-none">
        {navSections.map((section) => {
          const isSectionOpen = openSection === section.key;

          return (
            <div key={section.key} className="space-y-1">
              {section.groups.map((group) => (
                <SidebarItem
                  key={group.key}
                  group={group}
                  collapsed={railCollapsed}
                  active={pathname === group.to || group.children?.some((child) => pathname === child.to)}
                  isOpen={isSectionOpen}
                  onToggle={() => toggleSection(section.key)}
                  pathname={pathname}
                />
              ))}
            </div>
          );
        })}
      </div>

      <div className="border-t border-border p-4">
        <div
          className={cn(
            "rounded-2xl border border-border bg-muted/50 p-3 shadow-sm",
            railCollapsed ? "flex flex-col items-center gap-3" : "space-y-3",
          )}
        >
          <div className="flex items-center gap-3">
            <div
              aria-hidden="true"
              className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-emerald-500/20 bg-emerald-500/10 font-bold text-emerald-600 dark:text-emerald-400"
            >
              {profile?.full_name?.charAt(0) || "U"}
            </div>

            {!railCollapsed ? (
              <div className="min-w-0 flex-1">
                <div className="flex min-w-0 items-center gap-2">
                  <span className="truncate text-sm font-bold text-foreground">
                    {profile?.full_name?.split(" ")[0] || "Usuário"}
                  </span>
                  <Badge
                    variant="outline"
                    className="shrink-0 border-emerald-500/20 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
                  >
                    {planSlug === "premium_ia" ? "Premium IA" : "Premium"}
                  </Badge>
                </div>
                <p className="mt-0.5 truncate text-xs text-muted-foreground">
                  {profile?.full_name?.split(" ").slice(1).join(" ") || "Conta GastoCerto"}
                </p>
              </div>
            ) : null}

            {!railCollapsed && onSignOut ? (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={onSignOut}
                aria-label="Sair da conta"
                title="Sair da conta"
                className="text-muted-foreground hover:text-destructive"
              >
                <LogOut className="size-4" aria-hidden="true" />
              </Button>
            ) : null}
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
  onToggle,
  pathname,
}: {
  group: NavGroup;
  collapsed?: boolean;
  active?: boolean;
  isOpen: boolean;
  onToggle: () => void;
  pathname: string;
}) {
  const Icon = group.icon;
  const hasChildren = (group.children?.length ?? 0) > 0;
  const childrenId = `sidebar-${group.key}-children`;

  return (
    <div className="space-y-1">
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={hasChildren ? isOpen : undefined}
        aria-controls={hasChildren ? childrenId : undefined}
        aria-current={active ? "page" : undefined}
        aria-label={collapsed ? group.label : undefined}
        className={cn(
          "group relative flex min-h-11 w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors motion-reduce:transition-none",
          active
            ? "bg-primary/10 text-primary"
            : "text-muted-foreground hover:bg-muted hover:text-foreground",
        )}
      >
        <span
          className={cn(
            "shrink-0 rounded-lg transition-colors motion-reduce:transition-none",
            active ? "text-primary" : "group-hover:text-foreground",
          )}
        >
          <Icon className="size-5" aria-hidden="true" />
        </span>

        {!collapsed ? (
          <span className="min-w-0 flex-1 truncate text-xs font-bold uppercase tracking-wider">
            {group.label}
          </span>
        ) : null}

        {hasChildren && !collapsed ? (
          <ChevronRight
            aria-hidden="true"
            className={cn(
              "size-4 shrink-0 opacity-50 transition-transform motion-reduce:transition-none",
              isOpen && "rotate-90",
            )}
          />
        ) : null}

        {active ? (
          <span
            aria-hidden="true"
            className="absolute left-0 top-1/2 h-6 w-1 -translate-y-1/2 rounded-r-full bg-primary"
          />
        ) : null}
      </button>

      {hasChildren && !collapsed && isOpen ? (
        <div id={childrenId} className="ml-9 space-y-1 overflow-hidden pl-2">
          {group.children
            ?.filter((child) => !child.hidden)
            .map((child) => {
              const childActive = pathname === child.to;
              return (
                <Link
                  key={child.key}
                  to={child.to as any}
                  aria-current={childActive ? "page" : undefined}
                  className={cn(
                    "flex min-h-10 items-center rounded-lg px-2 py-2 text-xs font-semibold text-muted-foreground transition-colors hover:bg-muted hover:text-foreground motion-reduce:transition-none",
                    childActive && "bg-primary/8 text-primary",
                  )}
                >
                  <span className="truncate">{child.label}</span>
                </Link>
              );
            })}
        </div>
      ) : null}
    </div>
  );
}
