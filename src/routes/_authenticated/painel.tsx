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
        
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col">
          <h1 className="text-xl font-black tracking-tight sm:text-2xl">
            Olá, {profile?.full_name?.split(" ")[0] ?? "Usuário"}!
          </h1>
          <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
            {MONTH_NAMES[period.month - 1]} de {period.year}
          </p>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none sm:pb-0">
          <PeriodPicker year={period.year} month={period.month} onChange={handlePeriodChange} />
          
          <Button
            variant="outline"
            size="icon"
            onClick={handleRefresh}
            className="size-9 shrink-0 rounded-xl border-border/40 bg-background/50 backdrop-blur-sm sm:hidden"
            aria-label="Atualizar dados"
            title="Atualizar dados"
          >
            <RefreshCw className="size-4 text-muted-foreground" />
          </Button>
          
          <div className="h-8 w-px shrink-0 bg-border/40" />

          <div className="flex shrink-0 items-center gap-1.5">
            <Button
              size="sm"
              onClick={() => {
                setDialogKind("expense");
                setDialogOpen(true);
              }}
              className="h-9 rounded-xl bg-rose-500 px-4 font-bold text-white shadow-lg shadow-rose-500/10 transition-all hover:bg-rose-600 active:scale-95"
            >
              <Plus className="mr-1.5 size-4" />
              Lançar
            </Button>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  className="size-9 rounded-xl border-border/40 bg-background/50 backdrop-blur-sm"
                >
                  <ChevronDown className="size-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem onClick={() => {
                  setDialogKind("income");
                  setDialogOpen(true);
                }}>
                  <TrendingUp className="mr-2 size-4 text-success" />
                  Lançar Receita
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setCardsOpen(true)}>
                  <ShoppingBag className="mr-2 size-4 text-brand" />
                  Gasto no Cartão
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTaxOpen(true)}>
                  <FileText className="mr-2 size-4 text-warning" />
                  Lançar Imposto
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => exportDashboardToPDF("dashboard-content", "Painel Financeiro")}>
                  <Printer className="mr-2 size-4" />
                  Exportar PDF
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 sm:hidden px-4 mb-4">
        <MetricCard
          label="Saldo"
          value={formatCurrency(metrics.balance)}
          tone={metrics.balance >= 0 ? "brand" : "expense"}
          icon={Wallet}
          onClick={() => {
            setDetail({
              label: "Saldo Geral",
              value: formatCurrency(metrics.balance),
              hint: "Resultado do mês atual",
              formula: "Receitas totais menos despesas totais do período selecionado.",
              extra: [
                { label: "Receitas", value: formatCurrency(metrics.totalIncome) },
                { label: "Despesas", value: formatCurrency(metrics.totalExpense) }
              ],
              rows: transactions ?? []
            });
          }}
        />
        <MetricCard
          label="Gasto"
          value={formatCurrency(metrics.totalExpense)}
          tone="expense"
          icon={TrendingDown}
          onClick={() => {
            setDetail({
              label: "Total de Despesas",
              value: formatCurrency(metrics.totalExpense),
              hint: "Soma de todos os gastos",
              formula: "Total faturado no cartão + pagamentos à vista + contas fixas do período.",
              extra: [
                { label: "Média diária", value: formatCurrency(metrics.dailyAverage) },
                { label: "Projeção final", value: formatCurrency(metrics.projection) }
              ],
              rows: metrics.expenses
            });
          }}
        />
      </div>

        {kidsOnboarding.visible && !kidsOnboarding.complete && (
          <div className="glass-morphism mobile-compact-card shadow-sm sm:rounded-3xl sm:p-4">
            <div className="flex items-center justify-between mb-2 sm:mb-4">
              <div className="flex items-center gap-2">
                <div className="size-8 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Baby className="size-4 text-primary" />
                </div>
                <h3 className="text-xs font-black uppercase tracking-widest">Configuração Espaço Kids</h3>
              </div>
              <Button asChild variant="link" size="sm" className="h-auto p-0 text-primary text-[10px] font-bold">
                <Link to="/kids">Configurar Agora →</Link>
              </Button>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { label: "Adicionar", done: kidsOnboarding.hasKid },
                { label: "PIN Segurança", done: kidsOnboarding.hasPin },
                { label: "Limites", done: kidsOnboarding.hasLimit },
                { label: "Mesada", done: kidsOnboarding.hasAllowance }
              ].map((step, idx) => (
                <div key={idx} className={cn(
                  "flex items-center gap-2 px-3 py-1.5 rounded-xl border transition",
                  step.done ? "bg-primary/10 border-primary/20 text-primary" : "bg-background border-border text-muted-foreground"
                )}>
                  {step.done ? <CheckSquare className="size-3.5" /> : <Circle className="size-3.5" />}
                  <span className="text-[10px] font-bold">{step.label}</span>
                </div>
              ))}
            </div>
          </div>
        )}


        <GlobalAnnouncementsBanner />

        {loadingTransactions ? (
          <div className="grid gap-3 grid-cols-2 md:grid-cols-4 lg:grid-cols-6 opacity-50 transition-opacity duration-300">
            {Array.from({ length: 12 }).map((_, index) => (
              <Skeleton key={index} className="h-24 rounded-2xl" />
            ))}
          </div>
        ) : (
          <div id="dashboard-content" className="flex flex-col gap-3 lg:grid lg:gap-6 lg:grid-cols-[340px_1fr_360px] mt-2 sm:mt-6 w-full max-w-full overflow-x-hidden">
            <aside className="hidden lg:block space-y-6">
              <div className="rounded-2xl border border-border/40 bg-card/40 backdrop-blur-sm p-5 shadow-sm">
                <div className="flex items-center gap-2 mb-4">
                  <div className="size-8 rounded-lg bg-brand/10 flex items-center justify-center">
                    <Sparkles className="size-4 text-brand" />
                  </div>
                  <h2 className="text-sm font-black tracking-tight">Insights Rápidos</h2>
                </div>
                
                <div className="space-y-4">
                  <div className="p-3 rounded-xl bg-secondary/20 border border-border/30">
                    <p className="text-[10px] font-bold text-muted-foreground uppercase mb-1">Resumo do Mês</p>
                    <div className="flex items-end justify-between">
                      <p className={cn("text-lg font-black", metrics.balance >= 0 ? "text-emerald-600" : "text-rose-600")}>
                        {formatCurrency(metrics.balance)}
                      </p>
                      <span className="text-[10px] text-muted-foreground font-medium">Líquido</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <p className="text-[10px] font-bold text-muted-foreground uppercase px-1">Alertas do Mês</p>
                    {metrics.usedPercent > 90 ? (
                      <div className="flex items-start gap-2.5 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20">
                        <AlertTriangle className="size-4 text-rose-500 shrink-0 mt-0.5" />
                        <p className="text-[10px] leading-tight text-rose-600 font-bold">
                          Você atingiu {metrics.usedPercent.toFixed(1)}% do seu orçamento. Considere frear gastos não essenciais.
                        </p>
                      </div>
                    ) : metrics.usedPercent > 75 ? (
                      <div className="flex items-start gap-2.5 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20">
                        <AlertTriangle className="size-4 text-amber-600 shrink-0 mt-0.5" />
                        <p className="text-[10px] leading-tight text-amber-700 font-bold">
                          Atenção: Orçamento em {metrics.usedPercent.toFixed(1)}%. Mantenha o foco até o fechamento.
                        </p>
                      </div>
                    ) : (
                      <div className="flex items-start gap-2.5 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                        <CheckSquare className="size-4 text-emerald-500 shrink-0 mt-0.5" />
                        <p className="text-[10px] leading-tight text-emerald-700 font-bold">
                          Orçamento sob controle ({metrics.usedPercent.toFixed(1)}%). Ótimo trabalho!
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="pt-2">
                    <MetricCard
                      tone="neutral"
                      label="Projeção de Fim de Mês"
                      value={formatCurrency(metrics.projection)}
                      className="!p-3 border-none bg-emerald-500/5 dark:bg-emerald-500/10 shadow-none ring-1 ring-emerald-500/20"
                    />
                  </div>
                </div>
              </div>

              <div className="glass-morphism mobile-compact-card shadow-sm">
                <h3 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-4">Evolução do Saldo</h3>
                <div className="h-[180px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={byDay}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" opacity={0.3} />
                      <XAxis 
                        dataKey="day" 
                        tick={{ fontSize: 9 }}
                        interval="preserveStartEnd"
                        axisLine={false}
                        tickLine={false}
                      />
                      <YAxis 
                        hide 
                        domain={['auto', 'auto']} 
                      />
                      <Tooltip 
                        contentStyle={{ 
                          fontSize: '10px', 
                          borderRadius: '12px', 
                          backgroundColor: 'var(--popover)', 
                          border: '1px solid var(--border)',
                          boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' 
                        }}
                        formatter={(value: number, name: string) => [formatCurrency(value), name === 'receita' ? 'Ganhos' : 'Gastos']}
                        labelFormatter={(label) => `Dia ${label}`}
                      />
                      <Legend 
                        verticalAlign="top" 
                        align="right" 
                        iconType="circle"
                        wrapperStyle={{ fontSize: '9px', fontWeight: 'bold', paddingBottom: '10px' }}
                      />
                      <Line 
                        type="monotone" 
                        name="receita"
                        dataKey="receita" 
                        stroke="var(--success)" 
                        strokeWidth={2.5} 
                        dot={false} 
                        activeDot={{ r: 4 }}
                      />
                      <Line 
                        type="monotone" 
                        name="gasto"
                        dataKey="gasto" 
                        stroke="var(--expense)" 
                        strokeWidth={2.5} 
                        dot={false} 
                        activeDot={{ r: 4 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
                <div className="mt-4 pt-4 border-t border-border/50 grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <p className="text-[9px] font-black uppercase text-muted-foreground">Média Diária</p>
                    <p className="text-xs font-black">{formatCurrency(metrics.dailyAverage)}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[9px] font-black uppercase text-muted-foreground">Projeção</p>
                    <p className="text-xs font-black">{formatCurrency(metrics.projection)}</p>
                  </div>
                </div>
              </div>
            </aside>

                <div className="space-y-6">

                   <div className="space-y-6">
                     <div className="grid gap-6 sm:grid-cols-2">
                        <InteractiveCard
                          id="client-top-expenses"
                          className="glass-morphism"
                          title="Valores Gastos por Categoria"
                         description="Detalhamento das despesas do período"
                         icon={<ShoppingBag className="size-4" />}
                         items={byCategory}
                         maxVisibleItems={4}
                          chart={
                            <ResponsiveContainer width="100%" height="100%">
                              <BarChart data={byCategory.slice(0, 5)} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                               <XAxis dataKey="name" hide />
                               <YAxis hide />
                               <Tooltip 
                                 contentStyle={{ backgroundColor: 'hsl(var(--card))', borderRadius: '12px', border: '1px solid hsl(var(--border))', fontSize: '10px' }}
                                 formatter={(value: number) => [formatCurrency(value), 'Gasto']}
                               />
                               <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                                 {byCategory.slice(0, 5).map((entry, index) => (
                                   <Cell key={`cell-${index}`} fill={entry.color} opacity={0.8} />
                                 ))}
                               </Bar>
                             </BarChart>
                           </ResponsiveContainer>
                         }
                         renderItem={(cat) => (
                           <div 
                             key={cat.id} 
                             className="flex items-center justify-between gap-3 px-3 py-2 rounded-xl bg-muted/20 text-xs hover:bg-muted/40 transition-colors cursor-pointer"
                             onClick={() => openCategoryDetail(cat.id, cat.name)}
                           >
                             <div className="flex items-center gap-2">
                               <div className="size-2 rounded-full" style={{ backgroundColor: cat.color }} />
                               <span className="font-bold">{cat.name}</span>
                             </div>
                             <span className="font-black text-brand">{formatCurrency(cat.value)}</span>
                           </div>
                         )}
                       >
                         <div className="p-3 rounded-xl bg-brand/5 border border-brand/10 space-y-1">
                           <p className="text-[10px] font-black uppercase text-brand tracking-widest">Resumo Estratégico</p>
                           <p className="text-[11px] text-muted-foreground leading-tight">
                             Suas 3 principais categorias representam <strong>{metrics.totalExpense > 0 ? ((byCategory.slice(0, 3).reduce((s, c) => s + c.value, 0) / metrics.totalExpense) * 100).toFixed(1) : 0}%</strong> do seu orçamento mensal.
                           </p>
                         </div>
                       </InteractiveCard>

                        <InteractiveCard
                          id="client-upcoming-bills"
                          className="glass-morphism"
                          title="Próximos Vencimentos"
                         description="Contas pendentes e recorrentes"
                         icon={<CalendarClock className="size-4" />}
                         items={metrics.upcoming}
                         maxVisibleItems={3}
                         renderItem={(tx) => (
                           <div 
                             key={tx.id} 
                             className="flex items-center justify-between gap-3 px-3 py-2 rounded-xl bg-muted/20 text-xs"
                           >
                             <div className="flex flex-col">
                               <span className="font-bold truncate max-w-[120px]">{tx.description || "Sem descrição"}</span>
                               <span className="text-[9px] text-muted-foreground uppercase font-black">{formatDate(tx.transaction_date)}</span>
                             </div>
                             <div className="flex flex-col items-end">
                               <span className="font-black text-rose-600">{formatCurrency(tx.amount)}</span>
                               {tx.status === 'overdue' && <Badge variant="destructive" className="text-[8px] h-3 px-1 uppercase">Atrasado</Badge>}
                             </div>
                           </div>
                         )}
                       >
                         <div className="space-y-3">
                            <div className="flex items-center justify-between text-xs">
                              <span className="text-muted-foreground font-bold">Comprometimento Mensal</span>
                              <span className="font-black text-rose-600">{formatCurrency(metrics.recurring)}</span>
                            </div>
                            <Progress value={metrics.totalIncome > 0 ? (metrics.recurring / metrics.totalIncome) * 100 : 0} className="h-1.5" />
                            <p className="text-[10px] text-muted-foreground italic">
                              Contas fixas representam uma parcela significativa do seu custo de vida.
                            </p>
                         </div>
                       </InteractiveCard>
                     </div>
                      <div className="hidden sm:grid gap-3 auto-cards-sm">
                        <MetricCard
                          label="Minha Assinatura"
                          value={access.planSlug === "premium_ia" ? "Premium IA" : access.planSlug === "premium" ? "Premium" : "Grátis"}
                          tone={access.planSlug !== "free" ? "brand" : "neutral"}
                          icon={ShieldCheck}
                          badge={access.planSlug !== "free" ? (
                            <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 text-[10px] font-black uppercase tracking-tighter h-5 px-1.5">
                              PRO
                            </Badge>
                          ) : undefined}
                          onClick={() => navigate({ to: "/perfil" })}
                        />

                        <MetricCard
                          tone="brand"
                          label={
                            metrics.isCurrentMonth
                              ? `Gasto hoje · ${formatDate(isoDate(today))}`
                              : "Gasto hoje"
                          }
                          value={formatCurrency(metrics.today)}
                          hint={
                            !metrics.isCurrentMonth
                              ? "Disponível apenas no mês atual"
                              : detailRows.todayExpenses.length === 0
                                ? "Nenhum lançamento hoje"
                                : `${detailRows.todayExpenses.length} lançamento${
                                    detailRows.todayExpenses.length > 1 ? "s" : ""
                                  } só de hoje`
                          }
                          icon={Zap}
                          onClick={() => openDayDetail(today.getDate())}
                        />

                        <MetricCard
                          tone="warning"
                          label="Gasto nos 7 dias"
                          value={formatCurrency(metrics.week)}
                          icon={CalendarClock}
                          onClick={() =>
                            setDetail({
                              label: "Gasto nos últimos 7 dias",
                              value: formatCurrency(metrics.week),
                              formula:
                                "Soma das despesas dos 7 dias corridos até hoje, incluindo os dias que caem no mês anterior.",
                              rows: detailRows.weekExpenses,
                            })
                          }
                        />

                        <MetricCard
                          tone="expense"
                          label="Gasto no mês"
                          value={formatCurrency(metrics.totalExpense)}
                          icon={TrendingDown}
                          onClick={() =>
                            setDetail({
                              label: "Gasto no mês",
                              value: formatCurrency(metrics.totalExpense),
                              formula: "Soma de todas as despesas do período selecionado.",
                              rows: detailRows.expenses,
                              extra: [
                                { label: "Lançamentos", value: String(detailRows.expenses.length) },
                                { label: "Média diária", value: formatCurrency(metrics.dailyAverage) },
                              ],
                            })
                          }
                        />

                        <MetricCard
                          tone="brand"
                          label="Receita total"
                          value={formatCurrency(metrics.totalIncome)}
                          icon={TrendingUp}
                          onClick={() =>
                            setDetail({
                              label: "Receita total",
                              value: formatCurrency(metrics.totalIncome),
                              formula: "Soma de todas as receitas do período selecionado.",
                              rows: detailRows.incomes,
                              extra: [
                                { label: "Lançamentos", value: String(detailRows.incomes.length) },
                              ],
                            })
                          }
                        />

                        <MetricCard
                          tone="neutral"
                          label="Saldo disponível"
                          value={formatCurrency(metrics.balance)}
                          icon={Wallet}
                          onClick={() =>
                            setDetail({
                              label: "Saldo disponível",
                              value: formatCurrency(metrics.balance),
                              formula: "Resultado líquido do mês (Receitas - Despesas).",
                              rows: transactions ?? [],
                              extra: [
                                { label: "Receitas", value: formatCurrency(metrics.totalIncome) },
                                { label: "Despesas", value: formatCurrency(metrics.totalExpense) },
                              ],
                            })
                          }
                        />
                      </div>
                      <ChartCard title="Evolução Diária" summary="Pico de gastos diários">
                         <div className="h-[250px]">
                            <ResponsiveContainer width="100%" height="100%">
                               <BarChart data={byDay} onClick={(s:any) => s?.activeLabel && openDayDetail(Number(s.activeLabel))}>
                                  <CartesianGrid {...gridProps} />
                                  <XAxis dataKey="day" {...axisProps} />
                                  <YAxis {...axisProps} width={36} />
                                  <Tooltip {...tooltipProps} formatter={(v:any) => formatCurrency(v)} />
                                  <Bar dataKey="gasto" fill={CHART_TOKENS.neutral} radius={barRadius} />
                               </BarChart>
                            </ResponsiveContainer>
                         </div>
                      </ChartCard>
                   </div>
                 }
                  analytics={
                    <div className="grid gap-6 md:grid-cols-2">
                      <InteractiveCard
                        id="client-analytics-categories"
                        className="glass-morphism"
                        title="Categorias"
                        description="Distribuição percentual de gastos"
                        icon={<PieChartIcon className="size-4" />}
                        chart={
                          <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                              <Pie data={byCategory} dataKey="value" nameKey="name" innerRadius={60} outerRadius={90} onClick={(e:any) => e?.id && openCategoryDetail(e.id, e.name)}>
                                {byCategory.map((e, i) => <Cell key={e.name} fill={e.color ?? seriesColor(i)} stroke="var(--card)" strokeWidth={2} />)}
                              </Pie>
                              <Tooltip formatter={(v:any, n:any) => [formatCurrency(v), n]} />
                            </PieChart>
                          </ResponsiveContainer>
                        }
                      >
                        <div className="space-y-2">
                          <p className="text-[10px] font-bold text-muted-foreground uppercase">Distribuição de Recursos</p>
                          <div className="grid grid-cols-2 gap-2">
                             {byCategory.slice(0, 4).map(cat => (
                               <div key={cat.id} className="p-2 rounded-lg bg-muted/30 border border-border/20 flex flex-col">
                                 <span className="text-[9px] font-bold truncate">{cat.name}</span>
                                 <span className="text-xs font-black">{formatCurrency(cat.value)}</span>
                               </div>
                             ))}
                          </div>
                        </div>
                      </InteractiveCard>

                      <InteractiveCard
                        id="client-analytics-flow"
                        className="glass-morphism"
                        title="Receitas x Despesas"
                        description="Fluxo mensal consolidado"
                        icon={<Activity className="size-4" />}
                        chart={
                          <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={byDay}>
                               <CartesianGrid {...gridProps} />
                               <XAxis dataKey="day" {...axisProps} />
                               <YAxis {...axisProps} width={40} />
                               <Tooltip formatter={(v:any) => formatCurrency(v)} />
                               <Line type="monotone" dataKey="receita" stroke={CHART_TOKENS.income} strokeWidth={2} dot={false} />
                               <Line type="monotone" dataKey="gasto" stroke={CHART_TOKENS.expense} strokeWidth={2} dot={false} />
                            </LineChart>
                          </ResponsiveContainer>
                        }
                      >
                        <div className="grid grid-cols-2 gap-4">
                          <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                            <p className="text-[9px] font-bold text-emerald-600 uppercase">Total Receitas</p>
                            <p className="text-sm font-black text-emerald-700">{formatCurrency(metrics.totalIncome)}</p>
                          </div>
                          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20">
                            <p className="text-[9px] font-bold text-rose-600 uppercase">Total Despesas</p>
                            <p className="text-sm font-black text-rose-700">{formatCurrency(metrics.totalExpense)}</p>
                          </div>
                        </div>
                      </InteractiveCard>
                    </div>
                  }
                 yearly={<YearlyBalanceSection year={period.year} />}
                  insights={<InsightsPanel year={period.year} month={period.month} />}
                  recommendations={<DebtAdvisorPanel />}
                   kids={<KidsManagementPanel />}
                   family={<FamilySpendingDashboard />}

               />
            </div>
          </div>
        )}
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
