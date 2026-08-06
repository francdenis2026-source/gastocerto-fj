import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { ShieldAlert, TrendingDown, Target, CheckCircle2, AlertCircle, Sparkles } from "lucide-react";
import { getDebtAdvisorInsights } from "@/lib/debt-advisor.functions";
import { formatCurrency } from "@/lib/format-utils";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/hooks/use-auth";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

export function DebtAdvisorPanel() {
  const { user } = useAuth();
  const fetchInsights = useServerFn(getDebtAdvisorInsights);
  
  const { data, isLoading } = useQuery({
    queryKey: ["debt-advisor-insights", user?.id],
    queryFn: () => fetchInsights({ data: { userId: user?.id ?? "" } }),
    enabled: !!user?.id,
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-[200px] w-full rounded-2xl" />
        <Skeleton className="h-[300px] w-full rounded-2xl" />
      </div>
    );
  }

  if (!data) return null;

  const { summary, plans } = data;
  const isHealthy = summary.healthScore > 80;

  return (
    <div className="space-y-6">
      <section className="grid gap-4 md:grid-cols-3">
        <Card className="border-border/50 bg-card/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Dívida Total
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{formatCurrency(summary.totalDebt)}</p>
            <p className="text-[11px] text-muted-foreground mt-1">
              {summary.debtToIncomeRatio.toFixed(1)}% da sua renda mensal
            </p>
          </CardContent>
        </Card>

        <Card className="border-border/50 bg-card/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Score de Saúde
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-center justify-between">
              <span className={cn(
                "text-2xl font-bold",
                summary.healthScore > 80 ? "text-success" : summary.healthScore > 50 ? "text-warning" : "text-destructive"
              )}>
                {Math.round(summary.healthScore)}/100
              </span>
              {isHealthy ? <CheckCircle2 className="size-5 text-success" /> : <ShieldAlert className="size-5 text-warning" />}
            </div>
            <Progress value={summary.healthScore} className="h-1.5" />
          </CardContent>
        </Card>

        <Card className="border-border/50 bg-card/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Dívida em Cartões
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{formatCurrency(summary.cardDebt)}</p>
            <p className="text-[11px] text-muted-foreground mt-1">
              Foco principal para quitação
            </p>
          </CardContent>
        </Card>
      </section>

      <section className="space-y-4">
        <h3 className="flex items-center gap-2 text-sm font-semibold">
          <Sparkles className="size-4 text-primary" />
          Planos de Ação Recomendados
        </h3>
        
        {plans.map((plan, idx) => (
          <Card key={idx} className={cn(
            "border-l-4",
            summary.totalDebt > 0 ? "border-l-warning" : "border-l-success"
          )}>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                {summary.totalDebt > 0 ? <TrendingDown className="size-4 text-warning" /> : <Target className="size-4 text-success" />}
                {plan.title}
              </CardTitle>
              <CardDescription>{plan.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {plan.steps.map((step, sIdx) => (
                  <li key={sIdx} className="flex items-start gap-3 text-sm">
                    <div className="mt-1 flex size-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-[10px] font-bold text-primary">
                      {sIdx + 1}
                    </div>
                    <span className="text-muted-foreground leading-relaxed">{step}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        ))}
      </section>

      {summary.debtToIncomeRatio > 50 && (
        <div className="rounded-2xl border border-destructive/20 bg-destructive/5 p-4 flex gap-3 items-start dark:bg-destructive/10 dark:border-destructive/30">
          <AlertCircle className="size-5 text-destructive shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-bold text-destructive">Alerta Crítico: Superendividamento</p>
            <p className="text-xs text-destructive/80 mt-1">
              Suas dívidas superam 50% da sua renda mensal. Recomendamos procurar renegociação imediata ou consultoria especializada para evitar juros bola de neve.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
