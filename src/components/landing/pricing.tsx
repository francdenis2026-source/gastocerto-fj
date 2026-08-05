import { Link } from "@tanstack/react-router";
import { Check, ArrowRight } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/format";
import { cn } from "@/lib/utils";
import { CheckoutDialog } from "@/components/landing/checkout-dialog";
import { Reveal } from "@/components/landing/reveal";

export interface PricingPlan {
  slug: string;
  name: string;
  monthly: number;
  yearly: number;
  description: string;
  cta: string;
  highlighted: boolean;
  features: string[];
}

export const basePlans: PricingPlan[] = [
  {
    slug: "free",
    name: "Grátis",
    monthly: 0,
    yearly: 0,
    description: "Para organizar o básico",
    cta: "Começar Agora",
    highlighted: false,
    features: [
      "14 dias de acesso total",
      "Lançamentos básicos",
      "Suporte padrão",
      "1 Veículo",
    ],
  },
  {
    slug: "premium",
    name: "Premium",
    monthly: 24.90,
    yearly: 20.75,
    description: "Controle financeiro completo",
    cta: "Assinar Agora",
    highlighted: true,
    features: [
      "Lançamentos ilimitados",
      "Exportação PDF/CSV",
      "Gestão de cartões e gás",
      "Múltiplos veículos",
      "Suporte prioritário",
    ],
  },
  {
    slug: "premium_ia",
    name: "Premium+",
    monthly: 34.90,
    yearly: 29.00,
    description: "Inteligência com IA",
    cta: "Assinar Agora",
    highlighted: false,
    features: [
      "Tudo do Premium",
      "Consultor IA ilimitado",
      "Análise de dívidas",
      "Dicas personalizadas",
      "Metas inteligentes",
    ],
  },
];

export function Pricing() {
  const [isYearly, setIsYearly] = useState(true);
  const [checkoutPlan, setCheckoutPlan] = useState<string | null>(null);

  return (
    <section id="planos" className="section-y relative bg-secondary/30 border-t border-border">
      <div className="section-shell relative z-10">
        <Reveal className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-foreground leading-tight mb-6">
            Planos que acompanham seu crescimento
          </h2>
          <p className="section-subtitle max-w-2xl mx-auto mb-10">
            Escolha a ferramenta certa para o seu momento e tenha controle absoluto sobre seu dinheiro.
          </p>
          
           <div className="inline-flex items-center rounded-full border border-border bg-card p-1">
             <button
               onClick={() => setIsYearly(false)}
               className={cn(
                 "rounded-full px-6 py-2 text-xs font-bold transition-all",
                 !isYearly ? "bg-primary text-primary-foreground shadow-sm" : "text-secondary-foreground hover:text-foreground"
               )}
             >
               Mensal
             </button>
             <button
               onClick={() => setIsYearly(true)}
               className={cn(
                 "flex items-center gap-1.5 rounded-full px-6 py-2 text-xs font-bold transition-all",
                 isYearly ? "bg-primary text-primary-foreground shadow-sm" : "text-secondary-foreground hover:text-foreground"
               )}
             >
               Anual
               <span className={cn(
                 "rounded-full px-1.5 py-0.5 text-[9px] font-bold",
                 isYearly ? "bg-primary-foreground/20 text-primary-foreground" : "bg-primary/10 text-primary"
               )}>
                 2 MESES GRÁTIS
               </span>
             </button>
           </div>
        </Reveal>

        <div className="grid gap-8 md:grid-cols-3 max-w-6xl mx-auto">
          {basePlans.map((plan: PricingPlan, i: number) => (
            <Reveal key={plan.slug} delay={i * 100}>
              <div
                onClick={() => setCheckoutPlan(plan.slug)}
                className={cn(
                  "interactive-card flex flex-col rounded-[2.5rem] p-10 border border-border bg-card h-full cursor-pointer",
                  plan.highlighted && "border-primary ring-1 ring-primary/20 scale-[1.03] z-10 shadow-xl shadow-primary/5",
                )}
                role="button"
                tabIndex={0}
              >
                {plan.highlighted && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-primary px-4 py-1 text-[10px] font-bold uppercase tracking-wider text-primary-foreground shadow-sm">
                    Recomendado
                  </div>
                )}
                
                <div className="mb-8">
                  <h3 className="text-2xl font-bold text-foreground">{plan.name}</h3>
                  <p className="mt-1 text-sm font-medium text-secondary-foreground">{plan.description}</p>
                </div>

                <div className="mb-8">
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-black tracking-tight text-foreground tabular">
                      {plan.monthly === 0 ? "Grátis" : formatCurrency(isYearly ? plan.yearly : plan.monthly)}
                    </span>
                    <span className="text-sm font-medium text-secondary-foreground">/mês</span>
                  </div>
                </div>

                <div className="h-px w-full bg-border mb-8" />

                <ul className="flex-1 space-y-4 mb-10">
                  {plan.features.map((feature: string) => (
                    <li key={feature} className="flex items-start gap-3 text-sm font-medium text-foreground/80">
                      <Check className="size-5 shrink-0 text-primary" />
                      {feature}
                    </li>
                  ))}
                </ul>

                <Button
                  onClick={(e) => {
                    e.stopPropagation();
                    setCheckoutPlan(plan.slug);
                  }}
                  className={cn(
                    "h-14 w-full rounded-full text-sm font-bold transition-all active:scale-95",
                    plan.highlighted 
                      ? "bg-primary text-primary-foreground hover:opacity-90" 
                      : "bg-secondary text-foreground hover:bg-border"
                  )}
                  variant="ghost"
                >
                  {plan.cta}
                </Button>
              </div>
            </Reveal>
          ))}
        </div>
      </div>

      <CheckoutDialog
        open={checkoutPlan !== null}
        onOpenChange={(open) => !open && setCheckoutPlan(null)}
        initialPlan={checkoutPlan as any}
        initialCycle={isYearly ? "annual" : "monthly"}
      />
    </section>
  );
}
