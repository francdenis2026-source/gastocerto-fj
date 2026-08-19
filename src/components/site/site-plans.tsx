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
    name: "Gratuito",
    pitch: "Para começar",
    features: ["Até 50 lançamentos/mês", "Categorias básicas", "Relatórios simples", "Acesso mobile"],
  },
  {
    slug: "premium" as const,
    name: "Pro",
    pitch: "Controle completo",
    featured: true,
    features: ["Lançamentos ilimitados", "Contas e cartões ilimitados", "Análise de combustível/gás", "Balanço anual", "Exportação CSV/PDF", "Suporte prioritário"],
  },
  {
    slug: "premium_ia" as const,
    name: "Elite",
    pitch: "Recursos avançados",
    features: ["Tudo do plano Pro", "IA Consultora Financeira", "Espaço Kids ilimitado", "Multiusuários (Família)", "Previsão de fluxo de caixa", "Conciliação bancária"],
  },
];

export function SitePlans() {
  const [cycle, setCycle] = useState<Cycle>("monthly");
  const [checkout, setCheckout] = useState<(typeof catalog)[number]["slug"] | null>(null);
  const { data: plans } = usePublicPlans();

  return (
    <section id="planos" className="bg-background py-12 sm:py-14">
      <div className="shell">
        <Appear className="mb-7 flex flex-col gap-4 text-center lg:flex-row lg:items-end lg:justify-between lg:text-left">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.12em] text-primary">Planos</p>
            <h2 className="mt-2 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">Escolha o nível de recursos ideal.</h2>
          </div>
          <div className="flex justify-center lg:justify-end">
            <div className="flex gap-1 rounded-xl bg-muted p-1">
              <button onClick={() => setCycle("monthly")} className={cn("min-h-10 rounded-lg px-4 text-sm font-bold transition-all", cycle === "monthly" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground")}>Mensal</button>
              <button onClick={() => setCycle("annual")} className={cn("min-h-10 rounded-lg px-4 text-sm font-bold transition-all", cycle === "annual" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground")}>Anual <span className="ml-1 text-[10px] text-primary">-20%</span></button>
            </div>
          </div>
        </Appear>

        <div className="grid gap-4 md:grid-cols-3">
          {catalog.map((plan, index) => {
            const price = livePrice(plans, plan.slug, { monthly: 0, annual: 0 });
            const amount = cycle === "annual" ? price.annual : price.monthly;
            const priceLabel = amount === 0 ? "R$ 0" : `R$ ${amount.toFixed(2).replace('.', ',')}`;

            return (
              <Appear key={plan.slug} delay={index * 80}>
                <article className={cn("relative flex h-full flex-col rounded-2xl border p-5 transition-all", plan.featured ? "border-primary/30 bg-foreground text-background shadow-xl" : "border-border bg-card hover:border-primary/30")}> 
                  {plan.featured ? <span className="absolute right-4 top-4 rounded-full bg-primary px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-primary-foreground">Popular</span> : null}
                  <div className="pr-16"><h3 className="text-xl font-bold">{plan.name}</h3><p className={cn("mt-1 text-sm", plan.featured ? "text-background/60" : "text-muted-foreground")}>{plan.pitch}</p></div>
                  <div className="mt-5 flex items-baseline gap-1"><span className="text-3xl font-bold tracking-tight">{priceLabel}</span>{amount > 0 ? <span className={cn("text-xs font-medium", plan.featured ? "text-background/55" : "text-muted-foreground")}>/{cycle === "annual" ? "ano" : "mês"}</span> : null}</div>
                  <ul className="mt-5 flex-1 space-y-2.5">
                    {plan.features.map((feature) => <li key={feature} className="flex items-start gap-2 text-sm font-medium"><Check className="mt-0.5 size-4 shrink-0 text-primary" />{feature}</li>)}
                  </ul>
                  <Button onClick={() => setCheckout(plan.slug)} className={cn("mt-5 h-11 rounded-xl text-sm font-bold", plan.featured ? "bg-primary text-primary-foreground hover:bg-primary/90" : "bg-foreground text-background hover:bg-foreground/90")}>{plan.slug === "free" ? "Começar agora" : "Assinar agora"}</Button>
                </article>
              </Appear>
            );
          })}
        </div>
      </div>

      <CheckoutDialog open={checkout !== null} onOpenChange={(open) => !open && setCheckout(null)} initialPlan={checkout ?? undefined} initialCycle={cycle} />
    </section>
  );
}
