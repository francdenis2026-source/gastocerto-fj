import { Link } from "@tanstack/react-router";
import { Check, ArrowRight } from "lucide-react";
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
    <section id="planos" className="section-y relative overflow-hidden border-t border-border/5">
      {/* Foto de Fundo em Baixa Opacidade */}
      <img 
        src="https://images.unsplash.com/photo-1554224154-7626155e82b1?q=80&w=2070&auto=format&fit=crop" 
        alt="" 
        className="absolute inset-0 h-full w-full object-cover opacity-40 grayscale-0 pointer-events-none"
      />
      <div className="section-shell relative z-10">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <h2 className="section-title">Investimento em liberdade</h2>
          <p className="mt-3 text-sm text-muted-foreground">Estruturas de custo escaláveis para sua gestão.</p>
          
          <div className="mt-6 inline-flex items-center rounded-full border border-white/10 bg-white/5 p-1">
            <button
              onClick={() => setIsYearly(false)}
              className={cn(
                "rounded-full px-6 py-2 text-xs font-bold transition-all",
                !isYearly ? "bg-emerald-500 text-[#0A1512]" : "text-muted-foreground"
              )}
            >
              Mensal
            </button>
            <button
              onClick={() => setIsYearly(true)}
              className={cn(
                "flex items-center gap-1.5 rounded-full px-6 py-2 text-xs font-bold transition-all",
                isYearly ? "bg-emerald-500 text-[#0A1512]" : "text-muted-foreground"
              )}
            >
              Anual
              <span className={cn(
                "rounded-full px-1.5 py-0.5 text-[9px] font-black",
                isYearly ? "bg-black/20 text-[#0A1512]" : "bg-emerald-500/20 text-emerald-500"
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
                "relative flex flex-col rounded-[1.5rem] p-6 transition-all duration-300 border border-border/10",
                "hover:-translate-y-1 hover:shadow-2xl hover:border-white/20",
                plan.highlighted 
                  ? "border-emerald-500/40 shadow-[0_20px_50px_-12px_rgba(31,174,109,0.15)] ring-1 ring-emerald-500/20" 
                  : "border-white/10"

              )}
            >
              {plan.highlighted && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-emerald-500 px-3 py-1 text-[9px] font-black uppercase tracking-widest text-[#0A1512] shadow-[0_0_15px_rgba(31,174,109,0.4)] animate-pulse">
                  Mais Popular
                </div>
              )}
              
              <div className="mb-5">
                <h3 className="text-xl font-bold text-white">{plan.name}</h3>
                <p className="mt-1 text-xs text-muted-foreground">{plan.description}</p>
              </div>

              <div className="mb-4">
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-black tracking-tight text-white tabular">
                    {plan.monthly === 0 ? "Grátis" : formatCurrency(isYearly ? plan.yearly : plan.monthly)}
                  </span>
                  <span className="text-sm font-medium text-muted-foreground">/mês</span>
                </div>
              </div>

              <ul className="flex-1 space-y-2.5 mb-6">
                {plan.features.map((feature: string) => (
                  <li key={feature} className="flex items-start gap-3 text-[13px]">
                    <Check className="size-4 shrink-0 text-emerald-500 mt-0.5" />
                    <span className="text-white/80">{feature}</span>
                  </li>
                ))}
              </ul>

              <Button
                onClick={() => setCheckoutPlan(plan.slug)}
                className={cn(
                  "h-11 w-full rounded-lg text-[13px] font-bold transition-all active:scale-[0.98] group",
                  plan.highlighted
                    ? "bg-emerald-500 text-[#0A1512] hover:bg-emerald-400 shadow-[0_4px_15px_-5px_rgba(31,174,109,0.4)]"
                    : "border-white/10 bg-white/5 text-white hover:bg-white/10"
                )}
                variant={plan.highlighted ? "default" : "outline"}
              >
                {plan.cta}
                <ArrowRight className="ml-2 size-4 opacity-0 -translate-x-2 transition-all group-hover:opacity-100 group-hover:translate-x-0" />
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
