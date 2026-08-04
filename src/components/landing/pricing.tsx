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

  const [cycle, setCycle] = useState<Cycle>("monthly");
  const isYearly = cycle === "yearly";
  const [checkoutPlan, setCheckoutPlan] = useState<"free" | "premium" | "premium_ia" | null>(null);

  return (
    <section id="planos" className="section-padding bg-background/50">
      <div className="section-shell">
        <div className="flex flex-col items-center text-center mb-16">
          <div className="max-w-3xl">
            <p className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-primary">
              <Sparkles className="size-4" aria-hidden="true" />
              Preços Justos
            </p>
            <h2 className="mt-6 text-4xl font-extrabold tracking-tight text-foreground lg:text-5xl">
              Escolha seu nível de controle
            </h2>
            <p className="mt-6 text-lg leading-relaxed text-muted-foreground lg:text-xl">
              Sem fidelidade contratual. Exportação e exclusão de dados disponíveis a qualquer momento.
            </p>
          </div>
          
          <div className="mt-10">
            <div
              role="group"
              aria-label="Ciclo de cobrança"
              className="inline-flex items-center rounded-2xl border border-border bg-card p-1 shadow-premium"
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
                    "inline-flex h-11 items-center rounded-xl px-6 text-sm font-bold transition-all",
                    cycle === option.key
                      ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  {option.label}
                  {option.key === "yearly" && (
                    <span
                      className={cn(
                        "ml-2 rounded-lg px-2 py-0.5 text-[10px] font-black uppercase tracking-wider",
                        cycle === "yearly"
                          ? "bg-primary-foreground/20 text-primary-foreground"
                          : "bg-primary/10 text-primary",
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

        {/* Versão Desktop */}
        <div className="mx-auto grid max-w-6xl gap-8 md:grid-cols-3">
          {plans.map((plan) => {
            const price = isYearly ? plan.yearly : plan.monthly;
            return (
              <div
                key={plan.slug}
                className={cn(
                  "premium-card flex flex-col p-10",
                  plan.highlighted && "border-primary/50 ring-2 ring-primary/10 bg-primary/[0.02]"
                )}
              >
                {plan.highlighted && (
                  <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 gap-2 bg-primary text-primary-foreground px-4 py-1 text-xs font-black uppercase tracking-widest shadow-xl shadow-primary/20">
                    <Sparkles className="size-3.5" />
                    Mais Escolhido
                  </Badge>
                )}
                
                <div className="mb-8">
                  <h3 className="text-2xl font-bold">{plan.name}</h3>
                  <p className="mt-2 text-muted-foreground text-base">{plan.description}</p>
                </div>

                <div className="mb-8">
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-extrabold tracking-tight">
                      {price === 0 ? "Grátis" : formatCurrency(price)}
                    </span>
                    <span className="text-muted-foreground font-medium">/mês</span>
                  </div>
                </div>

                <ul className="mb-10 flex-1 space-y-4">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-3 text-base">
                      <div className="mt-1 grid size-5 shrink-0 place-items-center rounded-full bg-primary/10 text-primary">
                        <Check className="size-3.5 font-bold" />
                      </div>
                      <span className="text-muted-foreground leading-snug">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Button
                  className={cn(
                    "w-full h-14 rounded-2xl text-base font-bold transition-all active:scale-[0.98]",
                    plan.highlighted ? "btn-primary" : "btn-secondary"
                  )}
                  onClick={() => setCheckoutPlan(plan.slug as any)}
                >
                  {plan.cta}
                </Button>
              </div>
            );
          })}
        </div>

        {/* Versão Mobile (Opcional: Pode manter os mesmos cards ou simplificar) */}
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
