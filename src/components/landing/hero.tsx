import { Link } from "@tanstack/react-router";
import { Suspense, lazy } from "react";
import {
  ArrowRight,
  Play,
  Sparkles,
  Users,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/format";
import { cn } from "@/lib/utils";

const DashboardPreview = lazy(() =>
  import("@/components/landing/dashboard-preview").then((m) => ({ default: m.DashboardPreview })),
);

export function Hero() {
  return (
    <section
      id="inicio"
      className="relative isolate flex min-h-[60svh] lg:min-h-[75svh] items-center overflow-hidden bg-background pt-24 pb-12 lg:pt-32"
    >
      {/* 1. FUNDO DO HERO (Foto Real + Overlay) */}
      <div className="absolute inset-0 -z-20 overflow-hidden">
        {/* Imagem Real de Fundo */}
        <img 
          src="https://images.unsplash.com/photo-1497215728101-856f4ea42174?q=80&w=2070&auto=format&fit=crop" 
          alt="" 
          className="absolute inset-0 h-full w-full object-cover opacity-40 grayscale brightness-50"
        />
        
        {/* Overlay em Gradiente */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#0A1512] via-[#0A1512]/95 to-transparent" />
        
        {/* Gradiente radial verde sutil */}
        <div 
          className="absolute left-1/2 top-1/2 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-emerald-500/5 blur-[100px] animate-pulse-glow" 
        />
      </div>

      <div className="section-shell relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-16">
        
        {/* 2. COMPOSIÇÃO - TEXTO (45%) */}
        <div className="w-full lg:w-[45%] flex flex-col items-center text-center lg:items-start lg:text-left">
          {/* Headline com gradiente */}
          <div className="animate-in fade-in slide-in-from-top-4 duration-1000">
            <h1 className="font-display text-[clamp(1.75rem,6vw,3.25rem)] font-bold leading-[1.1] tracking-tight text-white mb-4">
              Gestão financeira<br />
              <span className="bg-gradient-to-r from-emerald-400 to-emerald-600 bg-clip-text text-transparent">estratégica.</span>
            </h1>
            <p className="max-w-xl text-[16px] font-medium leading-[1.5] text-muted-foreground sm:text-lg">
              Precisão total e controle absoluto para quem exige excelência na gestão familiar.
            </p>
          </div>

          {/* CTA E MICROCOPY */}
          <div className="mt-7 flex flex-col items-center gap-3 sm:flex-row lg:justify-start w-full">
            <Button
              className="cta-lift group relative h-12 w-full sm:w-auto rounded-lg bg-[#1FAE6D] px-8 text-[14px] font-bold text-[#0A1512] shadow-[0_0_30px_-5px_rgba(31,174,109,0.3)] hover:shadow-[0_0_40px_-5px_rgba(31,174,109,0.4)] transition-all overflow-hidden"
              asChild
            >
              <Link to="/auth" search={{ mode: "signup" }}>
                <span className="relative z-10 flex items-center">
                  Começar agora
                  <ArrowRight className="ml-2 size-4 transition-transform group-hover:translate-x-1" />
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]" />
              </Link>
            </Button>
            <Button
              variant="outline"
              className="h-12 w-full sm:w-auto rounded-lg border-white/10 bg-white/5 px-8 text-[14px] font-bold text-white backdrop-blur-md transition-all hover:bg-white/10 group/interactive"
              asChild
            >
              <Link to="/auth" search={{ mode: "login" }}>
                <Users size={16} className="mr-2 text-emerald-400" />
                Acessar Painel
              </Link>
            </Button>
          </div>

          {/* Prova Social Reformulada */}
          <div className="mt-8 flex items-center gap-4 animate-in fade-in duration-1000 delay-300">
            <div className="flex -space-x-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="size-9 rounded-full border-2 border-background bg-surface ring-1 ring-white/5 overflow-hidden">
                  <img src={`https://i.pravatar.cc/100?u=${i + 10}`} alt="User avatar" className="opacity-80" />
                </div>
              ))}
            </div>
            <div className="h-4 w-px bg-white/10" />
            <p className="text-[13px] font-medium text-[#9CA8A3]">
              Confiança de <span className="font-bold text-white">+10k usuários</span> ativos
            </p>
          </div>
        </div>

        {/* 2. COMPOSIÇÃO - PRODUTO (55%) */}
        <div className="w-full lg:w-[55%] animate-in fade-in slide-in-from-right-8 duration-1000 delay-500">
          <div className="relative perspective-2000 group/mockup scale-90 lg:scale-95 origin-center">
            {/* Mockup do Dashboard */}
            <div className="relative rotate-y-[-10deg] rotate-x-[5deg] skew-y-[2deg] rounded-2xl border border-white/10 bg-[#0F1B16]/60 p-1 shadow-[0_40px_80px_-20px_rgba(0,0,0,0.6),0_0_40px_-20px_rgba(31,174,109,0.2)] backdrop-blur-xl transition-all duration-700 group-hover/mockup:rotate-y-[-5deg] group-hover/mockup:rotate-x-[2deg] group-hover/mockup:skew-y-[1deg]">
              <div className="overflow-hidden rounded-xl bg-background shadow-2xl">
                {/* Minimalist Browser Frame */}
                <div className="flex items-center gap-1.5 border-b border-white/5 bg-white/5 px-4 py-2.5">
                  <div className="size-2 rounded-full bg-white/10" />
                  <div className="size-2 rounded-full bg-white/10" />
                  <div className="size-2 rounded-full bg-white/10" />
                </div>
                <Suspense fallback={<div className="h-[400px] w-full bg-[#1a2e26]/20 animate-pulse" />}>
                  <DashboardPreview />
                </Suspense>
              </div>
            </div>
            
            {/* 1 Card Flutuante de Destaque */}
            <div className="absolute -left-6 top-20 hidden xl:block animate-float">
              <div className="rounded-xl border border-white/10 bg-white/5 p-3 shadow-2xl backdrop-blur-2xl ring-1 ring-white/5">
                <div className="flex items-center gap-3">
                  <div className="flex size-8 items-center justify-center rounded-lg bg-emerald-500/20 text-emerald-400">
                    <Sparkles size={16} />
                  </div>
                  <div>
                    <p className="text-[14px] font-bold text-white">+12% economia</p>
                  </div>
                </div>
              </div>
            </div>
            
          </div>
        </div>

      </div>
    </section>
  );
}
