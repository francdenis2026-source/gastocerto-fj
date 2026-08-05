import { Link } from "@tanstack/react-router";
import { Suspense, lazy } from "react";
import {
  ArrowDownRight,
  ArrowRight,
  ArrowUpRight,
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
      className="relative isolate flex min-h-[60svh] lg:min-h-[70svh] items-center overflow-hidden bg-[#0A1512] pt-16 pb-8 lg:pt-24"
    >
      {/* 1. FUNDO DO HERO (Foto Real + Overlay) */}
      <div className="absolute inset-0 -z-20 overflow-hidden">
        {/* Imagem Real de Fundo */}
        <img 
          src="https://images.unsplash.com/photo-1554224155-1696413565d3?q=80&w=2070&auto=format&fit=crop" 
          alt="" 
          className="absolute inset-0 h-full w-full object-cover opacity-60 grayscale-[0.4] brightness-[0.45] contrast-[1.15] saturate-[0.8]"
        />
        
        {/* Overlay em Gradiente */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#0A1512] via-[#0A1512]/98 to-[#0A1512]/40" />
        
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
            <h1 className="font-display text-[clamp(1.5rem,5vw,2.75rem)] font-bold leading-[1.1] tracking-tight text-white mb-2">
              Gestão financeira<br />
              <span className="bg-gradient-to-r from-[#1FAE6D] to-[#3FD68C] bg-clip-text text-transparent">estratégica.</span>
            </h1>
            <p className="max-w-xl text-[16px] font-medium leading-[1.5] text-muted-foreground sm:text-lg">
              Precisão total e controle absoluto para quem exige excelência na gestão familiar.
            </p>
          </div>

          {/* CTA E MICROCOPY */}
          <div className="mt-7 flex flex-col items-center gap-3 sm:flex-row lg:justify-start w-full">
            <Button
              className="cta-lift group relative h-12 w-full sm:w-auto rounded-lg bg-[#1FAE6D] px-8 text-[14px] font-bold text-[#001640] shadow-[0_0_30px_-5px_rgba(31,174,109,0.3)] hover:shadow-[0_0_40px_-5px_rgba(31,174,109,0.4)] transition-all overflow-hidden"
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

        </div>

        {/* 2. COMPOSIÇÃO - PRODUTO (55%) */}
        <div className="w-full lg:w-[55%] animate-in fade-in slide-in-from-right-8 duration-1000 delay-500">
          <div className="relative perspective-2000 group/mockup scale-85 lg:scale-[0.92] origin-center lg:-mt-12">
            {/* Mockup do Dashboard */}
            <div className="relative rotate-y-[-10deg] rotate-x-[5deg] skew-y-[2deg] rounded-2xl border border-white/10 bg-[#10201B]/40 p-1 shadow-[0_40px_80px_-20px_rgba(0,0,0,0.7),0_0_60px_-20px_rgba(31,174,109,0.15)] backdrop-blur-md transition-all duration-700 group-hover/mockup:rotate-y-[-5deg] group-hover/mockup:rotate-x-[2deg] group-hover/mockup:skew-y-[1deg]">
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
            
            {/* Painel Flutuante de Destaque - Refatorado */}
            <div className="absolute -left-12 top-1/4 hidden xl:block animate-float">
              <div className="rounded-xl border border-white/10 bg-emerald-500/10 p-3 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.5)] backdrop-blur-xl ring-1 ring-white/5 transition-all duration-300 hover:scale-105 hover:bg-emerald-500/20">
                <div className="flex items-center gap-3">
                  <div className="flex size-9 items-center justify-center rounded-lg bg-[#1FAE6D] text-[#001640]">
                    <Sparkles size={18} fill="currentColor" />
                  </div>
                  <div className="flex flex-col">
                    <p className="text-[11px] font-bold tracking-wider uppercase text-emerald-400/80">Meta Mensal</p>
                    <p className="text-[15px] font-bold text-white leading-none mt-0.5">92% concluída</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Segundo Painel Flutuante - Lado Oposto */}
            <div className="absolute -right-8 bottom-1/4 hidden xl:block animate-float" style={{ animationDelay: '1s' }}>
              <div className="rounded-xl border border-white/10 bg-white/5 p-3 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.5)] backdrop-blur-xl ring-1 ring-white/5 transition-all duration-300 hover:scale-105 hover:bg-white/10">
                <div className="flex items-center gap-3">
                  <div className="flex size-9 items-center justify-center rounded-lg bg-white/10 text-white">
                    <ArrowUpRight size={18} />
                  </div>
                  <div className="flex flex-col">
                    <p className="text-[11px] font-bold tracking-wider uppercase text-[#9CA8A3]">Saldo Hoje</p>
                    <p className="text-[15px] font-bold text-white tabular leading-none mt-0.5">{formatCurrency(12450.80)}</p>
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
