
import { Link } from "@tanstack/react-router";
import { ArrowRight, Sparkles, TrendingUp, ShieldCheck, Zap, Bot, Target, CreditCard } from "lucide-react";
import { Reveal } from "@/components/landing/reveal";
import { DashboardPreview } from "@/components/landing/dashboard-preview";
import { cn } from "@/lib/utils";

export function Hero() {
  return (
    <section id="inicio" className="relative overflow-hidden pt-12 pb-20 lg:pt-16 lg:pb-24">
      {/* Immersive Background */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full">
          <img 
            src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=2070&auto=format&fit=crop" 
            alt=""
            className="w-full h-full object-cover opacity-[0.04] grayscale dark:opacity-[0.08]"
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-b from-background via-background/90 to-background" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[120%] h-full bg-primary/[0.03] blur-[150px] rounded-full" />
      </div>

      <div className="container mx-auto px-6 lg:px-12">
        <div className="flex flex-col items-center text-center max-w-4xl mx-auto">
          {/* Animated Badge */}
          <Reveal delay={100}>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-primary/20 bg-primary/5 backdrop-blur-sm mb-8 transition-transform hover:scale-105">
              <Sparkles className="size-4 text-primary animate-pulse" />
              <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-primary">
                O Futuro da Gestão Financeira com IA
              </span>
            </div>
          </Reveal>

          {/* Main Headline */}
          <Reveal delay={200}>
            <h1 className="text-5xl lg:text-7xl font-black tracking-tight leading-[1.05] text-foreground mb-6">
              A inteligência que sua<br />
              <span className="text-primary italic">vida financeira</span> merece.
            </h1>
          </Reveal>

          {/* Subheadline */}
          <Reveal delay={300}>
            <p className="text-lg lg:text-xl text-muted-foreground max-w-2xl mx-auto mb-8 leading-relaxed font-medium">
              Gestão completa de gastos, cartões, veículos e investimentos em um único dashboard premium impulsionado por IA.
            </p>
          </Reveal>

          {/* Main Actions */}
          <Reveal delay={400} className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto mb-20">
            <Link
              to="/auth"
              search={{ mode: "signup" }}
              className="group relative w-full sm:w-auto inline-flex items-center justify-center gap-3 bg-primary text-primary-foreground text-base font-bold px-10 py-5 rounded-2xl overflow-hidden transition-all hover:scale-[1.02] active:scale-95 shadow-2xl shadow-primary/20"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
              Começar agora — É Grátis
              <ArrowRight className="size-5 transition-transform group-hover:translate-x-1" />
            </Link>
            
            <a
              href="#recursos"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-10 py-5 rounded-2xl border border-border bg-secondary/50 font-bold hover:bg-secondary transition-all"
            >
              Ver recursos
            </a>
          </Reveal>
        </div>

        {/* Hero Dashboard Preview with Perspective */}
        <Reveal delay={500} className="relative max-w-6xl mx-auto perspective-2000">
          <div className="relative z-10 transition-transform duration-1000 hover:rotate-x-1 transform-gpu">
            <div className="rounded-3xl border border-white/10 bg-black/40 backdrop-blur-3xl p-4 lg:p-6 shadow-[0_32px_120px_-20px_rgba(0,0,0,0.5)] overflow-hidden">
              <DashboardPreview />
            </div>

            {/* Floating Decorative Elements */}
            <div className="absolute -top-12 -right-12 z-20 hidden lg:block animate-bounce-subtle">
              <div className="bg-background/80 backdrop-blur-xl border border-border rounded-2xl p-6 shadow-2xl">
                <div className="flex items-center gap-4 mb-3">
                  <div className="size-10 rounded-xl bg-primary/10 flex items-center justify-center">
                    <TrendingUp className="size-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground font-bold uppercase tracking-widest">Economia Total</p>
                    <p className="text-2xl font-black text-foreground">+ R$ 2.450,00</p>
                  </div>
                </div>
                <div className="w-full bg-secondary h-2 rounded-full overflow-hidden">
                  <div className="bg-primary h-full w-[75%]" />
                </div>
              </div>
            </div>

            <div className="absolute -bottom-10 -left-10 z-20 hidden lg:block animate-float">
              <div className="bg-background/80 backdrop-blur-xl border border-border rounded-2xl p-6 shadow-2xl flex items-center gap-5">
                <div className="size-12 rounded-full bg-primary/20 flex items-center justify-center border border-primary/20">
                  <Bot className="size-7 text-primary" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground font-bold uppercase tracking-widest">Análise de IA</p>
                  <p className="text-base font-bold text-foreground">"Sua saúde financeira está excelente!"</p>
                </div>
              </div>
            </div>
          </div>

          {/* Underglow */}
          <div className="absolute -bottom-20 left-1/2 -translate-x-1/2 w-[80%] h-40 bg-primary/20 blur-[100px] -z-10 rounded-full" />
        </Reveal>

        {/* Trust/Module Badges */}
        <Reveal delay={600} className="mt-32">
          <div className="flex flex-col items-center">
            <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-muted-foreground mb-12">
              Ecossistema Completo de Gestão
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-16 opacity-60 grayscale hover:grayscale-0 transition-all duration-500">
               <div className="flex items-center gap-3">
                 <Zap className="size-5 text-primary" />
                 <span className="font-display font-black text-lg">Lançamentos</span>
               </div>
               <div className="flex items-center gap-3">
                 <Target className="size-5 text-primary" />
                 <span className="font-display font-black text-lg">Metas</span>
               </div>
               <div className="flex items-center gap-3">
                 <CreditCard className="size-5 text-primary" />
                 <span className="font-display font-black text-lg">Cartões</span>
               </div>
               <div className="flex items-center gap-3">
                 <ShieldCheck className="size-5 text-primary" />
                 <span className="font-display font-black text-lg">Segurança</span>
               </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
