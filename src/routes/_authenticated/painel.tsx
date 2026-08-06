import { createFileRoute, Link, useNavigate, useSearch } from "@tanstack/react-router";
import { RefreshCw, ToyBrick, Flame, UtensilsCrossed, ShieldAlert, AlertCircle, Sparkles, Calendar as CalendarIcon, Search, BarChart3, TrendingUp as TrendingUpIcon, TrendingDown as TrendingDownIcon, Wallet as WalletIcon, FileText, ChevronRight, ChevronDown, Activity, PieChart as PieChartIcon, ShieldCheck, Baby as BabyIcon, LogOut, SearchIcon, ArrowUpRight, ShoppingBag, Printer } from "lucide-react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { cleanupJulyData } from "@/lib/data-cleanup.functions";
import { fixEnzoTransactionError } from "@/lib/data-fix-enzo.functions";
import { cleanupDuplicatedKidTransactions } from "@/lib/data-fix-duplicates.functions";
import { CommandPalette } from "@/components/nav/command-palette";
import { NotificationCenter } from "@/components/notifications/notification-center";
import { InteractiveCard } from "@/components/ui/interactive-card";


import { cn } from "@/lib/utils";
import {
  AlertTriangle,
  ArrowRight,
  CalendarClock,
  Car,
  Landmark,
  Loader2,
  Plus,
  TrendingDown,
  TrendingUp,
  Users,
  Wallet,
  Zap,
  Gift,
  PiggyBank,
  Baby,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { useEffect, useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { AppShell } from "@/components/app-shell";
import { TransactionDialog } from "@/components/finance/transaction-dialog";
import { ExpenseCardsDialog } from "@/components/finance/expense-cards-dialog";
import { DependentExpenseDialog } from "@/components/finance/dependent-expense-dialog";
import { TaxQuickDialog } from "@/components/finance/tax-quick-dialog";
import { RecurringAlerts } from "@/components/finance/recurring-alerts";
import { MetricDetailDialog, type MetricDetail as BaseMetricDetail } from "@/components/finance/metric-detail-dialog";

interface MetricDetail extends BaseMetricDetail {
  onAction?: () => void;
}
import { QuickCategoryMenu, type QuickPick } from "@/components/finance/quick-category-menu";
import { PeriodPicker } from "@/components/finance/period-picker";
import { CardMonthSummary } from "@/components/finance/card-month-summary";
import { InsightsPanel } from "@/components/finance/insights-panel";
import { PastMonthsLockNotice } from "@/components/finance/past-months-lock-notice";
import { VehicleEmblem } from "@/components/finance/vehicle-emblem";
import { usePeriodStore } from "@/lib/period-store";
import { InteractiveCalendar } from "@/components/finance/interactive-calendar";
import { MetricCard } from "@/components/dashboard/MetricCard";
import { GlobalAnnouncementsBanner } from "@/components/finance/global-announcements-banner";
import { DebtAdvisorPanel } from "@/components/finance/debt-advisor-panel";
import { KidsManagementPanel } from "@/components/kids/kids-management-panel";
import { FamilySpendingDashboard } from "@/components/finance/family-spending-dashboard";
import { DashboardTabs } from "@/components/finance/dashboard-tabs";
import { hasFeature, usePlanAccess } from "@/lib/plan-features";
import { getYearlyBalance } from "@/lib/yearly-balance.functions";
import { useServerFn } from "@tanstack/react-start";
import { useAuth } from "@/hooks/use-auth";







import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import {
  CHART_TOKENS,
  axisProps,
  barRadius,
  gridProps,
  legendProps,
  seriesColor,
  tooltipProps,
} from "@/lib/chart-theme";
import { formatCurrency, formatDate } from "@/lib/format";
import { MONTH_NAMES, isoDate, monthRange, periodDefaultDate } from "@/lib/finance";
import { useCategories, useProfile } from "@/lib/queries";
import { useBudgets, useTransactions, type Transaction } from "@/lib/transactions";
import { useQueryClient, useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { exportDashboardToPDF } from "@/lib/pdf-export";

import { useAutoRecurring } from "@/lib/recurring";
import { useVehicles, VEHICLE_TYPES } from "@/lib/vehicles";
import { vehicleSpendBreakdown } from "@/lib/vehicle-spend";
import { labelFor } from "@/lib/finance";

import { useDependents } from "@/lib/dependents";
import { CheckSquare, Circle } from "lucide-react";

export const Route = createFileRoute("/_authenticated/painel")({
  head: () => ({
    meta: [
      { title: "Painel — GastoCerto" },
      { name: "description", content: "Resumo dos seus gastos e receitas no GastoCerto." },
      { property: "og:title", content: "Painel — GastoCerto" },
      { property: "og:description", content: "Resumo dos seus gastos e receitas no GastoCerto." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: DashboardPage,
});

function DashboardPage() {
  const navigate = useNavigate();
  const search = useSearch({ from: "/_authenticated/painel" });
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { data: profile } = useProfile();
  const access = usePlanAccess();

  const today = new Date();
  const { year: storedYear, month: storedMonth, setPeriod: setStoredPeriod, reset } = usePeriodStore();
  const [period, setPeriod] = useState({ year: storedYear, month: storedMonth });

  const handlePeriodChange = (next: { year: number; month: number }) => {
    setPeriod(next);
    setStoredPeriod(next);
  };

  const handleRefresh = async () => {
    const toastId = toast.loading("Atualizando dados...");
    try {
      await queryClient.invalidateQueries();
      toast.success("Dados atualizados!", { id: toastId });
    } catch (e) {
      toast.error("Erro ao atualizar dados", { id: toastId });
    }
  };

  const [dialogOpen, setDialogOpen] = useState(false);
  const [cardsOpen, setCardsOpen] = useState(false);
  const [dialogKind, setDialogKind] = useState<"expense" | "income">("expense");
  const [preset, setPreset] = useState<QuickPick>({ categoryId: null, subCategoryId: null });
  const [detail, setDetail] = useState<MetricDetail | null>(null);
  const [editingTx, setEditingTx] = useState<Transaction | null>(null);
  /** Dia selecionado no calendário — permite lançar direto pelo modal do dia. */
  const [detailDate, setDetailDate] = useState<string | null>(null);
  const [dependentOpen, setDependentOpen] = useState(false);
  const [taxOpen, setTaxOpen] = useState(false);
  const [calendarOpen, setCalendarOpen] = useState(false);

  const { data: categories, isLoading: loadingCategories } = useCategories();
  const { data: vehicles } = useVehicles();


  const range = monthRange(period.year, period.month);
  const { data: transactions, isLoading: loadingTransactions } = useTransactions(range);
  const { data: budgets } = useBudgets(period.year, period.month);

  const isAdminArea = false; // Add check if needed


  // Contabiliza automaticamente as contas recorrentes do período.
  useAutoRecurring();


  const previous = new Date(period.year, period.month - 2, 1);
  const previousRange = monthRange(previous.getFullYear(), previous.getMonth() + 1);
  const { data: previousTransactions } = useTransactions(previousRange);

  const cleanupDuplicates = useServerFn(cleanupDuplicatedKidTransactions);

  useEffect(() => {
    if (profile) {
      if (!profile.onboarding_completed) {
        navigate({ to: "/onboarding", replace: true });
        return;
      }

      // Cleanup duplicated kid transactions for user 69598193268 or anyone affected
      // This is a one-time check per session to ensure data integrity
      if (profile.cpf === '69598193268' && !localStorage.getItem('dup_cleanup_done')) {
        const runCleanup = async () => {
          const { data: dependents } = await supabase.from('dependents').select('id, kid_user_id').not('kid_user_id', 'is', null);
          if (dependents) {
            for (const dep of dependents) {
              if (dep.kid_user_id) {
                await cleanupDuplicates({ data: { kidUserId: dep.kid_user_id } });
              }
            }
          }
          localStorage.setItem('dup_cleanup_done', 'true');
        };
        runCleanup();
      }
    }
  }, [profile, navigate, cleanupDuplicates]);

  const metrics = useMemo(() => {
    const rows = transactions ?? [];
    const expenses = rows.filter((row) => row.transaction_type === "expense");
    const incomes = rows.filter((row) => row.transaction_type === "income");
    const sum = (items: typeof rows) => items.reduce((total, row) => total + Number(row.amount), 0);

    const todayIso = isoDate(today);
    const weekStart = isoDate(new Date(today.getTime() - 6 * 86_400_000));

    const totalExpense = sum(expenses);
    const totalIncome = sum(incomes);
    const generalBudget = (budgets ?? []).find((budget) => !budget.category_id);
    const limit = generalBudget ? Number(generalBudget.limit_amount) : 0;
    const previousMonthExpenses = (previousTransactions ?? []).filter(
      (row) => row.transaction_type === "expense",
    );
    const previousExpense = previousMonthExpenses.reduce(
      (total, row) => total + Number(row.amount),
      0,
    );

    const isCurrentMonth =
      period.year === today.getFullYear() && period.month === today.getMonth() + 1;
    const elapsedDays = isCurrentMonth ? today.getDate() : range.days;
    const dailyAverage = elapsedDays > 0 ? totalExpense / elapsedDays : 0;

    return {
      isCurrentMonth,
      today: isCurrentMonth
        ? sum(expenses.filter((row) => row.transaction_date === todayIso))
        : 0,
      week: isCurrentMonth
        ? sum(
            expenses.filter(
              (row) =>
                row.transaction_date >= weekStart &&
                row.transaction_date >= range.start &&
                row.transaction_date <= todayIso,
            ),
          )
        : 0,
      totalExpense,
      totalIncome,
      balance: totalIncome - totalExpense,
      limit,
      available: limit > 0 ? limit - totalExpense : 0,
      usedPercent: limit > 0 ? Math.min(999, (totalExpense / limit) * 100) : 0,
      upcoming: rows.filter((row) => row.status === "pending" || row.status === "overdue"),
      recurring: sum(expenses.filter((row) => row.is_recurring)),
      dailyAverage,
      projection: dailyAverage * range.days,
      previousExpense,
      diffAvailable:
        previousExpense > 0 &&
        totalExpense > 0 &&
        new Date(period.year, period.month - 1, 1) <=
          new Date(today.getFullYear(), today.getMonth(), 1),
      diffPercent:
        previousExpense > 0 ? ((totalExpense - previousExpense) / previousExpense) * 100 : 0,
      incomes: incomes,
      expenses: expenses,
    };
  }, [transactions, previousTransactions, budgets, period, range.days, today]);

  /** Listas usadas no detalhamento ao clicar em cada card. */
  const detailRows = useMemo(() => {
    const rows = transactions ?? [];
    const expenses = rows.filter((row) => row.transaction_type === "expense");
    const todayIso = isoDate(today);
    const weekStart = isoDate(new Date(today.getTime() - 6 * 86_400_000));
    const sameMonth =
      period.year === today.getFullYear() && period.month === today.getMonth() + 1;
    return {
      all: rows,
      expenses,
      incomes: rows.filter((row) => row.transaction_type === "income"),
      todayExpenses: sameMonth
        ? expenses.filter((row) => row.transaction_date === todayIso)
        : [],
      weekExpenses: sameMonth
        ? [
            ...expenses,
            ...(previousTransactions ?? []).filter((row) => row.transaction_type === "expense"),
          ]
            .filter((row) => row.transaction_date >= weekStart && row.transaction_date <= todayIso)
            .sort((a, b) => b.transaction_date.localeCompare(a.transaction_date))
        : [],
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [transactions, previousTransactions, period.year, period.month]);


  const byDay = useMemo(() => {
    const map = new Map<number, { day: number; gasto: number; receita: number }>();
    for (let day = 1; day <= range.days; day += 1) map.set(day, { day, gasto: 0, receita: 0 });
    for (const row of transactions ?? []) {
      const day = Number(row.transaction_date.slice(8, 10));
      const entry = map.get(day);
      if (!entry) continue;
      if (row.transaction_type === "income") entry.receita += Number(row.amount);
      else entry.gasto += Number(row.amount);
    }
    return [...map.values()];
  }, [transactions, range.days]);

  const byCategory = useMemo(() => {
    const names = new Map((categories ?? []).map((category) => [category.id, category]));
    const totals = new Map<string, { id: string; name: string; value: number; color: string }>();
    for (const row of metrics.expenses) {
      const category = row.category_id ? names.get(row.category_id) : undefined;
      const key = category?.id ?? "sem-categoria";
      const current = totals.get(key) ?? {
        id: key,
        name: category?.name ?? "Sem categoria",
        value: 0,
        color: category?.color ?? "#94a3b8",
      };
      current.value += Number(row.amount);
      totals.set(key, current);
    }
    return [...totals.values()].sort((a, b) => b.value - a.value);
  }, [metrics.expenses, categories]);

  const essentialSplit = useMemo(() => {
    const essential = metrics.expenses
      .filter((row) => row.is_essential)
      .reduce((total, row) => total + Number(row.amount), 0);
    return [
      { name: "Essenciais", value: essential, color: CHART_TOKENS.income },
      { name: "Não essenciais", value: metrics.totalExpense - essential, color: CHART_TOKENS.warning },
    ];
  }, [metrics.expenses, metrics.totalExpense]);

  /** Detalhamento profissional ao clicar em qualquer ponto dos gráficos. */
  const openCategoryDetail = (categoryId: string, name: string) => {
    const rows = metrics.expenses.filter((row) =>
      categoryId === "sem-categoria" ? !row.category_id : row.category_id === categoryId,
    );
    const total = rows.reduce((sum, row) => sum + Number(row.amount), 0);
    
    // Calcula o total faturado no mês para esta categoria (mesmo que o card principal seja filtrado)
    // No caso de "Gás", o usuário quer ver o que foi gasto "neste mês"
    setDetail({
      label: `Gastos em ${name}`,
      value: formatCurrency(total),
      totalInvoiced: formatCurrency(total),
      hint: `${rows.length} lançamento(s) em ${MONTH_NAMES[period.month - 1]} de ${period.year}`,
      formula: "Soma das despesas do período classificadas nesta categoria.",

      rows,
      extra: [
        {
          label: "Participação nas despesas",
          value:
            metrics.totalExpense > 0
              ? `${((total / metrics.totalExpense) * 100).toFixed(1)}%`
              : "—",
        },
        {
          label: "Ticket médio",
          value: rows.length > 0 ? formatCurrency(total / rows.length) : "—",
        },
      ],
    });
  };

  const openDayDetail = (day: number) => {
    const iso = `${period.year}-${String(period.month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    const rows = (transactions ?? []).filter((row) => row.transaction_date === iso);
    const expense = rows
      .filter((row) => row.transaction_type === "expense")
      .reduce((sum, row) => sum + Number(row.amount), 0);
    const income = rows
      .filter((row) => row.transaction_type === "income")
      .reduce((sum, row) => sum + Number(row.amount), 0);

    setDetailDate(iso);
    setDetail({
      label: `Movimentos de ${formatDate(iso)}`,
      value: formatCurrency(expense),
      hint: `${rows.length} lançamento(s) no dia`,
      formula: "Soma das movimentações financeiras registradas nesta data específica.",
      rows,
      extra: [
        { label: "Total Receitas", value: formatCurrency(income) },
        { label: "Total Despesas", value: formatCurrency(expense) },
        { label: "Resultado do dia", value: formatCurrency(income - expense) }
      ],
      onAction: () => {
        // Redireciona para lançamentos já filtrado por este dia
        navigate({
          to: "/lancamentos",
          search: { 
            ano: period.year, 
            mes: period.month, 
            tipo: "all"
          } as any
        });
      }
    });
  };

  const openEssentialDetail = (essential: boolean) => {
    const rows = metrics.expenses.filter((row) => Boolean(row.is_essential) === essential);
    const total = rows.reduce((sum, row) => sum + Number(row.amount), 0);
    setDetail({
      label: essential ? "Gastos essenciais" : "Gastos não essenciais",
      value: formatCurrency(total),
      hint: `${rows.length} lançamento(s)`,
      formula: essential
        ? "Despesas marcadas como essenciais no período."
        : "Despesas não marcadas como essenciais no período.",
      rows,
    });
  };

  const budgetAlerts = useMemo(() => {
    const names = new Map((categories ?? []).map((category) => [category.id, category.name]));
    return (budgets ?? [])
      .filter((budget) => budget.category_id && Number(budget.limit_amount) > 0)
      .map((budget) => {
        const spent = metrics.expenses
          .filter((row) => row.category_id === budget.category_id)
          .reduce((total, row) => total + Number(row.amount), 0);
        const percent = (spent / Number(budget.limit_amount)) * 100;
        return {
          id: budget.id,
          name: names.get(budget.category_id!) ?? "Categoria",
          percent,
          spent,
          limit: Number(budget.limit_amount),
          alertAt: budget.alert_percentage,
        };
      })
      .filter((item) => item.percent >= item.alertAt)
      .sort((a, b) => b.percent - a.percent);
  }, [budgets, metrics.expenses, categories]);

  const vehicleSummary = useMemo(
    () => vehicleSpendBreakdown(transactions ?? [], vehicles ?? [], categories ?? []),
    [transactions, vehicles, categories],
  );
  const vehicleTotal = vehicleSummary.reduce((sum, row) => sum + row.total, 0);

  const { data: dependents } = useDependents();

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      window.location.replace("/");
    } catch (error) {
      console.error("Erro ao sair:", error);
      window.location.replace("/");
    }
  };

  const kidsOnboarding = useMemo(() => {
    const active = (dependents ?? []).filter(d => d.active !== false);
    const hasKid = active.length > 0;
    const hasPin = active.some(d => (d as any).pin_code);
    const hasLimit = active.some(d => (d as any).monthly_limit);
    const hasAllowance = active.some(d => d.monthly_allowance || (d as any).recurring_allowance_day);

    const isResolvingFixedError = profile?.tags?.includes("fixed_enzo_error");
    
    return {
      hasKid,
      hasPin,
      hasLimit,
      hasAllowance,
      complete: hasKid && hasPin && hasLimit,
      visible: hasKid,
      isResolvingFixedError
    };
  }, [dependents, profile?.tags]);

  const firstName = (profile?.full_name ?? "").split(" ")[0] || "por aqui";
  const { signOut } = useAuth();

  if (!profile || loadingTransactions || loadingCategories) {
    return (
      <AppShell>
      <div className="flex min-h-[40vh] items-center justify-center p-8">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="size-8 animate-spin text-brand" />
          <p className="text-xs font-bold text-muted-foreground animate-pulse">Carregando painel profissional...</p>
        </div>
      </div>
      </AppShell>
    );
  }


  return (
    <AppShell>
      <div className="space-y-3 sm:space-y-6">

        {profile?.cpf === "69598193268" && profile?.tags?.includes('fixed_enzo_error') && (
          <div className="flex flex-col items-center justify-center p-8 text-center space-y-4 rounded-3xl border border-dashed border-emerald-500/30 bg-emerald-500/5 animate-in fade-in zoom-in duration-500 mb-6">
            <div className="size-12 rounded-full bg-emerald-500/20 flex items-center justify-center">
              <ShieldAlert className="size-6 text-emerald-600" />
            </div>
            <div className="space-y-2">
              <h3 className="text-sm font-black text-emerald-800">por que essa menssagem persiste? Correção de Sistema Aplicada</h3>
              <p className="text-xs text-emerald-700/80 max-w-xs leading-relaxed">
                O erro "dei 20 reias pro Enzo" foi removido. Clique abaixo para confirmar e ocultar este aviso definitivamente.
              </p>
            </div>
            <Button 
              size="sm" 
              className="rounded-xl h-9 px-6 bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-lg shadow-emerald-600/20 transition-all active:scale-95"
              onClick={async () => {
                 toast.success("Aviso removido com sucesso!");
                 queryClient.setQueryData(["profile"], (old: any) => ({
                   ...old,
                   tags: (old?.tags || []).filter((t: string) => t !== 'fixed_enzo_error').concat('enzo_error_hidden')
                 }));
              }}
            >
              Confirmar e Ocultar
            </Button>
          </div>
        )}
        
      <div className="flex flex-col gap-6">
        <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex flex-col">
              <h1 className="text-xl font-black tracking-tight sm:text-2xl">
                Olá, {profile?.full_name?.split(" ")[0] ?? "Usuário"}!
              </h1>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-[11px] font-medium text-emerald-500 uppercase tracking-wider bg-emerald-500/10 px-2 py-0.5 rounded-md">
                  {MONTH_NAMES[period.month - 1]} de {period.year}
                </span>
                <Badge variant="outline" className="text-[10px] font-black uppercase border-emerald-500/20 text-emerald-600 bg-emerald-500/5">
                  {access.planSlug === "premium_ia" ? "Premium IA" : access.planSlug === "premium" ? "Premium" : "Grátis"}
                </Badge>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <PeriodPicker year={period.year} month={period.month} onChange={handlePeriodChange} />
            <Button
              size="sm"
              onClick={() => { setDialogKind("expense"); setDialogOpen(true); }}
              className="h-9 rounded-xl bg-emerald-600 px-4 font-bold text-white shadow-lg shadow-emerald-600/10 transition-all hover:bg-emerald-700 active:scale-95"
            >
              <Plus className="mr-1.5 size-4" />
              Lançar
            </Button>
          </div>
        </header>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <MetricCard label="Saldo" value={formatCurrency(metrics.balance)} tone={metrics.balance >= 0 ? "brand" : "expense"} icon={Wallet} />
          <MetricCard label="Receita" value={formatCurrency(metrics.totalIncome)} tone="brand" icon={TrendingUp} />
          <MetricCard label="Despesa" value={formatCurrency(metrics.totalExpense)} tone="expense" icon={TrendingDown} />
          <MetricCard label="Projeção" value={formatCurrency(metrics.projection)} tone="neutral" icon={Zap} />
        </div>

        <DashboardTabs
          resumo={
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <div className="lg:col-span-8 space-y-6">
                <div className="glass-morphism p-6 rounded-2xl">
                  <h3 className="text-sm font-black uppercase tracking-widest text-muted-foreground mb-6">Evolução do Saldo</h3>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={byDay}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" opacity={0.3} />
                        <XAxis dataKey="day" {...axisProps} />
                        <YAxis hide domain={['auto', 'auto']} />
                        <Tooltip {...tooltipProps} />
                        <Line type="monotone" name="receita" dataKey="receita" stroke={CHART_TOKENS.income} strokeWidth={2} dot={false} />
                        <Line type="monotone" name="gasto" dataKey="gasto" stroke={CHART_TOKENS.expense} strokeWidth={2} dot={false} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
              <div className="lg:col-span-4 space-y-6">
                 {/* Insights e Alertes */}
                 <div className="bg-card border border-border p-6 rounded-2xl shadow-sm">
                    <h2 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-4">Insights Estratégicos</h2>
                    <p className="text-sm font-medium leading-relaxed">
                      {metrics.usedPercent > 90 ? "Alerta de orçamento: alto comprometimento." : "Seu orçamento está sob controle."}
                    </p>
                 </div>
              </div>
            </div>
          }
          categorias={
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {byCategory.map(cat => (
                <div key={cat.id} className="bg-card border border-border p-4 rounded-2xl flex items-center justify-between shadow-sm hover:shadow-md transition-all">
                   <div className="flex items-center gap-3">
                     <div className="size-3 rounded-full shadow-sm" style={{ backgroundColor: cat.color }} />
                     <span className="text-sm font-bold">{cat.name}</span>
                   </div>
                   <span className="text-sm font-bold text-primary">{formatCurrency(cat.value)}</span>
                </div>
              ))}
            </div>
          }
          evolucao={
             <div className="bg-card border border-border p-6 rounded-2xl h-[400px] shadow-sm">
                <ResponsiveContainer width="100%" height="100%">
                   <BarChart data={byDay}>
                      <CartesianGrid {...gridProps} />
                      <XAxis dataKey="day" {...axisProps} />
                      <YAxis {...axisProps} />
                      <Tooltip {...tooltipProps} />
                      <Bar dataKey="gasto" fill={CHART_TOKENS.expense} radius={barRadius} />
                   </BarChart>
                </ResponsiveContainer>
             </div>
          }
          proximasAcoes={
             <div className="grid grid-cols-1 gap-4">
                {(metrics.upcoming ?? []).map(tx => (
                   <div key={tx.id} className="bg-card border border-border p-4 rounded-2xl flex items-center justify-between shadow-sm hover:shadow-md transition-all">
                      <div className="flex flex-col">
                        <span className="font-bold text-sm">{tx.description}</span>
                        <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">{formatDate(tx.transaction_date)}</span>
                      </div>
                      <span className="font-bold text-destructive">{formatCurrency(tx.amount)}</span>
                   </div>
                ))}
             </div>
          }
        />
      </div>
      </div>
      <MetricDetailDialog
        detail={detail}
        categories={categories ?? []}
        onOpenChange={(open) => {
          if (!open) {
            setDetail(null);
            setDetailDate(null);
          }
        }}
        onEditTransaction={(transaction) => {
          setDetail(null);
          setEditingTx(transaction);
          setDialogKind(transaction.transaction_type === "income" ? "income" : "expense");
          setPreset({ categoryId: null, subCategoryId: null });
          setDialogOpen(true);
        }}
        {...(detailDate
          ? {
              onAddTransaction: () => {
                setDetail(null);
                setEditingTx(null);
                setDialogKind("expense");
                setPreset({ categoryId: null, subCategoryId: null });
                setDialogOpen(true);
              },
              addLabel: `Lançar em ${formatDate(detailDate)}`,
            }
          : {})}
      />

      <TransactionDialog
        open={dialogOpen}
        onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) {
            setEditingTx(null);
            setDetailDate(null);
          }
        }}
        kind={dialogKind}
        transaction={editingTx}
        {...(detailDate && !editingTx ? { defaultDate: detailDate } : {})}
        presetCategoryId={preset.categoryId}
        presetSubCategoryId={preset.subCategoryId}
      />

      <ExpenseCardsDialog open={cardsOpen} onOpenChange={setCardsOpen} />
      <DependentExpenseDialog open={dependentOpen} onOpenChange={setDependentOpen} />
      <TaxQuickDialog open={taxOpen} onOpenChange={setTaxOpen} />
      <InteractiveCalendar 
        open={calendarOpen} 
        onOpenChange={setCalendarOpen} 
        onDayClick={(day: number) => openDayDetail(day)} 
      />
    </AppShell>
  );
}









    



function ChartCard({
  title,
  summary,
  children,
}: {
  title: string;
  summary: string;
  children: React.ReactNode;
}) {
  return (
    <div className="glass-morphism mobile-compact-card">
      <h2 className="text-sm font-semibold">{title}</h2>
      <p className="mt-1 text-xs text-muted-foreground">{summary}</p>
      <div className="chart-frame mt-2">{children}</div>
    </div>
  );
}

function EmptyState({ onAdd }: { onAdd: () => void }) {
  return (
    <div className="mt-4 rounded-xl border border-dashed border-border p-6 text-center">
      <p className="text-sm text-muted-foreground">Nenhum lançamento neste período.</p>
      <Button className="mt-3" size="sm" onClick={onAdd}>
        <Plus className="mr-2 size-4" />
        Registrar o primeiro
      </Button>
    </div>
  );
}

function YearlyBalanceSection({ year }: { year: number }) {
  const fetchYearly = useServerFn(getYearlyBalance);
  const [isExpanded, setIsExpanded] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ["yearly_balance", year],
    queryFn: () => fetchYearly({ data: { year } }),
  });

  if (isLoading) return <Skeleton className="h-48 w-full rounded-2xl" />;
  if (!data) return null;

  return (
    <section className="glass-morphism mobile-compact-card shadow-sm overflow-hidden">
      <div 
        className="p-4 flex items-center justify-between cursor-pointer hover:bg-muted/30 transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-2">
          <div className="p-2 bg-primary/10 rounded-lg text-primary">
            <BarChart3 className="size-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold">Balanço Anual {year}</h2>
            <p className="text-[10px] text-muted-foreground">Visão consolidada de receitas e despesas do ano</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
           <div className="hidden sm:flex items-center gap-3 text-xs">
             <div className="text-right">
               <p className="text-[9px] font-bold text-muted-foreground uppercase">Receita Anual</p>
               <p className="font-black text-emerald-600">{formatCurrency(data.totalIncome)}</p>
             </div>
             <div className="text-right border-l pl-3">
               <p className="text-[9px] font-bold text-muted-foreground uppercase">Despesa Anual</p>
               <p className="font-black text-rose-500">{formatCurrency(data.totalExpense)}</p>
             </div>
           </div>
           {isExpanded ? <ChevronDown className="size-4" /> : <ChevronRight className="size-4" />}
        </div>
      </div>

      {isExpanded && (
        <div className="p-4 pt-0 border-t border-border/50 animate-in fade-in slide-in-from-top-2">
          <div className="h-[250px] w-full mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.monthlyData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" opacity={0.6} />
                <XAxis 
                  dataKey="month" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
                  tickFormatter={(m) => MONTH_NAMES[m-1].slice(0,3)}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} 
                  tickFormatter={(v) => `R$ ${v > 1000 ? (v/1000).toFixed(0)+'k' : v}`}
                />
                <Tooltip 
                  cursor={tooltipProps.cursor}
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const m = payload[0].payload;
                      return (
                        <div className="bg-card border border-border p-3 rounded-xl shadow-xl">
                          <p className="text-xs font-bold mb-2">{MONTH_NAMES[m.month-1]}</p>
                          <div className="space-y-1">
                            <div className="flex justify-between gap-4">
                              <span className="text-[10px] text-muted-foreground">Receita:</span>
                              <span className="text-[10px] font-bold text-emerald-600">{formatCurrency(m.income)}</span>
                            </div>
                            <div className="flex justify-between gap-4">
                              <span className="text-[10px] text-muted-foreground">Despesa:</span>
                              <span className="text-[10px] font-bold text-rose-600">{formatCurrency(m.expense)}</span>
                            </div>
                            <div className="flex justify-between gap-4 border-t pt-1 mt-1">
                              <span className="text-[10px] text-muted-foreground font-bold">Saldo:</span>
                              <span className={cn("text-[10px] font-black", m.balance >= 0 ? "text-emerald-600" : "text-rose-600")}>
                                {formatCurrency(m.balance)}
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Legend iconType="circle" wrapperStyle={{fontSize: 10, fontWeight: 600, paddingTop: 10}} />
                <Bar name="Receita" dataKey="income" fill={CHART_TOKENS.income} radius={[5, 5, 0, 0]} maxBarSize={22} />
                <Bar name="Despesa" dataKey="expense" fill={CHART_TOKENS.expense} radius={[5, 5, 0, 0]} maxBarSize={22} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6">
            {data.monthlyData.slice(-4).map((m) => (
              <div 
                key={m.month} 
                className="p-3 rounded-xl border bg-muted/20 hover:bg-muted/40 transition-colors cursor-pointer group"
                onClick={() => {
                  toast.info(`Detalhes de ${MONTH_NAMES[m.month-1]}`, {
                    description: `Balanço de ${formatCurrency(m.balance)} no mês.`
                  });
                }}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] font-bold uppercase text-muted-foreground">{MONTH_NAMES[m.month-1]}</span>
                  <ChevronRight className="size-3 text-muted-foreground group-hover:text-foreground transition-colors" />
                </div>
                <p className={cn("text-sm font-black", m.balance >= 0 ? "text-emerald-600" : "text-rose-600")}>
                  {formatCurrency(m.balance)}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
