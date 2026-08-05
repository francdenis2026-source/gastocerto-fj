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
      className="relative isolate flex min-h-[95svh] items-center overflow-hidden bg-[#0A1210] pt-32 pb-20 lg:pt-40"
    >
      {/* 1. FUNDO DO HERO (Abstrato/Digital) */}
      <div className="absolute inset-0 -z-20 overflow-hidden">
        {/* Gradiente profundo */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#0A1210] to-[#0F1B16]" />
        
        {/* Gradiente radial verde sutil atrás do produto */}
        <div 
          className="absolute left-1/2 top-1/2 h-[800px] w-[800px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-emerald-500/10 blur-[120px]" 
        />

        {/* Grid pontilhado sutil */}
        <div className="absolute inset-0 opacity-[0.03]" 
             style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '32px 32px' }} />

        {/* Elementos SVG decorativos abstratos */}
        <svg className="absolute inset-0 h-full w-full opacity-[0.07]" viewBox="0 0 1000 1000" fill="none" preserveAspectRatio="none">
          <path d="M-100,200 C150,150 350,450 600,350 S850,50 1100,100" stroke="white" strokeWidth="0.5" />
          <path d="M-100,800 C100,700 400,900 700,750 S900,600 1100,650" stroke="white" strokeWidth="0.5" />
          <circle cx="100" cy="150" r="1.5" fill="white" />
          <circle cx="850" cy="800" r="1.5" fill="white" />
          <line x1="100" y1="150" x2="250" y2="100" stroke="white" strokeWidth="0.2" />
        </svg>
      </div>

      <div className="section-shell relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-16">
        
        {/* 2. COMPOSIÇÃO - TEXTO (45%) */}
        <div className="w-full lg:w-[45%] flex flex-col items-center text-center lg:items-start lg:text-left">
          {/* Headline com gradiente */}
          <div className="animate-in fade-in slide-in-from-top-4 duration-1000">
            <h1 className="font-display text-[clamp(2rem,8vw,4rem)] font-bold leading-[1.05] tracking-tight text-white mb-6">
              Controle financeiro<br />
              <span className="bg-gradient-to-r from-emerald-400 to-emerald-600 bg-clip-text text-transparent">inteligente.</span>
            </h1>
            <p className="max-w-xl text-[18px] font-medium leading-[1.6] text-[#9CA8A3] sm:text-xl">
              Organize seus gastos e o futuro da sua família com uma plataforma técnica e poderosa feita para quem exige precisão.
            </p>
          </div>

          {/* CTA E MICROCOPY */}
          <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row lg:justify-start w-full">
            <Button
              className="cta-lift group h-14 w-full sm:w-auto rounded-xl bg-gradient-to-b from-emerald-500 to-emerald-600 px-8 text-[15px] font-bold text-[#0A1210] shadow-[0_0_30px_-5px_rgba(34,197,94,0.3)] hover:shadow-[0_0_40px_-5px_rgba(34,197,94,0.4)] transition-all"
              asChild
            >
              <Link to="/auth" search={{ mode: "signup" }}>
                Começar agora
                <ArrowRight className="ml-2 size-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </Button>
            <Button
              variant="outline"
              className="h-14 w-full sm:w-auto rounded-xl border-white/10 bg-white/5 px-8 text-[15px] font-bold text-white backdrop-blur-md transition-all hover:bg-white/10"
            >
              <div className="mr-3 flex size-6 items-center justify-center rounded-full bg-white/10">
                <Play size={12} className="fill-white ml-0.5" />
              </div>
              Ver demonstração
            </Button>
          </div>

          {/* Prova Social Reformulada */}
          <div className="mt-10 flex items-center gap-4 animate-in fade-in duration-1000 delay-300">
            <div className="flex -space-x-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="size-9 rounded-full border-2 border-[#0A1210] bg-[#1a2e26] ring-1 ring-white/5 overflow-hidden">
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
          <div className="relative perspective-2000">
            {/* Mockup do Dashboard com Perspectiva 3D */}
            <div className="relative rotate-y-[-10deg] rotate-x-[5deg] skew-y-[2deg] rounded-2xl border border-white/10 bg-[#0F1B16]/60 p-1.5 shadow-[0_60px_100px_-20px_rgba(0,0,0,0.6),0_0_80px_-20px_rgba(34,197,94,0.2)] backdrop-blur-xl transition-all duration-700 hover:rotate-0 hover:skew-y-0">
              <div className="overflow-hidden rounded-xl bg-[#0A1210] shadow-2xl">
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
            
            {/* 2. Cards Flutuantes com Glassmorphism */}
            <div className="absolute -left-8 top-12 hidden xl:block animate-in slide-in-from-left-4 duration-1000 delay-700">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4 shadow-2xl backdrop-blur-2xl ring-1 ring-white/5">
                <div className="flex items-center gap-3">
                  <div className="flex size-10 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-400">
                    <Sparkles size={18} />
                  </div>
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-widest text-[#9CA8A3]">Sugestão IA</p>
                    <p className="text-[15px] font-bold text-white">+12% economia</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="absolute -right-6 bottom-20 hidden xl:block animate-in slide-in-from-right-4 duration-1000 delay-1000">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4 shadow-2xl backdrop-blur-2xl ring-1 ring-white/5">
                <div className="flex flex-col gap-1">
                  <p className="text-[11px] font-bold uppercase tracking-widest text-[#9CA8A3]">Patrimônio</p>
                  <p className="font-mono text-xl font-bold tracking-tight text-white">
                    {formatCurrency(142650.00)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}
