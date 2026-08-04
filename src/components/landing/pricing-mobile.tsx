import { Check, Sparkles } from "lucide-react";
import { useState } from "react";

import { CheckoutDialog } from "@/components/landing/checkout-dialog";
import { basePlans } from "@/components/landing/pricing";
import { Button } from "@/components/ui/button";
import { usePublicPlans, livePrice } from "@/hooks/use-public-plans";
import { annualMonthlyEquivalent } from "@/lib/plan-pricing";
import { formatCurrency } from "@/lib/format";
import { cn } from "@/lib/utils";

type Slug = "free" | "premium" | "premium_ia";

/**
 * Bloco de planos da versão mobile: um único cartão compacto com seletor de plano,
 * evitando três cards enormes ocupando toda a tela.
 */
export function PricingMobile() {
  const { data: livePlans } = usePublicPlans();
  const plans = basePlans.map((plan) => {
    if (plan.monthly === 0) return plan;
    const live = livePrice(livePlans, plan.slug, { monthly: plan.monthly, annual: plan.yearly * 12 });
    return { ...plan, monthly: live.monthly, yearly: annualMonthlyEquivalent(live.annual) };
  });

  const [slug, setSlug] = useState<Slug>("premium_ia");
  const [yearly, setYearly] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);

  const plan = plans.find((item) => item.slug === slug) ?? plans[0]!;
  const price = yearly ? plan.yearly : plan.monthly;

  return (
    <section id="planos" className="px-4 py-7 md:hidden">
      <div className="flex items-end justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-brand">Planos</p>
          <h2 className="mt-0.5 text-lg font-extrabold tracking-tight">Escolha seu controle</h2>
        </div>
        <div
          role="group"
          aria-label="Ciclo de cobrança"
          className="inline-flex shrink-0 items-center rounded-full border border-border bg-card/80 p-0.5"
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
                "min-h-7 rounded-full px-2.5 text-[10px] font-bold transition-colors",
                yearly === option.key ? "bg-brand text-brand-foreground" : "text-muted-foreground",
              )}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-3 rounded-2xl border border-border bg-card/85 p-3 shadow-soft backdrop-blur-sm">
        <div className="mb-2.5 px-1">
          <p className="text-[10px] font-medium leading-tight text-muted-foreground/80">
            {slug === "free" && "Recursos básicos para controle essencial."}
            {slug === "premium" && "Tudo liberado, veículos e suporte prioritário."}
            {slug === "premium_ia" && "Consultor financeiro com IA para análise avançada."}
          </p>
        </div>
        <div role="tablist" aria-label="Planos" className="grid grid-cols-3 gap-1 rounded-xl bg-muted/50 p-1">
          {plans.map((item) => (
            <button
              key={item.slug}
              role="tab"
              type="button"
              aria-selected={slug === item.slug}
              onClick={() => setSlug(item.slug as Slug)}
              className={cn(
                "min-h-8 truncate rounded-lg px-1 text-[11px] font-bold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                slug === item.slug
                  ? "bg-card text-foreground shadow-soft"
                  : "text-muted-foreground",
              )}
            >
              {item.name.replace("Premium IA", "Prem. IA")}
            </button>
          ))}
        </div>

        <div className="mt-3 flex items-end justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[11px] font-medium text-muted-foreground">{plan.description}</p>
          </div>
          <p className="tabular shrink-0 text-right text-2xl font-extrabold leading-none tracking-tight">
            {price === 0 ? "R$ 0" : formatCurrency(price)}
            <span className="ml-1 text-[10px] font-semibold text-muted-foreground">/mês</span>
          </p>
        </div>

        <ul className="mt-3 space-y-1.5 border-t border-border/60 pt-3">
          {plan.features.slice(0, 3).map((feature) => (
            <li key={feature} className="flex items-start gap-2 text-[12px] leading-snug">
              <Check className="mt-[2px] size-3.5 shrink-0 text-success" aria-hidden="true" />
              <span className="text-muted-foreground">{feature}</span>
            </li>
          ))}
        </ul>

        <Button
          className={cn(
            "mt-3 h-12 w-full rounded-xl text-[14px] font-black shadow-soft transition-all active:scale-[0.97]",
            plan.highlighted
              ? "bg-brand text-brand-foreground hover:bg-brand/90 shadow-lg shadow-brand/20 border-none"
              : "border-2 border-brand/20 bg-card text-brand hover:bg-brand/[0.02]"
          )}
          onClick={() => setCheckoutOpen(true)}
          variant={plan.highlighted ? "default" : "outline"}
        >
          {plan.highlighted ? <Sparkles className="mr-1.5 size-4 animate-pulse" aria-hidden="true" /> : null}
          {plan.cta}
        </Button>
        <p className="mt-2 text-center text-[10px] font-medium text-muted-foreground">
          Sem fidelidade · cancele quando quiser
        </p>
      </div>

      <CheckoutDialog
        open={checkoutOpen}
        onOpenChange={setCheckoutOpen}
        initialPlan={slug}
        initialCycle={yearly ? "annual" : "monthly"}
      />
    </section>
  );
}
