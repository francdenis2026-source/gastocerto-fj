import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CreditCard, Download, Loader2, LogOut, Moon, PiggyBank, Sparkles, Sun, Target, TrendingDown, TrendingUp, HelpCircle, AlertTriangle, LayoutGrid, WifiOff, RefreshCw, Calendar as CalendarIcon, FileText, ChevronRight } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
import { formatCurrency } from "@/lib/format";
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
const NEGATIVE_TEXT = "text-rose-700 dark:text-rose-400 font-bold";
const NEGATIVE_SURFACE = "bg-rose-600/10 dark:bg-rose-400/15";

function KidSpacePage() {
  const navigate = useNavigate();
  const { signOut, user } = useAuth();
  const { dependent, loading } = useKidSession();
  const { compactMode: initialCompactMode } = Route.useLoaderData();
  const [compactMode, setCompactMode] = useState(initialCompactMode);
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
        <h1 className="text-lg font-bold">Este espaço é só para crianças</h1>
        <p className="max-w-sm text-sm text-muted-foreground">
          Sua conta não está vinculada a um espaço infantil. Entre com o painel do responsável.
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
      {/* Selector for period view and Goals Panel */}
      <div className="mx-auto mt-4 flex w-full max-w-2xl flex-col gap-4 px-4">
        {/* Goals / Budget Alert - Removed as requested to gain space */}

        <div className="flex items-center justify-between">
          <div className="relative flex-1 max-w-xs">
             <Input 
               placeholder="Buscar registros..." 
               className="h-8 text-xs pl-8 bg-muted/50 border-none shadow-none"
             />
             <HelpCircle className="absolute left-2.5 top-2.5 size-3 text-muted-foreground" />
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            className="h-8 text-[10px] font-bold gap-1.5"
            onClick={async () => {
              if (rows.length === 0) return;
              await exportKidsSummaryPdf(
                rows.map(r => ({
                  date: r.transaction_date,
                  description: r.description,
                  type: r.transaction_type as any,
                  amount: r.amount
                })),
                { income, expense, balance, count: rows.length },
                { 
                  kidName: dependent.name, 
                  periodLabel: viewYearly ? `Ano ${selectedYear}` : `${MONTH_NAMES[selectedMonth]} ${selectedYear}`,
                  typeLabel: "Todos os registros"
                }
              );
            }}
          >
            <FileText className="size-3" /> Exportar PDF
          </Button>
        </div>
        
        <div className="flex items-center justify-end gap-2">
          {!viewYearly && (
            <Select 
              value={selectedMonth.toString()} 
              onValueChange={(v) => setSelectedMonth(parseInt(v))}
            >
              <SelectTrigger className="h-8 w-32 text-[10px] font-bold bg-muted/50 border-none shadow-none">
                <SelectValue placeholder="Mês" />
              </SelectTrigger>
              <SelectContent>
                {Array.from({ length: 12 }).map((_, i) => (
                  <SelectItem key={i} value={i.toString()} className="text-xs">
                    {new Date(0, i).toLocaleDateString("pt-BR", { month: "long" })}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
          <Select 
            value={selectedYear.toString()} 
            onValueChange={(v) => setSelectedYear(parseInt(v))}
          >
            <SelectTrigger className="h-8 w-24 text-[10px] font-bold bg-muted/50 border-none shadow-none">
              <SelectValue placeholder="Ano" />
            </SelectTrigger>
            <SelectContent>
              {[2024, 2025, 2026].map((y) => (
                <SelectItem key={y} value={y.toString()} className="text-xs">{y}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <div className="inline-flex rounded-lg bg-muted p-1 shadow-sm">
            <Button 
              variant={!viewYearly ? "secondary" : "ghost"} 
              size="sm" 
              className="h-7 px-3 text-[10px] font-bold"
              onClick={() => setViewYearly(false)}
            >
              Mês
            </Button>
            <Button 
              variant={viewYearly ? "secondary" : "ghost"} 
              size="sm" 
              className="h-7 px-3 text-[10px] font-bold"
              onClick={() => setViewYearly(true)}
            >
              Anual
            </Button>
          </div>
        </div>
      </div>


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
        "flex items-center justify-between gap-3 px-4 py-5 sm:px-6 transition-all",
        compactMode && "py-2 px-3 border-b border-border bg-card/70 backdrop-blur-md sticky top-0 z-40"
      )}>

        <div className="flex min-w-0 items-center gap-3">
          <Avatar className={cn("size-10 sm:size-12 border border-border shadow-sm ring-2", accent.ring)}>
            {avatarUrl ? (
              <AvatarImage src={avatarUrl} alt={`Foto de ${dependent.name}`} />
            ) : null}
            <AvatarFallback
              className="text-lg font-semibold text-white"
              style={{ backgroundColor: dependent.color ?? "#0f766e" }}
            >
              {firstName.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
              Espaço financeiro
            </p>
            <h1 className="truncate text-lg sm:text-xl font-semibold leading-tight tracking-tight">
              Olá, <span className={accent.text}>{firstName}</span>
            </h1>
          </div>
        </div>
        <div className="flex items-center gap-1 sm:gap-2">
          {!online ? (
            <span className="hidden items-center gap-1 rounded-full border border-amber-500/40 bg-amber-500/10 px-2 py-1 text-[10px] font-semibold text-amber-700 dark:text-amber-300 sm:inline-flex">
              <WifiOff className="size-3" aria-hidden="true" /> Modo offline
            </span>
          ) : null}
          {canInstall ? (
            <Button
              variant="outline"
              size="sm"
              className="h-8 sm:h-9 px-2 text-[11px] sm:text-xs font-medium sm:px-3"
              onClick={() => void install()}
              title="Instalar o Meu Espaço como aplicativo"
            >
              <Download className="mr-1.5 size-3.5 sm:size-4" aria-hidden="true" />
              <span className="hidden sm:inline">Instalar app</span>
            </Button>
          ) : null}
          <Button
            variant="ghost"
            size="icon"
            className="size-9 text-muted-foreground hover:text-foreground"
            onClick={toggleKidTheme}
            title={kidTheme === "dark" ? "Ativar modo claro" : "Ativar modo escuro"}
            aria-label={kidTheme === "dark" ? "Ativar modo claro" : "Ativar modo escuro"}
          >
            {kidTheme === "dark" ? (
              <Sun className="size-[18px]" aria-hidden="true" />
            ) : (
              <Moon className="size-[18px]" aria-hidden="true" />
            )}
          </Button>
          <NotificationCenter isKid />

          <Button
            variant="ghost"
            size="sm"
            className="h-9 px-2 text-xs font-medium text-muted-foreground hover:text-foreground sm:px-3"
            onClick={async () => {
              await signOut();
              navigate({ to: "/auth", replace: true });
            }}
          >
            <LogOut className="mr-1.5 size-4" aria-hidden="true" /> Sair
          </Button>
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
            "relative flex min-h-[160px] flex-col justify-center overflow-hidden rounded-2xl border bg-card p-5 text-center shadow-sm transition-colors",
            accent.border,
            compactMode && "min-h-[120px] p-4 sm:col-span-2 flex-row items-center justify-between text-left",
          )}>

            {/* Emblema SVG decorativo — opacidade calibrada para os dois temas */}
            <div className={cn(
              "pointer-events-none absolute -right-5 -top-5 size-24 opacity-[0.07] dark:opacity-[0.12]",
              accent.text,
            )} aria-hidden="true">
              <PiggyBank className="size-full" />
            </div>

            {visibility.balance ? (
              <div className={cn(compactMode && "flex flex-col")}>
                <p className={cn(
                  "flex items-center justify-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.16em]",
                  accent.text,
                  compactMode && "justify-start"
                )}>
                  <Sparkles className="size-3.5" aria-hidden="true" /> Saldo disponível
                </p>
                <p
                  className={cn(
                    "mt-1.5 text-4xl font-semibold tabular-nums tracking-tight",
                    compactMode && "text-2xl mt-0",
                    balance < 0 ? NEGATIVE_TEXT : "text-foreground",
                  )}
                >
                  {formatCurrency(balance)}
                </p>
                <p className="mt-1 text-[11px] text-muted-foreground">
                  Atualizado a cada novo registro
                </p>
              </div>
            ) : (
              <p className="text-[12px] font-medium text-muted-foreground">
                Seu saldo está oculto por escolha do responsável.
              </p>
            )}

            {visibility.income ? (
              <div className={cn(
                "mt-4 grid grid-cols-2 gap-2 text-left",
                compactMode && "mt-0 grid-cols-1 gap-1"
              )}>
                <div className={cn("rounded-xl p-2.5", POSITIVE_SURFACE)}>
                  <p className={cn("flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wide", POSITIVE_TEXT)}>
                    <TrendingUp className="size-3" aria-hidden="true" /> Entradas
                  </p>
                  <p className="mt-0.5 text-sm font-semibold tabular-nums text-foreground">{formatCurrency(income)}</p>
                </div>
                <div className={cn("rounded-xl p-2.5", NEGATIVE_SURFACE)}>
                  <p className={cn("flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wide", NEGATIVE_TEXT)}>
                    <TrendingDown className="size-3" aria-hidden="true" /> Saídas
                  </p>
                  <p className="mt-0.5 text-sm font-semibold tabular-nums text-foreground">{formatCurrency(expense)}</p>
                </div>
              </div>
            ) : null}
          </section>

          <section className={cn(
            "group flex flex-col items-center justify-center gap-4 rounded-2xl border border-border bg-card p-5 shadow-sm transition-colors",
            accent.borderHover,
            compactMode && "rounded-2xl p-4 flex-row justify-between",
          )}>
            <div className={cn(
              "flex size-14 items-center justify-center rounded-full transition-transform group-hover:scale-105",
              accent.iconBg,
              compactMode && "size-10",
            )}>
              <TrendingUp className={cn("size-7", compactMode && "size-5")} aria-hidden="true" />
            </div>
            <div className={cn("text-center", compactMode && "text-left flex-1 px-3")}>
              <h2 className="text-sm font-semibold tracking-tight">Registrar movimentação</h2>
              <p className="mt-0.5 text-[11px] leading-relaxed text-muted-foreground">
                {online
                  ? "Anote o que você recebeu ou gastou."
                  : "Sem internet agora: o registro precisa de conexão para ser salvo com segurança."}
              </p>
            </div>
            <Button
              className={cn(
                "h-10 w-full rounded-xl text-sm font-semibold shadow-sm",
                compactMode && "w-auto px-4 h-9",
                accent.button,
              )}
              onClick={() => setEntryOpen(true)}
              disabled={!online}
              title={online ? undefined : "Disponível quando a internet voltar"}
            >
              {compactMode ? "Registrar" : online ? "Novo registro" : "Sem internet"}
            </Button>
          </section>


        </div>

        {visibility.goals && (
          <section className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="flex items-center gap-2 text-sm font-semibold tracking-tight">
                <Target className={cn("size-4", accent.text)} aria-hidden="true" /> Metas e Educação Financeira
              </h2>
            </div>
            {(goals.data ?? []).length === 0 && (
              <div className="rounded-2xl border border-dashed border-border p-4 text-center">
                 <p className="text-[10px] text-muted-foreground">Você ainda não tem metas. Peça ao seu responsável para criar uma!</p>
              </div>
            )}
            {(goals.data ?? []).map((goal) => {
              const progress = goal.target_amount
                ? Math.min(100, Math.round((Number(goal.current_amount) / Number(goal.target_amount)) * 100))
                : 0;
              return (
                <div key={goal.id} className="rounded-2xl border border-border bg-card p-4 shadow-sm">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-semibold tracking-tight">{goal.title}</p>
                    <span className={cn("text-[11px] font-semibold tabular-nums", accent.text)}>{progress}%</span>
                  </div>
                  <div
                    className="mt-2.5 h-2 overflow-hidden rounded-full bg-muted"
                    role="progressbar"
                    aria-valuenow={progress}
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-label={`Progresso da meta ${goal.title}`}
                  >
                    <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${progress}%` }} />
                  </div>
                  <p className="mt-2 text-[11px] leading-relaxed text-muted-foreground">
                    {formatCurrency(Number(goal.current_amount))} de {formatCurrency(Number(goal.target_amount))}
                    {goal.reward ? ` · Recompensa: ${goal.reward}` : ""}
                  </p>
                </div>
              );
            })}
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
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold tracking-tight">Histórico de movimentações</h2>
            {visibility.siblings ? <KidSiblingAvatars dependentId={dependent.id} /> : null}
          </div>
          {rows.length === 0 ? (
            <p className="rounded-2xl border border-dashed border-border p-6 text-center text-sm leading-relaxed text-muted-foreground">
              Nenhuma movimentação registrada até agora. Use “Novo registro” para começar.
            </p>
          ) : (
            <ul className="divide-y divide-border overflow-hidden rounded-2xl border border-border bg-card">
              {rows.map((row) => (
                <li key={row.id} className="group flex items-center justify-between gap-3 p-3.5 transition-colors hover:bg-muted/40">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="truncate text-sm font-medium">
                        {row.tags?.some(t => t.startsWith("from_parent") || t.startsWith("parent_desc:")) 
                          ? "Recebido do responsável" 
                          : row.description}
                      </p>
                      <button
                        type="button"
                        disabled={!online}
                        onClick={() => {
                          if (!online) {
                            toast.warning("Sem internet", {
                              description: "O aviso ao responsável precisa de conexão. Tente novamente quando a rede voltar.",
                            });
                            return;
                          }
                          toast.info("Solicitação registrada", {
                            description: "Seu responsável foi avisado e vai revisar este lançamento.",
                          });
                        }}
                        className={cn(
                          "shrink-0 rounded-md px-1 text-[10px] font-semibold underline-offset-2 transition-opacity hover:underline focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                          "opacity-0 group-hover:opacity-100 disabled:cursor-not-allowed disabled:opacity-40",
                          accent.text,
                        )}
                      >
                        Solicitar correção
                      </button>
                    </div>
                    <p className="mt-0.5 text-[11px] font-medium capitalize text-muted-foreground">
                      {new Date(`${row.transaction_date}T12:00:00`).toLocaleDateString("pt-BR", {
                        day: "2-digit",
                        month: "long",
                      })}
                    </p>
                  </div>

                  <span
                    className={cn(
                      "shrink-0 text-sm font-semibold tabular-nums",
                      row.transaction_type === "income" ? POSITIVE_TEXT : NEGATIVE_TEXT,
                    )}
                  >
                    {row.transaction_type === "income" ? "+" : "−"} {formatCurrency(Number(row.amount))}
                  </span>
                </li>
              ))}
            </ul>
          )}
          <div className="mt-2 flex justify-center">
            <Button
              variant="ghost"
              size="sm"
              className="gap-2 text-[11px] font-medium text-muted-foreground transition-colors hover:text-foreground"
              onClick={() => {
                toast.info("Encontrou uma informação errada?", {
                  description: "Passe o cursor sobre o lançamento e toque em “Solicitar correção”.",
                });
              }}
            >
              <HelpCircle className="size-3.5" aria-hidden="true" /> Como corrigir um lançamento
            </Button>
          </div>
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
      
      // 2. Se for um registro que deve gerar notificação ou log para o pai
      // Gastos manuais da criança são marcados como Informativos no painel do pai.
      try {
        await syncTx({
          data: {
            dependentId,
            amount: value,
            description: description.trim() || selected.label,
            transactionDate: isoDate,
            type: selected.type
          }
        });
      } catch (syncErr) {
        console.warn("[kids-sync] Falha na sincronização informativa", syncErr);
      }
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
            <p className="text-[11px] font-semibold text-amber-800 dark:text-amber-200">Digitou algo errado?</p>
            <p className="mt-0.5 text-[11px] leading-relaxed text-amber-800/80 dark:text-amber-200/80">
              Salve normalmente e solicite a correção ao seu responsável — ele ajusta o lançamento no painel dele.
            </p>
          </div>
        </div>





        {confirming ? (
          <div className="rounded-2xl border border-primary/30 bg-primary/5 p-4">
            <div className="flex items-start gap-3">
              <div className="rounded-xl bg-primary/10 p-2 text-primary">
                <Target className="size-5" aria-hidden="true" />
              </div>
              <div>
                <p className="text-sm font-semibold tracking-tight">Confirmar registro</p>
                <p className="mt-0.5 text-[11px] leading-relaxed text-muted-foreground">
                  Confira o valor antes de continuar. Depois de salvar, este lançamento não poderá ser editado.
                </p>
              </div>
            </div>
            <div className="mt-3 flex gap-2">
              <Button
                variant="outline"
                className="flex-1 rounded-xl font-semibold"
                onClick={() => setConfirming(false)}
                disabled={save.isPending}
              >
                Revisar
              </Button>
              <Button
                className="flex-1 rounded-xl font-semibold"
                onClick={() => save.mutate()}
                disabled={save.isPending}
              >
                {save.isPending ? <Loader2 className="mr-2 size-4 animate-spin" /> : null}
                Confirmar
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
