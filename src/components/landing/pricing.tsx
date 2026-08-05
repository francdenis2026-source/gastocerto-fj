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
    cta: "Começar Gratuitamente",
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
    cta: "Ativar Plano Premium",
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
    cta: "Ativar Premium+ IA",
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
    <section id="planos" className="section-y relative overflow-hidden md:block">
      <div className="md:hidden section-shell mb-8">
        <div className="rounded-[1.5rem] border border-white/5 p-6 shadow-2xl backdrop-blur-md bg-white/[0.03]">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-xl font-bold">Premium+ IA</h3>
              <p className="text-xs text-muted-foreground">O plano mais completo</p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-black">R$ 29,00</p>
              <p className="text-[10px] text-muted-foreground">/mês no anual</p>
            </div>
          </div>
          <Button 
            className="w-full bg-emerald-500 text-black font-bold h-12 rounded-xl"
            onClick={() => {
              setCheckoutPlan("premium_ia");
              setIsYearly(true);
            }}
          >
            Assinar Plano IA
          </Button>
        </div>
      </div>
      {/* Foto de Fundo em Baixa Opacidade */}
      {/* Foto de Fundo - Removida para limpar o visual */}
      <div className="section-shell relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-10">
          <h2 className="section-title">Planos e Preços</h2>
          <p className="mt-6 section-subtitle max-w-2xl mx-auto">Escolha a melhor opção para transformar sua gestão financeira hoje mesmo.</p>
          
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

        <div className="grid gap-4 md:grid-cols-3 lg:max-w-6xl lg:mx-auto">
          {basePlans.map((plan: PricingPlan) => (
            <div
              key={plan.slug}
              className={cn(
                "interactive-card relative flex flex-col rounded-[1.5rem] p-7 transition-all duration-400",
                "bg-white/[0.03] border border-white/[0.08] shadow-xl backdrop-blur-md",
                plan.highlighted 
                  ? "shadow-[0_32px_64px_-16px_rgba(31,174,109,0.15)] border-[#1FAE6D]/30 bg-[#1FAE6D]/[0.02] scale-[1.02] z-10" 
                  : ""
              )}
              tabIndex={0}
              role="button"
              aria-label={`Plano ${plan.name}: ${plan.description}`}
            >
              {plan.highlighted && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-emerald-500 px-3 py-1 text-[9px] font-black uppercase tracking-widest text-[#0A1512] shadow-[0_0_15px_rgba(31,174,109,0.4)] animate-pulse">
                  Mais Popular
                </div>
              )}
              
              <div className="mb-5">
                <h3 className="text-2xl font-black text-white tracking-tight">{plan.name}</h3>
                <p className="mt-3 body-text !text-[14px] !font-medium opacity-60">{plan.description}</p>
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
                  <li key={feature} className="flex items-start gap-3 text-[14px] leading-snug">
                    <Check className="size-4 shrink-0 text-emerald-500 mt-0.5" />
                    <span className="body-text !text-white/90 !font-medium">{feature}</span>
                  </li>
                ))}
              </ul>

              <Button
                onClick={() => setCheckoutPlan(plan.slug)}
                className={cn(
                  "cta-lift h-14 w-full rounded-2xl text-[14px] font-black uppercase tracking-wider transition-all group",
                  plan.highlighted
                    ? "bg-[#1FAE6D] text-black hover:bg-[#24c77d] shadow-[0_15px_30px_-10px_rgba(31,174,109,0.4)]"
                    : "border-white/10 bg-white/5 text-white hover:bg-white/10 hover:border-white/20"
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
