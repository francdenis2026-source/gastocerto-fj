import { Link } from "@tanstack/react-router";
import { cn } from "@/lib/utils";
import {
  ArrowRight,
  ShieldCheck,
  Zap,
  Target,
  LayoutDashboard,
  Lock,
  Sparkles,
  BrainCircuit,
  Smartphone,
  Users,
} from "lucide-react";

import { Reveal } from "@/components/landing/reveal";
import { Button } from "@/components/ui/button";

const features = [
  {
    title: "Painel Inteligente",
    description: "Visão consolidada de saldo, gastos e metas com gráficos em tempo real.",
    icon: LayoutDashboard,
    bg: "bg-blue-500/10",
    color: "text-blue-500",
  },
  {
    title: "Consultor com IA",
    description: "Insights financeiros, análise de dívidas e dicas personalizadas.",
    icon: BrainCircuit,
    bg: "bg-indigo-500/10",
    color: "text-indigo-500",
  },
  {
    title: "Metas de Poupança",
    description: "Crie objetivos, acompanhe o progresso e receba previsão de conclusão.",
    icon: Target,
    bg: "bg-emerald-500/10",
    color: "text-emerald-500",
  },
  {
    title: "Segurança Total",
    description: "Dados protegidos com criptografia de ponta a ponta e conformidade LGPD.",
    icon: Lock,
    bg: "bg-rose-500/10",
    color: "text-rose-500",
  },
  {
    title: "Experiência Mobile",
    description: "Interface otimizada para iOS e Android, parecendo um aplicativo nativo.",
    icon: Smartphone,
    bg: "bg-amber-500/10",
    color: "text-amber-500",
  },
  {
    title: "Espaço Kids Seguro",
    description: "Ambiente controlado com PIN para ensinar educação financeira aos seus filhos.",
    icon: Users,
    bg: "bg-purple-500/10",
    color: "text-purple-500",
  },
];

export function Benefits() {
  return (
    <section id="recursos" className="section-y bg-background border-t border-border">
      <div className="section-shell">
        <Reveal className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-xs font-semibold text-primary mb-4">
            <Sparkles className="size-3" />
            Recursos Poderosos
          </div>
          <h2 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-foreground leading-tight">
            Tudo o que você precisa em uma única plataforma
          </h2>
        </Reveal>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, index) => (
            <Reveal key={feature.title} delay={index * 100}>
              <div className="group interactive-card p-8 h-full flex flex-col rounded-[2rem] border border-border bg-card">
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
