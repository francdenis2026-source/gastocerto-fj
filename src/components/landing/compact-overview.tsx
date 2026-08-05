import { useState } from "react";
import { 
  BarChart3, 
  ShieldCheck, 
  Zap, 
  Users, 
  Smartphone, 
  BrainCircuit 
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Reveal } from "@/components/landing/reveal";

const features = [
  {
    id: "dashboard",
    title: "Gestão Visual",
    description: "Visualize seus gastos por categorias com gráficos intuitivos e interativos.",
    icon: BarChart3,
    color: "text-blue-500",
    bg: "bg-blue-500/10",
  },
  {
    id: "security",
    title: "Segurança Total",
    description: "Seus dados são protegidos com criptografia de ponta e autenticação segura.",
    icon: ShieldCheck,
    color: "text-emerald-500",
    bg: "bg-emerald-500/10",
  },
  {
    id: "speed",
    title: "Lançamento Rápido",
    description: "Registre despesas em segundos com nossa interface otimizada para agilidade.",
    icon: Zap,
    color: "text-amber-500",
    bg: "bg-amber-500/10",
  },
  {
    id: "kids",
    title: "Espaço Kids",
    description: "Eduque seus filhos financeiramente com uma área dedicada e segura.",
    icon: Users,
    color: "text-purple-500",
    bg: "bg-purple-500/10",
  },
  {
    id: "mobile",
    title: "Mobile First",
    description: "Experiência de aplicativo nativo no seu navegador, onde quer que você esteja.",
    icon: Smartphone,
    color: "text-rose-500",
    bg: "bg-rose-500/10",
  },
  {
    id: "ai",
    title: "Consultor IA",
    description: "Receba insights inteligentes e dicas personalizadas para economizar mais.",
    icon: BrainCircuit,
    color: "text-indigo-500",
    bg: "bg-indigo-500/10",
  },
];

export function CompactOverview() {
  const [activeTab, setActiveTab] = useState("dashboard");

  return (
    <section id="recursos" className="section-y bg-background border-t border-border">
      <div className="section-shell">
        <Reveal className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="section-title">Tudo o que você precisa</h2>
          <p className="mt-6 section-subtitle">
            Uma plataforma completa e integrada para gerenciar cada detalhe da sua vida financeira com precisão.
          </p>
        </Reveal>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, index) => (
            <Reveal key={feature.id} delay={index * 100}>
              <div className="group interactive-card p-8 h-full flex flex-col rounded-[2rem] border border-border bg-card hover:border-primary/50 transition-all duration-300">
                <div className={cn("mb-6 flex size-12 items-center justify-center rounded-2xl transition-transform duration-300 group-hover:scale-110", feature.bg)}>
                  <feature.icon className={cn("size-6", feature.color)} />
                </div>
                <h3 className="mb-3 text-xl font-bold text-foreground">
                  {feature.title}
                </h3>
                <p className="text-secondary-foreground leading-relaxed">
                  {feature.description}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
