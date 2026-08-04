import { useState } from "react";
import { useHydrated } from "@/hooks/use-hydrated";
import { cn } from "@/lib/utils";
import { Sparkles, TrendingUp, ShieldCheck, Users, ArrowRight, Zap, Target, CreditCard } from "lucide-react";
import heroAsset from "@/assets/hero-bg-2027.jpg";

export function MobileHeroSection() {
  const hydrated = useHydrated();

  if (!hydrated) return null;

  return (
    <section className="relative overflow-hidden px-4 py-8 md:hidden">
      <div className="relative flex flex-col overflow-hidden rounded-[2rem] border border-white/10 bg-black/25 shadow-2xl transition-all duration-700 max-h-[70vh] backdrop-blur-2xl">
        
        {/* Parallax Background Layer */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-30 mix-blend-overlay pointer-events-none transition-opacity duration-1000"
          style={{ 
            backgroundImage: `url(${heroAsset})`,
          }}
        />
        
        {/* Decorative Gradients */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/60 to-black/90" />
        <div className="absolute -left-20 -top-20 size-64 rounded-full bg-brand/5 blur-[100px]" />
        <div className="absolute -right-20 bottom-0 size-64 rounded-full bg-emerald-500/5 blur-[100px]" />

        {/* Content Layer */}
        <div className="relative z-10 flex flex-col p-8 items-center text-center overflow-y-auto custom-scrollbar">
          <div className="absolute inset-0 -z-10 bg-black/10 backdrop-blur-[2px]" />
          
          {/* Top Badge */}
          <div className="mb-5 flex animate-reveal items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-1.5 text-[10px] font-bold uppercase tracking-[0.22em] text-white/80 backdrop-blur-md">
            <Zap className="size-2.5" />
            Sua jornada financeira
          </div>
          
          {/* Main Icon */}
          <div className="mb-4 flex size-12 items-center justify-center rounded-2xl bg-white/5 text-white/40 shadow-inner ring-1 ring-white/10 animate-reveal" style={{ animationDelay: '100ms' }}>
            <TrendingUp className="size-6" />
          </div>
          
          {/* Headline */}
          <h2 className="animate-reveal font-display text-3xl font-black leading-[1.05] tracking-[-0.04em] text-white" style={{ animationDelay: '200ms' }}>
            Controle <span className="text-brand">total</span>,<br />tranquilidade <span className="text-brand">sempre</span>
          </h2>
          
          <p className="mt-2 animate-reveal px-4 text-[11px] font-medium leading-relaxed text-white/50" style={{ animationDelay: '300ms' }}>
            Tecnologia e simplicidade unidas para garantir o controle total de seus gastos e investimentos.
          </p>
          
          {/* Visual Highlight Cards */}
          <div className="mt-6 grid w-full grid-cols-2 gap-3 animate-reveal" style={{ animationDelay: '400ms' }}>
            <div className="group flex flex-col items-center rounded-2xl border border-white/10 bg-white/[0.07] p-4 backdrop-blur-md transition-all active:scale-95 shadow-[0_8px_32px_rgba(0,0,0,0.3)]">
              <div className="mb-3 flex size-10 items-center justify-center rounded-xl bg-brand/15 text-brand ring-1 ring-brand/30 shadow-[0_0_15px_rgba(23,164,95,0.2)]">
                <Target className="size-5" />
              </div>
              <p className="text-xl font-black text-white">Metas</p>
              <p className="mt-0.5 text-[9px] font-bold uppercase tracking-wider text-white/50">Progresso Real</p>
            </div>
            <div className="group flex flex-col items-center rounded-2xl border border-white/10 bg-white/[0.07] p-4 backdrop-blur-md transition-all active:scale-95 shadow-[0_8px_32px_rgba(0,0,0,0.3)]">
              <div className="mb-3 flex size-10 items-center justify-center rounded-xl bg-emerald-500/15 text-emerald-500 ring-1 ring-emerald-500/30 shadow-[0_0_15px_rgba(16,185,129,0.2)]">
                <CreditCard className="size-5" />
              </div>
              <p className="text-xl font-black text-white">Cartões</p>
              <p className="mt-0.5 text-[9px] font-bold uppercase tracking-wider text-white/50">Visão Unificada</p>
            </div>
          </div>


          {/* Enhanced CTA */}
          <div className="mt-6 flex w-full flex-col gap-4 animate-reveal" style={{ animationDelay: '600ms' }}>
            <button className="group relative flex h-12 w-full items-center justify-center gap-3 overflow-hidden rounded-xl bg-brand font-display font-bold text-brand-foreground shadow-lg transition-all active:scale-[0.96]">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
              Começar Grátis
              <ArrowRight className="size-5 transition-transform group-hover:translate-x-1" />
            </button>
            
            <div className="flex flex-wrap justify-center gap-x-4 gap-y-2">
              <div className="flex items-center gap-1">
                <ShieldCheck className="size-3 text-brand" />
                <span className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground/70">Conformidade RGPD</span>
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
