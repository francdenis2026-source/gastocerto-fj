import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/app-shell";
import { CreditCard, Plus, ArrowRight, History, CreditCard as CardIcon, LayoutGrid, FileDown, Search, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { getCreditCards } from "@/lib/credit-cards.functions";
import { useAuth } from "@/hooks/use-auth";
import { formatCurrency } from "@/lib/format-utils";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useState } from "react";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PageHeader } from "@/components/finance/page-header";

export const Route = createFileRoute("/_authenticated/cartoes")({
  head: () => ({
    meta: [
      { title: "Gestão de Cartões — GastoCerto" },
      { name: "description", content: "Controle total dos seus cartões de crédito e débito em um só lugar." },
    ],
  }),
  component: CreditCardsPage,
});

function CreditCardsPage() {
  const { user } = useAuth();
  const fetchCards = useServerFn(getCreditCards);
  const [activeTab, setActiveTab] = useState("overview");

  const { data: cards, isLoading } = useQuery({
    queryKey: ["credit-cards", user?.id],
    queryFn: () => fetchCards({ data: { userId: user?.id ?? "" } }),
    enabled: !!user?.id,
  });

  return (
    <AppShell>
      <div className="mx-auto w-full max-w-7xl space-y-5 sm:space-y-7">
        <PageHeader
          icon={CreditCard}
          eyebrow="Movimentações"
          title="Meus cartões"
          description="Acompanhe limites, faturas e gastos por cartão com clareza."
          actions={
            <>
              <Button
                variant="outline"
                size="sm"
                className="min-h-11 gap-2 sm:min-h-9"
                onClick={() => toast.success("Relatório gerado com filtros completos! (Simulação)")}
              >
                <FileDown className="size-4" aria-hidden />
                Exportar
              </Button>
              <Button size="sm" className="min-h-11 gap-2 sm:min-h-9">
                <Plus className="size-4" aria-hidden />
                Adicionar cartão
              </Button>
            </>
          }
        />

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            <TabsList className="min-w-max rounded-xl bg-muted/60 p-1">
              <TabsTrigger value="overview" className="min-h-10 gap-2 rounded-lg px-4">
                <LayoutGrid className="size-4" aria-hidden />
                Visão geral
              </TabsTrigger>
              <TabsTrigger value="transactions" className="min-h-10 gap-2 rounded-lg px-4">
                <History className="size-4" aria-hidden />
                Últimas compras
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="overview" className="mt-5 space-y-6">
            {isLoading ? (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3" aria-label="Carregando cartões">
                {[1, 2, 3].map((item) => <Skeleton key={item} className="h-52 rounded-2xl" />)}
              </div>
            ) : cards?.length === 0 ? (
              <section className="rounded-3xl border border-dashed border-border bg-muted/20 px-5 py-10 text-center sm:px-8">
                <div className="mx-auto mb-4 grid size-12 place-items-center rounded-2xl border border-border bg-background text-muted-foreground">
                  <CardIcon className="size-6" aria-hidden />
                </div>
                <h2 className="text-base font-semibold text-foreground">Nenhum cartão cadastrado</h2>
                <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-muted-foreground">
                  Adicione seu primeiro cartão para acompanhar limite, fechamento, vencimento e saldo devedor.
                </p>
                <Button variant="outline" size="sm" className="mt-5 min-h-11 gap-2 sm:min-h-9">
                  <Plus className="size-4" aria-hidden />
                  Adicionar cartão
                </Button>
              </section>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {cards?.map((card) => {
                  const usedPercent = card.limit_amount > 0 ? (card.current_balance / card.limit_amount) * 100 : 0;
                  const progressValue = Math.min(Math.max(usedPercent, 0), 100);
                  return (
                    <article key={card.id} className="relative overflow-hidden rounded-2xl border border-border bg-card p-5 shadow-soft">
                      <div className="flex items-start justify-between gap-4">
                        <div className="min-w-0 space-y-1">
                          <p className="truncate text-[11px] font-bold uppercase tracking-[0.12em] text-muted-foreground">
                            {card.institution || "Instituição"}
                          </p>
                          <h2 className="truncate text-lg font-bold text-foreground">{card.name}</h2>
                        </div>
                        <div
                          className="grid size-10 shrink-0 place-items-center rounded-xl text-white shadow-sm"
                          style={{ backgroundColor: card.color || "var(--primary)" }}
                          aria-hidden
                        >
                          <CreditCard className="size-5" />
                        </div>
                      </div>

                      <div className="mt-6 space-y-3">
                        <div className="flex items-center justify-between gap-3 text-sm">
                          <span className="text-muted-foreground">Limite utilizado</span>
                          <span className="numeric font-semibold text-foreground">{usedPercent.toFixed(0)}%</span>
                        </div>
                        <Progress value={progressValue} className="h-2" aria-label={`${usedPercent.toFixed(0)}% do limite utilizado`} />
                        <div className="flex items-end justify-between gap-4">
                          <div className="min-w-0">
                            <p className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground">Saldo devedor</p>
                            <p className="numeric mt-1 break-words text-xl font-bold text-foreground">{formatCurrency(card.current_balance)}</p>
                          </div>
                          <div className="shrink-0 text-right">
                            <p className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground">Limite total</p>
                            <p className="numeric mt-1 text-sm font-semibold text-muted-foreground">{formatCurrency(card.limit_amount)}</p>
                          </div>
                        </div>
                      </div>

                      <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-border pt-4">
                        <div className="flex flex-wrap gap-2">
                          <Badge variant="outline" className="min-h-6 px-2 text-[10px]">Vence dia {card.due_day}</Badge>
                          <Badge variant="outline" className="min-h-6 px-2 text-[10px]">Fecha dia {card.closing_day}</Badge>
                        </div>
                        <Button variant="ghost" size="sm" className="min-h-9 gap-1 px-3 text-xs">
                          Detalhes
                          <ArrowRight className="size-3.5" aria-hidden />
                        </Button>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </TabsContent>

          <TabsContent value="transactions" className="mt-5 space-y-5">
            <section className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border bg-muted/30 p-4">
              <div className="relative min-w-[min(100%,240px)] flex-1">
                <label htmlFor="card-transaction-search" className="sr-only">Buscar compras por descrição ou valor</label>
                <Input id="card-transaction-search" placeholder="Buscar na descrição ou valor..." className="pl-10" />
                <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
              </div>
              <div className="flex flex-wrap gap-2">
                <Button variant="outline" size="sm" className="min-h-11 gap-2 sm:min-h-9" onClick={() => toast.success("Histórico exportado em CSV!")}>
                  <FileDown className="size-4" aria-hidden />
                  CSV
                </Button>
                <Button variant="outline" size="sm" className="min-h-11 gap-2 sm:min-h-9" onClick={() => toast.success("PDF do Cartão exportado!")}>
                  <FileDown className="size-4" aria-hidden />
                  PDF
                </Button>
              </div>
            </section>

            <section className="flex items-start gap-3 rounded-2xl border border-primary/20 bg-primary/5 p-4">
              <AlertCircle className="mt-0.5 size-5 shrink-0 text-primary" aria-hidden />
              <div className="space-y-1.5">
                <h2 className="text-sm font-semibold text-foreground">Monitor de assinaturas e recorrências</h2>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  Detectamos 2 possíveis assinaturas recorrentes neste cartão (Netflix, Spotify). Deseja criar uma meta de economia para essas categorias?
                </p>
                <Button variant="link" className="h-auto min-h-0 p-0 text-sm">Ver detalhes</Button>
              </div>
            </section>

            <section className="rounded-2xl border border-border bg-card p-6 text-center sm:p-8">
              <History className="mx-auto mb-3 size-9 text-muted-foreground/50" aria-hidden />
              <h2 className="text-sm font-semibold text-foreground">Auditoria e histórico detalhado</h2>
              <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-muted-foreground">
                Visualização completa de quem inseriu, editou ou removeu cada compra. Filtrado por: {user?.email} · Período: últimos 30 dias.
              </p>
            </section>
          </TabsContent>
        </Tabs>
      </div>
    </AppShell>
  );
}
