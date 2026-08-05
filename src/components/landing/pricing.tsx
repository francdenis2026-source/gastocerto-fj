import { Link } from "@tanstack/react-router";
import { Check, ArrowRight } from "lucide-react";
import { useState, useEffect } from "react";
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
    description: "Ideal para começar.",
    cta: "Detalhes do Plano",
    highlighted: false,
    features: [
      "14 dias de acesso total",
      "Cancelamento a qualquer momento",
      "Até 30 lançamentos/mês",
      "Painel de gastos mensal",
      "1 Veículo",
    ],
  },
  {
    slug: "premium",
    name: "Premium",
    monthly: 24.90,
    yearly: 20.75,
    description: "Controle total da família.",
    cta: "Detalhes do Plano",
    highlighted: true,
    features: [
      "Lançamentos ilimitados",
      "Múltiplos veículos",
      "Exportação PDF/CSV",
      "Gestão de cartões e gás",
      "Suporte prioritário",
    ],
  },
  {
    slug: "premium_ia",
    name: "Premium+",
    monthly: 34.90,
    yearly: 29.00,
    description: "Inteligência financeira.",
    cta: "Detalhes do Plano",
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
    <section id="planos" className="section-y relative overflow-hidden">
      <div className="section-shell relative z-10">
        <Reveal className="text-center max-w-3xl mx-auto mb-12">
          <h2 className="section-title">O investimento certo para você</h2>
          <p className="mt-6 section-subtitle max-w-2xl mx-auto">Transforme sua vida financeira com planos que cabem no seu bolso e oferecem retorno imediato em organização.</p>
          
          <div className="mt-10 inline-flex items-center rounded-full border border-foreground/10 dark:border-white/10 bg-foreground/5 dark:bg-white/5 p-1">
            <button
              onClick={() => setIsYearly(false)}
              className={cn(
                "rounded-full px-6 py-2 text-xs font-bold transition-all active:scale-95",
                !isYearly ? "bg-emerald-500 text-[#0A1512]" : "text-muted-foreground"
              )}
            >
              Mensal
            </button>
            <button
              onClick={() => setIsYearly(true)}
              className={cn(
                "flex items-center gap-1.5 rounded-full px-6 py-2 text-xs font-bold transition-all active:scale-95",
                isYearly ? "bg-emerald-500 text-[#0A1512]" : "text-muted-foreground"
              )}
            >
              Anual
              <span className={cn(
                "rounded-full px-1.5 py-0.5 text-[9px] font-bold",
                isYearly ? "bg-black/20 text-[#0A1512]" : "bg-emerald-500/20 text-emerald-500"
              )}>
                2 MESES GRÁTIS
              </span>
            </button>
          </div>
        </Reveal>

         <div className="grid gap-8 md:grid-cols-3 lg:max-w-7xl lg:mx-auto">
           {basePlans.map((plan: PricingPlan) => (
             <div
               key={plan.slug}
               onClick={() => setCheckoutPlan(plan.slug)}
               className={cn(
                 "interactive-card flex flex-col rounded-[2rem] p-8 border border-border bg-card transition-all duration-300",
                 plan.highlighted && "border-primary ring-1 ring-primary/20 scale-105 z-10 shadow-xl shadow-primary/5",
                 !plan.highlighted && "hover:border-primary/50 shadow-sm"
               )}
               tabIndex={0}
               role="button"
               aria-label={`Plano ${plan.name}: ${plan.description}`}
             >
               {plan.highlighted && (
                 <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-primary px-4 py-1 text-[10px] font-bold uppercase tracking-wider text-primary-foreground shadow-sm">
                   Recomendado
                 </div>
               )}
               
               <div className="mb-8">
                 <h3 className="text-xl font-bold text-foreground">{plan.name}</h3>
                 <p className="mt-1 text-sm font-medium text-secondary-foreground">{plan.description}</p>
               </div>
 
               <div className="mb-8">
                 <div className="flex items-baseline gap-1">
                   <span className="text-4xl font-extrabold tracking-tight text-foreground tabular">
                     {plan.monthly === 0 ? "Grátis" : formatCurrency(isYearly ? plan.yearly : plan.monthly)}
                   </span>
                   <span className="text-sm font-medium text-secondary-foreground">/mês</span>
                 </div>
                 {isYearly && plan.monthly > 0 && (
                   <p className="mt-2 text-xs font-semibold text-primary">
                     Economize {formatCurrency((plan.monthly - plan.yearly) * 12)} por ano
                   </p>
                 )}
               </div>
 
               <div className="h-px w-full bg-border mb-8" />
 
               <ul className="flex-1 space-y-4 mb-8">
                 {plan.features.map((feature: string) => (
                   <li key={feature} className="flex items-start gap-3 text-sm">
                     <div className={cn(
                       "mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full",
                       plan.highlighted ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground"
                     )}>
                       <Check className="size-3" />
                     </div>
                     <span className="font-medium text-foreground/90">{feature}</span>
                   </li>
                 ))}
               </ul>
 
               <Button
                 onClick={(e) => {
                   e.stopPropagation();
                   setCheckoutPlan(plan.slug);
                 }}
                 className={cn(
                   "h-12 w-full rounded-full text-sm font-semibold transition-all active:scale-95",
                   plan.highlighted 
                     ? "bg-primary text-primary-foreground hover:opacity-90" 
                     : "bg-secondary text-foreground hover:bg-border"
                 )}
                 variant="ghost"
               >
                 {plan.slug === "free" ? "Começar Agora" : "Assinar Agora"}
               </Button>
             </div>
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
