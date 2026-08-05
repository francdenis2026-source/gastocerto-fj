import { Link } from "@tanstack/react-router";
import { ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/landing/reveal";

export function Hero() {
  return (
    <section className="relative pt-32 pb-24 overflow-hidden">
      <div className="section-shell">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <Reveal>
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-1.5 text-xs font-semibold text-primary mb-8">
              <Sparkles className="size-3" />
              SaaS Financeiro Premium
            </div>
            <h1 className="text-6xl md:text-7xl font-extrabold tracking-tighter text-foreground leading-[1.05] mb-6">
              Controle sua vida financeira com <span className="text-primary">precisão absoluta</span>.
            </h1>
            <p className="text-xl text-secondary-foreground leading-relaxed mb-10 max-w-lg">
              A plataforma definitiva para organizar gastos, metas e investimentos. Tudo centralizado em uma experiência de elite, moderna e inteligente.
            </p>
            <div className="flex gap-4">
              <Button size="lg" className="rounded-full h-14 px-8 text-lg" asChild>
                <Link to="/auth" search={{ mode: "signup" }}>Começar Agora <ArrowRight className="ml-2 size-5" /></Link>
              </Button>
              <Button size="lg" variant="outline" className="rounded-full h-14 px-8 text-lg" asChild>
                <Link to="/auth" search={{ mode: "login" }}>Entrar no Sistema</Link>
              </Button>
            </div>
          </Reveal>
          <Reveal delay={200}>
            <div className="relative">
              <div className="aspect-[4/3] rounded-3xl border border-border bg-card shadow-2xl p-4 overflow-hidden">
                <div className="h-full w-full bg-secondary/20 rounded-2xl animate-pulse" />
              </div>
              <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-primary/20 blur-[100px] -z-10" />
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
