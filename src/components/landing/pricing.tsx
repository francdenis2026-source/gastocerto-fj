
import { Link } from "@tanstack/react-router";
import { Check, Sparkles, Zap, Bot, Star, ShieldCheck, ArrowRight } from "lucide-react";
import { useState } from "react";

import { Badge } from "@/components/ui/badge";
import { CheckoutDialog } from "@/components/landing/checkout-dialog";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/format";
import { annualMonthlyEquivalent } from "@/lib/plan-pricing";
import { livePrice, usePublicPlans } from "@/hooks/use-public-plans";
import { cn } from "@/lib/utils";
import { Reveal } from "@/components/landing/reveal";

type Cycle = "monthly" | "yearly";

export const basePlans = [
  {
    slug: "free",
    name: "Standard",
    monthly: 0,
    yearly: 0,
    description: "Perfeito para começar sua jornada financeira.",
    highlighted: false,
    cta: "Começar Grátis",
    features: [
      "Até 30 lançamentos por mês",
      "Dashboard simplificado",
      "Categorias essenciais",
      "Controle de 1 veículo",
      "Segurança SSL"
    ],
  },
  {
    slug: "premium",
    name: "Pro",
    monthly: 24.9,
    yearly: 19.9,
    description: "Para quem leva o controle a sério.",
    highlighted: false,
    cta: "Assinar Pro",
    features: [
      "Lançamentos ilimitados",
      "Gestão de múltiplos cartões",
      "Relatórios detalhados PDF/CSV",
      "Até 5 veículos e metas",
      "Suporte prioritário"
    ],
  },
  {
    slug: "premium_ia",
    name: "Enterprise IA",
    monthly: 34.9,
    yearly: 29,
    description: "O poder máximo da IA no seu bolso.",
    highlighted: true,
    cta: "Assinar Enterprise",
    features: [
      "Tudo do plano Pro",
      "Consultor Financeiro de IA",
      "Análise preditiva de gastos",
      "Insights de economia",
      "Acesso antecipado a betas",
      "Sincronização premium"
    ],
  },
];

export function Pricing() {
  const { data: livePlans } = usePublicPlans();
  const [cycle, setCycle] = useState<Cycle>("monthly");
  const isYearly = cycle === "yearly";
  const [checkoutPlan, setCheckoutPlan] = useState<"free" | "premium" | "premium_ia" | null>(null);

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

  return (
    <section id="planos" className="py-24 lg:py-32 bg-background relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 blur-[120px] rounded-full -z-10" />

      <div className="container mx-auto px-6 lg:px-12">
        <div className="flex flex-col items-center text-center mb-20">
          <Reveal delay={100}>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-primary/20 bg-primary/5 mb-6">
              <Star className="size-4 text-primary fill-primary" />
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary">Planos Flexíveis</span>
            </div>
          </Reveal>
          <Reveal delay={200}>
            <h2 className="text-4xl lg:text-6xl font-black tracking-tight text-foreground mb-8">
              Escolha seu nível de <span className="text-primary italic">domínio</span>.
            </h2>
          </Reveal>
          
          <Reveal delay={300} className="mt-4">
            <div className="inline-flex items-center p-1.5 rounded-2xl bg-secondary/50 border border-border">
              <button
                onClick={() => setCycle("monthly")}
                className={cn(
                  "px-8 py-2.5 rounded-xl text-sm font-bold transition-all",
                  cycle === "monthly" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                )}
              >
                Mensal
              </button>
              <button
                onClick={() => setCycle("yearly")}
                className={cn(
                  "px-8 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center gap-2",
                  cycle === "yearly" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                )}
              >
                Anual
                <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] font-black uppercase tracking-tighter">
                  -{savingsPercent}%
                </span>
              </button>
            </div>
          </Reveal>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch max-w-7xl mx-auto">
          {plans.map((plan, index) => {
            const price = isYearly ? plan.yearly : plan.monthly;
            return (
              <Reveal key={plan.slug} delay={index * 100 + 400} className="flex h-full">
                <div className={cn(
                  "relative flex flex-col w-full p-10 rounded-[40px] border border-border bg-card transition-all duration-500 hover:scale-[1.02] hover:shadow-2xl h-full",
                  plan.highlighted && "border-primary/50 shadow-2xl shadow-primary/10 ring-1 ring-primary/20 scale-105 z-10"
                )}>
                  {plan.highlighted && (
                    <div className="absolute -top-5 left-1/2 -translate-x-1/2 px-6 py-2 rounded-full bg-primary text-primary-foreground text-[10px] font-black uppercase tracking-[0.2em] shadow-xl whitespace-nowrap">
                      Recomendado pela IA
                    </div>
                  )}

                  <div className="mb-8">
                    <h3 className="text-2xl font-black text-foreground mb-2">{plan.name}</h3>
                    <p className="text-sm text-muted-foreground font-medium">{plan.description}</p>
                  </div>

                  <div className="mb-10 flex items-baseline gap-1">
                    <span className="text-5xl font-black tracking-tight text-foreground">
                      {price === 0 ? "Grátis" : formatCurrency(price)}
                    </span>
                    <span className="text-muted-foreground font-bold text-sm">/mês</span>
                  </div>

                  <ul className="space-y-5 mb-12 flex-grow">
                    {plan.features.map((feature, i) => (
                      <li key={i} className="flex items-start gap-4">
                        <div className="size-5 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0 mt-0.5">
                          <Check className="size-3 stroke-[3px]" />
                        </div>
                        <span className="text-[15px] font-medium text-muted-foreground leading-snug">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <button
                    onClick={() => setCheckoutPlan(plan.slug as any)}
                    className={cn(
                      "w-full py-5 rounded-2xl font-black text-base transition-all active:scale-[0.98] flex items-center justify-center gap-2",
                      plan.highlighted 
                        ? "bg-primary text-primary-foreground shadow-xl shadow-primary/20 hover:brightness-110" 
                        : "bg-secondary text-foreground hover:bg-secondary/80"
                    )}
                  >
                    {plan.cta}
                    <ArrowRight className="size-5" />
                  </button>
                </div>
              </Reveal>
            );
          })}
        </div>

        <div className="mt-20 text-center">
          <Reveal delay={800}>
            <div className="inline-flex items-center gap-6 px-8 py-4 rounded-3xl border border-border bg-secondary/20">
              <div className="flex items-center gap-2">
                <ShieldCheck className="size-5 text-primary" />
                <span className="text-sm font-bold text-muted-foreground">Pagamento 100% Seguro</span>
              </div>
              <div className="w-px h-4 bg-border hidden sm:block" />
              <div className="flex items-center gap-2">
                <Star className="size-5 text-yellow-500 fill-yellow-500" />
                <span className="text-sm font-bold text-muted-foreground">Garantia de 7 Dias</span>
              </div>
            </div>
          </Reveal>
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
