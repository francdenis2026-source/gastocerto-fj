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
import { TransactionDialog } from "@/components/finance/dialogs/transaction-dialog";

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
import { Sidebar } from "@/components/sidebar/Sidebar";
import { EnergySidebarWidget } from "@/components/sidebar/energy-widget";
import { formatCurrency } from "@/lib/format-utils";
import { getRecurrentExpenses } from "@/functions/recurrent-metrics.functions";
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
    <div className="min-h-screen bg-background lg:flex">
      <ConfirmDialog />
      <TemporaryLicenseBanner />
      
      <div className="hidden lg:block shrink-0">
        <Sidebar 
          railCollapsed={railCollapsed} 
          onSignOut={handleSignOut}
        />
      </div>

      <div className="flex min-w-0 flex-1 flex-col">
        {/* Mobile Header */}
        <header className="lg:hidden sticky top-0 z-40 border-b border-border/10 bg-background/80 pt-[env(safe-area-inset-top)] backdrop-blur-md">
          <div className="flex h-14 items-center justify-between px-4">
            <Link to="/painel" className="scale-90 -ml-1">
              <Logo compact />
            </Link>
            
            <div className="flex items-center gap-3">
              <CommandPalette variant="icon" onQuickEntry={setQuickEntry} />
              <NotificationCenter />
              <ThemeToggle />
              <Link to="/perfil">
                <Avatar className="size-8 border-2 border-border/50 shadow-sm">
                  {avatarUrl ? <AvatarImage src={avatarUrl} alt="Foto de perfil" /> : null}
                  <AvatarFallback className="bg-secondary text-[10px] font-black">{initials}</AvatarFallback>
                </Avatar>
              </Link>
            </div>
          </div>
        </header>

        {/* Desktop Title Bar (Internal Header) */}
        <header className="hidden lg:flex sticky top-0 z-40 h-16 items-center justify-between px-8 border-b border-border bg-background/80 backdrop-blur-md">
          <div className="flex flex-col">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
              {isAdminArea ? "Administração" : "Painel do Cliente"}
            </p>
            <h1 className="text-lg font-bold tracking-tight text-foreground flex items-center gap-2">
              {activeGroup?.label || "Meu Controle Financeiro"}
              {activeMetrics.length > 0 && (
                <div className="flex gap-2 ml-4">
                  {activeMetrics.slice(0, 2).map(m => (
                    <Badge key={m.id} variant="outline" className="h-5 px-1.5 text-[9px] font-bold border-border bg-muted/50 text-muted-foreground">
                      {m.label}
                    </Badge>
                  ))}
                </div>
              )}
            </h1>
          </div>

          <div className="flex items-center gap-4">
             <CommandPalette onQuickEntry={setQuickEntry} />
             
             <div className="h-8 w-px bg-border mx-2" />
             
             <div className="flex items-center gap-2">
               <NotificationCenter />
               <ThemeToggle />
             </div>

             <Button
                onClick={() => setQuickEntry("expense")}
                className="h-10 gap-2 rounded-xl bg-primary px-6 text-[12px] font-bold uppercase tracking-wider text-primary-foreground shadow-lg shadow-primary/20 transition-all hover:opacity-90 active:scale-95"
              >
                <Plus className="size-4" />
                Lançar
             </Button>
          </div>
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
