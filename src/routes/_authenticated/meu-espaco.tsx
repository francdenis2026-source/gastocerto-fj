import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CreditCard, Download, Loader2, LogOut, Moon, PiggyBank, Sparkles, Sun, Target, TrendingDown, TrendingUp, HelpCircle, AlertTriangle, LayoutGrid, WifiOff, RefreshCw, Calendar as CalendarIcon, FileText, ChevronRight, Plus, Gift, Wallet } from "lucide-react";
import { useConfirm } from "@/components/ui/confirm-dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

import { useKidTheme } from "@/lib/kids-theme";
import { useKidsAppMode } from "@/lib/kids-pwa";
import { useAppUpdate } from "@/lib/pwa";
import { Badge } from "@/components/ui/badge";


import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { MoneyInput } from "@/components/ui/money-input";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { DEPENDENT_REASONS, dependentTag, reasonTag, useDependents, type Dependent } from "@/lib/dependents";
import { MONTH_NAMES, parseAmount } from "@/lib/finance";
import { formatCurrency } from "@/lib/format-utils";
import { useKidSession } from "@/lib/kids-session";
import { parseKidVisibility } from "@/lib/kids-access";
import { cn } from "@/lib/utils";
import { getKidCardControl } from "@/lib/kids-cards.functions";
import { useServerFn } from "@tanstack/react-start";
import { Progress } from "@/components/ui/progress";
import { KidsStatusGuard } from "@/components/kids/kids-status-guard";
import { NotificationCenter } from "@/components/notifications/notification-center";
import { useAvatarUrl } from "@/lib/queries";
import { syncKidTransaction } from "@/lib/kids-sync.functions";
import { createKidTransaction } from "@/lib/kids-self-transactions.functions";
import { exportKidsSummaryPdf } from "@/lib/kids-export";
import { getKidGoals } from "@/lib/kids-goals.functions";
import { useKidSpaceRealtime } from "@/lib/kids-space-realtime";
import { KidEntryDetailsDialog } from "@/components/kids/kid-entry-details-dialog";
import { kidEntryKind, kidEntryLabel, kidEntryTone } from "@/lib/kids-labels";



export const Route = createFileRoute("/_authenticated/meu-espaco")({
  head: () => {
    const title = "Meu Espaço — GastoCerto Kids";
    const description =
      "O espaço da criança no GastoCerto: mesada, metas de poupança e registro de ganhos e gastos, com acompanhamento do responsável.";
    const image = "https://gastocerto-fj.lovable.app/og-kids.jpg";
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { name: "robots", content: "noindex" },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:type", content: "website" },
        { property: "og:url", content: "https://gastocerto-fj.lovable.app/meu-espaco" },
        { property: "og:image", content: image },
        { property: "og:image:width", content: "1200" },
        { property: "og:image:height", content: "630" },
        { property: "og:image:alt", content: "Espaço Kids do GastoCerto: cofrinho e meta de poupança" },
        { property: "og:locale", content: "pt_BR" },
        { name: "twitter:card", content: "summary_large_image" },
        { name: "twitter:title", content: title },
        { name: "twitter:description", content: description },
        { name: "twitter:image", content: image },
      ],
    };
  },

  loader: async ({ context: { queryClient } }) => {
    // Carregar configurações de modo compacto
    const { data: profile } = await supabase.from("profiles").select("*").single();
    return { compactMode: (profile as any)?.compact_mode ?? false };
  },

  component: KidSpacePage,
});


type KidTransaction = {
  id: string;
  description: string;
  amount: number;
  transaction_type: "income" | "expense" | "transfer";
  transaction_date: string;
  tags?: string[];
};

/**
 * Paleta de acento do Espaço Kids.
 *
 * Cada variante declara explicitamente o par claro/escuro para garantir contraste
 * AA nos dois temas — evitamos usar apenas `text-blue-600`, que fica ilegível no
 * modo escuro, e apenas `text-blue-300`, que falha no modo claro.
 */
type KidAccent = {
  surface: string;
  border: string;
  borderHover: string;
  text: string;
  iconBg: string;
  button: string;
  ring: string;
};

const KID_ACCENTS: Record<"boy" | "girl" | "neutral", KidAccent> = {
  boy: {
    surface: "bg-sky-500/8 dark:bg-sky-400/10",
    border: "border-sky-600/25 dark:border-sky-400/25",
    borderHover: "hover:border-sky-600/50 dark:hover:border-sky-400/50",
    text: "text-sky-700 dark:text-sky-300",
    iconBg: "bg-sky-600/12 text-sky-700 dark:bg-sky-400/15 dark:text-sky-300",
    button: "bg-sky-700 text-white hover:bg-sky-800 dark:bg-sky-500 dark:hover:bg-sky-400 dark:text-sky-950",
    ring: "ring-sky-600/20 dark:ring-sky-400/25",
  },
  girl: {
    surface: "bg-fuchsia-500/8 dark:bg-fuchsia-400/10",
    border: "border-fuchsia-600/25 dark:border-fuchsia-400/25",
    borderHover: "hover:border-fuchsia-600/50 dark:hover:border-fuchsia-400/50",
    text: "text-fuchsia-700 dark:text-fuchsia-300",
    iconBg: "bg-fuchsia-600/12 text-fuchsia-700 dark:bg-fuchsia-400/15 dark:text-fuchsia-300",
    button: "bg-fuchsia-700 text-white hover:bg-fuchsia-800 dark:bg-fuchsia-500 dark:hover:bg-fuchsia-400 dark:text-fuchsia-950",
    ring: "ring-fuchsia-600/20 dark:ring-fuchsia-400/25",
  },
  neutral: {
    surface: "bg-primary/8",
    border: "border-primary/25",
    borderHover: "hover:border-primary/50",
    text: "text-primary",
    iconBg: "bg-primary/12 text-primary",
    button: "",
    ring: "ring-primary/20",
  },
};

/** Valores positivos e negativos com contraste garantido nos dois temas. */
const POSITIVE_TEXT = "text-emerald-700 dark:text-emerald-400";
const POSITIVE_SURFACE = "bg-emerald-600/10 dark:bg-emerald-400/10";
const NEGATIVE_TEXT = "text-red-600 dark:text-red-400 font-black";
const NEGATIVE_SURFACE = "bg-red-500/10 dark:bg-red-400/15";

function KidSpacePage() {
  const navigate = useNavigate();
  const { signOut, user } = useAuth();
  const { confirm, ConfirmDialog } = useConfirm();
  const { dependent, loading } = useKidSession();
  const { compactMode: initialCompactMode } = Route.useLoaderData();
  const [compactMode, setCompactMode] = useState(initialCompactMode);
  const [logoutDialogOpen, setLogoutDialogOpen] = useState(false);
  const [viewYearly, setViewYearly] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const avatarUrl = useAvatarUrl(dependent?.avatar_url);
  const [entryOpen, setEntryOpen] = useState(false);
  const [entryDetails, setEntryDetails] = useState<any | null>(null);
  const syncTx = useServerFn(syncKidTransaction);
  const createTx = useServerFn(createKidTransaction);
  const fetchGoals = useServerFn(getKidGoals);

  // Modo aplicativo/offline exclusivo do Espaço Kids.
  const { canInstall, online, install } = useKidsAppMode();
  const { updateReady, applyUpdate } = useAppUpdate();

  // Preferência de tema exclusiva da criança (não altera a do responsável).
  const { theme: kidTheme, toggleTheme: toggleKidTheme } = useKidTheme(dependent?.id);

  // Se o responsável apagar ou editar um envio, a tela da criança atualiza na hora.
  useKidSpaceRealtime(user?.id);



  const gender = (dependent as { gender?: string } | null | undefined)?.gender;
  const isBoy = gender === "boy";
  const isGirl = gender === "girl";
  const accent = KID_ACCENTS[isBoy ? "boy" : isGirl ? "girl" : "neutral"];

  const fetchCardControl = useServerFn(getKidCardControl);

  const cardControl = useQuery({
    queryKey: ["kid_card_control", dependent?.id],
    enabled: Boolean(dependent?.id),
    queryFn: async () => {
      return await fetchCardControl({ data: { kidUserId: dependent!.id } });
    },
  });

  const transactions = useQuery({
    queryKey: ["kid_transactions", dependent?.id, user?.id, viewYearly, selectedMonth, selectedYear],
    enabled: Boolean(dependent?.id) && Boolean(user?.id),
    queryFn: async (): Promise<KidTransaction[]> => {
      const startMonth = selectedMonth + 1;
      const { data, error } = await supabase
        .from("transactions")
        .select("id, description, amount, transaction_type, transaction_date, tags")
        // Somente os lançamentos da própria criança: nunca os registros do responsável.
        .eq("user_id", user!.id)
        .is("deleted_at", null)
        .order("transaction_date", { ascending: false })
        .gte("transaction_date", viewYearly ? `${selectedYear}-01-01` : `${selectedYear}-${String(startMonth).padStart(2, '0')}-01`)
        .lte("transaction_date", viewYearly ? `${selectedYear}-12-31T23:59:59` : `${selectedYear}-${String(startMonth).padStart(2, '0')}-${new Date(selectedYear, startMonth, 0).getDate()}T23:59:59`);

      if (error) throw error;
      // Blindagem extra: descarta qualquer espelho de lançamento feito pelo responsável.
      return ((data ?? []) as unknown as KidTransaction[]).filter(
        (row) => !(row.tags ?? []).includes("kids_management"),
      );
    },
  });

  const pixAlerts = useQuery({
    queryKey: ["kid_pix_alerts", dependent?.id],
    enabled: Boolean(dependent?.id),
    refetchInterval: 10000,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("ledger_entries")
        .select("*")
        .eq("dependent_id", dependent!.id)
        .order("created_at", { ascending: false })
        .limit(1);
      
      if (error) throw error;
      return data?.[0];
    }

  });

  useEffect(() => {
    if (pixAlerts.data) {
      const lastSeen = localStorage.getItem(`last_pix_alert_${dependent?.id}`);
      if (lastSeen !== pixAlerts.data.id && (pixAlerts.data as any).type === 'income') {
        toast.custom((t) => (
          <div className={cn(
            "flex w-full max-w-sm flex-col gap-2 rounded-2xl border p-4 shadow-2xl animate-in slide-in-from-right-5",
            "border-white/20 text-white",
            isBoy ? "bg-sky-700" : isGirl ? "bg-fuchsia-700" : "bg-emerald-700",
          )}>
            <div className="flex items-start gap-3">
              <div className="bg-white/20 p-2 rounded-xl">
                <TrendingUp className="size-6" />
              </div>
              <div className="flex-1">
                <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/80">Transferência confirmada</p>
                <h4 className="text-xl font-bold tracking-tight">{formatCurrency(pixAlerts.data.amount)}</h4>
                <p className="text-[11px] font-medium text-white/90 mt-1">{pixAlerts.data.description}</p>
                <p className="text-[9px] mt-2 font-bold opacity-70">
                  {new Date(pixAlerts.data.created_at || '').toLocaleString('pt-BR')}
                </p>
              </div>
              <button onClick={() => toast.dismiss(t)} className="opacity-70 hover:opacity-100">
                <span className="sr-only">Fechar</span>
                <Sparkles className="size-4" />
              </button>
            </div>
          </div>
        ), { duration: 15000 });
        localStorage.setItem(`last_pix_alert_${dependent?.id}`, pixAlerts.data.id);
      }
    }
  }, [pixAlerts.data, dependent?.id]);


  const goals = useQuery({
    queryKey: ["kid_goals", dependent?.id],
    enabled: Boolean(dependent?.id),
    queryFn: async () => {
      return await fetchGoals({ data: { kidUserId: dependent!.id } }) as any[];
    },
  });

  if (loading) {
    return (
      <main className="flex min-h-dvh items-center justify-center">
        <Loader2 className="size-6 animate-spin text-primary" />
      </main>
    );
  }

  if (!dependent) {
    return (
      <main className="flex min-h-dvh flex-col items-center justify-center gap-4 p-6 text-center">
        <h1 className="text-lg font-bold">Acesso ao Espaço Kids</h1>
        <p className="max-w-sm text-sm text-muted-foreground">
          Entre com o painel do responsável para gerenciar seu espaço.
        </p>
        <Button onClick={() => navigate({ to: "/painel" })}>Ir para o painel</Button>
      </main>
    );
  }

  const rows = (transactions.data ?? []) as KidTransaction[];
  const income = Array.isArray(rows)
    ? rows
        .filter((row) => row.transaction_type === "income")
        .reduce((sum, row) => sum + Number(row.amount), 0)
    : 0;
  const expense = Array.isArray(rows)
    ? rows
        .filter((row) => row.transaction_type === "expense")
        .reduce((sum, row) => sum + Number(row.amount), 0)
    : 0;
  const balance = income - expense;
  const firstName = (dependent.nickname || dependent.name).split(" ")[0];
  const visibility = parseKidVisibility((dependent as { kid_visibility?: unknown }).kid_visibility);


  return (
    <KidsStatusGuard kidUserId={dependent.id}>
    <main className={cn(
      "min-h-dvh pb-20 text-foreground antialiased transition-colors duration-300",
      compactMode ? "max-w-4xl mx-auto px-2 sm:px-4" : "",
      isBoy ? "bg-gradient-to-b from-sky-600/12 via-background to-background" :
      isGirl ? "bg-gradient-to-b from-fuchsia-600/12 via-background to-background" :
      "bg-gradient-to-b from-primary/8 via-background to-background",
      compactMode && "tracking-tight"
    )}>





      {/* Densidade da interface: modo padrão (confortável) ou compacto (objetivo) */}
      <div className="fixed bottom-4 right-4 z-50">
        <Button
          variant="outline"
          size="icon"
          className={cn(
            "size-12 rounded-full border shadow-lg transition-transform hover:scale-105",
            compactMode ? "bg-primary border-primary text-primary-foreground" : "bg-card border-border text-foreground"
          )}
          onClick={async () => {
            const newMode = !compactMode;
            setCompactMode(newMode);
            if (user) {
              await supabase.from("profiles").update({ ["compact_mode" as string]: newMode } as any).eq("user_id", user.id);
            }
            toast.success(newMode ? "Visualização compacta ativada." : "Visualização confortável ativada.");
          }}
          title={compactMode ? "Usar visualização confortável" : "Usar visualização compacta"}
          aria-label={compactMode ? "Usar visualização confortável" : "Usar visualização compacta"}
        >
          <LayoutGrid className="size-5" />
        </Button>
      </div>

      {/* Aviso discreto de nova versão do app instalado */}
      {updateReady ? (
        <div className="mx-auto mt-3 w-full max-w-2xl px-4 sm:px-6">
          <div className="flex items-center justify-between gap-3 rounded-xl border border-primary/30 bg-primary/5 px-3 py-2">
            <p className="text-[12px] font-medium leading-snug text-foreground">
              <RefreshCw className="mr-1.5 inline size-3.5 align-[-2px] text-primary" aria-hidden="true" />
              Uma versão mais nova do Meu Espaço está pronta.
            </p>
            <Button size="sm" className="h-8 shrink-0 px-3 text-xs font-semibold" onClick={applyUpdate}>
              Atualizar agora
            </Button>
          </div>
        </div>
      ) : null}

      {/* Modo offline: mensagem clara e explicação do que dá para fazer */}
      {!online ? (
        <div className="mx-auto mt-3 w-full max-w-2xl px-4 sm:px-6">
          <div className="rounded-xl border border-amber-500/40 bg-amber-500/10 px-3 py-2.5">
            <p className="flex items-center gap-1.5 text-[12px] font-semibold text-amber-800 dark:text-amber-200">
              <WifiOff className="size-3.5" aria-hidden="true" /> Você está sem internet
            </p>
            <p className="mt-1 text-[12px] font-medium leading-relaxed text-amber-900/90 dark:text-amber-100/90">
              Seu saldo e os últimos registros continuam visíveis porque ficam guardados no aparelho.
              Para registrar uma nova movimentação ou avisar o responsável, conecte-se ao Wi-Fi ou aos dados
              e tente de novo — nada do que já está salvo será perdido.
            </p>
          </div>
        </div>
      ) : null}

      <header className={cn(
        "px-4 pt-4 pb-2 sm:px-6 transition-all",
        compactMode && "pt-2 px-3 pb-1.5 border-b border-border bg-card/70 backdrop-blur-md sticky top-0 z-40"
      )}>
        <div className="mx-auto grid w-full max-w-2xl grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
          <div className="flex min-w-0 items-center gap-3">
            <Avatar className={cn(
              "size-16 shrink-0 border-2 border-background shadow-lg ring-2 ring-offset-2 ring-offset-background transition-transform active:scale-95 sm:size-[4.5rem]",
              accent.ring,
              compactMode && "size-12 sm:size-12 ring-offset-1",
            )}>
              {avatarUrl ? (
                <AvatarImage src={avatarUrl} alt={`Foto de ${dependent.name}`} className="object-cover" />
              ) : null}
              <AvatarFallback
                className="bg-gradient-to-br from-white/25 to-transparent text-2xl font-black text-white"
                style={{ backgroundColor: dependent.color ?? "#0f766e" }}
              >
                {firstName.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <h1 className="truncate text-lg font-bold leading-tight tracking-tight sm:text-xl">
                Olá, <span className={accent.text}>{firstName}</span>
              </h1>
              <p className="mt-0.5 truncate text-[10px] font-bold uppercase tracking-[0.12em] text-muted-foreground opacity-70">
                {online ? "Online" : "Offline"} · Espaço Kids
              </p>
            </div>
          </div>

          <TooltipProvider delayDuration={200}>
            <div className="flex shrink-0 items-center gap-1">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-10 rounded-full text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                    onClick={toggleKidTheme}
                    aria-label={kidTheme === "dark" ? "Usar modo claro" : "Usar modo escuro"}
                  >
                    {kidTheme === "dark" ? <Sun className="size-4 text-amber-500" /> : <Moon className="size-4 text-primary" />}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>{kidTheme === "dark" ? "Modo claro" : "Modo escuro"}</TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <span className="inline-flex">
                    <NotificationCenter isKid />
                  </span>
                </TooltipTrigger>
                <TooltipContent>Avisos</TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-10 rounded-full text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                    onClick={() => setLogoutDialogOpen(true)}
                    aria-label="Sair do Espaço Kids"
                  >
                    <LogOut className="size-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Sair</TooltipContent>
              </Tooltip>
            </div>
          </TooltipProvider>
        </div>


        {/* Período (mês/ano) na mesma faixa do topo, compacto e legível */}
        <div className="mx-auto mt-2 flex w-full max-w-2xl flex-wrap items-center justify-end gap-1.5">
          {!viewYearly && (
            <Select value={selectedMonth.toString()} onValueChange={(v) => setSelectedMonth(parseInt(v))}>
              <SelectTrigger className="h-9 w-36 border-border bg-card text-sm font-bold capitalize shadow-sm">
                <SelectValue placeholder="Mês" />
              </SelectTrigger>
              <SelectContent>
                {Array.from({ length: 12 }).map((_, i) => (
                  <SelectItem key={i} value={i.toString()} className="text-sm font-semibold capitalize">
                    {new Date(0, i).toLocaleDateString("pt-BR", { month: "long" })}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
          <Select value={selectedYear.toString()} onValueChange={(v) => setSelectedYear(parseInt(v))}>
            <SelectTrigger className="h-9 w-24 border-border bg-card text-sm font-bold shadow-sm">
              <SelectValue placeholder="Ano" />
            </SelectTrigger>
            <SelectContent>
              {[2024, 2025, 2026].map((y) => (
                <SelectItem key={y} value={y.toString()} className="text-sm font-semibold">{y}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <TooltipProvider delayDuration={200}>
            <div className="inline-flex rounded-lg bg-muted p-0.5 shadow-sm">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant={!viewYearly ? "secondary" : "ghost"}
                    size="icon"
                    className="size-8 rounded-md"
                    onClick={() => setViewYearly(false)}
                    aria-label="Ver por mês"
                    aria-pressed={!viewYearly}
                  >
                    <CalendarIcon className="size-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Mês</TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant={viewYearly ? "secondary" : "ghost"}
                    size="icon"
                    className="size-8 rounded-md"
                    onClick={() => setViewYearly(true)}
                    aria-label="Ver o ano inteiro"
                    aria-pressed={viewYearly}
                  >
                    <LayoutGrid className="size-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Anual</TooltipContent>
              </Tooltip>
            </div>
          </TooltipProvider>

        </div>
      </header>


      <div className={cn(
        "mx-auto w-full max-w-2xl space-y-5 px-4 sm:px-6 transition-all",
        compactMode && "max-w-4xl space-y-3 mt-4"
      )}>
        <div className={cn(
          "grid gap-4 sm:grid-cols-2",
          compactMode && "sm:grid-cols-3"
        )}>
          <section className={cn(
            "relative flex flex-col justify-between overflow-hidden rounded-[2.5rem] border bg-card p-6 shadow-xl transition-all hover:shadow-2xl",
            accent.border,
            compactMode && "min-h-[120px] p-4 sm:col-span-2 flex-row items-center text-left",
          )}>
            <div className={cn(
              "pointer-events-none absolute -right-2 -top-2 size-28 opacity-[0.05] dark:opacity-[0.1]",
              accent.text,
            )} aria-hidden="true">
              <PiggyBank className="size-full" />
            </div>

            {visibility.balance ? (
              <div className="relative z-10">
                <div className="flex items-center gap-1.5">
                   <div className={cn("p-1.5 rounded-lg", accent.iconBg)}>
                     <Sparkles className="size-3.5" />
                   </div>
                   <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground opacity-80">
                    Saldo disponível
                   </p>
                </div>
                <p className={cn(
                    "mt-3 text-5xl font-black tabular-nums tracking-tighter",
                    compactMode && "text-3xl mt-0",
                    balance < 0 ? NEGATIVE_TEXT : "text-foreground",
                  )}
                >
                  {formatCurrency(balance)}
                </p>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-6 text-center">
                <HelpCircle className="size-8 text-muted-foreground mb-2 opacity-20" />
                <p className="text-[11px] font-bold text-muted-foreground max-w-[150px]">
                  Saldo oculto pelo responsável
                </p>
              </div>
            )}

            {visibility.income ? (
              <div className={cn(
                "mt-6 grid grid-cols-2 gap-3 relative z-10",
                compactMode && "mt-0 grid-cols-1 gap-2"
              )}>
                <div className={cn("rounded-2xl p-3 border border-emerald-500/10 transition-transform active:scale-95", POSITIVE_SURFACE)}>
                  <p className={cn("text-[9px] font-black uppercase tracking-wide", POSITIVE_TEXT)}>Ganhos</p>
                  <p className="mt-0.5 text-base font-black tabular-nums text-foreground">{formatCurrency(income)}</p>
                </div>
                <div className={cn("rounded-2xl p-3 border border-red-500/10 transition-transform active:scale-95", NEGATIVE_SURFACE)}>
                  <p className={cn("text-[9px] font-black uppercase tracking-wide", NEGATIVE_TEXT)}>Gastos</p>
                  <p className="mt-0.5 text-base font-black tabular-nums text-foreground">{formatCurrency(expense)}</p>
                </div>
              </div>
            ) : null}
          </section>

          <section
            role="button"
            tabIndex={0}
            aria-label="Criar novo registro"
            className={cn(
              "group flex items-center gap-3 rounded-2xl border border-border bg-card px-4 py-3 shadow-sm transition-all hover:shadow-md active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
              accent.borderHover,
            )}
            onClick={() => setEntryOpen(true)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                setEntryOpen(true);
              }
            }}
          >
            <div className={cn(
              "flex size-9 shrink-0 items-center justify-center rounded-xl shadow-inner transition-transform group-hover:scale-105",
              accent.iconBg,
            )}>
              <Plus className="size-4" />
            </div>
            <div className="min-w-0 flex-1">
              <h2 className="truncate text-[12px] font-black uppercase tracking-tight">Novo Registro</h2>
              <p className="truncate text-[10px] font-medium text-muted-foreground">
                {online ? "Anotar gasto ou ganho" : "Offline agora"}
              </p>
            </div>
            <ChevronRight className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
          </section>



        </div>

        {visibility.goals && (
          <section className="space-y-4">
            <div className="flex items-center justify-between px-1">
              <h2 className="flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.2em] text-muted-foreground">
                <Target className="size-3.5" /> Metas
              </h2>
            </div>
            {(goals.data ?? []).length === 0 && (
              <div className="rounded-[2rem] border border-dashed border-border p-8 text-center bg-muted/20">
                 <p className="text-[11px] font-bold text-muted-foreground opacity-60">Nenhuma meta ativa</p>
              </div>
            )}
            <div className="grid gap-3">
              {(goals.data ?? []).map((goal) => {
                const progress = goal.target_amount
                  ? Math.min(100, Math.round((Number(goal.current_amount) / Number(goal.target_amount)) * 100))
                  : 0;
                return (
                  <div key={goal.id} className="rounded-[2rem] border border-border bg-card p-4 shadow-sm group hover:border-primary/30 transition-all">
                    <div className="flex items-center justify-between mb-3 px-1">
                      <div>
                        <p className="text-xs font-black tracking-tight">{goal.title}</p>
                        <p className="text-[9px] font-bold text-muted-foreground mt-0.5">
                          {formatCurrency(Number(goal.current_amount))} de {formatCurrency(Number(goal.target_amount))}
                        </p>
                      </div>
                      <div className={cn("size-10 rounded-full flex items-center justify-center font-black text-xs border shadow-inner", accent.iconBg)}>
                        {progress}%
                      </div>
                    </div>
                    <div className="h-2.5 overflow-hidden rounded-full bg-muted/50 p-0.5 border border-border/50 shadow-inner">
                      <div className="h-full rounded-full bg-primary shadow-[0_0_10px_rgba(var(--primary),0.3)] transition-all duration-1000" style={{ width: `${progress}%` }} />
                    </div>
                    {goal.reward && (
                      <div className="mt-3 flex items-center gap-1.5 px-1">
                        <Gift className="size-3 text-amber-500" />
                        <p className="text-[9px] font-bold text-amber-600 dark:text-amber-400">Recompensa: {goal.reward}</p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </section>
        )}


        {cardControl.data?.cards && cardControl.data.cards.length > 0 && (
          <section className="space-y-3">
            <h2 className="flex items-center gap-2 text-sm font-bold">
              <CreditCard className="size-4 text-primary" /> Meu cartão
            </h2>
            {cardControl.data.cards.map((card: any) => (
              <div key={card.id} className="rounded-2xl border border-border bg-card p-5 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="rounded-xl bg-primary/10 p-2 text-primary">
                      <CreditCard className="size-5" />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Disponível para uso</p>
                      <p className="text-xl font-semibold text-foreground">
                        {formatCurrency(card.limit_amount - card.current_balance)}
                      </p>
                    </div>
                  </div>
                  <span className="text-[10px] font-medium text-muted-foreground border rounded-full px-2 py-0.5">
                    Final {card.card_number_suffix}
                  </span>
                </div>
                
                <div className="space-y-2">
                  <Progress 
                    value={(card.current_balance / card.limit_amount) * 100} 
                    className="h-2"
                  />
                  <div className="flex justify-between text-[11px] font-bold">
                    <span className="text-muted-foreground">Gasto: {formatCurrency(card.current_balance)}</span>
                    <span className="text-primary">Total: {formatCurrency(card.limit_amount)}</span>
                  </div>
                </div>

                {cardControl.data.recentTransactions.filter((t: any) => t.card_id === card.id).length > 0 && (
                  <div className="mt-5 space-y-2 pt-4 border-t border-border">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Compras recentes</p>
                    {cardControl.data.recentTransactions
                      .filter((t: any) => t.card_id === card.id)
                      .slice(0, 2)
                      .map((t: any) => (
                        <div key={t.id} className="flex items-center justify-between py-1.5">
                          <span className="text-xs font-semibold truncate max-w-[150px]">{t.description}</span>
                          <span className="text-xs font-bold">{formatCurrency(t.amount)}</span>
                        </div>
                      ))}
                  </div>
                )}
              </div>
            ))}
          </section>
        )}

        {visibility.history ? (
          <section className="space-y-4">
            <div className="flex items-center justify-between px-1">
              <h2 className="text-[11px] font-black uppercase tracking-[0.2em] text-muted-foreground">Histórico</h2>
              {visibility.siblings ? <KidSiblingAvatars dependentId={dependent.id} /> : null}
            </div>
            {rows.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-card/50 px-6 py-12 text-center shadow-sm">
                <div className="flex size-16 items-center justify-center rounded-full bg-muted/30 text-muted-foreground/40">
                  <FileText className="size-8" />
                </div>
                <h3 className="mt-4 text-sm font-bold text-foreground">Sem registros este mês</h3>
                <p className="mt-1.5 max-w-[280px] text-xs leading-relaxed text-muted-foreground">
                  Sua conta está em dia! Comece agora registrando sua primeira entrada ou gasto.
                </p>
                <Button
                  onClick={() => setEntryOpen(true)}
                  size="sm"
                  disabled={!online}
                  className="mt-6 h-10 w-full max-w-[180px] gap-2 rounded-xl text-xs font-bold shadow-soft transition-all hover:scale-[1.02] active:scale-[0.98]"
                >
                  <Plus className="size-4" />
                  Novo Registro
                </Button>
              </div>
            ) : (
              <div className="space-y-2">
                {rows.map((row) => (
                  <div key={row.id} className="group flex items-center justify-between gap-3 p-4 rounded-[1.5rem] border border-border bg-card shadow-sm transition-all hover:border-primary/20">
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-xs font-black tracking-tight">
                        {row.tags?.some(t => t.startsWith("from_parent") || t.startsWith("parent_desc:")) 
                          ? "💰 Recebido do responsável" 
                          : row.transaction_type === "income" ? "📈 Ganho" : "🛍️ " + row.description}
                      </p>
                      <p className="mt-0.5 text-[9px] font-bold uppercase text-muted-foreground opacity-60">
                        {new Date(`${row.transaction_date}T12:00:00`).toLocaleDateString("pt-BR", {
                          day: "2-digit",
                          month: "short",
                        })}
                      </p>
                    </div>

                    <div className="text-right">
                      <span className={cn(
                        "text-sm font-black tabular-nums",
                        row.transaction_type === "income" ? POSITIVE_TEXT : NEGATIVE_TEXT,
                      )}>
                        {row.transaction_type === "income" ? "+" : "−"} {formatCurrency(Number(row.amount))}
                      </span>
                      <div className="mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          type="button"
                          disabled={!online}
                          onClick={() => {
                            if (!online) return;
                            toast.info("Avisamos seu responsável!", {
                              description: "Ele vai revisar este lançamento em breve.",
                            });
                          }}
                          className={cn("text-[8px] font-black uppercase tracking-widest underline decoration-2 underline-offset-2", accent.text)}
                        >
                          Corrigir
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        ) : null}
      </div>

      <KidSummary
        balance={balance}
        income={income}
        expense={expense}
        rows={rows}
        accent={accent}
        viewYearly={viewYearly}
        selectedMonth={selectedMonth}
        selectedYear={selectedYear}
      />

      <KidEntryDialog
        open={entryOpen}
        onOpenChange={setEntryOpen}
        dependentId={dependent.id}
        ownerId={dependent.user_id}
        syncTx={syncTx}
        createTx={createTx}
      />
      <footer className="mt-auto border-t border-border py-6 text-center">
        <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
          &lt;Dev. Franc D&apos;nis&gt; · Acre
        </p>
      </footer>


      <ConfirmDialog />
      <SvgLogoutDialog 
        open={logoutDialogOpen} 
        onClose={() => setLogoutDialogOpen(false)} 
        onConfirm={() => signOut(true)} 
      />
    </main>
    </KidsStatusGuard>
  );
}


function KidSummary({
  balance,
  income,
  expense,
  rows,
  accent,
  viewYearly,
  selectedMonth,
  selectedYear,
}: {
  balance: number;
  income: number;
  expense: number;
  rows: KidTransaction[];
  accent: KidAccent;
  viewYearly: boolean;
  selectedMonth: number;
  selectedYear: number;
}) {
  const [entryDetails, setEntryDetails] = useState<any | null>(null);
  const [onboarding, setOnboarding] = useState(() => {
    if (typeof window === "undefined") return false;
    return localStorage.getItem("kid_onboarding_done") !== "true";
  });

  const weeklyStats = useMemo(() => {
    const today = new Date();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay());
    startOfWeek.setHours(0, 0, 0, 0);

    const weekRows = rows.filter(r => new Date(r.transaction_date).getTime() >= startOfWeek.getTime());
    const weekIncome = weekRows.filter(r => r.transaction_type === "income").reduce((a, b) => a + Number(b.amount), 0);
    const weekExpense = weekRows.filter(r => r.transaction_type === "expense").reduce((a, b) => a + Number(b.amount), 0);

    return { income: weekIncome, expense: weekExpense, balance: weekIncome - weekExpense };
  }, [rows]);

  return (
    <>
      <Dialog open={onboarding} onOpenChange={(v) => {
        if (!v) {
          localStorage.setItem("kid_onboarding_done", "true");
          setOnboarding(false);
        }
      }}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="size-5 text-emerald-500" /> Bem-vindo ao seu Espaço!
            </DialogTitle>
            <DialogDescription className="text-xs">
              Este é o seu lugar seguro para aprender sobre dinheiro.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="flex gap-3">
              <div className="bg-emerald-500/10 p-2 rounded-lg shrink-0">
                <TrendingUp className="size-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-xs font-bold">Ganhos</p>
                <p className="text-[11px] text-muted-foreground">Aqui você vê o dinheiro que recebeu dos seus pais.</p>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="bg-rose-500/10 p-2 rounded-lg shrink-0">
                <TrendingDown className="size-5 text-rose-600" />
              </div>
              <div>
                <p className="text-xs font-bold">Gastos</p>
                <p className="text-[11px] text-muted-foreground">Anote aqui sempre que usar seu dinheiro para comprar algo.</p>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="bg-sky-500/10 p-2 rounded-lg shrink-0">
                <Target className="size-5 text-sky-600" />
              </div>
              <div>
                <p className="text-xs font-bold">Metas</p>
                <p className="text-[11px] text-muted-foreground">Crie objetivos para juntar dinheiro e ganhar recompensas!</p>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button className="w-full font-bold" onClick={() => {
              localStorage.setItem("kid_onboarding_done", "true");
              setOnboarding(false);
            }}>
              Começar agora!
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <section className={cn(
        "mx-auto mt-8 w-full max-w-2xl space-y-4 rounded-2xl border bg-card p-6 shadow-sm transition-all duration-300",
        accent.border,
      )}>
      <div className="flex items-center justify-between mb-2">
        <h2 className="flex items-center gap-2 text-xl font-black tracking-tighter uppercase text-foreground">
          <CalendarIcon className="size-4" />
          {viewYearly ? selectedYear : `${MONTH_NAMES[selectedMonth]} ${selectedYear}`}
        </h2>
        <Target className={cn("size-5", accent.text)} aria-hidden="true" /> 
      </div>
      <h2 className="sr-only">
        Resumo {viewYearly ? `de ${selectedYear}` : `de ${new Date(0, selectedMonth).toLocaleDateString("pt-BR", { month: "long" })}`}
      </h2>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div className={cn("rounded-xl border p-4 text-center", accent.surface, accent.border)}>
          <p className={cn("text-[10px] font-semibold uppercase tracking-[0.16em]", accent.text)}>Saldo final</p>
          <p className="mt-1 text-2xl font-semibold tabular-nums text-foreground">{formatCurrency(balance)}</p>
        </div>
        <div className={cn("rounded-xl border border-emerald-600/20 p-4 text-center dark:border-emerald-400/20", POSITIVE_SURFACE)}>
          <p className={cn("text-[10px] font-semibold uppercase tracking-[0.16em]", POSITIVE_TEXT)}>Total recebido</p>
          <p className="mt-1 text-xl font-semibold tabular-nums text-foreground">{formatCurrency(income)}</p>
        </div>
        <div className={cn(
          "rounded-xl border p-4 text-center transition-all duration-500", 
          balance <= 0 ? "border-rose-600/30 bg-rose-500/10 shadow-sm shadow-rose-500/10" : "border-rose-600/20", 
          NEGATIVE_SURFACE
        )}>
          <p className={cn("text-[10px] font-semibold uppercase tracking-[0.16em]", NEGATIVE_TEXT)}>Total gasto</p>
          <p className="mt-1 text-xl font-semibold tabular-nums text-foreground">{formatCurrency(expense)}</p>
        </div>
      </div>

      {/* Mensagem de saldo baixo removida para ganhar espaço útil conforme solicitado */}

      <div className="rounded-xl border border-border bg-muted/20 p-4">
        <div className="flex items-center justify-between mb-2">
          <p className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-foreground">
            <CalendarIcon className="size-3" aria-hidden="true" /> Evolução da semana
          </p>
          <Badge variant="outline" className="text-[9px] font-bold border-emerald-500/20 text-emerald-600 bg-emerald-500/5">Ativo</Badge>
        </div>
        <div className="grid grid-cols-3 gap-2">
          <div className="space-y-0.5">
            <p className="text-[9px] font-medium text-muted-foreground uppercase">Ganhou</p>
            <p className="text-xs font-bold text-emerald-600">+{formatCurrency(weeklyStats.income)}</p>
          </div>
          <div className="space-y-0.5 text-center">
            <p className="text-[9px] font-medium text-muted-foreground uppercase">Gastou</p>
            <p className="text-xs font-bold text-rose-600">-{formatCurrency(weeklyStats.expense)}</p>
          </div>
          <div className="space-y-0.5 text-right">
            <p className="text-[9px] font-medium text-muted-foreground uppercase">Saldo Sem.</p>
            <p className={cn("text-xs font-bold", weeklyStats.balance < 0 ? "text-rose-600" : "text-emerald-600")}>
              {formatCurrency(weeklyStats.balance)}
            </p>
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-border bg-muted/40 p-4">
        <p className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wide text-foreground">
          <HelpCircle className="size-3.5" aria-hidden="true" /> Entenda seu dinheiro
        </p>
        <p className="mt-1.5 text-[12px] font-medium leading-relaxed text-muted-foreground">
          O seu saldo é o que sobra: <strong className="text-emerald-600 dark:text-emerald-400">Ganhos</strong> (o que você recebe) menos <strong className="text-rose-600 dark:text-rose-400">Gastos</strong> (o que você usa). 
          Cada vez que você anota algo, o valor atualiza na hora!
        </p>
      </div>

      {rows.length > 0 && (
        <div className="space-y-2">
          <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">Últimos registros</p>
          <div className="space-y-2">
            {rows.slice(0, 3).map((row) => {
              const kind = kidEntryKind(row as any);
              return (
              <button
                type="button"
                key={row.id}
                onClick={() => setEntryDetails({
                  ...row,
                  description: kind === "received" ? kidEntryLabel(row as any) : row.description,
                })}
                className="flex w-full items-center justify-between rounded-xl border border-border bg-background p-3 text-left transition-colors hover:bg-muted/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                aria-label={`Ver detalhes: ${kidEntryLabel(row as any)}`}
              >
                <div className="flex items-center gap-3">
                  <div className={cn(
                    "flex size-8 items-center justify-center rounded-lg",
                    row.transaction_type === "income"
                      ? cn(POSITIVE_SURFACE, POSITIVE_TEXT)
                      : cn(NEGATIVE_SURFACE, NEGATIVE_TEXT),
                  )}>
                    {row.transaction_type === "income"
                      ? <TrendingUp className="size-4" aria-hidden="true" />
                      : <TrendingDown className="size-4" aria-hidden="true" />}
                  </div>
                  <div>
                    <p className={cn("text-xs font-semibold", kidEntryTone(kind))}>
                      {kidEntryLabel(row as any)}
                      {kind !== "received" && row.description ? (
                        <span className="font-medium text-muted-foreground">{`: ${row.description}`}</span>
                      ) : null}
                    </p>
                    <p className="text-[10px] font-medium text-muted-foreground">
                      {new Date(`${row.transaction_date}T12:00:00`).toLocaleDateString("pt-BR")}
                    </p>
                  </div>
                </div>
                <p className={cn(
                  "text-xs font-semibold tabular-nums",
                  row.transaction_type === "income" ? POSITIVE_TEXT : NEGATIVE_TEXT,
                )}>
                  {row.transaction_type === "income" ? "Ganhou +" : "Gastou -"} {formatCurrency(row.amount)}
                </p>
              </button>
              );
            })}
          </div>
        </div>
      )}
    </section>
    <KidEntryDetailsDialog
      entry={entryDetails}
      open={entryDetails !== null}
      onOpenChange={(value: boolean) => !value && setEntryDetails(null)}
    />
    </>
  );
}


function KidEntryDialog({

  open,
  onOpenChange,
  dependentId,
  ownerId,
  syncTx,
  createTx,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  dependentId: string;
  ownerId: string;
  syncTx: any;
  createTx: any;
}) {
  const queryClient = useQueryClient();
  const [reason, setReason] = useState<string>(DEPENDENT_REASONS[0].value);
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [confirming, setConfirming] = useState(false);


  const selected = DEPENDENT_REASONS.find((item) => item.value === reason) ?? DEPENDENT_REASONS[0];

  const save = useMutation({
    mutationFn: async () => {
      const value = parseAmount(amount);
      if (!value || value <= 0) throw new Error("Informe um valor maior que zero.");
      
      const isoDate = new Date().toISOString().split('T')[0];

      // 1. Criar transação para a criança
      await createTx({
        data: {
          amount: value,
          description: description.trim() || selected.label,
          transactionDate: isoDate,
          transactionType: selected.type,
        }
      });
      
      // A sincronização com o painel do responsável é automática via tags e notificações
      // disparadas diretamente na criação do lançamento (createTx).
    },
    onSettled: () => {
      setConfirming(false);
    },

    onSuccess: () => {

      toast.success("Lançamento registrado com sucesso.");
      setAmount("");
      setDescription("");
      onOpenChange(false);
      void queryClient.invalidateQueries({ queryKey: ["kid_transactions"] });
    },
    onError: (error) => {
      toast.error("Não foi possível registrar.", {
        description: error instanceof Error ? error.message : undefined,
      });
    },
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto rounded-3xl sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="tracking-tight">Registrar movimentação</DialogTitle>
          <DialogDescription>Selecione o motivo e informe o valor.</DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-2">
          {DEPENDENT_REASONS.map((item) => (
            <button
              key={item.value}
              type="button"
              aria-pressed={reason === item.value}
              onClick={() => setReason(item.value)}
              className={cn(
                "rounded-xl border p-3 text-left text-[12px] font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                reason === item.value
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border bg-card text-foreground hover:bg-muted/50",
              )}
            >
              {item.label}
              <span className="mt-0.5 block text-[10px] font-medium text-muted-foreground">
                {item.type === "income" ? "Entrada de dinheiro" : "Saída de dinheiro"}
              </span>
            </button>
          ))}
        </div>

        <div className="mt-2 space-y-3">
          <div>
            <Label htmlFor="kid-amount">Valor</Label>
            <MoneyInput
              id="kid-amount"
              value={amount}
              onValueChange={setAmount}
              placeholder="0,00"
              className="mt-1 h-12 text-lg"
            />
          </div>
          <div>
            <Label htmlFor="kid-desc">Descrição (opcional)</Label>
            <Input
              id="kid-desc"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder={selected.label}
              maxLength={80}
              className="mt-1"
            />
          </div>
        </div>

        <p className="rounded-xl border border-border bg-muted/40 px-3 py-2.5 text-[11px] font-medium leading-relaxed text-muted-foreground">
          A data e a hora são registradas automaticamente. Depois de salvar, o lançamento
          <strong className="text-foreground"> não pode ser editado nem excluído</strong> — apenas o responsável pode corrigi-lo.
        </p>

        <div className="flex items-start gap-3 rounded-xl border border-amber-600/25 bg-amber-500/8 p-3 dark:border-amber-400/25 dark:bg-amber-400/10">
          <div className="rounded-lg bg-amber-600/12 p-2 text-amber-700 dark:bg-amber-400/15 dark:text-amber-300">
            <AlertTriangle className="size-4" aria-hidden="true" />
          </div>
          <div>
            <p className="text-[11px] font-semibold text-amber-800 dark:text-amber-200">Atenção</p>
            <p className="mt-0.5 text-[11px] leading-relaxed text-amber-800/80 dark:text-amber-200/80">
              Confira bem os dados antes de salvar. Caso erre, apenas o responsável poderá corrigir depois no painel dele.
            </p>
          </div>
        </div>





        {confirming ? (
          <div className="rounded-2xl border border-primary/30 bg-primary/5 p-4">
            <div className="flex items-start gap-3">
              <div className="rounded-xl bg-primary/10 p-2 text-primary">
                <Target className="size-5" aria-hidden="true" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold tracking-tight text-center sm:text-left">Confirmar registro</p>
                <p className="mt-0.5 text-[11px] leading-relaxed text-muted-foreground text-center sm:text-left">
                  Confira o valor antes de continuar. Depois de salvar, este lançamento não poderá ser editado.
                </p>
              </div>
            </div>
            {/* Botão de confirmação fixo no mobile e centralizado */}
            <div className="mt-4 flex flex-col sm:flex-row gap-2">
              <Button
                variant="outline"
                className="order-2 sm:order-1 flex-1 rounded-xl font-semibold h-12 sm:h-10"
                onClick={() => setConfirming(false)}
                disabled={save.isPending}
              >
                Revisar
              </Button>
              <Button
                className="order-1 sm:order-2 flex-1 rounded-xl font-semibold h-12 sm:h-10 bg-primary shadow-lg shadow-primary/20"
                onClick={() => save.mutate()}
                disabled={save.isPending}
              >
                {save.isPending ? <Loader2 className="mr-2 size-4 animate-spin" /> : <Sparkles className="mr-2 size-4" />}
                Confirmar agora
              </Button>
            </div>
          </div>
        ) : (
          <DialogFooter>
            <Button variant="ghost" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button
              onClick={() => {
                const value = parseAmount(amount);
                if (!value || value <= 0) {
                  toast.error("Informe um valor maior que zero.");
                  return;
                }
                setConfirming(true);
              }}
            >
              Salvar
            </Button>
          </DialogFooter>
        )}

      </DialogContent>
    </Dialog>
  );
}

function SvgLogoutDialog({ open, onClose, onConfirm }: { open: boolean; onClose: () => void; onConfirm: () => void }) {
  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-xs overflow-hidden rounded-3xl border-none p-0">
        <div className="bg-gradient-to-b from-rose-500 to-rose-600 p-8 text-center text-white">
          <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-3xl bg-white/20 backdrop-blur-md">
            <LogOut className="h-10 w-10" />
          </div>
          <h2 className="text-2xl font-black tracking-tight">Até logo!</h2>
          <p className="mt-2 text-sm font-medium opacity-90">
            Tem certeza que deseja sair do seu espaço agora?
          </p>
        </div>
        <div className="grid grid-cols-2 gap-px bg-border/50">
          <button 
            onClick={onClose}
            className="bg-card py-4 text-sm font-bold text-muted-foreground transition-colors hover:bg-muted/50 active:bg-muted"
          >
            Voltar
          </button>
          <button 
            onClick={onConfirm}
            className="bg-card py-4 text-sm font-black text-rose-500 transition-colors hover:bg-rose-50 active:bg-rose-100"
          >
            Sair agora
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function KidSiblingAvatars({ dependentId }: { dependentId: string }) {
  const { data: dependents } = useDependents();
  const siblings = (dependents ?? []).filter((d: Dependent) => d.id !== dependentId && d.active !== false);

  if (siblings.length === 0) return null;

  return (
    <div className="flex -space-x-2 overflow-hidden">
      {siblings.map((sibling: Dependent) => (
        <div
          key={sibling.id}
          title={sibling.name}
          className="inline-flex size-7 items-center justify-center rounded-full border-2 border-card text-[10px] font-bold text-white shadow-sm"
          style={{ backgroundColor: sibling.color ?? "#94a3b8" }}
        >
          {sibling.name.charAt(0).toUpperCase()}
        </div>
      ))}
    </div>
  );
}
