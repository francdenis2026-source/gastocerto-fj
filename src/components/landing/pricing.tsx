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
          className="group relative overflow-hidden rounded-[2rem] border border-[#1FAE6D]/30 bg-gradient-to-br from-[#1FAE6D] to-[#168a57] p-6 shadow-[0_20px_40px_-10px_rgba(31,174,109,0.3)] cursor-pointer active:scale-[0.98] transition-all"
          onClick={() => {
            setCheckoutPlan("premium_ia");
            setIsYearly(true);
          }}
        >
          {/* SVG Background for mobile card */}
          <div className="absolute inset-0 opacity-10 pointer-events-none">
            <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <pattern id="waves-mobile" width="100" height="20" patternUnits="userSpaceOnUse">
                  <path d="M0 10 Q 25 0 50 10 T 100 10" fill="none" stroke="white" strokeWidth="2"/>
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#waves-mobile)" />
            </svg>
          </div>

          <div className="relative z-10 flex items-center justify-between mb-4">
            <div>
              <span className="inline-block px-2 py-0.5 rounded-full bg-white/20 text-[10px] font-black uppercase tracking-wider text-white mb-2">Recomendado</span>
              <h3 className="text-xl font-black text-white leading-none">Premium+ IA</h3>
              <p className="text-[11px] text-white/70 font-bold mt-1 uppercase tracking-wider">O plano mais completo</p>
            </div>
            <div className="text-right">
              <div className="flex items-baseline justify-end gap-1">
                <span className="text-2xl font-black text-white tabular">R$ 29,00</span>
                <span className="text-[10px] text-white/50 font-bold uppercase">/mês</span>
              </div>
              <p className="text-[9px] text-white/60 font-medium">no plano anual</p>
            </div>
          </div>
          <Button 
            className="w-full bg-white text-[#1FAE6D] hover:bg-white/90 font-black h-12 rounded-xl text-xs uppercase tracking-widest shadow-lg"
          >
            Começar Agora
          </Button>
        </div>
      </div>
      {/* Foto de Fundo em Baixa Opacidade */}
      {/* Foto de Fundo - Removida para limpar o visual */}
      <div className="section-shell relative z-10">
        <Reveal className="text-center max-w-3xl mx-auto mb-12">
          <h2 className="section-title">O investimento certo para você</h2>
          <p className="mt-6 section-subtitle max-w-2xl mx-auto">Transforme sua vida financeira com planos que cabem no seu bolso e oferecem retorno imediato em organização.</p>
        </Reveal>
          
          <div className="mt-6 inline-flex items-center rounded-full border border-foreground/10 dark:border-white/10 bg-foreground/5 dark:bg-white/5 p-1">
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
                setCheckoutPlan(plan.slug);
              }}
              className={cn(
                "interactive-card relative flex flex-col rounded-[2.5rem] p-8 transition-all duration-700 overflow-hidden cursor-pointer group border-2",
                plan.slug === "free" && "bg-surface/50 dark:bg-slate-900/40 border-border dark:border-slate-700/50 hover:border-emerald-500/50 shadow-2xl",
                plan.slug === "premium" && "bg-card dark:bg-[#0A1512] border-[#1FAE6D] shadow-[0_20px_60px_-10px_rgba(31,174,109,0.5),inset_0_1px_1px_rgba(255,255,255,0.1)] scale-105 z-10",
                plan.slug === "premium_ia" && "bg-surface/50 dark:bg-slate-900/40 border-[#D4AF6A]/30 hover:border-[#D4AF6A] shadow-2xl",
                "backdrop-blur-3xl hover:translate-y-[-12px]"
              )}
              tabIndex={0}
              role="button"
              aria-label={`Plano ${plan.name}: ${plan.description}`}
            >
              {/* Subtle Noise Texture */}
              <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/asfalt-dark.png')] invert dark:invert-0" />
              
              {/* SVG Background Patterns for Visual Depth */}
              <div className="absolute inset-0 opacity-[0.05] pointer-events-none overflow-hidden">
                {plan.slug === "premium" && (
                  <div className="absolute -right-20 -top-20 size-64 bg-[#1FAE6D]/20 blur-[80px] rounded-full animate-pulse-slow" />
                )}
                {plan.slug === "premium_ia" && (
                  <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
                    <defs>
                      <linearGradient id="grad-gold" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" style={{ stopColor: '#D4AF6A', stopOpacity: 0.2 }} />
                        <stop offset="100%" style={{ stopColor: '#D4AF6A', stopOpacity: 0 }} />
                      </linearGradient>
                    </defs>
                    <rect width="100%" height="100%" fill="url(#grad-gold)" />
                  </svg>
                )}
              </div>

              {plan.highlighted && (
                <div className="absolute -top-1 left-1/2 -translate-x-1/2 rounded-b-2xl bg-[#1FAE6D] px-6 py-2 text-[10px] font-black uppercase tracking-[0.2em] text-black shadow-lg shadow-[#1FAE6D]/20">
                  Mais Recomendado
                </div>
              )}
              
              <div className="relative z-10 mb-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-2xl font-black text-foreground dark:text-white tracking-tight">{plan.name}</h3>
                  {plan.slug === "premium" && <div className="size-2 rounded-full bg-[#1FAE6D] animate-ping" />}
                </div>
                <p className={cn(
                  "mt-1 text-[11px] font-bold uppercase tracking-widest",
                   plan.slug === "free" && "text-muted-foreground",
                  plan.slug === "premium" && "text-[#1FAE6D]",
                  plan.slug === "premium_ia" && "text-[#D4AF6A]"
                )}>{plan.description}</p>
              </div>

              <div className="relative z-10 mb-8">
                <div className="flex items-baseline gap-1">
                  <span className="text-5xl font-black tracking-tighter text-foreground dark:text-white tabular">
                    {plan.monthly === 0 ? "Grátis" : formatCurrency(isYearly ? plan.yearly : plan.monthly)}
                  </span>
                  <span className="text-sm font-bold text-slate-500 uppercase tracking-wider">/mês</span>
                </div>
                {isYearly && plan.monthly > 0 && (
                  <p className="text-[10px] font-bold text-[#1FAE6D] mt-2 bg-emerald-500/10 inline-block px-2 py-0.5 rounded-md">
                    ECONOMIZE {formatCurrency((plan.monthly - plan.yearly) * 12)} /ano
                  </p>
                )}
              </div>

              <div className="h-px w-full bg-foreground/5 dark:bg-white/5 mb-8" />

              <ul className="relative z-10 flex-1 space-y-4 mb-8">
                {plan.features.map((feature: string) => (
                  <li key={feature} className="flex items-start gap-3 text-[13px] group/item">
                    <div className={cn(
                      "mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full transition-all",
                      plan.slug === "premium" ? "bg-[#1FAE6D] text-black shadow-[0_0_10px_rgba(31,174,109,0.3)]" : "bg-foreground/10 dark:bg-white/10 text-foreground/40 dark:text-white/40"
                    )}>
                      <Check className="size-3 font-bold" />
                    </div>
                    <span className="font-medium text-foreground/80 dark:text-slate-300 group-hover/item:text-foreground dark:group-hover/item:text-white transition-colors">{feature}</span>
                  </li>
                ))}
              </ul>

              <Button
                onClick={(e) => {
                  e.stopPropagation();
                  setCheckoutPlan(plan.slug);
                }}
                className={cn(
                  "relative z-10 h-14 w-full rounded-2xl text-[13px] font-black uppercase tracking-[0.2em] transition-all group overflow-hidden border-2",
                  plan.slug === "free" && "bg-foreground/5 dark:bg-white/5 text-foreground dark:text-white border-foreground/10 dark:border-white/10 hover:bg-foreground hover:text-background dark:hover:bg-white dark:hover:text-black",
                  plan.slug === "premium" && "bg-[#1FAE6D] text-black border-[#1FAE6D] hover:bg-[#168a57] hover:border-[#168a57] shadow-xl shadow-[#1FAE6D]/20",
                  plan.slug === "premium_ia" && "bg-transparent text-[#D4AF6A] border-[#D4AF6A]/40 hover:bg-[#D4AF6A] hover:text-black dark:hover:text-black",
                )}
                variant="ghost"
              >
                <span className="relative z-10 flex items-center justify-center gap-2">
                  {plan.slug === "free" ? "Começar Agora" : "Assinar Agora"}
                  <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
                </span>
                {plan.highlighted && (
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full animate-[shimmer_3s_infinite] pointer-events-none" />
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
