import { useState } from "react";
import { Check, Sparkles } from "lucide-react";
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
    pitch: "Para quem está começando",
    features: [
      "Até 50 lançamentos/mês",
      "Categorias básicas",
      "Relatórios simples",
      "Acesso mobile"
    ],
  },
  {
    slug: "premium" as const,
    name: "Pro",
    pitch: "O controle que você merece",
    featured: true,
    features: [
      "Lançamentos ilimitados",
      "Contas e cartões ilimitados",
      "Análise de combustível/gás",
      "Balanço anual completo",
      "Exportação CSV/PDF",
      "Suporte prioritário"
    ],
  },
  {
    slug: "premium_ia" as const,
    name: "Elite",
    pitch: "Inteligência máxima",
    features: [
      "Tudo do plano Pro",
      "IA Consultora Financeira",
      "Espaço Kids ilimitado",
      "Multi-usuários (Família)",
      "Previsão de fluxo de caixa",
      "Conciliação bancária"
    ],
  },
];

export function SitePlans() {
  const [cycle, setCycle] = useState<Cycle>("annual");
  const [checkout, setCheckout] = useState<(typeof catalog)[number]["slug"] | null>(null);
  const { data: plans } = usePublicPlans();

  return (
    <section id="planos" className="py-16 md:py-20 bg-background border-t border-border">
      <div className="shell">
        <Appear className="text-center mb-10">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground mb-4">
            Escolha o melhor plano para você
          </h2>
          
          <div className="flex items-center justify-center mt-10">
            <div className="bg-muted p-1.5 rounded-2xl flex gap-1">
              <button
                onClick={() => setCycle("monthly")}
                className={cn(
                  "px-6 py-2.5 rounded-xl text-sm font-bold transition-all",
                  cycle === "monthly" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"
                )}
              >
                Mensal
              </button>
              <button
                onClick={() => setCycle("annual")}
                className={cn(
                  "px-6 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center gap-2",
                  cycle === "annual" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"
                )}
              >
                Anual
                <span className="bg-primary/10 text-primary text-[10px] px-2 py-0.5 rounded-full uppercase">Economize 20%</span>
              </button>
            </div>
          </div>
        </Appear>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {catalog.map((plan, i) => {
            const price = livePrice(plans, plan.slug, { monthly: 0, annual: 0 });
            const amount = cycle === "annual" ? price.annual : price.monthly;
            const priceLabel = amount === 0 ? "R$ 0" : `R$ ${amount.toFixed(2).replace('.', ',')}`;

            return (
              <Appear key={plan.slug} delay={i * 100}>
                <div className={cn(
                  "relative p-6 rounded-[2rem] flex flex-col h-full transition-all duration-500",
                  plan.featured 
                    ? "bg-foreground text-background shadow-2xl scale-105 z-10" 
                    : "bg-muted/30 border border-border hover:bg-background"
                )}>
                  {plan.featured && (
                    <div className="absolute -top-5 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-xs font-bold uppercase tracking-widest px-6 py-2 rounded-full shadow-lg">
                      Mais Popular
                    </div>
                  )}

                  <div className="mb-8">
                    <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                    <p className={cn("text-sm", plan.featured ? "text-background/60" : "text-muted-foreground")}>
                      {plan.pitch}
                    </p>
                  </div>

                  <div className="mb-8">
                    <div className="flex items-baseline gap-1">
                      <span className="text-5xl font-bold tracking-tight">{priceLabel}</span>
                      {amount > 0 && (
                        <span className={cn("text-sm font-medium", plan.featured ? "text-background/50" : "text-muted-foreground")}>
                          /{cycle === "annual" ? "ano" : "mês"}
                        </span>
                      )}
                    </div>
                  </div>

                  <ul className="space-y-4 mb-10 flex-1">
                    {plan.features.map((f) => (
                      <li key={f} className="flex items-center gap-3 text-sm font-medium">
                        <Check size={18} className="text-primary shrink-0" />
                        {f}
                      </li>
                    ))}
                  </ul>

                  <Button
                    onClick={() => setCheckout(plan.slug)}
                    className={cn(
                      "h-14 rounded-2xl text-lg font-bold transition-all",
                      plan.featured 
                        ? "bg-primary text-primary-foreground hover:bg-primary/90 hover:scale-[1.02]" 
                        : "bg-foreground text-background hover:bg-foreground/90"
                    )}
                  >
                    {plan.slug === "free" ? "Começar Agora" : "Assinar agora"}
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
