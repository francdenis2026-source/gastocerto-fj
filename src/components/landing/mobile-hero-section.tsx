import { useState } from "react";
import { useHydrated } from "@/hooks/use-hydrated";
import { cn } from "@/lib/utils";
import { Sparkles, TrendingUp, ShieldCheck, Users, ArrowRight, Zap, Target, CreditCard } from "lucide-react";
import heroAsset from "@/assets/hero-bg-2027-mobile-v2.jpg";

export function MobileHeroSection() {
  const hydrated = useHydrated();

  if (!hydrated) return null;

  return (
    <section className="relative overflow-hidden px-4 py-8 md:hidden">
      <div className="relative flex flex-col overflow-hidden rounded-[2rem] border border-border/50 bg-card shadow-lifted transition-all duration-700 max-h-[85vh]">
        
        {/* Parallax Background Layer */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-40 mix-blend-overlay pointer-events-none"
          style={{ 
            backgroundImage: `url(${heroAsset})`,
            backgroundAttachment: 'fixed'
          }}
        />
        
        {/* Decorative Gradients */}
        <div className="absolute inset-0 bg-gradient-to-b from-card/40 via-card/80 to-card" />
        <div className="absolute -left-20 -top-20 size-64 rounded-full bg-brand/10 blur-[80px]" />
        <div className="absolute -right-20 bottom-0 size-64 rounded-full bg-emerald-500/10 blur-[80px]" />

        {/* Content Layer */}
        <div className="relative z-10 flex flex-col p-6 items-center text-center overflow-y-auto custom-scrollbar">
          
          {/* Top Badge */}
          <div className="mb-4 flex animate-reveal items-center gap-2 rounded-full border border-brand/20 bg-brand/5 px-4 py-1 text-[10px] font-black uppercase tracking-widest text-brand backdrop-blur-md">
            <Zap className="size-3" />
            Nova Geração 2027
          </div>
          
          {/* Main Icon */}
          <div className="mb-4 flex size-14 items-center justify-center rounded-2xl bg-brand/10 text-brand shadow-inner ring-1 ring-brand/20 animate-reveal" style={{ animationDelay: '100ms' }}>
            <TrendingUp className="size-7" />
          </div>
          
          {/* Headline */}
          <h2 className="animate-reveal font-display text-2xl font-black leading-tight tracking-tight text-foreground" style={{ animationDelay: '200ms' }}>
            Sua vida <span className="text-brand">financeira</span> em <span className="text-brand">ordem</span>
          </h2>
          
          <p className="mt-3 animate-reveal px-2 text-xs font-medium leading-relaxed text-muted-foreground" style={{ animationDelay: '300ms' }}>
            Uma inteligência dedicada à sua tranquilidade diária e metas de longo prazo. Controle hoje, tranquilidade sempre.
          </p>
          
          {/* Visual Highlight Cards */}
          <div className="mt-6 grid w-full grid-cols-2 gap-3 animate-reveal" style={{ animationDelay: '400ms' }}>
            <div className="group flex flex-col items-center rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-xl transition-all active:scale-95">
              <div className="mb-3 flex size-10 items-center justify-center rounded-xl bg-brand/20 text-brand">
                <Target className="size-5" />
              </div>
              <p className="text-xl font-black text-foreground">Metas</p>
              <p className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground/60">Alcançadas</p>
            </div>
            <div className="group flex flex-col items-center rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-xl transition-all active:scale-95">
              <div className="mb-3 flex size-10 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-500">
                <CreditCard className="size-5" />
              </div>
              <p className="text-xl font-black text-foreground">Gestão</p>
              <p className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground/60">de Cartões</p>
            </div>
          </div>

          {/* Social Proof / Stats */}
          <div className="mt-6 flex items-center gap-6 animate-reveal" style={{ animationDelay: '500ms' }}>
            <div className="text-center">
              <p className="text-lg font-black text-foreground">+24k</p>
              <p className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground/60">Usuários</p>
            </div>
            <div className="h-8 w-px bg-border/40" />
            <div className="text-center">
              <p className="text-lg font-black text-foreground">4.9/5</p>
              <p className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground/60">Avaliação</p>
            </div>
            <div className="h-8 w-px bg-border/40" />
            <div className="text-center">
              <p className="text-lg font-black text-foreground">100%</p>
              <p className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground/60">Seguro</p>
            </div>
          </div>

          {/* Enhanced CTA */}
          <div className="mt-6 flex w-full flex-col gap-4 animate-reveal" style={{ animationDelay: '600ms' }}>
            <button className="group relative flex h-14 w-full items-center justify-center gap-3 overflow-hidden rounded-2xl bg-brand font-display font-black text-brand-foreground shadow-xl shadow-brand/20 transition-all active:scale-[0.96] hover:brightness-110">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
              Começar Grátis
              <ArrowRight className="size-5 transition-transform group-hover:translate-x-1" />
            </button>
            
            <div className="flex flex-wrap justify-center gap-x-4 gap-y-2">
              <div className="flex items-center gap-1">
                <ShieldCheck className="size-3 text-brand" />
                <span className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground/70">RGPD Compliance</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="size-1 rounded-full bg-brand" />
                <span className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground/70">Sem Cartão</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
