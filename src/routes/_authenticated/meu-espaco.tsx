import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CreditCard, Loader2, LogOut, PiggyBank, Sparkles, Target, TrendingDown, TrendingUp, Bell } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

import { useEffect, useState } from "react";
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
import { parseAmount } from "@/lib/finance";
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



export const Route = createFileRoute("/_authenticated/meu-espaco")({
  head: () => ({
    meta: [
      { title: "Meu Espaço — GastoCerto Kids" },
      {
        name: "description",
        content: "Painel da criança: saldo mágico, metas de poupança e registro de ganhos e gastos.",
      },
      { property: "og:title", content: "Meu Espaço — GastoCerto Kids" },
      {
        property: "og:description",
        content: "Painel da criança: saldo mágico, metas de poupança e registro de ganhos e gastos.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: KidSpacePage,
});

type KidTransaction = {
  id: string;
  description: string;
  amount: number;
  transaction_type: "income" | "expense" | "transfer";
  transaction_date: string;
};

function KidSpacePage() {
  const navigate = useNavigate();
  const { signOut } = useAuth();
  const { dependent, loading } = useKidSession();
  const avatarUrl = useAvatarUrl(dependent?.avatar_url);
  const [entryOpen, setEntryOpen] = useState(false);
  const fetchCardControl = useServerFn(getKidCardControl);

  const cardControl = useQuery({
    queryKey: ["kid_card_control", dependent?.id],
    enabled: Boolean(dependent?.id),
    queryFn: async () => {
      return await fetchCardControl({ data: { kidUserId: dependent!.id } });
    },
  });


  const transactions = useQuery({
    queryKey: ["kid_transactions", dependent?.id],
    enabled: Boolean(dependent?.id),
    queryFn: async (): Promise<KidTransaction[]> => {
      const { data, error } = await supabase
        .from("transactions")
        .select("id, description, amount, transaction_type, transaction_date")
        .is("deleted_at", null)
        .order("transaction_date", { ascending: false })
        .limit(60);
      if (error) throw error;
      return (data ?? []) as unknown as KidTransaction[];
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
            isBoy ? "bg-blue-600 border-blue-400 text-white" : 
            isGirl ? "bg-pink-600 border-pink-400 text-white" : 
            "bg-emerald-600 border-emerald-400 text-white"
          )}>
            <div className="flex items-start gap-3">
              <div className="bg-white/20 p-2 rounded-xl">
                <TrendingUp className="size-6" />
              </div>
              <div className="flex-1">
                <p className="text-[10px] font-black uppercase tracking-widest opacity-80">Recebimento Aprovado! 🚀</p>
                <h4 className="text-xl font-black">{formatCurrency(pixAlerts.data.amount)}</h4>
                <p className="text-[11px] font-medium opacity-90 mt-1">{pixAlerts.data.description}</p>
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
      const { data, error } = await supabase
        .from("kids_savings_goals" as never)
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as unknown as {
        id: string;
        title: string;
        target_amount: number;
        current_amount: number;
        reward: string | null;
        completed_at: string | null;
      }[];
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

  const rows = transactions.data ?? [];
  const income = rows
    .filter((row) => row.transaction_type === "income")
    .reduce((sum, row) => sum + Number(row.amount), 0);
  const expense = rows
    .filter((row) => row.transaction_type === "expense")
    .reduce((sum, row) => sum + Number(row.amount), 0);
  const balance = income - expense;
  const firstName = (dependent.nickname || dependent.name).split(" ")[0];
  // O responsável escolhe o que aparece aqui (painel /kids).
  const visibility = parseKidVisibility((dependent as { kid_visibility?: unknown }).kid_visibility);

  const isBoy = (dependent as any).gender === 'boy';
  const isGirl = (dependent as any).gender === 'girl';

  return (
    <KidsStatusGuard kidUserId={dependent.id}>
    <main className={cn(
      "min-h-dvh pb-16 transition-colors duration-500",
      isBoy ? "bg-gradient-to-b from-blue-600/20 via-background to-background" :
      isGirl ? "bg-gradient-to-b from-pink-500/20 via-background to-background" :
      "bg-gradient-to-b from-primary/10 via-background to-background"
    )}>
      <header className="flex items-center justify-between gap-3 px-4 py-5 sm:px-6">
        <div className="flex items-center gap-3">
          <Avatar className="size-12 border-2 border-white shadow-md ring-2 ring-primary/20">
            {avatarUrl ? (
              <AvatarImage src={avatarUrl} alt={`Foto de ${dependent.name}`} />
            ) : null}
            <AvatarFallback 
              className="text-lg font-black text-white"
              style={{ backgroundColor: dependent.color ?? "#f97316" }}
            >
              {firstName.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">
              Meu universo financeiro
            </p>
            <h1 className="text-xl font-black leading-tight tracking-tight">
              E aí, <span className={cn(
                isBoy ? "text-blue-600" : isGirl ? "text-pink-600" : "text-primary"
              )}>{firstName}</span>! 🚀
            </h1>
          </div>
        </div>
        <div className="flex items-center gap-1 sm:gap-2">
          <NotificationCenter isKid />
          <Button
            variant="ghost"
            size="sm"
            className="h-9 px-2 sm:px-3 text-xs"
            onClick={async () => {
              await signOut();
              navigate({ to: "/auth", replace: true });
            }}
          >
            <LogOut className="mr-1.5 size-4" /> Sair
          </Button>
        </div>

      </header>

      <div className="mx-auto w-full max-w-2xl space-y-5 px-4 sm:px-6">
        <div className="grid gap-4 sm:grid-cols-2">
          <section className={cn(
            "rounded-3xl border border-primary/20 bg-card p-5 text-center shadow-sm flex flex-col justify-center min-h-[160px] relative overflow-hidden",
            isBoy ? "border-blue-500/30" : isGirl ? "border-pink-500/30" : ""
          )}>
            {/* Background decorativo sutil para o saldo */}
            <div className={cn(
              "absolute -right-4 -top-4 size-24 opacity-5",
              isBoy ? "text-blue-500" : isGirl ? "text-pink-500" : "text-primary"
            )}>
              <PiggyBank className="size-full" />
            </div>

            {visibility.balance ? (
              <>
                <p className="flex items-center justify-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-primary">
                  <Sparkles className="size-3.5" /> Saldo disponível
                </p>
                <p
                  className={cn(
                    "mt-1 text-4xl font-black tabular-nums tracking-tighter",
                    balance < 0 ? "text-destructive" : "text-foreground",
                  )}
                >
                  {formatCurrency(balance)}
                </p>
              </>
            ) : (
              <p className="text-[11px] font-semibold text-muted-foreground">
                Saldo oculto pelo responsável.
              </p>
            )}
            
            {visibility.income ? (
              <div className="mt-3 grid grid-cols-2 gap-2 text-left">
                <div className="rounded-xl bg-emerald-500/10 p-2">
                  <p className="flex items-center gap-1 text-[9px] font-bold text-emerald-600 uppercase tracking-tight">
                    <TrendingUp className="size-3" /> Ganhei
                  </p>
                  <p className="text-sm font-bold tabular-nums">{formatCurrency(income)}</p>
                </div>
                <div className="rounded-xl bg-destructive/10 p-2">
                  <p className="flex items-center gap-1 text-[9px] font-bold text-destructive uppercase tracking-tight">
                    <TrendingDown className="size-3" /> Gastei
                  </p>
                  <p className="text-sm font-bold tabular-nums">{formatCurrency(expense)}</p>
                </div>
              </div>
            ) : null}
          </section>

          <section className={cn(
            "rounded-3xl border border-border bg-card p-5 shadow-sm flex flex-col items-center justify-center gap-4 group hover:border-primary/40 transition-all",
            isBoy ? "hover:border-blue-500/40" : isGirl ? "hover:border-pink-500/40" : ""
          )}>
            <div className={cn(
              "size-16 rounded-full bg-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform",
              isBoy ? "bg-blue-500/10 text-blue-600" : isGirl ? "bg-pink-500/10 text-pink-600" : "text-primary"
            )}>
              <TrendingUp className="size-8" />
            </div>
            <div className="text-center">
              <h3 className="text-sm font-bold">Comprei ou Ganhei?</h3>
              <p className="text-[11px] text-muted-foreground mt-0.5">Toque no botão para anotar</p>
            </div>
            <Button 
              className={cn(
                "h-10 w-full rounded-xl text-sm font-bold shadow-lg",
                isBoy ? "bg-blue-600 hover:bg-blue-700" : isGirl ? "bg-pink-600 hover:bg-pink-700" : ""
              )} 
              onClick={() => setEntryOpen(true)}
            >
              Anotar Agora 📝
            </Button>
          </section>
        </div>

        {visibility.goals && (goals.data ?? []).length > 0 && (
          <section className="space-y-3">
            <h2 className="flex items-center gap-2 text-sm font-bold">
              <Target className="size-4 text-primary" /> Minhas metas
            </h2>
            {(goals.data ?? []).map((goal) => {
              const progress = goal.target_amount
                ? Math.min(100, Math.round((Number(goal.current_amount) / Number(goal.target_amount)) * 100))
                : 0;
              return (
                <div key={goal.id} className="rounded-2xl border border-border bg-card p-4">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-bold">{goal.title}</p>
                    <span className="text-[11px] font-bold text-primary">{progress}%</span>
                  </div>
                  <div className="mt-2 h-2.5 overflow-hidden rounded-full bg-muted">
                    <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${progress}%` }} />
                  </div>
                  <p className="mt-2 text-[11px] text-muted-foreground">
                    {formatCurrency(Number(goal.current_amount))} de {formatCurrency(Number(goal.target_amount))}
                    {goal.reward ? ` · Prêmio: ${goal.reward}` : ""}
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
                      <p className="text-xl font-black text-foreground">
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
            <h2 className="text-sm font-bold">Meu histórico</h2>
            {visibility.siblings ? <KidSiblingAvatars dependentId={dependent.id} /> : null}
          </div>
          {rows.length === 0 ? (
            <p className="rounded-2xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
              Nada registrado ainda. Toque em “Registrar agora” para começar.
            </p>
          ) : (
            <ul className="divide-y divide-border overflow-hidden rounded-2xl border border-border bg-card">
              {rows.map((row) => (
                <li key={row.id} className="flex items-center justify-between gap-3 p-3 hover:bg-muted/30 transition-colors">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold">{row.description}</p>
                    <p className="text-[10px] font-bold text-muted-foreground/70 uppercase">
                      {new Date(`${row.transaction_date}T12:00:00`).toLocaleDateString("pt-BR", {
                        day: '2-digit',
                        month: 'long'
                      })}
                    </p>
                  </div>
                  <span
                    className={cn(
                      "shrink-0 text-sm font-bold tabular-nums",
                      row.transaction_type === "income" ? "text-emerald-600" : "text-destructive",
                    )}
                  >
                    {row.transaction_type === "income" ? "+" : "−"} {formatCurrency(Number(row.amount))}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>
        ) : null}
      </div>

      <KidEntryDialog
        open={entryOpen}
        onOpenChange={setEntryOpen}
        dependentId={dependent.id}
        ownerId={dependent.user_id}
      />
      <footer className="mt-auto border-t border-border/50 py-6 text-center">
        <p className="text-[10px] font-medium text-muted-foreground/60 uppercase tracking-widest">
          &lt;Dev. Franc D&apos;nis&gt; · Feijó, ACRE
        </p>
      </footer>
    </main>
    </KidsStatusGuard>
  );
}

function KidEntryDialog({
  open,
  onOpenChange,
  dependentId,
  ownerId,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  dependentId: string;
  ownerId: string;
}) {
  const queryClient = useQueryClient();
  const [reason, setReason] = useState<string>(DEPENDENT_REASONS[0].value);
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");

  const selected = DEPENDENT_REASONS.find((item) => item.value === reason) ?? DEPENDENT_REASONS[0];

  const save = useMutation({
    mutationFn: async () => {
      const value = parseAmount(amount);
      if (!value || value <= 0) throw new Error("Informe um valor maior que zero.");
      
      const now = new Date();
      // transaction_date é YYYY-MM-DD
      const isoDate = now.toISOString().split('T')[0];
      // Salva a hora exata na descrição ou metadados se necessário, 
      // mas aqui vamos garantir que o registro seja cronológico
      
      const { error } = await supabase.from("transactions").insert({
        user_id: ownerId,
        description: description.trim() || selected.label,
        amount: value,
        transaction_type: selected.type,
        transaction_date: isoDate,
        status: selected.type === "income" ? "received" : "paid",
        tags: [dependentTag(dependentId), reasonTag(selected.value)],
        // created_at no banco já lida com o timestamp exato para ordenação técnica
      } as never);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Registrado! Muito bem 👏");
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
          <DialogTitle>O que aconteceu?</DialogTitle>
          <DialogDescription>Escolha o motivo e digite o valor.</DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-2">
          {DEPENDENT_REASONS.map((item) => (
            <button
              key={item.value}
              type="button"
              onClick={() => setReason(item.value)}
              className={cn(
                "rounded-2xl border p-3 text-left text-[12px] font-bold transition",
                reason === item.value
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border bg-card text-muted-foreground",
              )}
            >
              {item.label}
              <span className="mt-0.5 block text-[10px] font-medium opacity-70">
                {item.type === "income" ? "Entrou dinheiro" : "Saiu dinheiro"}
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

        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={() => save.mutate()} disabled={save.isPending}>
            {save.isPending ? <Loader2 className="mr-2 size-4 animate-spin" /> : null}
            Salvar
          </Button>
        </DialogFooter>
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
