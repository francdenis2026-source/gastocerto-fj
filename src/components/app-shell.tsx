import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { useQueryClient, useQuery } from "@tanstack/react-query";
import { monthRange } from "@/lib/finance";
import { usePeriodStore } from "@/lib/period-store";
import { useTransactions } from "@/lib/transactions";
import { ReadOnlyBanner } from "@/components/finance/read-only-banner";
import { TemporaryLicenseBanner } from "./admin/temporary-license-banner";
import { useConfirm } from "@/components/ui/confirm-dialog";
import { 
  Sparkles, 
  ShieldCheck, 
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
  AlertCircle 
} from "lucide-react";
import { usePlanAccess } from "@/lib/plan-features";
import { toast } from "sonner";

import { useState, type ReactNode, useEffect, useMemo } from "react";

import { Logo } from "@/components/logo";
import { NotificationCenter } from "@/components/notifications/notification-center";
import { Badge } from "@/components/ui/badge";
import { TransactionDialog } from "@/components/finance/transaction-dialog";

import { useKidSession } from "@/lib/kids-session";
import { useKidsRealtimeAlerts } from "@/lib/kids-realtime";
import { ThemeToggle } from "@/components/theme-toggle";
import { MobileTabBar as NewMobileTabBar } from "@/components/finance/mobile-tab-bar";
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
// useQuery duplicate removed
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
  const routerState = useRouterState();
  const { year, month } = usePeriodStore();
  const range = useMemo(() => monthRange(year, month), [year, month]);
  const { data: transactions } = useTransactions(range);

  const metrics = useMemo(() => {
    const rows = transactions ?? [];
    const expenses = rows.filter((r: any) => r.transaction_type === "expense");
    const incomes = rows.filter((r: any) => r.transaction_type === "income");
    const totalExpense = expenses.reduce((sum: number, r: any) => sum + Number(r.amount), 0);
    const totalIncome = incomes.reduce((sum: number, r: any) => sum + Number(r.amount), 0);
    return { totalExpense, balance: totalIncome - totalExpense };
  }, [transactions]);

  const { confirm, ConfirmDialog } = useConfirm();
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
  const access = usePlanAccess();
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
    confirm({
      title: "Encerrar Sessão",
      description: "Tem certeza que deseja encerrar sua sessão com segurança?",
      type: "warning",
      confirmLabel: "Sair agora",
      onConfirm: async () => {
        const toastId = toast.loading("Finalizando acesso...", {
          description: "Sua segurança é nossa prioridade.",
          icon: <RefreshCcw className="size-4 animate-spin text-brand" />
        });

        try {
          // Cancela queries pendentes e limpa o cache para evitar leaks
          await queryClient.cancelQueries();
          queryClient.clear();
          
          // Signout no backend primeiro
          await supabase.auth.signOut();

          // Limpeza completa e segura do navegador
          clearBrowserCredentials();
          window.localStorage.clear();
          window.sessionStorage.clear();
          
          toast.success("Até logo!", {
            id: toastId,
            description: "Você foi desconectado com segurança.",
            icon: (
              <div className="flex size-10 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-500 shadow-sm border border-emerald-500/20">
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="animate-in zoom-in duration-300"
                >
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                  <polyline points="22 4 12 14.01 9 11.01" />
                </svg>
              </div>
            ),
          });

          // Redirecionamento forçado para a raiz (limpa o estado do react-router)
          setTimeout(() => {
            window.location.replace("/");
          }, 800);
        } catch (error) {
          console.error("Erro durante logout:", error);
          toast.error("Erro ao encerrar sessão", { id: toastId });
          window.location.replace("/");
        }
      }
    });
  }

  return (
    <div className="min-h-screen bg-secondary/20 lg:flex">
      <ConfirmDialog />
      <TemporaryLicenseBanner />
      <aside
        className={cn(
          "sticky top-0 hidden h-screen shrink-0 flex-col border-r border-border bg-background transition-[width] duration-200 lg:flex",
          railCollapsed ? "w-[76px]" : "w-[268px]",
        )}
      >
        <div className="flex h-14 items-center gap-2 border-b border-border px-3">
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
              <PanelLeftOpen className="size-5" />
            ) : (
              <PanelLeftClose className="size-5" />
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
                aria-label="Adicionar despesa"
                title="Adicionar despesa"
              >
                <TrendingDown className="size-5" aria-hidden="true" />
                {!railCollapsed ? <span className="text-[12px]">Despesa</span> : null}
              </Button>
              {!railCollapsed ? (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setQuickEntry("income")}
                  className="w-full gap-1.5 border-success/35 text-foreground"
                >
                  <TrendingUp className="size-5 text-success" aria-hidden="true" />
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
              <div className={cn(
                "grid gap-1",
                railCollapsed ? "grid-cols-1" : "lg:grid-cols-1 md:grid-cols-2 grid-cols-1"
              )}>
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
                            <item.icon className={cn("size-5 transition-transform", isActive && "scale-110")} aria-hidden="true" />
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
                              className={cn("size-5 transition-transform duration-300 cubic-bezier(0.4, 0, 0.2, 1)", isOpen && "rotate-180")}
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
            </div>
          ))}
        </nav>


        {!isAdminArea && !isKid && (
          <div className="mb-4 space-y-2">
            {!isAdminArea && <EnergySidebarWidget collapsed={railCollapsed} />}
            
            {activeMetrics.length > 0 && !railCollapsed && (
              <div className="mx-2 p-3 rounded-xl border border-border bg-secondary/30 space-y-3">
                <div className="flex items-center gap-1.5 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                  <Settings className="size-3 text-brand" />
                  Métricas
                </div>
                <div className="space-y-2">
                  {activeMetrics.map(metric => {
                    const relevantRows = (recurrents ?? []).filter((r: any) => 
                      r.categories?.name?.toLowerCase().includes(metric.label.toLowerCase()) ||
                      r.categories?.name?.toLowerCase().includes(metric.id.toLowerCase())
                    );
                    const currentAmount = relevantRows.reduce((sum: number, r: any) => sum + Number(r.amount), 0);
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
          {!isAdminArea && !isKid && (
            <div className="mb-2 px-2">
               <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/40 mb-2">Resumo Rápido</p>
               <div className="grid grid-cols-2 gap-2">
                  <div className="rounded-lg bg-secondary/30 p-2 border border-border/50">
                    <p className="text-[8px] uppercase text-muted-foreground">Gastos</p>
                    <p className="text-[11px] font-bold text-rose-500 tabular-nums">
                      {formatCurrency(metrics.totalExpense)}
                    </p>
                  </div>
                  <div className="rounded-lg bg-secondary/30 p-2 border border-border/50">
                    <p className="text-[8px] uppercase text-muted-foreground">Saldo</p>
                    <p className="text-[11px] font-bold text-emerald-500 tabular-nums">
                      {formatCurrency(metrics.balance)}
                    </p>
                  </div>
               </div>
            </div>
          )}
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
                {(access.planSlug === "premium_ia" || access.planSlug === "premium") && (
                  <Badge 
                    variant="outline" 
                    className="mt-0.5 h-4 px-1 text-[8px] font-black uppercase tracking-tighter bg-emerald-500/10 text-emerald-600 border-emerald-500/20 w-fit"
                  >
                    <ShieldCheck className="mr-0.5 size-2" />
                    Conta PRO
                  </Badge>
                )}
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
        <header className="sticky top-0 z-40 border-b border-border bg-background/95 pt-[env(safe-area-inset-top)] backdrop-blur-md">
          <div className="flex items-center justify-between px-4 py-2.5 sm:px-6 sm:py-3.5">
            <div className="flex min-w-0 items-center gap-3">
              <Link to="/painel" className="lg:hidden">
                <Logo compact />
              </Link>
              <div className="hidden flex-col lg:flex">
                <p className="text-xs font-black uppercase tracking-widest text-muted-foreground/60">
                  {isAdminArea ? "Administração" : "Painel do Cliente"}
                </p>
                <h1 className="text-base font-black tracking-tight text-foreground">
                  {activeGroup ? activeGroup.label : "Visão Geral"}
                </h1>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {!isAdminArea && (
                <div className="hidden items-center gap-2 sm:flex">
                  <CommandPalette variant="icon" onQuickEntry={setQuickEntry} />
                  <NotificationCenter />
                  <Button
                    onClick={() => setQuickEntry("expense")}
                    className="h-9 gap-2 rounded-xl bg-brand px-4 text-xs font-black uppercase tracking-wider text-brand-foreground shadow-soft transition-all hover:opacity-90 active:scale-95"
                  >
                    <Plus className="size-4" />
                    Lançar
                  </Button>
                </div>
              )}
              
              <div className="flex items-center gap-1 sm:hidden">
                 <CommandPalette variant="icon" onQuickEntry={setQuickEntry} />
                 <NotificationCenter />
              </div>

              <div className="mx-1 h-6 w-px bg-border/60" />
              <ThemeToggle />
              
              <Link to="/perfil" className="ml-1 transition-transform hover:scale-105 active:scale-95">
                <Avatar className="size-8 border-2 border-border/50 shadow-sm">
                  {avatarUrl ? <AvatarImage src={avatarUrl} alt="Foto de perfil" /> : null}
                  <AvatarFallback className="bg-secondary text-[10px] font-black">{initials}</AvatarFallback>
                </Avatar>
              </Link>
            </div>
          </div>

          {/* Subtabs compact and elegant */}
          {subTabs.length > 1 && (
            <div className="border-t border-border/40 bg-secondary/10">
              <nav
                aria-label="Subnavegação"
                className="mx-auto flex w-full max-w-6xl items-center gap-1.5 overflow-x-auto px-4 py-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
              >
                {subTabs.map((tab) => (
                  <Link
                    key={tab.to}
                    to={tab.to as any}
                    aria-current={pathname === tab.to ? "page" : undefined}
                    className={cn(
                      "shrink-0 rounded-full px-3.5 py-1.5 text-[11px] font-black uppercase tracking-wider transition-all",
                      pathname === tab.to
                        ? "bg-brand text-brand-foreground shadow-sm"
                        : "text-muted-foreground hover:bg-secondary hover:text-foreground",
                    )}
                  >
                    {tab.label}
                  </Link>
                ))}
              </nav>
            </div>
          )}
        </header>

        <main className="mx-auto w-full min-w-0 max-w-full flex-1 px-3 py-2.5 pb-[calc(4.75rem+env(safe-area-inset-bottom))] sm:px-6 sm:py-6 lg:pb-8 overflow-x-hidden">
          {!isAdminArea ? <ReadOnlyBanner /> : null}
          <div className="mx-auto max-w-7xl w-full">
            {children}
          </div>
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

      <NewMobileTabBar />
    </div>
  );
}

export { X };
