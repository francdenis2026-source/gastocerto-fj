import { Link } from "@tanstack/react-router";
import { Check, Sparkles } from "lucide-react";
import { useState } from "react";

import { Badge } from "@/components/ui/badge";
import { CheckoutDialog } from "@/components/landing/checkout-dialog";
import { FeatureDetailDialog } from "@/components/landing/feature-detail-dialog";

import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/format";
import { annualMonthlyEquivalent } from "@/lib/plan-pricing";
import { livePrice, usePublicPlans } from "@/hooks/use-public-plans";
import { cn } from "@/lib/utils";

type Cycle = "monthly" | "yearly";

export const basePlans = [
  {
    slug: "free",
    name: "Gratuito",
    monthly: 0,
    yearly: 0,
    description: "Para conhecer o sistema sem pagar nada.",
    highlighted: false,
    cta: "Criar conta grátis",
    features: [
      "Até 30 lançamentos por mês",
      "Categorias, painel e balancete do mês",
      "Inclui 14 dias de teste completo",
      "Sem cartão de crédito",
    ],
  },
  {
    slug: "premium",
    name: "Premium",
    monthly: 24.9,
    yearly: 20.75,
    description: "Controle total, previsões e relatórios.",
    highlighted: false,
    cta: "Assinar o Premium",
    features: [
      "Lançamentos ilimitados",
      "Até 2 veículos, 5 metas e 2 links compartilhados",
      "Histórico de 24 meses e exportação CSV/PDF",
      "Combustível, gás e orçamentos",
    ],
  },
  {
    slug: "premium_ia",
    name: "Premium IA",
    monthly: 34.9,
    yearly: 29,
    description: "Tudo do Premium + Consultor de IA integrado.",
    highlighted: true,
    cta: "Assinar o Premium IA",
    features: [
      "Tudo do Premium, agora sem cotas",
      "Veículos, metas, links e histórico ilimitados",
      "Consultor de IA que analisa seus gastos",
      "Créditos mensais de IA inclusos",
      "Recibos e auditoria de cada análise",
    ],
  },
];



export function Pricing() {
  const { data: livePlans } = usePublicPlans();

  // Preços vigentes do banco: qualquer ajuste do administrador aparece na hora.
  const plans = basePlans.map((plan) => {
    if (plan.monthly === 0) return plan;
    const live = livePrice(livePlans, plan.slug, {
      monthly: plan.monthly,
      annual: plan.yearly * 12,
    });
    return { ...plan, monthly: live.monthly, yearly: annualMonthlyEquivalent(live.annual) };
  });

  const premium = plans[plans.length - 1];
  const savingsPercent = Math.max(0, Math.round((1 - premium.yearly / premium.monthly) * 100));
  const savingsPerYear = premium.monthly * 12 - premium.yearly * 12;

  const [cycle, setCycle] = useState<Cycle>("monthly");
  const isYearly = cycle === "yearly";
  const [checkoutPlan, setCheckoutPlan] = useState<"free" | "premium" | "premium_ia" | null>(null);


  return (
    <section id="planos" className="py-20 sm:py-32">
      <div className="section-shell">
        <div className="grid gap-2.5 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-end">
          <div className="min-w-0">
            <p className="text-[12.5px] font-semibold uppercase tracking-[0.16em] text-brand">
              Planos de Assinatura
            </p>
            <h2 className="section-title mt-1.5">
              Escolha seu nível de controle
            </h2>
            <p className="mt-1.5 text-sm text-muted-foreground sm:block hidden">
              Sem fidelidade contratual. Exportação e exclusão de dados disponíveis a qualquer momento.
            </p>
          </div>

          <div className="flex flex-col items-start gap-1 sm:items-end">
            <div
              role="group"
              aria-label="Ciclo de cobrança"
              className="inline-flex items-center rounded-full border border-border bg-card/80 p-1 shadow-soft backdrop-blur-sm"
            >
              {[
                { key: "monthly" as const, label: "Mensal" },
                { key: "yearly" as const, label: "Anual" },
              ].map((option) => (
                <button
                  key={option.key}
                  type="button"
                  aria-pressed={cycle === option.key}
                  onClick={() => setCycle(option.key)}
                  className={cn(
                    "inline-flex min-h-8 items-center rounded-full px-3 text-[11px] font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                    cycle === option.key
                      ? "bg-brand text-brand-foreground shadow-soft"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  {option.label}
                  {option.key === "yearly" && (
                    <span
                      className={cn(
                        "ml-1 rounded-full px-1 py-0.5 text-[9px]",
                        cycle === "yearly"
                          ? "bg-brand-foreground text-brand"
                          : "bg-success/15 text-success",
                      )}
                    >
                      -{savingsPercent}%
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Versão Desktop: Cards Expandidos */}
        <div className="mx-auto mt-6 hidden max-w-5xl gap-3 md:grid md:grid-cols-3">
          {plans.map((plan) => {
            const price = isYearly ? plan.yearly : plan.monthly;
            return (
              <div
                key={plan.slug}
                className={cn(
                  "relative flex flex-col rounded-[2rem] border border-white/5 bg-white/[0.02] p-8 shadow-2xl backdrop-blur-xl transition-all hover:-translate-y-1 hover:border-brand/30 overflow-hidden",
                  plan.highlighted && "border-brand/40 ring-1 ring-brand/20 bg-brand/[0.03]",
                )}
              >
                {plan.highlighted && (
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,var(--color-brand)_0%,transparent_25%)] opacity-[0.08]" />
                )}
                {plan.highlighted && (
                  <Badge className="absolute -top-2.5 right-5 gap-1 bg-brand text-brand-foreground shadow-lg shadow-brand/20 border-brand/50 px-2.5 py-0.5 animate-in fade-in zoom-in duration-500">
                    <Sparkles className="size-3" aria-hidden="true" />
                    Mais Escolhido
                  </Badge>
                )}
                <div className="flex items-baseline justify-between gap-3">
                  <h3 className="text-base font-semibold">{plan.name}</h3>
                  <p className="tabular text-2xl font-extrabold tracking-tight">
                    {price === 0 ? "Grátis" : formatCurrency(price)}
                    <span className="ml-1 text-xs font-medium text-muted-foreground">/mês</span>
                  </p>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">{plan.description}</p>
                <ul className="mt-4 flex-1 space-y-1.5">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2 text-[13px]">
                      <Check className="mt-0.5 size-4 shrink-0 text-success" aria-hidden="true" />
                      <span className="text-muted-foreground">{feature}</span>
                    </li>
                  ))}
                </ul>
                <div className="mt-4">
                  <Button
                    className={cn(
                      "w-full font-bold shadow-soft transition-all active:scale-[0.98]",
                      plan.highlighted 
                        ? "bg-brand text-brand-foreground hover:bg-brand/90 hover:shadow-brand/20 shadow-lg" 
                        : "border-brand/30 text-brand hover:bg-brand/[0.03]"
                    )}
                    variant={plan.highlighted ? "default" : "outline"}
                    onClick={() => setCheckoutPlan(plan.slug as any)}
                  >
                    {plan.cta}
                  </Button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Versão Mobile: Cards Compactos (Click para ver detalhes) */}
        <div className="mt-4 grid grid-cols-1 gap-2 md:hidden">
          {plans.map((plan) => {
            const price = isYearly ? plan.yearly : plan.monthly;
            return (
              <div key={plan.slug} className="flex flex-col gap-1.5">
                <FeatureDetailDialog
                  feature={{
                    title: `Plano ${plan.name}`,
                    text: plan.features.join(". "),
                    tag: plan.highlighted ? "Destaque" : "Assinatura"
                  }}
                >
                  <button
                    type="button"
                    className={cn(
                      "group relative flex w-full flex-col rounded-xl border border-border bg-card/80 p-3 text-left transition-all active:scale-[0.98] overflow-hidden",
                      plan.highlighted && "border-brand/50 bg-brand/[0.03] ring-1 ring-brand/10 shadow-sm shadow-brand/5"
                    )}
                  >
                    {plan.highlighted && (
                      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,var(--color-brand)_0%,transparent_30%)] opacity-[0.06]" />
                    )}
                    <div className="flex w-full items-center justify-between gap-2">
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="text-sm font-bold">{plan.name}</span>
                          {plan.highlighted && (
                            <span className="rounded-full bg-brand/10 px-1.5 py-0.5 text-[9px] font-black uppercase text-brand border border-brand/20">
                              RECOMENDADO
                            </span>
                          )}
                        </div>
                        <p className="truncate text-[11px] text-muted-foreground">{plan.description}</p>
                      </div>
                      <div className="shrink-0 text-right">
                        <p className="text-base font-black text-foreground">
                          {price === 0 ? "R$ 0" : formatCurrency(price)}
                        </p>
                        <p className="text-[9px] font-medium text-muted-foreground">/mês</p>
                      </div>
                    </div>
                    <div className="mt-2 flex items-center justify-between border-t border-border/50 pt-2">
                      <span className="text-[10px] font-semibold text-brand">Ver detalhes e benefícios</span>
                      <Sparkles className={cn("size-3", plan.highlighted ? "text-brand" : "text-muted-foreground/40")} />
                    </div>
                  </button>
                </FeatureDetailDialog>
                
                <Button
                  className={cn(
                    "h-10 w-full rounded-xl text-[13px] font-black shadow-soft transition-all active:scale-[0.97]",
                    plan.highlighted
                      ? "bg-brand text-brand-foreground hover:bg-brand/90 shadow-lg shadow-brand/10 border-none"
                      : "border-2 border-brand/20 bg-card text-brand hover:bg-brand/[0.02]"
                  )}
                  variant={plan.highlighted ? "default" : "outline"}
                  onClick={() => setCheckoutPlan(plan.slug as any)}
                >
                  Selecionar {plan.name}
                </Button>
              </div>
            );
          })}
        </div>
      </div>

      <CheckoutDialog
        open={checkoutPlan !== null}
        onOpenChange={(open: boolean) => setCheckoutPlan(open ? checkoutPlan : null)}
        {...(checkoutPlan ? { initialPlan: checkoutPlan } : {})}
        initialCycle={isYearly ? "annual" : "monthly"}
      />
    </section>
  );
}

