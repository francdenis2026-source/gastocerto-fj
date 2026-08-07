import { Check, Sparkles } from "lucide-react";
import { useState, useEffect } from "react";
import { Link } from "@tanstack/react-router";

import { CheckoutDialog } from "@/components/landing/checkout-dialog";
import { basePlans, type PricingPlan } from "@/components/landing/pricing";
import { Button } from "@/components/ui/button";
import { usePublicPlans, livePrice } from "@/hooks/use-public-plans";
import { annualMonthlyEquivalent } from "@/lib/plan-pricing";
import { formatCurrency } from "@/lib/format-utils";
import { cn } from "@/lib/utils";

type Slug = "free" | "premium" | "premium_ia";

/**
 * Bloco de planos da versão mobile: Redesenhado para padrão Premium.
 */
export function PricingMobile() {
  const plans = basePlans; // Simplificado para evitar dependências circulares ou ganchos ausentes

  const [slug, setSlug] = useState<Slug>("premium_ia");
  const [yearly, setYearly] = useState(true);
  const [checkoutOpen, setCheckoutOpen] = useState(false);

  const plan = plans.find((item: PricingPlan) => item.slug === slug) ?? plans[0]!;
  const price = yearly ? plan.yearly : plan.monthly;

  return (
    <section id="planos-mobile" className="section-y md:hidden border-t border-white/5 relative">

      {/* Foto de Fundo em Baixa Opacidade */}
      <div
        aria-hidden="true"
        className="absolute inset-0 pointer-events-none -z-10 bg-[radial-gradient(120%_80%_at_50%_0%,color-mix(in_oklab,var(--primary)_16%,transparent),transparent_70%)]"
      />
      <div className="relative z-10">
      <div className="flex flex-col gap-4 mb-8">
        <div className="min-w-0">
          <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-brand">Planos</p>
          <h2 className="mt-1 text-2xl font-extrabold tracking-tight">O nível ideal para você</h2>
        </div>
        
        <div
          role="group"
          aria-label="Ciclo de cobrança"
          className="inline-flex w-fit items-center rounded-full border border-white/5 bg-white/[0.03] p-0.5"
        >
          {[
            { key: false, label: "Mensal" },
            { key: true, label: "Anual" },
          ].map((option) => (
            <button
              key={String(option.key)}
              type="button"
              aria-pressed={yearly === option.key}
              onClick={() => setYearly(option.key)}
              className={cn(
                "min-h-9 rounded-full px-5 text-xs font-bold transition-all",
                yearly === option.key ? "bg-brand text-brand-foreground shadow-lg" : "text-muted-foreground",
              )}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      <div className="rounded-[1.5rem] border border-white/5 p-5 shadow-2xl backdrop-blur-md">
        <div role="tablist" aria-label="Planos" className="grid grid-cols-3 gap-1 rounded-2xl bg-white/[0.03] p-1 mb-6">
          {plans.map((item: PricingPlan) => (
            <button
              key={item.slug}
              role="tab"
              type="button"
              aria-selected={slug === item.slug}
              onClick={() => setSlug(item.slug as Slug)}
              className={cn(
                "min-h-10 truncate rounded-xl px-2 text-xs font-bold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand",
                slug === item.slug
                  ? "bg-brand text-brand-foreground shadow-lg"
                  : "text-muted-foreground",
              )}
            >
              {item.name.replace("Premium IA", "IA")}
            </button>
          ))}
        </div>

        <div className="flex items-center justify-between mb-6">
          <div className="min-w-0 flex-1">
            <h3 className="text-xl font-black">{plan.name}</h3>
            <p className="text-xs text-muted-foreground mt-1 line-clamp-1">{plan.desc}</p>
          </div>
          <div className="shrink-0 text-right ml-4">
            <p className="tabular text-2xl font-black tracking-tight">
              {price === 0 ? "R$ 0" : formatCurrency(price)}
            </p>
            <p className="text-[10px] font-bold text-muted-foreground">/mês</p>
          </div>
        </div>

        <ul className="space-y-3 mb-8 border-t border-white/5 pt-6">
          {plan.features.map((feature: string) => (
            <li key={feature} className="flex items-start gap-3 text-sm">
              <Check className="mt-0.5 size-4 shrink-0 text-brand" aria-hidden="true" />
              <span className="text-muted-foreground">{feature}</span>
            </li>
          ))}
        </ul>

        <Button
          className={cn(
            "h-12 w-full rounded-xl text-sm font-bold shadow-xl transition-all active:scale-[0.97]",
            plan.highlight
              ? "bg-brand text-brand-foreground shadow-brand/20 border-none"
              : "border border-white/10 bg-white/5 text-white"
          )}
          onClick={() => setCheckoutOpen(true)}
          variant={plan.highlight ? "default" : "outline"}
        >
          {plan.highlight ? <Sparkles className="mr-2 size-4" aria-hidden="true" /> : null}
          {plan.cta}
        </Button>
        <p className="mt-4 text-center text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">
          Cancele quando quiser
        </p>
      </div>

      <CheckoutDialog
        open={checkoutOpen}
        onOpenChange={setCheckoutOpen}
        initialPlan={slug}
        initialCycle={yearly ? "annual" : "monthly"}
      />
      </div>
    </section>
  );
}
