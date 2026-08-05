import { Reveal } from "@/components/landing/reveal";
import { LayoutDashboard, Shield, Smartphone, Zap, Sparkles, BarChart3, Target, PiggyBank } from "lucide-react";

const features = [
  {
    title: "Dashboard Preditivo",
    desc: "Visualize o futuro do seu saldo com algoritmos que entendem seus hábitos de consumo.",
    icon: LayoutDashboard,
    color: "text-blue-500",
    bg: "bg-blue-500/10"
  },
  {
    title: "Inteligência Artificial",
    desc: "Receba conselhos personalizados para economizar mais e investir com sabedoria.",
    icon: Sparkles,
    color: "text-primary",
    bg: "bg-primary/10"
  },
  {
    title: "Gestão Multicontas",
    desc: "Centralize bancos, cartões e investimentos em uma única visão consolidada.",
    icon: BarChart3,
    color: "text-amber-500",
    bg: "bg-amber-500/10"
  },
  {
    title: "Segurança Absoluta",
    desc: "Seus dados são protegidos por criptografia de ponta a ponta e anonimização total.",
    icon: Shield,
    color: "text-emerald-500",
    bg: "bg-emerald-500/10"
  },
  {
    title: "Metas Dinâmicas",
    desc: "Crie objetivos de vida e acompanhe seu progresso com indicadores em tempo real.",
    icon: Target,
    color: "text-purple-500",
    bg: "bg-purple-500/10"
  },
  {
    title: "Economia Colaborativa",
    desc: "Gerencie finanças familiares ou de casais com total privacidade e transparência.",
    icon: PiggyBank,
    color: "text-pink-500",
    bg: "bg-pink-500/10"
  }
];

export function CompactOverview() {
  return (
    <section id="recursos" className="section-y relative overflow-hidden">
      <div className="section-shell">
        <div className="max-w-2xl mb-16">
          <Reveal>
            <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight mb-6">
              Recursos de elite para sua <br />
              <span className="text-primary italic">evolução financeira</span>.
            </h2>
            <p className="text-lg text-secondary-foreground font-medium opacity-80">
              Engenharia de software aplicada ao controle de gastos. Simplicidade externa, inteligência interna.
            </p>
          </Reveal>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((f, i) => (
            <Reveal key={i} delay={i * 50}>
              <div className="premium-card group h-full">
                <div className={`size-12 rounded-2xl ${f.bg} flex items-center justify-center mb-6 transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3`}>
                  <f.icon className={`size-6 ${f.color}`} />
                </div>
                <h3 className="text-xl font-bold mb-3">{f.title}</h3>
                <p className="text-secondary-foreground leading-relaxed text-[15px]">
                  {f.desc}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
