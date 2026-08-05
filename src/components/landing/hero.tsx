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
      className="relative isolate flex min-h-[95svh] items-center overflow-hidden bg-background pt-32 pb-20 lg:pt-40"
    >
      {/* 1. FUNDO DO HERO (Abstrato/Digital) */}
      <div className="absolute inset-0 -z-20 overflow-hidden">
        {/* Gradiente profundo */}
        <div className="absolute inset-0 bg-gradient-to-b from-background to-surface" />
        
        {/* Gradiente radial verde sutil atrás do produto com pulsação */}
        <div 
          className="absolute left-1/2 top-1/2 h-[800px] w-[800px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-emerald-500/10 blur-[120px] animate-pulse-glow" 
        />

        {/* Grid pontilhado sutil */}
        <div className="absolute inset-0 opacity-[0.03]" 
             style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '32px 32px' }} />

        {/* Elementos SVG decorativos abstratos com animação de traço */}
        <svg className="absolute inset-0 h-full w-full opacity-[0.07]" viewBox="0 0 1000 1000" fill="none" preserveAspectRatio="none">
          <path d="M-100,200 C150,150 350,450 600,350 S850,50 1100,100" stroke="white" strokeWidth="0.5" className="animate-draw" />
          <path d="M-100,800 C100,700 400,900 700,750 S900,600 1100,650" stroke="white" strokeWidth="0.5" className="animate-draw" style={{ animationDelay: '1s' }} />
          <circle cx="100" cy="150" r="1.5" fill="white" className="animate-pulse" />
          <circle cx="850" cy="800" r="1.5" fill="white" className="animate-pulse" style={{ animationDelay: '1.5s' }} />
        </svg>
      </div>

      <div className="section-shell relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-16">
        
        {/* 2. COMPOSIÇÃO - TEXTO (45%) */}
        <div className="w-full lg:w-[45%] flex flex-col items-center text-center lg:items-start lg:text-left">
          {/* Headline com gradiente */}
          <div className="animate-in fade-in slide-in-from-top-4 duration-1000">
            <h1 className="font-display text-[clamp(2rem,8vw,4rem)] font-bold leading-[1.05] tracking-tight text-white mb-6">
              Gestão financeira<br />
              <span className="bg-gradient-to-r from-emerald-400 to-emerald-600 bg-clip-text text-transparent">profissional.</span>
            </h1>
            <p className="max-w-xl text-[18px] font-medium leading-[1.6] text-muted-foreground sm:text-xl">
              Domine seus recursos com uma plataforma técnica projetada para quem exige controle total e precisão estratégica.
            </p>
          </div>

          {/* CTA E MICROCOPY */}
          <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row lg:justify-start w-full">
            <Button
              className="cta-lift group relative h-14 w-full sm:w-auto rounded-xl bg-gradient-to-b from-[#22C55E] to-[#4ADE80] px-8 text-[15px] font-bold text-[#0B1F1A] shadow-[0_0_30px_-5px_rgba(34,197,94,0.3)] hover:shadow-[0_0_40px_-5px_rgba(34,197,94,0.4)] transition-all overflow-hidden"
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
              className="h-14 w-full sm:w-auto rounded-xl border-white/10 bg-white/5 px-8 text-[15px] font-bold text-white backdrop-blur-md transition-all hover:bg-white/10 group/play"
            >
              <div className="mr-3 flex size-6 items-center justify-center rounded-full bg-white/10 transition-transform group-hover/play:scale-110">
                <Play size={12} className="fill-white ml-0.5" />
              </div>
              Ver demonstração
            </Button>
          </div>

          {/* Prova Social Reformulada */}
          <div className="mt-10 flex items-center gap-4 animate-in fade-in duration-1000 delay-300">
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
          <div className="relative perspective-2000 group/mockup">
            {/* Mockup do Dashboard com Perspectiva 3D e Parallax leve no Hover */}
            <div className="relative rotate-y-[-10deg] rotate-x-[5deg] skew-y-[2deg] rounded-2xl border border-white/10 bg-[#0F1B16]/60 p-1.5 shadow-[0_60px_100px_-20px_rgba(0,0,0,0.6),0_0_80px_-20px_rgba(34,197,94,0.2)] backdrop-blur-xl transition-all duration-700 group-hover/mockup:rotate-y-[-5deg] group-hover/mockup:rotate-x-[2deg] group-hover/mockup:skew-y-[1deg]">
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
            
            {/* 2. Cards Flutuantes com Animação de Flutuação */}
            <div className="absolute -left-8 top-12 hidden xl:block animate-float">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4 shadow-2xl backdrop-blur-2xl ring-1 ring-white/5">
                <div className="flex items-center gap-3">
                  <div className="flex size-10 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-400">
                    <Sparkles size={18} />
                  </div>
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">Otimização</p>
                    <p className="text-[15px] font-bold text-white">+18% eficiência</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="absolute -right-6 bottom-20 hidden xl:block animate-float" style={{ animationDelay: '1.5s' }}>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4 shadow-2xl backdrop-blur-2xl ring-1 ring-white/5">
                <div className="flex flex-col gap-1">
                  <p className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">Patrimônio</p>
                  <p className="font-mono text-xl font-bold tracking-tight text-white tabular-nums">
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
