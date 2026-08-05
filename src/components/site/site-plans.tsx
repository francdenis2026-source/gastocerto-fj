import { useState } from "react";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CheckoutDialog } from "@/components/landing/checkout-dialog";
import { livePrice, usePublicPlans } from "@/hooks/use-public-plans";
import { cn } from "@/lib/utils";
import { Appear } from "./appear";

type Cycle = "monthly" | "annual";

const catalog = [
  {
    slug: "free" as const,
    name: "Essencial",
    pitch: "Para começar a organizar hoje mesmo",
    fallback: { monthly: 0, annual: 0 },
    features: [
      "Lançamentos ilimitados",
      "Contas fixas e vencimentos",
      "Relatório mensal",
      "14 dias de teste dos recursos pagos",
    ],
  },
  {
    slug: "premium" as const,
    name: "Premium",
    pitch: "O controle completo da casa",
    fallback: { monthly: 19.9, annual: 199 },
    featured: true,
    features: [
      "Tudo do Essencial",
      "Cartões, parcelas e faturas",
      "Combustível, veículos e gás",
      "Balanço anual e exportação",
      "Fechamento de mês com senha",
    ],
  },
  {
    slug: "premium_ia" as const,
    name: "Família",
    pitch: "Para quem cuida de mais gente",
    fallback: { monthly: 29.9, annual: 299 },
    features: [
      "Tudo do Premium",
      "Espaço Kids com mesada",
      "Múltiplas contas na mesma casa",
      "Análise inteligente dos gastos",
      "Compartilhamento protegido",
    ],
  },
];

function money(value: number) {
  if (value === 0) return "Grátis";
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export function SitePlans() {
  const [cycle, setCycle] = useState<Cycle>("annual");
  const [checkout, setCheckout] = useState<(typeof catalog)[number]["slug"] | null>(null);
  const { data: plans } = usePublicPlans();

  return (
    <section id="planos" className="band border-t border-border bg-navy-700">
      <div className="shell">
        <Appear className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-xl">
            <p className="kicker">Planos</p>
            <h2 className="mt-5 font-display text-[clamp(1.9rem,3.6vw,2.7rem)] font-semibold leading-[1.1] text-bone-100">
              Preço honesto, sem pegadinha
            </h2>
            <p className="mt-5 text-[16px] leading-relaxed text-bone-100/50">
              Cancele quando quiser. Seus dados continuam seus, exportáveis a qualquer momento.
            </p>
          </div>

          <div className="inline-flex shrink-0 rounded-full border border-border p-1">
            {(["monthly", "annual"] as Cycle[]).map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => setCycle(option)}
                aria-pressed={cycle === option}
                className={cn(
                  "rounded-full px-5 py-2 text-[13px] font-semibold transition-colors duration-200",
                  cycle === option
                    ? "bg-primary text-primary-foreground"
                    : "text-bone-100/55 hover:text-bone-100",
                )}
              >
                {option === "monthly" ? "Mensal" : "Anual · 2 meses grátis"}
              </button>
            ))}
          </div>
        </Appear>

        <div className="mt-14 grid gap-6 lg:grid-cols-3">
          {catalog.map((plan, i) => {
            const price = livePrice(plans, plan.slug, plan.fallback);
            const amount = cycle === "annual" ? price.annual : price.monthly;

            return (
              <Appear key={plan.slug} delay={i * 60}>
                <div
                  className={cn(
                    "lift flex h-full flex-col rounded-2xl border p-8",
                    plan.featured
                      ? "border-primary/45 bg-navy-600"
                      : "border-border bg-navy-800",
                  )}
                >
                  <div className="flex items-center justify-between">
                    <h3 className="font-display text-[18px] font-semibold text-bone-100">
                      {plan.name}
                    </h3>
                    {plan.featured && (
                      <span className="rounded-full bg-primary/15 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-brand-300">
                        Mais escolhido
                      </span>
                    )}
                  </div>
                  <p className="mt-2 text-[13px] text-bone-100/45">{plan.pitch}</p>

                  <div className="mt-8 flex items-baseline gap-1.5">
                    <span className="numeric text-[34px] font-semibold text-bone-100">
                      {money(amount)}
                    </span>
                    {amount > 0 && (
                      <span className="text-[13px] text-bone-100/40">
                        /{cycle === "annual" ? "ano" : "mês"}
                      </span>
                    )}
                  </div>

                  <ul className="mt-8 flex-1 space-y-3.5">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex gap-3 text-[14px] text-bone-100/60">
                        <Check className="mt-0.5 size-4 shrink-0 text-primary" strokeWidth={2.25} />
                        {feature}
                      </li>
                    ))}
                  </ul>

                  <Button
                    onClick={() => setCheckout(plan.slug)}
                    className={cn(
                      "mt-9 h-12 w-full rounded-full text-[14px] font-semibold",
                      plan.featured
                        ? "bg-primary text-primary-foreground hover:bg-brand-400"
                        : "border border-border bg-transparent text-bone-100 hover:bg-navy-600",
                    )}
                  >
                    {plan.slug === "free" ? "Começar grátis" : `Assinar ${plan.name}`}
                  </Button>
                </div>
              </Appear>
            );
          })}
        </div>
      </div>

      <CheckoutDialog
        open={checkout !== null}
        onOpenChange={(open) => !open && setCheckout(null)}
        initialPlan={checkout ?? undefined}
        initialCycle={cycle}
      />
    </section>
  );
}
