import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/app-shell";
import { CreditCard, Plus, ArrowRight, Wallet, History, CreditCard as CardIcon, LayoutGrid } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { getCreditCards } from "@/lib/credit-cards.functions";
import { useAuth } from "@/hooks/use-auth";
import { formatCurrency } from "@/lib/format";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

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
      <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6 pb-24 lg:pb-8">
        <header className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Meus Cartões</h1>
            <p className="text-muted-foreground text-sm">Gerencie limites, faturas e gastos por cartão.</p>
          </div>
          <Button className="gap-2">
            <Plus className="size-4" /> Novo Cartão
          </Button>
        </header>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="bg-muted/50 p-1 rounded-xl">
            <TabsTrigger value="overview" className="rounded-lg gap-2">
              <LayoutGrid className="size-4" /> Visão Geral
            </TabsTrigger>
            <TabsTrigger value="transactions" className="rounded-lg gap-2">
              <History className="size-4" /> Últimas Compras
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="mt-6 space-y-6">
            {isLoading ? (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {[1, 2, 3].map(i => <Skeleton key={i} className="h-48 rounded-2xl" />)}
              </div>
            ) : cards?.length === 0 ? (
              <div className="text-center py-12 border-2 border-dashed rounded-3xl">
                <CardIcon className="size-12 mx-auto text-muted-foreground/30" />
                <h3 className="mt-4 text-lg font-semibold">Nenhum cartão cadastrado</h3>
                <p className="text-muted-foreground text-sm mb-6">Comece adicionando seu primeiro cartão de crédito ou débito.</p>
                <Button variant="outline">Adicionar Cartão</Button>
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {cards?.map(card => {
                  const usedPercent = card.limit_amount > 0 ? (card.current_balance / card.limit_amount) * 100 : 0;
                  return (
                    <div 
                      key={card.id} 
                      className="group relative overflow-hidden rounded-2xl border border-border bg-card p-5 shadow-sm hover:shadow-md transition-all"
                    >
                      <div className="flex items-start justify-between">
                        <div className="space-y-1">
                          <p className="text-xs font-medium text-muted-foreground uppercase">{card.institution || "Instituição"}</p>
                          <h3 className="font-bold text-lg">{card.name}</h3>
                        </div>
                        <div 
                          className="size-10 rounded-xl flex items-center justify-center text-white"
                          style={{ backgroundColor: card.color || "var(--primary)" }}
                        >
                          <CreditCard className="size-5" />
                        </div>
                      </div>

                      <div className="mt-6 space-y-3">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Limite utilizado</span>
                          <span className="font-semibold">{usedPercent.toFixed(0)}%</span>
                        </div>
                        <Progress value={usedPercent} className="h-1.5" />
                        <div className="flex justify-between items-end">
                          <div>
                            <p className="text-[10px] text-muted-foreground uppercase">Saldo Devedor</p>
                            <p className="text-xl font-black">{formatCurrency(card.current_balance)}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-[10px] text-muted-foreground uppercase">Limite Total</p>
                            <p className="text-sm font-bold text-muted-foreground">{formatCurrency(card.limit_amount)}</p>
                          </div>
                        </div>
                      </div>

                      <div className="mt-5 pt-4 border-t flex items-center justify-between text-[11px] text-muted-foreground">
                        <div className="flex gap-2">
                          <Badge variant="outline" className="text-[9px] h-4">Dia {card.due_day} (Venc)</Badge>
                          <Badge variant="outline" className="text-[9px] h-4">Dia {card.closing_day} (Fech)</Badge>
                        </div>
                        <Button variant="ghost" size="sm" className="h-6 text-[10px] gap-1 px-2">
                          Detalhes <ArrowRight className="size-3" />
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </TabsContent>

          <TabsContent value="transactions" className="mt-6">
             <div className="rounded-2xl border bg-card p-6 text-center text-muted-foreground">
                <p className="text-sm">Selecione um cartão para ver as transações detalhadas.</p>
             </div>
          </TabsContent>
        </Tabs>
      </div>
    </AppShell>
  );
}
