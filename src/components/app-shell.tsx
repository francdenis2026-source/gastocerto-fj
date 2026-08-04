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
  AlertCircle,
  Search,
  Bell,
  Sun,
  Moon,
  ChevronRight
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
import { useTheme } from "@/components/theme-provider";

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
  useKidsRealtimeAlerts();
  const { isKid } = useKidSession();
  const { theme, toggleTheme } = useTheme();

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
  const sections: NavSection[] = isAdminArea
    ? [{ key: "admin", label: "Equipe", groups: adminNavGroups }]
    : isStaff
      ? [...navSections, { key: "staff", label: "Equipe", groups: [staffNavGroup] }]
      : navSections;

  const items: NavGroup[] = flattenGroups(sections);

  const activeGroup = items.find(
    (group) => group.to === pathname || group.children?.some((child) => child.to === pathname),
  );
  
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
          icon: <RefreshCcw className="size-4 animate-spin text-primary" />
        });

        try {
          await queryClient.cancelQueries();
          queryClient.clear();
          await supabase.auth.signOut();
          clearBrowserCredentials();
          window.localStorage.clear();
          window.sessionStorage.clear();
          toast.success("Até logo!", {
            id: toastId,
            description: "Você foi desconectado com segurança.",
          });
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
    <div className="min-h-screen bg-background flex text-foreground antialiased selection:bg-primary/20 selection:text-primary">
      <ConfirmDialog />
      
      {/* Sidebar - Redesenhada como Enterprise Standard */}
      <aside
        className={cn(
          "hidden lg:flex flex-col border-r border-border bg-card/50 backdrop-blur-3xl transition-[width] duration-300 ease-[cubic-bezier(0.2,0,0,1)]",
          railCollapsed ? "w-[80px]" : "w-[280px]",
        )}
      >
        <div className="flex items-center h-16 border-b border-border/50 px-6 gap-3">
          <Logo compact={railCollapsed} href={isAdminArea ? "/admin" : "/painel"} className="scale-110"/>
          {!railCollapsed && <span className="font-bold text-base tracking-tight truncate">GameCarto</span>}
          <button onClick={toggleRail} className="ml-auto p-1.5 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground">
             {railCollapsed ? <PanelLeftOpen size={18}/> : <PanelLeftClose size={18}/>}
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto px-4 py-6 space-y-8 scrollbar-hide">
          {sections.map((section) => (
             <div key={section.key} className="space-y-2">
                {!railCollapsed && <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60 px-2">{section.label}</p>}
                <div className="space-y-0.5">
                  {section.groups.map((group) => {
                    const isActive = activeGroup?.key === group.key;
                    return (
                      <Link key={group.to} to={group.to as never} className={cn(
                        "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group text-[14px]",
                        isActive ? "bg-primary/10 text-primary font-semibold" : "text-muted-foreground hover:bg-muted hover:text-foreground"
                      )}>
                        <group.icon size={18} className={cn("shrink-0", isActive && "text-primary")} />
                        {!railCollapsed && <span className="truncate">{group.label}</span>}
                        {isActive && !railCollapsed && <ChevronRight className="ml-auto size-4 opacity-50" />}
                      </Link>
                    )
                  })}
                </div>
             </div>
          ))}
        </nav>
      </aside>

      {/* Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
         {/* Premium Header */}
         <header className="h-16 border-b border-border/50 flex items-center px-6 gap-4 bg-background/50 backdrop-blur-md sticky top-0 z-10">
            {subTabs.length > 0 && !railCollapsed && (
              <div className="flex items-center gap-1">
                 {subTabs.map(tab => (
                   <Link key={tab.to} to={tab.to as never} className="text-[13px] px-3 py-1.5 rounded-md text-muted-foreground hover:bg-muted hover:text-foreground transition-colors">
                     {tab.label}
                   </Link>
                 ))}
              </div>
            )}

            <div className="flex-1" />

            <div className="flex items-center gap-2">
               <button className="p-2 rounded-lg text-muted-foreground hover:bg-muted"><Search size={18} /></button>
               <button className="p-2 rounded-lg text-muted-foreground hover:bg-muted relative">
                  <Bell size={18} />
                  {unreadCount > 0 && <span className="absolute top-2 right-2 size-2 rounded-full bg-primary" />}
               </button>
               <button onClick={toggleTheme} className="p-2 rounded-lg text-muted-foreground hover:bg-muted">
                 {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
               </button>
               <div className="h-6 w-px bg-border mx-2" />
               <Avatar className="size-8">
                 <AvatarImage src={avatarUrl ?? ""} />
                 <AvatarFallback className="bg-muted text-[12px]">{initials}</AvatarFallback>
               </Avatar>
            </div>
         </header>

         {/* Main Content with Padding */}
         <main className="flex-1 overflow-y-auto p-8 bg-[#05070B]/2">
           <div className="max-w-7xl mx-auto">
             {children}
           </div>
         </main>
      </div>
      
      {/* Mobile Bar */}
      <NewMobileTabBar />
      <TransactionDialog open={!!quickEntry} onOpenChange={(o) => setQuickEntry(o ? "expense" : null)} kind={quickEntry ?? "expense"} />
    </div>
  );
}
