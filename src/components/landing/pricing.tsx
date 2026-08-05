import { Check, Sparkles, Zap, Shield, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Reveal } from "./reveal";
import { cn } from "@/lib/utils";

const plans = [
  {
    name: "Essencial",
    price: "Grátis",
    period: "por 14 dias",
    desc: "Ideal para dar o primeiro passo na sua organização.",
    features: ["Até 2 contas", "Dashboard básico", "Controle de despesas", "App Mobile PWA"],
    cta: "Começar Trial",
    highlight: false,
    icon: Zap
  },
  {
    name: "Premium",
    price: "R$ 19",
    period: "/mês",
    desc: "Para quem busca precisão absoluta e controle total.",
    features: [
      "Contas ilimitadas",
      "IA Advisor Premium",
      "Metas financeiras",
      "Exportação de dados",
      "Prioridade no suporte"
    ],
    cta: "Assinar Premium",
    highlight: true,
    icon: Star
  },
  {
    name: "Família",
    price: "R$ 29",
    period: "/mês",
    desc: "A solução completa para toda a família prosperar.",
    features: [
      "Até 5 usuários",
      "Espaço Kids exclusivo",
      "Relatórios consolidados",
      "Conciliação avançada",
      "Treinamento exclusivo"
    ],
    cta: "Escolher Família",
    highlight: false,
    icon: Shield
  }
];

export function Pricing() {
  return (
    <section id="planos" className="section-y bg-secondary/30">
      <div className="section-shell">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <Reveal>
            <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight mb-6">
              O investimento certo no <br />
              <span className="text-primary italic">seu futuro</span>.
            </h2>
            <p className="text-lg text-secondary-foreground font-medium opacity-80">
              Escolha o plano que melhor se adapta à sua jornada. Sem taxas ocultas, cancelamento a qualquer momento.
            </p>
          </Reveal>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {basePlans.map((p, i) => (
            <Reveal key={i} delay={i * 100}>
              <div className={cn(
                "premium-card h-full relative flex flex-col p-8",
                p.highlight && "border-primary bg-primary/[0.02] shadow-2xl shadow-primary/10"
              )}>
                {p.highlight && (
                  <div className="absolute top-0 right-8 -translate-y-1/2 bg-primary text-white text-[11px] font-black uppercase tracking-widest px-4 py-1 rounded-full flex items-center gap-1.5 shadow-lg">
                    <Sparkles className="size-3" />
                    Mais Escolhido
                  </div>
                )}
                
                <div className="mb-8">
                  <div className={cn(
                    "size-10 rounded-xl flex items-center justify-center mb-6",
                    p.highlight ? "bg-primary/20 text-primary" : "bg-secondary text-secondary-foreground"
                  )}>
                    <p.icon className="size-5" />
                  </div>
                  <h3 className="text-2xl font-bold mb-2">{p.name}</h3>
                  <div className="flex items-baseline gap-1 mb-4">
                    <span className="text-4xl font-black">{p.price}</span>
                    <span className="text-secondary-foreground text-sm font-medium">{p.period}</span>
                  </div>
                  <p className="text-secondary-foreground text-sm leading-relaxed">
                    {p.desc}
                  </p>
                </div>

                <div className="space-y-4 mb-10 flex-1">
                  {p.features.map((f, idx) => (
                    <div key={idx} className="flex items-center gap-3">
                      <div className="size-5 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                        <Check className="size-3 text-primary" />
                      </div>
                      <span className="text-[15px] font-medium opacity-90">{f}</span>
                    </div>
                  ))}
                </div>

                <Button 
                  size="lg" 
                  variant={p.highlight ? "default" : "outline"} 
                  className={cn(
                    "w-full rounded-2xl h-14 text-base font-bold transition-all",
                    p.highlight ? "shadow-xl shadow-primary/20" : "hover:bg-secondary"
                  )}
                >
                  {p.cta}
                </Button>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
