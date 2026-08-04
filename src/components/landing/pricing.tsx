import { Link } from "@tanstack/react-router";
import { Check } from "lucide-react";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/format";
import { cn } from "@/lib/utils";
import { CheckoutDialog } from "@/components/landing/checkout-dialog";
import { handleAnchorClick } from "@/lib/scroll";

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
    cta: "Começar Agora",
    highlighted: false,
    features: [
      "Até 30 lançamentos/mês",
      "Painel de gastos mensal",
      "1 Veículo",
      "Categorias ilimitadas",
    ],
  },
  {
    slug: "premium",
    name: "Premium",
    monthly: 24.90,
    yearly: 20.75,
    description: "Controle total da família.",
    cta: "Assinar Premium",
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
    cta: "Assinar Premium+",
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

  useEffect(() => {
    const section = document.getElementById("planos");
    if (section) {
      // Logic for anchor visibility if needed
    }
  }, []);

  return (
    <section id="planos" className="section-y bg-background relative overflow-hidden border-t border-white/5">
      <div className="section-shell">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="section-title">Planos objetivos e transparentes</h2>
          <p className="mt-4 text-muted-foreground">Escolha o nível de controle que você precisa.</p>
          
          <div className="mt-8 inline-flex items-center rounded-full border border-white/10 bg-white/5 p-1">
            <button
              onClick={() => setIsYearly(false)}
              className={cn(
                "rounded-full px-6 py-2 text-xs font-bold transition-all",
                !isYearly ? "bg-emerald-500 text-black" : "text-muted-foreground"
              )}
            >
              Mensal
            </button>
            <button
              onClick={() => setIsYearly(true)}
              className={cn(
                "flex items-center gap-1.5 rounded-full px-6 py-2 text-xs font-bold transition-all",
                isYearly ? "bg-emerald-500 text-black" : "text-muted-foreground"
              )}
            >
              Anual
              <span className={cn(
                "rounded-full px-1.5 py-0.5 text-[9px] font-black",
                isYearly ? "bg-black/20 text-black" : "bg-emerald-500/20 text-emerald-500"
              )}>
                2 MESES GRÁTIS
              </span>
            </button>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-3 lg:max-w-5xl lg:mx-auto">
          {basePlans.map((plan: PricingPlan) => (
            <div
              key={plan.slug}
              className={cn(
                "relative flex flex-col rounded-[2rem] border p-8 transition-all hover:-translate-y-1",
                plan.highlighted 
                  ? "border-emerald-500/50 bg-emerald-500/[0.02] shadow-[0_20px_50px_-12px_rgba(34,197,94,0.1)]" 
                  : "border-white/5 bg-white/[0.01]"
              )}
            >
              {plan.highlighted && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-emerald-500 px-4 py-1 text-[10px] font-black uppercase tracking-widest text-black">
                  Mais Popular
                </div>
              )}
              
              <div className="mb-6">
                <h3 className="text-xl font-bold text-white">{plan.name}</h3>
                <p className="mt-1 text-xs text-muted-foreground">{plan.description}</p>
              </div>

              <div className="mb-8">
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-black tracking-tight text-white tabular">
                    {plan.monthly === 0 ? "R$ 0" : formatCurrency(isYearly ? plan.yearly : plan.monthly)}
                  </span>
                  <span className="text-sm font-medium text-muted-foreground">/mês</span>
                </div>
              </div>

              <ul className="flex-1 space-y-4 mb-8">
                {plan.features.map((feature: string) => (
                  <li key={feature} className="flex items-start gap-3 text-sm">
                    <Check className="size-4 shrink-0 text-emerald-500" />
                    <span className="text-white/80">{feature}</span>
                  </li>
                ))}
              </ul>

              <Button
                onClick={() => setCheckoutPlan(plan.slug)}
                className={cn(
                  "h-12 w-full rounded-xl text-sm font-bold transition-all active:scale-[0.98]",
                  plan.highlighted
                    ? "bg-emerald-500 text-black hover:bg-emerald-400"
                    : "border-white/10 bg-white/5 text-white hover:bg-white/10"
                )}
                variant={plan.highlighted ? "default" : "outline"}
              >
                {plan.cta}
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
