import { Link } from "@tanstack/react-router";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/landing/reveal";

const plans = [
  {
    name: "Grátis",
    price: "0",
    description: "Para organizar o básico",
    features: ["14 dias de acesso total", "Lançamentos básicos", "Suporte padrão"],
  },
  {
    name: "Premium",
    price: "24.90",
    description: "Controle financeiro completo",
    features: ["Lançamentos ilimitados", "Exportação PDF/CSV", "Gestão de cartões"],
    highlighted: true,
  },
  {
    name: "Premium+",
    price: "34.90",
    description: "Inteligência com IA",
    features: ["Tudo do Premium", "Consultor IA ilimitado", "Dicas personalizadas"],
  },
];

export function Pricing() {
  return (
    <section id="planos" className="section-y bg-secondary/30">
      <div className="section-shell">
        <Reveal className="text-center mb-16">
          <h2 className="text-4xl font-bold tracking-tighter mb-4">Planos que acompanham seu crescimento</h2>
        </Reveal>
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan, i) => (
            <Reveal key={plan.name} delay={i * 100}>
              <div className={`p-8 rounded-3xl border ${plan.highlighted ? "border-primary bg-background shadow-xl" : "border-border bg-card"}`}>
                <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                <p className="text-sm text-secondary-foreground mb-6">{plan.description}</p>
                <div className="text-4xl font-black mb-8">R$ {plan.price}<span className="text-lg font-medium text-secondary-foreground">/mês</span></div>
                <ul className="space-y-4 mb-8">
                  {plan.features.map(f => (
                    <li key={f} className="flex items-center gap-3"><Check className="size-5 text-primary" /> {f}</li>
                  ))}
                </ul>
                <Button className="w-full h-12 rounded-full" variant={plan.highlighted ? "default" : "secondary"}>
                  {plan.price === "0" ? "Começar Grátis" : "Assinar Agora"}
                </Button>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
