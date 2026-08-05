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
      className="relative isolate flex min-h-[65svh] lg:min-h-[75svh] items-center overflow-hidden pt-16 pb-8 lg:pt-24"
    >
      {/* 1. FUNDO DO HERO (Foto Real + Overlay) */}
      <div className="absolute inset-0 -z-20 overflow-hidden">
        {/* Imagem Real de Alta Resolução (Finance-focused) */}
        <img 
          src="https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?q=80&w=2670&auto=format&fit=crop" 
          alt="" 
          className="absolute inset-0 h-full w-full object-cover brightness-[0.85] contrast-[1.1]"
        />

        
        {/* Overlay em Gradiente - Adaptado para modo claro/escuro */}
        <div className="absolute inset-0 bg-transparent" />
        
        {/* Efeito de luz ambiente */}
        <div 
          className="absolute left-1/4 top-1/4 h-[500px] w-[500px] rounded-full bg-transparent blur-[120px]" 
        />
      </div>

      <div className="section-shell relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-16">
        
        {/* 2. COMPOSIÇÃO - TEXTO (45%) */}
        <div className="w-full lg:w-[45%] flex flex-col items-center text-center lg:items-start lg:text-left">
          {/* Headline com gradiente */}
          <div className="animate-in fade-in slide-in-from-top-4 duration-1000">
            <h1 className="font-display text-[clamp(1.5rem,5vw,2.75rem)] font-bold leading-[1.1] tracking-tight text-foreground dark:text-white mb-2">
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
              className="h-12 w-full sm:w-auto rounded-lg border-border/10 bg-surface/50 px-8 text-[14px] font-bold text-foreground dark:text-white backdrop-blur-md transition-all hover:bg-surface group/interactive"
              asChild
            >
              <Link to="/auth" search={{ mode: "login" }}>
                <Users size={16} className="mr-2 text-emerald-400" />
                Acessar Painel
              </Link>
            </Button>
          </div>

        </div>

        {/* REMOVED PREVIOUS MOCKUP ART */}


      </div>
    </section>
  );
}
