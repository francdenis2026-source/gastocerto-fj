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

  useEffect(() => {
    const section = document.getElementById("planos");
    if (section) {
      // Logic for anchor visibility if needed
    }
  }, []);

  return (
    <section id="planos" className="section-y relative overflow-hidden md:block">
      <div className="md:hidden section-shell mb-8">
        <div 
          className="rounded-[1.5rem] border border-white/5 p-6 shadow-2xl backdrop-blur-md bg-white/[0.03] cursor-pointer hover:bg-white/[0.05] transition-all"
          onClick={() => {
            setCheckoutPlan("premium_ia");
            setIsYearly(true);
          }}
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-xl font-bold">Premium+ IA</h3>
              <p className="text-xs text-muted-foreground">O plano mais completo</p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold">R$ 29,00</p>
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
        </div>

        <div className="grid gap-4 md:grid-cols-3 lg:max-w-6xl lg:mx-auto">
          {basePlans.map((plan: PricingPlan) => (
            <div
              key={plan.slug}
              onClick={() => {
                console.log("Card clicked, setting plan to:", plan.slug);
                setCheckoutPlan(plan.slug);
              }}
              className={cn(
                "interactive-card relative flex flex-col rounded-[2.5rem] p-8 transition-all duration-700 overflow-hidden cursor-pointer group",
                plan.slug === "free" && "bg-gradient-to-br from-emerald-950/40 to-emerald-900/10 border-emerald-500/20 shadow-[0_20px_40px_-15px_rgba(31,174,109,0.1)]",
                plan.slug === "premium" && "bg-gradient-to-br from-blue-950/40 to-indigo-900/10 border-blue-500/30 ring-1 ring-blue-500/20 shadow-[0_30px_60px_-15px_rgba(59,130,246,0.2)] scale-105 z-10",
                plan.slug === "premium_ia" && "bg-gradient-to-br from-amber-950/40 to-yellow-900/10 border-amber-500/30 shadow-[0_20px_40px_-15px_rgba(212,175,106,0.15)]",
                "backdrop-blur-2xl hover:translate-y-[-8px]"
              )}
              tabIndex={0}
              role="button"
              aria-label={`Plano ${plan.name}: ${plan.description}`}
            >

              {plan.highlighted && (
                <div className="absolute -top-1 left-1/2 -translate-x-1/2 rounded-b-2xl bg-blue-500 px-6 py-1.5 text-[10px] font-black uppercase tracking-[0.2em] text-white shadow-[0_10px_30px_rgba(59,130,246,0.4)]">
                  Mais Escolhido
                </div>
              )}
              
              <div className="relative z-10 mb-6">
                <h3 className="text-2xl font-black text-white tracking-tight">{plan.name}</h3>
                <p className="mt-1 text-[11px] font-bold text-emerald-500/60 uppercase tracking-widest">{plan.description}</p>
              </div>

              <div className="relative z-10 mb-8">
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-black tracking-tighter text-white tabular">
                    {plan.monthly === 0 ? "Livre" : formatCurrency(isYearly ? plan.yearly : plan.monthly)}
                  </span>
                  <span className="text-xs font-bold text-white/40 uppercase tracking-wider">/mês</span>
                </div>
              </div>

              <ul className="relative z-10 flex-1 space-y-3 mb-8">
                {plan.features.map((feature: string) => (
                  <li key={feature} className="flex items-start gap-3 text-[13px] group/item">
                    <div className={cn(
                      "mt-1 flex size-5 shrink-0 items-center justify-center rounded-full transition-colors",
                      plan.slug === "free" && "bg-emerald-500/20 text-emerald-500 group-hover/item:bg-emerald-500 group-hover/item:text-black",
                      plan.slug === "premium" && "bg-blue-500/20 text-blue-400 group-hover/item:bg-blue-500 group-hover/item:text-white",
                      plan.slug === "premium_ia" && "bg-amber-500/20 text-amber-500 group-hover/item:bg-amber-500 group-hover/item:text-black"
                    )}>
                      <Check className="size-3 font-bold" />
                    </div>
                    <span className="font-medium text-white/70 group-hover/item:text-white transition-colors">{feature}</span>
                  </li>
                ))}
              </ul>

              <Button
                onClick={(e) => {
                  e.stopPropagation();
                  console.log("Button clicked, setting plan to:", plan.slug);
                  setCheckoutPlan(plan.slug);
                }}
                className={cn(
                  "relative z-10 cta-lift h-14 w-full rounded-2xl text-[13px] font-black uppercase tracking-[0.15em] transition-all group overflow-hidden",
                  plan.slug === "free" && "bg-emerald-500/10 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500 hover:text-black",
                  plan.slug === "premium" && "bg-blue-500 text-white hover:bg-blue-400 shadow-[0_20px_40px_-10px_rgba(59,130,246,0.5)]",
                  plan.slug === "premium_ia" && "bg-amber-500/10 text-amber-400 border-amber-500/30 hover:bg-amber-500 hover:text-black",
                )}
                variant="ghost"
              >
                <span className="relative z-10 flex items-center justify-center">
                  {plan.cta}
                  <ArrowRight className="ml-2 size-4 transition-transform group-hover:translate-x-1" />
                </span>
                {plan.highlighted && (
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full animate-[shimmer_2s_infinite] pointer-events-none" />
                )}
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
