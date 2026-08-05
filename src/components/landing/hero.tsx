import { Link } from "@tanstack/react-router";
import {
  ArrowDownRight,
  ArrowRight,
  ArrowUpRight,
  Play,
  Sparkles,
  Users,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  AiFinanceIcon,
  KidsSpaceIcon,
  MultiAccountIcon,
} from "@/components/landing/hero-feature-icons";
import { Logo } from "@/components/logo";
import { formatCurrency } from "@/lib/format";
import { cn } from "@/lib/utils";



export function Hero() {
  return (
    <section
      id="inicio"
      className="relative isolate flex min-h-[75svh] items-center overflow-hidden pt-24 pb-16 sm:min-h-[80svh] lg:pt-28 lg:py-24"
    >
      {/* 1. FUNDO DO HERO (Profissional fazendo contas no iPhone) */}
      <div className="absolute inset-0 -z-20 bg-background transition-colors duration-500">
        <img 
          src="https://images.unsplash.com/photo-1554415707-6e8cfc93fe23?q=80&w=2670&auto=format&fit=crop" 
          alt="Planejamento financeiro realista" 
          className="h-full w-full object-cover brightness-[0.9] contrast-[1.1] opacity-20 dark:brightness-[0.35] dark:opacity-70 blur-[4px] transition-all duration-500"
        />
        
        {/* Animated Particles/Orbs in background */}
        <div className="absolute top-[15%] left-[5%] h-[400px] w-[400px] animate-pulse-slow rounded-full bg-emerald-500/10 blur-[100px] opacity-40 dark:opacity-20" />
        <div className="absolute bottom-[10%] right-[5%] h-[500px] w-[500px] animate-pulse-slow rounded-full bg-emerald-500/10 blur-[120px] opacity-40 dark:opacity-20" style={{ animationDelay: '3s' }} />
        <div className="absolute top-[40%] right-[15%] h-[300px] w-[300px] animate-pulse-slow rounded-full bg-emerald-400/5 blur-[80px] opacity-30 dark:opacity-10" style={{ animationDelay: '1.5s' }} />


        <div className="absolute inset-0 bg-gradient-to-b from-background/60 via-transparent to-background transition-colors duration-500" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,var(--background)_100%)] opacity-60 transition-colors duration-500" />
      </div>

      {/* Camada de gráfico moderno do hero */}
      


      <div className="section-shell relative z-10">
        <div className="mx-auto max-w-7xl">
          <Reveal className="relative flex flex-col items-center justify-center space-y-6 px-4 py-12 sm:px-12 sm:py-20 overflow-visible">


            <h1 className="text-center font-display text-[clamp(2.5rem,10vw,5rem)] font-bold leading-[1.1] tracking-[-0.05em] text-foreground drop-shadow-lg dark:text-white">
              Sua vida <span className="text-[#1FAE6D]">financeira</span> <br className="hidden sm:block" />
              sob <span className="text-foreground/60 dark:text-white/60">controle total.</span>
            </h1>

            <p
              className="mx-auto max-w-3xl text-center section-subtitle !text-foreground/90 dark:!text-white/90 !text-[clamp(1.15rem,5vw,1.4rem)] !font-medium"
            >
              Organize seus gastos, planeje o futuro e tome decisões inteligentes com a plataforma mais completa de gestão financeira pessoal.
            </p>

            <div className="flex flex-col items-center justify-center gap-3 pt-2 sm:flex-row">
              <Button
                size="lg"
                className="cta-lift h-14 w-full rounded-2xl bg-gradient-to-br from-[#1FAE6D] to-[#54d693] px-10 text-[15px] font-black uppercase tracking-widest text-black shadow-[0_20px_40px_-10px_rgba(31,174,109,0.5)] transition-all sm:w-auto"
                asChild
              >
                <Link to="/auth" search={{ mode: "signup" }}>
                  Criar Conta Grátis
                  <ArrowRight className="ml-2 size-4" />
                </Link>
              </Button>

              <Button
                variant="outline"
                size="lg"
                className="h-14 w-full rounded-2xl border-foreground/10 dark:border-white/10 bg-foreground/5 dark:bg-white/5 px-10 text-[15px] font-bold uppercase tracking-wider text-foreground dark:text-white backdrop-blur-3xl transition-all hover:bg-foreground/10 dark:hover:bg-white/10 hover:border-[#1FAE6D]/30 sm:w-auto active:scale-95"
                asChild
              >
                <Link to="/auth" search={{ mode: "login" }}>
                  <Users className="mr-2 size-4 text-emerald-400" />
                  Entrar no Painel
                </Link>
              </Button>
            </div>

            <div className="flex flex-wrap justify-center gap-2.5 pt-2 sm:gap-3">

              {[
                { label: "IA Financeira", Icon: AiFinanceIcon },
                { label: "Espaço Kids", Icon: KidsSpaceIcon },
                { label: "Multi-Contas", Icon: MultiAccountIcon },
              ].map(({ label, Icon }, i) => (
                <span
                  key={label}
                  style={{ animationDelay: `${400 + i * 120}ms`, fontFamily: '"Space Grotesk", var(--font-display)' }}
                  className="group relative flex cursor-pointer items-center gap-2.5 overflow-hidden rounded-xl border border-foreground/5 dark:border-white/5 bg-foreground/[0.03] dark:bg-white/[0.03] px-5 py-2.5 text-[11px] font-bold uppercase tracking-[0.2em] text-foreground/50 dark:text-white/50 transition-all duration-500 animate-in fade-in slide-in-from-bottom-4 fill-mode-both hover:-translate-y-1 hover:border-[#1FAE6D]/30 hover:bg-[#1FAE6D]/5 hover:text-[#1FAE6D] hover:shadow-[0_20px_40px_-12px_rgba(0,0,0,0.5)] active:scale-95"
                  tabIndex={0}
                  role="button"
                >
                  <span className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
                  <Icon className="size-4 text-emerald-400 transition-all duration-500 group-hover:rotate-[8deg] group-hover:scale-110 group-hover:text-emerald-300" />
                  {label}
                </span>
              ))}
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

import { Reveal } from "@/components/landing/reveal";

// Removed local Reveal definition to use the shared one that supports tabIndex and other props
