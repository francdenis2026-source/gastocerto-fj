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
import { FinancialOrbs } from "@/components/landing/financial-orbs";


export function Hero() {
  return (
    <section
      id="inicio"
      className="relative isolate flex min-h-[78svh] items-center overflow-hidden py-20 sm:min-h-[85svh]"
    >
      {/* 1. FUNDO DO HERO (Profissional fazendo contas no iPhone) */}
      <div className="absolute inset-0 -z-20">
        <img 
          src="https://images.unsplash.com/photo-1554415707-6e8cfc93fe23?q=80&w=2670&auto=format&fit=crop" 
          alt="Planejamento financeiro realista" 
          className="h-full w-full object-cover brightness-[0.55] contrast-[1.1] opacity-100"
        />









        <div className="absolute inset-0 bg-black/50 mix-blend-multiply" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/20 to-black/90" />
        <div className="absolute inset-0 backdrop-blur-[1.5px]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.8)_100%)]" />

      </div>

      {/* Camada de gráfico moderno do hero */}
      <FinancialOrbs />


      <div className="section-shell relative z-10">
        <div className="mx-auto max-w-4xl text-center">


          <Reveal className="relative space-y-5 sm:space-y-7 px-4 py-8 sm:px-8 sm:py-12 rounded-3xl bg-black/20 backdrop-blur-[2px] border border-white/5 shadow-2xl">
            <h1 className="font-display text-[clamp(2.25rem,7vw,4.25rem)] font-extrabold leading-[1.05] tracking-[-0.035em] text-white drop-shadow-[0_8px_28px_rgba(0,0,0,0.55)]">
              Domine seu{" "}
              <span className="bg-gradient-to-br from-emerald-400 via-emerald-500 to-emerald-600 bg-clip-text text-transparent drop-shadow-none">dinheiro.</span>
            </h1>

            <p
              className="mx-auto max-w-xl px-2 text-[15px] font-medium leading-[1.5] tracking-[-0.01em] text-white/90 [text-wrap:balance] drop-shadow-[0_3px_14px_rgba(0,0,0,0.7)] sm:text-[18px]"
              style={{ fontFamily: '"Space Grotesk", var(--font-display)' }}
            >
              <span className="font-semibold">Gestão estratégica com precisão.</span>{" "}
              <span className="font-semibold text-emerald-300">
                O controle definitivo na palma da sua mão.
              </span>
            </p>

            <div className="flex flex-col items-center justify-center gap-3 pt-2 sm:flex-row">
              <Button
                size="lg"
                className="h-13 w-full rounded-xl bg-emerald-500 px-8 text-[15px] font-bold text-[#001640] shadow-[0_0_36px_-12px_rgba(16,185,129,0.5)] transition-all hover:scale-[1.03] hover:bg-emerald-400 sm:w-auto active:scale-95"
                asChild
              >
                <Link to="/auth" search={{ mode: "signup" }}>
                  Começar Grátis
                  <ArrowRight className="ml-2 size-4" />
                </Link>
              </Button>

              <Button
                variant="outline"
                size="lg"
                className="h-13 w-full rounded-xl border-white/20 bg-white/5 px-8 text-[15px] font-semibold text-white backdrop-blur-2xl transition-all hover:bg-white/10 sm:w-auto active:scale-95"
                asChild
              >
                <Link to="/auth" search={{ mode: "login" }}>
                  <Users className="mr-2 size-4 text-emerald-400" />
                  Acessar Painel
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
                  className="group relative flex cursor-pointer items-center gap-2.5 overflow-hidden rounded-full border border-emerald-400/20 bg-emerald-500/[0.07] px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-emerald-200 backdrop-blur-md transition-all duration-500 animate-in fade-in slide-in-from-bottom-4 fill-mode-both hover:-translate-y-1 hover:border-emerald-400/50 hover:bg-emerald-500/15 hover:text-emerald-100 hover:shadow-[0_10px_30px_-8px_rgba(16,185,129,0.5)]"
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

function Reveal({ children, className, delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  return (
    <div 
      className={cn("animate-in fade-in slide-in-from-bottom-8 duration-1000 fill-mode-both", className)}
      style={{ animationDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}
