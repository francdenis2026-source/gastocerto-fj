import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { ReadOnlyBanner } from "@/components/finance/read-only-banner";
import {
  ChevronDown,
  PanelLeftClose,
  PanelLeftOpen,
  LogOut,
  Plus,
  Menu,
  RefreshCcw,
  X,
  TrendingUp,
  TrendingDown,
  Settings,
  AlertCircle,
} from "lucide-react";
import { toast } from "sonner";

import { useState, type ReactNode, useEffect, useMemo } from "react";

import { Logo } from "@/components/logo";
import { NotificationCenter } from "@/components/notifications/notification-center";
import { TransactionDialog } from "@/components/finance/transaction-dialog";

import { useKidSession } from "@/lib/kids-session";
import { useKidsRealtimeAlerts } from "@/lib/kids-realtime";
import { ThemeToggle } from "@/components/theme-toggle";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { usePlanRealtimeSync } from "@/hooks/use-plan";
import { supabase } from "@/integrations/supabase/client";
import { useAvatarUrl, useProfile, useRoles } from "@/lib/queries";
import { clearBrowserCredentials } from "@/lib/local-session";
import { useNotifications } from "@/lib/notifications";
import { EnergySidebarWidget } from "@/components/sidebar/energy-widget";
import { formatCurrency } from "@/lib/format";
import { getRecurrentExpenses } from "@/lib/recurrent-metrics.functions";
import { useQuery } from "@tanstack/react-query";
import type { SidebarMetric } from "./settings/sidebar-config";
import { CommandPalette } from "@/components/nav/command-palette";
import {
  adminNavGroups,
  flattenGroups,
  mobilePrimary,
  navSections,
  staffNavGroup,
  type NavGroup,
  type NavSection,
} from "@/lib/nav-model";
import { cn } from "@/lib/utils";



type Kind = "expense" | "income";


export function AppShell({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const [quickEntry, setQuickEntry] = useState<Kind | null>(null);
  const [railCollapsed, setRailCollapsed] = useState(() => {
    if (typeof window === "undefined") return false;
    return localStorage.getItem("gc:sidebar-collapsed") === "true";
  });
  const [expanded, setExpanded] = useState<string | null>(() => {
    if (typeof window === "undefined") return null;
    return localStorage.getItem("gc:sidebar-expanded-group");
  });

  const handleSetExpanded = (val: string | null) => {
    setExpanded(val);
    if (val) {
      localStorage.setItem("gc:sidebar-expanded-group", val);
    } else {
      localStorage.removeItem("gc:sidebar-expanded-group");
    }
  };

  const toggleRail = () => {
    setRailCollapsed((prev) => {
      const next = !prev;
      localStorage.setItem("gc:sidebar-collapsed", String(next));
      return next;
    });
  };
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  const { data: profile } = useProfile();
  const { data: roles } = useRoles();
  const { data: notifications } = useNotifications();
  const avatarUrl = useAvatarUrl(profile?.avatar_url);
  usePlanRealtimeSync();
  // Avisos e conquistas do Espaço Kids chegam sem recarregar a tela.
  useKidsRealtimeAlerts();

  // Conta de criança nunca vê o painel do responsável.
  const { isKid } = useKidSession();
  useEffect(() => {
    if (isKid && pathname !== "/meu-espaco") {
      navigate({ to: "/meu-espaco", replace: true });
    }
  }, [isKid, pathname, navigate]);

  const { data: recurrents } = useQuery({
    queryKey: ["recurrent-expenses-sidebar"],
    queryFn: () => getRecurrentExpenses()
  });

  const [metricsConfig, setMetricsConfig] = useState<SidebarMetric[]>([]);

  useEffect(() => {
    const loadConfig = () => {
      const saved = localStorage.getItem("sidebar-metrics-config");
      if (saved) {
        try {
          setMetricsConfig(JSON.parse(saved));
        } catch (e) {}
      }
    };
    loadConfig();
    window.addEventListener("sidebar-config-updated", loadConfig);
    return () => window.removeEventListener("sidebar-config-updated", loadConfig);
  }, []);

  const activeMetrics = useMemo(() => {
    if (metricsConfig.length === 0) return [];
    return metricsConfig.filter(m => m.enabled);
  }, [metricsConfig]);
  const unreadCount = (notifications ?? []).filter((item) => !item.read_at).length;
  const isStaff = (roles ?? []).some((role) => role === "admin" || role === "support");
  const isAdminArea = pathname.startsWith("/admin");
  // Uma única fonte de verdade (src/lib/nav-model.ts) alimenta sidebar,
  // menu mobile, abas do header e a busca rápida.
  const sections: NavSection[] = isAdminArea
    ? [{ key: "admin", label: "Equipe", groups: adminNavGroups }]
    : isStaff
      ? [...navSections, { key: "staff", label: "Equipe", groups: [staffNavGroup] }]
      : navSections;

  const items: NavGroup[] = flattenGroups(sections);

  const activeGroup = items.find(
    (group) => group.to === pathname || group.children?.some((child) => child.to === pathname),
  );
  // Rotas de detalhe ficam fora das abas para não poluir o header.
  const subTabs = (activeGroup?.children ?? []).filter((child) => !child.hidden);





  const initials = (profile?.full_name ?? "GC")
    .split(" ")
    .slice(0, 2)
    .map((part: string) => part.charAt(0).toUpperCase())
    .join("");

  async function handleSignOut() {
    const confirmed = window.confirm("Tem certeza que deseja encerrar sua sessão com segurança?");
    if (!confirmed) return;

    const toastId = toast.loading("Encerrando sessão e limpando dados...", {
      description: "Seus dados estão sendo removidos com segurança.",
      icon: <RefreshCcw className="size-4 animate-spin text-brand" />
    });

    try {
      await queryClient.cancelQueries();
      queryClient.clear();
      
      // Limpeza completa e segura
      clearBrowserCredentials();
      window.localStorage.clear();
      window.sessionStorage.clear();
      
      await supabase.auth.signOut();
      
      toast.success("Sessão encerrada!", {
        id: toastId,
        description: "Seus dados foram removidos do navegador.",
        icon: <AlertCircle className="size-4 text-emerald-500" />
      });

      // Pequeno delay para o usuário ver o toast antes do redirecionamento
      setTimeout(() => {
        window.location.replace("/");
      }, 1000);
    } catch (error) {
      toast.error("Erro ao sair", { id: toastId });
      window.location.replace("/");
    }
  }

  return (
    <div className="min-h-screen bg-secondary/20 lg:flex">
      <aside
        className={cn(
          "sticky top-0 hidden h-screen shrink-0 flex-col border-r border-border bg-background transition-[width] duration-200 lg:flex",
          railCollapsed ? "w-[76px]" : "w-[268px]",
        )}
      >
        <div className="flex h-16 items-center gap-2 border-b border-border px-3">
          <Link
            to={isAdminArea ? "/admin" : "/painel"}
            aria-label="Ir para o painel"
            className="min-w-0 transition-transform hover:scale-[1.02]"
          >
            <Logo compact={railCollapsed} />
          </Link>
          <Button
            variant="ghost"
            size="icon"
            className="ml-auto size-8 text-muted-foreground"
            onClick={toggleRail}
            aria-label={railCollapsed ? "Expandir menu" : "Recolher menu"}
          >
            {railCollapsed ? (
              <PanelLeftOpen className="size-4" />
            ) : (
              <PanelLeftClose className="size-4" />
            )}
          </Button>
        </div>

        {!isAdminArea ? (
          <div className={cn("space-y-2 border-b border-border p-3", railCollapsed && "px-2")}>
            <div className={cn("grid gap-1.5", railCollapsed ? "grid-cols-1" : "grid-cols-2")}>
              <Button
                onClick={() => setQuickEntry("expense")}
                className="w-full gap-1.5 bg-brand text-brand-foreground hover:opacity-90"
                size={railCollapsed ? "icon" : "sm"}
                aria-label="Nova despesa"
                title="Nova despesa"
              >
                <TrendingDown className="size-4" aria-hidden="true" />
                {!railCollapsed ? <span className="text-[12px]">Despesa</span> : null}
              </Button>
              {!railCollapsed ? (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setQuickEntry("income")}
                  className="w-full gap-1.5 border-success/35 text-foreground"
                >
                  <TrendingUp className="size-4 text-success" aria-hidden="true" />
                  <span className="text-[12px]">Receita</span>
                </Button>
              ) : null}
            </div>
            {!railCollapsed ? <CommandPalette onQuickEntry={setQuickEntry} /> : null}
          </div>
        ) : null}

        <nav aria-label="Menu principal" className="flex-1 space-y-3 overflow-y-auto p-2 scrollbar-thin scrollbar-thumb-muted">
          {sections.map((section) => (
            <div key={section.key} className="space-y-1">
              {!railCollapsed ? (
                <p className="px-2.5 pt-1 text-[11px] font-black uppercase tracking-[0.2em] text-muted-foreground/50">
                  {section.label}
                </p>
              ) : (
                <div aria-hidden className="mx-auto h-px w-6 bg-border/50 my-3" />
              )}
              {section.groups.map((item) => {
                const isActive = activeGroup?.key === item.key;
                const visibleChildren = (item.children ?? []).filter((child) => !child.hidden);
                const hasChildren = visibleChildren.length > 1;
                const isOpen = !railCollapsed && (expanded ? expanded === item.key : isActive);
                
                return (
                  <div key={item.to} className="group/nav-item">
                    <div
                      className={cn(
                        "group relative flex items-center gap-1 rounded-xl transition-all duration-200",
                        isActive ? "bg-brand/10 shadow-sm shadow-brand/5" : "hover:bg-secondary/70",
                      )}
                    >
                      {isActive && (
                        <span
                          aria-hidden
                          className="absolute left-0 top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-r-full bg-brand shadow-[0_0_8px_rgba(var(--brand),0.5)]"
                        />
                      )}
                      <Link
                        to={item.to as never}
                        aria-current={isActive ? "page" : undefined}
                        title={item.hint ? `${item.label} — ${item.hint}` : item.label}
                        className={cn(
                          "flex min-w-0 flex-1 items-center gap-2.5 rounded-xl px-2.5 py-2 text-[14px] font-bold transition-transform active:scale-[0.98]",
                          isActive ? "text-foreground" : "text-muted-foreground group-hover:text-foreground",
                          railCollapsed && "justify-center px-0",
                        )}
                      >
                        <span
                          className={cn(
                            "grid size-8 shrink-0 place-items-center rounded-lg border transition-all duration-300 group-hover/nav-item:scale-110",
                            isActive
                              ? "border-brand/40 bg-brand/15 text-brand shadow-inner"
                              : "border-border/50 bg-secondary/60 text-muted-foreground group-hover:border-brand/30 group-hover:text-brand",
                          )}
                        >
                          <item.icon className={cn("size-4 transition-transform", isActive && "scale-110")} aria-hidden="true" />
                        </span>
                        {!railCollapsed && <span className="truncate tracking-tight">{item.label}</span>}
                      </Link>
                      
                      {hasChildren && !railCollapsed && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            handleSetExpanded(expanded === item.key ? null : item.key);
                          }}
                          aria-expanded={isOpen}
                          aria-label={`${isOpen ? "Recolher" : "Expandir"} ${item.label}`}
                          className="mr-1.5 grid size-7 shrink-0 place-items-center rounded-lg text-muted-foreground transition-all hover:bg-secondary active:scale-90"
                        >
                          <ChevronDown
                            className={cn("size-4 transition-transform duration-300 cubic-bezier(0.4, 0, 0.2, 1)", isOpen && "rotate-180")}
                          />
                        </button>
                      )}
                    </div>

                    {hasChildren && isOpen && (
                      <div className="ml-[26px] mt-1 space-y-0.5 border-l border-border/80 pl-2.5 animate-in slide-in-from-left-2 duration-200">
                        {visibleChildren.map((child) => (
                          <Link
                            key={child.to}
                            to={child.to as never}
                            aria-current={pathname === child.to ? "page" : undefined}
                            className={cn(
                              "flex items-center gap-1.5 truncate rounded-lg px-2.5 py-1.5 text-[12.5px] font-bold transition-all relative",
                              pathname === child.to
                                ? "bg-secondary/80 text-foreground"
                                : "text-muted-foreground hover:bg-secondary/40 hover:text-foreground hover:translate-x-0.5",
                            )}
                          >
                            <span className="truncate tracking-tight">{child.label}</span>
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </nav>


        {!isAdminArea && (
          <div className="mb-4 space-y-2">
            {/* Atalho do Espaço Kids saiu daqui: agora é um grupo próprio no menu. */}


            <EnergySidebarWidget collapsed={railCollapsed} />
            
            {activeMetrics.length > 0 && !railCollapsed && (
              <div className="mx-2 p-3 rounded-xl border border-border bg-secondary/30 space-y-3">
                <div className="flex items-center gap-1.5 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                  <Settings className="size-3 text-brand" />
                  Métricas
                </div>
                <div className="space-y-2">
                  {activeMetrics.map(metric => {
                    const relevantRows = (recurrents ?? []).filter(r => 
                      r.categories?.name?.toLowerCase().includes(metric.label.toLowerCase()) ||
                      r.categories?.name?.toLowerCase().includes(metric.id.toLowerCase())
                    );
                    const currentAmount = relevantRows.reduce((sum, r) => sum + Number(r.amount), 0);
                    const isHigh = currentAmount > metric.defaultAmount && metric.defaultAmount > 0;

                    return (
                      <div key={metric.id} className="space-y-0.5">
                        <div className="flex items-center justify-between text-[10px]">
                          <span className="text-muted-foreground">{metric.label}</span>
                          {isHigh ? (
                            <span className="text-orange-500 font-bold">Alta</span>
                          ) : (
                            <span className="text-emerald-500 font-bold">Ok</span>
                          )}
                        </div>
                        <p className="text-sm font-bold tabular-nums">
                          {formatCurrency(currentAmount)}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        <div className="mt-auto border-t border-border p-2 space-y-1">
          <Link
            to="/perfil"
            className={cn(
              "flex items-center gap-2 rounded-xl px-2 py-2.5 transition-all hover:bg-brand/10 group/profile",
              railCollapsed && "justify-center px-0",
            )}
          >
            <div className="relative shrink-0">
              <Avatar className="size-8 transition-transform group-hover/profile:scale-105 border border-border/50">
                {avatarUrl ? <AvatarImage src={avatarUrl} alt="Foto de perfil" /> : null}
                <AvatarFallback className="text-xs bg-secondary text-muted-foreground">{initials}</AvatarFallback>
              </Avatar>
              <div className="absolute -bottom-0.5 -right-0.5 size-2.5 rounded-full bg-emerald-500 border-2 border-background" />
            </div>
            {!railCollapsed && (
              <span className="min-w-0 flex-1">
                <span className="block truncate text-[12.5px] font-extrabold tracking-tight group-hover/profile:text-brand transition-colors">
                  {profile?.full_name ?? "Minha conta"}
                </span>
                <span className="block truncate text-[10px] font-bold uppercase tracking-wider text-muted-foreground/60">
                  Meu perfil e plano
                </span>
              </span>
            )}
          </Link>
          <Button
            variant="ghost"
            className={cn(
              "w-full justify-start gap-2 h-10 px-2 rounded-xl text-muted-foreground hover:text-rose-500 hover:bg-rose-500/5 transition-all group/logout",
              railCollapsed && "justify-center",
            )}
            onClick={handleSignOut}
            aria-label="Sair"
          >
            <LogOut className="size-4 transition-transform group-hover/logout:-translate-x-0.5" />
            {!railCollapsed && <span className="text-[12.5px] font-bold">Encerrar Sessão</span>}
          </Button>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        {/* pt safe-area: no mobile a faixa do notch acompanha o tema (claro/escuro). */}
        <header className="sticky top-0 z-40 border-b border-border bg-background/90 pt-[env(safe-area-inset-top)] backdrop-blur">
          <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-2 px-3 py-2 sm:px-4 sm:py-3">
            <div className="flex min-w-0 items-center gap-2">
              <Link to="/painel" className="min-w-0 lg:hidden">
                <Logo compact />
              </Link>
              <p className="hidden min-w-0 truncate text-sm font-semibold lg:block">
                {activeGroup ? activeGroup.label : "Painel"}
              </p>
            </div>

            <div className="flex shrink-0 items-center gap-1 sm:gap-2">
              {!isAdminArea ? (
                <>
                  <CommandPalette variant="icon" onQuickEntry={setQuickEntry} />
                  <NotificationCenter />


                  <button
                    type="button"
                    onClick={() => setQuickEntry("expense")}
                    aria-label="Novo lançamento"
                    title="Novo lançamento"
                    className="inline-flex h-8 items-center gap-1.5 rounded-md bg-brand px-2.5 text-[12px] font-semibold text-brand-foreground transition-opacity hover:opacity-90 sm:h-9 sm:px-3"
                  >
                    <Plus className="size-4" aria-hidden="true" />
                    <span className="hidden sm:inline">Lançar</span>
                  </button>
                </>
              ) : null}
              <ThemeToggle />

              <Link to="/perfil" aria-label="Meu perfil">
                <Avatar className="size-7 sm:size-8">
                  {avatarUrl ? <AvatarImage src={avatarUrl} alt="Foto de perfil" /> : null}
                  <AvatarFallback className="text-xs">{initials}</AvatarFallback>
                </Avatar>
              </Link>
            </div>
          </div>

          {/* Faixa sempre presente e com altura fixa: alternar seção nunca
              muda a altura do header nem "redimensiona" a janela ativa. */}
          <div className="border-t border-border bg-background/80">
            <nav
              aria-label="Seções da área"
              className="subnav-strip mx-auto flex w-full max-w-6xl items-center gap-1 overflow-x-auto px-3 sm:px-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            >
              {subTabs.length > 1 ? (
                subTabs.map((tab) => (
                  <Link
                    key={tab.to}
                    to={tab.to as never}
                    aria-current={pathname === tab.to ? "page" : undefined}
                    className={cn(
                      "shrink-0 rounded-full px-2.5 py-1 text-[11px] font-medium transition-colors sm:px-3 sm:text-xs",
                      pathname === tab.to
                        ? "bg-brand text-brand-foreground"
                        : "text-muted-foreground hover:bg-secondary hover:text-foreground",
                    )}
                  >
                    {tab.label}
                  </Link>
                ))
              ) : (
                <span className="truncate text-[11px] font-medium text-muted-foreground">
                  {activeGroup?.label ?? "Painel"}
                </span>
              )}
            </nav>
          </div>
        </header>

        <main className="app-main mx-auto w-full min-w-0 max-w-7xl flex-1 px-3 py-2.5 pb-[calc(4.75rem+env(safe-area-inset-bottom))] sm:px-6 sm:py-6 lg:pb-8">
          {!isAdminArea ? <ReadOnlyBanner /> : null}
          {children}
        </main>

        <footer className="mt-auto border-t border-border py-6 text-center lg:px-8">
          <p className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground/60">
          &lt;Dev. Franc D&apos;nis&gt; · Acre
          </p>
        </footer>
      </div>

      {quickEntry ? (
        <TransactionDialog
          open
          kind={quickEntry}
          onOpenChange={(value) => {
            if (!value) setQuickEntry(null);
          }}
        />
      ) : null}

      <MobileTabBar
        items={items}
        activeGroup={activeGroup?.to}
        open={open}
        onOpenChange={setOpen}
        onSignOut={handleSignOut}
        adminArea={isAdminArea}
        onQuickEntry={(kind) => setQuickEntry(kind)}

        
      />
    </div>
  );
}

const MOBILE_PRIMARY = mobilePrimary;

function MobileTabBar({
  items,
  activeGroup,
  open,
  onOpenChange,
  onSignOut,
  adminArea = false,
  onQuickEntry,
}: {
  items: NavGroup[];
  activeGroup?: string;
  open: boolean;
  onOpenChange: (value: boolean) => void;
  onSignOut: () => void;
  adminArea?: boolean;
  onQuickEntry: (kind: Kind) => void;
}) {
  const navigate = useNavigate();
  const primary = adminArea
    ? items
    : MOBILE_PRIMARY.map((to) => items.find((item) => item.to === to)).filter(
        (item): item is NavGroup => Boolean(item),
      );


  return (
    <>
      {open ? (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            aria-label="Fechar menu"
            onClick={() => onOpenChange(false)}
            className="absolute inset-0 bg-foreground/50 backdrop-blur-sm"
          />
          <div className="absolute inset-x-0 bottom-0 max-h-[86svh] overflow-y-auto rounded-t-3xl border-t border-border bg-background pb-[calc(1rem+env(safe-area-inset-bottom))] shadow-lifted">
            <div className="sticky top-0 z-10 border-b border-border bg-background/95 px-3 py-2.5 backdrop-blur">
              <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-2">
                <div className="min-w-0">
                  <p className="text-[13px] font-bold leading-tight">
                    {adminArea ? "Área administrativa" : "Tudo do seu controle"}
                  </p>
                  <p className="truncate text-[11px] text-muted-foreground">
                    {adminArea
                      ? "Gestão do negócio, usuários e licenças"
                      : "Toque em uma área para abrir a seção"}
                  </p>

                </div>
                <div className="flex shrink-0 items-center gap-1">
                  <ThemeToggle />
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onOpenChange(false)}
                    aria-label="Fechar menu"
                  >
                    <X className="size-5" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Atalhos rápidos: as ações mais usadas em uma linha só. */}
            {!adminArea ? (
            <div className="grid grid-cols-3 gap-1.5 px-3 pt-3">
              <Button
                variant="outline"
                onClick={() => {
                  onOpenChange(false);
                  onQuickEntry("income");
                }}
                className="flex h-14 flex-col items-center justify-center gap-1 rounded-2xl border-emerald-500/25 bg-emerald-500/10 text-[11px] font-bold text-foreground"
              >
                <TrendingUp className="size-4 text-emerald-500" />
                Receita
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  onOpenChange(false);
                  onQuickEntry("expense");
                }}
                className="flex h-14 flex-col items-center justify-center gap-1 rounded-2xl border-rose-500/25 bg-rose-500/10 text-[11px] font-bold text-foreground"
              >
                <TrendingDown className="size-4 text-rose-500" />
                Despesa
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  onOpenChange(false);
                  navigate({ to: "/recorrencia" });
                }}
                className="flex h-14 flex-col items-center justify-center gap-1 rounded-2xl border-brand/25 bg-brand/10 text-[11px] font-bold text-foreground"
              >
                <RefreshCcw className="size-4 text-brand" />
                Fixos
              </Button>
            </div>
            ) : null}


            {/* Áreas com suas subseções: qualquer página em 2 toques. */}
            <div className="space-y-2 p-3">
              {items.map((item) => {
                const isActive = activeGroup === item.to;
                return (
                  <section
                    key={item.to}
                    className={cn(
                      "overflow-hidden rounded-2xl border bg-card",
                      isActive ? "border-brand/40" : "border-border",
                    )}
                  >
                    <Link
                      to={item.to as never}
                      onClick={() => onOpenChange(false)}
                      className={cn(
                        "flex min-h-11 items-center gap-2 px-3 text-[13px] font-bold transition-colors",
                        isActive ? "bg-brand/10 text-foreground" : "text-foreground",
                      )}
                    >
                      <span
                        className={cn(
                          "grid size-7 shrink-0 place-items-center rounded-lg border",
                          isActive
                            ? "border-brand/40 bg-brand/15 text-brand"
                            : "border-border bg-secondary text-brand",
                        )}
                      >
                        <item.icon className="size-4" aria-hidden="true" />
                      </span>
                      <span className="truncate">{item.label}</span>
                    </Link>
                    {item.children && item.children.length > 1 ? (
                      <div className="flex flex-wrap gap-1.5 border-t border-border px-3 py-2">
                        {item.children.map((child) => (
                          <Link
                            key={child.to}
                            to={child.to as never}
                            onClick={() => onOpenChange(false)}
                            className="rounded-full border border-border bg-secondary/60 px-2.5 py-1 text-[11px] font-medium text-muted-foreground transition-colors active:bg-brand/15 active:text-foreground"
                          >
                            {child.label}
                          </Link>
                        ))}
                      </div>
                    ) : null}
                  </section>
                );
              })}
            </div>

            <div className="border-t border-border p-3">
              <Button variant="outline" className="w-full justify-center gap-2" onClick={onSignOut}>
                <LogOut className="size-4" />
                Sair da conta
              </Button>
            </div>
          </div>
        </div>
      ) : null}


      <nav
        aria-label="Navegação principal"
        className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background/95 pb-[env(safe-area-inset-bottom)] backdrop-blur lg:hidden"
      >
        <div className={cn("grid", adminArea ? "grid-cols-3" : "grid-cols-5")}>
          {primary.map((item) => (
            <Link
              key={item.to}
              to={item.to as never}
              aria-current={activeGroup === item.to ? "page" : undefined}
              className={cn(
                "flex min-h-14 flex-col items-center justify-center gap-0.5 px-1 text-[10px] font-medium transition-colors",
                activeGroup === item.to ? "text-brand" : "text-muted-foreground",
              )}
            >
              <item.icon className="size-5 shrink-0" />
              <span className="w-full truncate text-center leading-tight">{item.label}</span>
            </Link>
          ))}
          <button
            type="button"
            onClick={() => onOpenChange(!open)}
            aria-expanded={open}
            className={cn(
              "flex min-h-14 flex-col items-center justify-center gap-0.5 px-1 text-[10px] font-medium transition-colors",
              open ? "text-brand" : "text-muted-foreground",
            )}
          >
            <Menu className="size-5 shrink-0" />
            <span>Menu</span>
          </button>
        </div>
      </nav>
      
      {/* Rodapé mobile discreto acima da tab bar */}
      <footer className="pb-[calc(4rem+env(safe-area-inset-bottom))] pt-2 text-center lg:hidden">
        <p className="text-[9px] font-medium uppercase tracking-widest text-muted-foreground/40">
          &lt;Dev. Franc D&apos;nis&gt; · Feijó, ACRE
        </p>
      </footer>
    </>
  );
}

export { X };
