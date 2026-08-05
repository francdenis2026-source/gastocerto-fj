import { Link } from "@tanstack/react-router";
import { 
  CheckCircle2, 
  TrendingUp, 
  Target, 
  ShieldCheck, 
  Zap,
  ArrowRight,
  Smile,
  Wallet
} from "lucide-react";
import { Reveal } from "@/components/landing/reveal";
import { Button } from "@/components/ui/button";

const stats = [
  { label: "Usuários Ativos", value: "12k+", icon: Smile },
  { label: "Transações/Mês", value: "850k", icon: Zap },
  { label: "Economia Gerada", value: "R$ 4M", icon: Wallet },
];

const highlights = [
  "Interface 100% responsiva",
  "Consultoria com IA 24/7",
  "Controle de metas realistas",
  "Segurança bancária (AES-256)",
];

export function HowItWorks() {
  return (
    <section className="section-y bg-card border-y border-border overflow-hidden">
      <div className="section-shell">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <Reveal>
            <div className="relative group">
              <div className="relative z-10 aspect-square rounded-[3rem] overflow-hidden border border-border shadow-2xl">
                <img 
                  src="https://images.unsplash.com/photo-1551836022-d5d88e9218df?q=80&w=2070&auto=format&fit=crop" 
                  alt="Financial Success" 
                  className="w-full h-full object-cover grayscale-[0.2] group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent" />
              </div>
              
              {/* Floating Stat Cards */}
              <div className="absolute -top-6 -right-6 p-6 rounded-3xl border border-border bg-background shadow-2xl z-20 animate-bounce-slow">
                <p className="text-[10px] font-black uppercase tracking-widest text-primary mb-1">Impacto Real</p>
                <p className="text-2xl font-black text-foreground">Economize +30%</p>
                <p className="text-xs text-secondary-foreground font-medium mt-1">Logo no primeiro mês de uso.</p>
              </div>

              <div className="absolute bottom-12 -left-8 p-5 rounded-2xl border border-border bg-background shadow-2xl z-20">
                <div className="flex items-center gap-3">
                  <div className="flex -space-x-2">
                    {[1, 2, 3].map(i => (
                      <div key={i} className="size-8 rounded-full border-2 border-background bg-secondary overflow-hidden">
                        <img src={`https://i.pravatar.cc/100?img=${i + 20}`} alt="User" />
                      </div>
                    ))}
                  </div>
                  <div className="text-xs font-bold">+500 reviews ⭐⭐⭐⭐⭐</div>
                </div>
              </div>
            </div>
          </Reveal>

          <Reveal delay={200}>
            <div className="max-w-xl">
              <h2 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-foreground leading-tight mb-8">
                Transforme sua relação com o dinheiro em <span className="text-primary italic">poucos dias</span>.
              </h2>
              <p className="text-lg text-secondary-foreground leading-relaxed mb-10">
                Não é apenas sobre anotar gastos. É sobre entender seu comportamento, automatizar sua disciplina e construir o patrimônio que você merece com ferramentas de elite.
              </p>

              <div className="grid sm:grid-cols-2 gap-4 mb-10">
                {highlights.map((h) => (
                  <div key={h} className="flex items-center gap-3">
                    <CheckCircle2 className="size-5 text-primary shrink-0" />
                    <span className="text-sm font-semibold text-foreground/80">{h}</span>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-3 gap-6 mb-12 border-t border-border pt-10">
                {stats.map((s) => (
                  <div key={s.label}>
                    <p className="text-xl md:text-2xl font-black text-foreground mb-1">{s.value}</p>
                    <p className="text-[10px] font-black uppercase tracking-widest text-secondary-foreground">{s.label}</p>
                  </div>
                ))}
              </div>

              <Button size="lg" className="rounded-full px-8 h-14 font-bold text-lg group" asChild>
                <Link to="/auth" search={{ mode: "signup" }}>
                  Ver Demonstração <ArrowRight className="ml-2 size-5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
