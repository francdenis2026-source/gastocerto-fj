import { Reveal } from "@/components/landing/reveal";
import { cn } from "@/lib/utils";
import { 
  Sparkles, 
  BrainCircuit, 
  Target, 
  CreditCard, 
  Users, 
  ShieldCheck,
  ChevronRight
} from "lucide-react";

const steps = [
  {
    icon: Sparkles,
    title: "Importação Rápida",
    description: "Conecte suas contas ou lance despesas em segundos com nossa interface intuitiva.",
    color: "text-blue-500",
    bg: "bg-blue-500/10"
  },
  {
    icon: BrainCircuit,
    title: "Análise Inteligente",
    description: "Nossa IA processa seus dados para identificar padrões e sugerir economias reais.",
    color: "text-emerald-500",
    bg: "bg-emerald-500/10"
  },
  {
    icon: Target,
    title: "Metas Alcançadas",
    description: "Acompanhe seu progresso visualmente e atinja seus objetivos antes do esperado.",
    color: "text-amber-500",
    bg: "bg-amber-500/10"
  }
];

export function CompactOverview() {
  return (
    <section className="py-20 bg-background border-t border-border overflow-hidden">
      <div className="section-shell">
        <div className="grid md:grid-cols-3 gap-12">
          {steps.map((step, i) => (
            <Reveal key={step.title} delay={i * 100}>
              <div className="group flex items-start gap-6">
                <div className={cn(
                  "shrink-0 size-14 rounded-2xl flex items-center justify-center transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3",
                  step.bg
                )}>
                  <step.icon className={cn("size-7", step.color)} />
                </div>
                <div className="min-w-0">
                  <h3 className="text-xl font-bold text-foreground mb-2 group-hover:text-primary transition-colors">
                    {step.title}
                  </h3>
                  <p className="text-sm leading-relaxed text-secondary-foreground">
                    {step.description}
                  </p>
                  <div className="mt-4 flex items-center gap-1 text-xs font-bold text-primary opacity-0 group-hover:opacity-100 transition-all translate-x-[-10px] group-hover:translate-x-0">
                    Saber mais <ChevronRight className="size-3" />
                  </div>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
