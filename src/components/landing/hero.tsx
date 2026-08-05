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
      className="relative isolate flex min-h-[85svh] items-center overflow-hidden py-24 sm:min-h-[90svh] lg:py-32"
    >
      {/* 1. FUNDO DO HERO (Profissional fazendo contas no iPhone) */}
      <div className="absolute inset-0 -z-20 bg-[#0A1512]">
        <img 
          src="https://images.unsplash.com/photo-1554415707-6e8cfc93fe23?q=80&w=2670&auto=format&fit=crop" 
          alt="Planejamento financeiro realista" 
          className="h-full w-full object-cover brightness-[0.45] contrast-[1.1] opacity-70 grayscale-[0.2]"
        />









        <div className="absolute inset-0 bg-gradient-to-b from-[#0A1512]/60 via-[#0A1512]/30 to-[#0A1512]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_40%_50%,rgba(31,174,109,0.12)_0%,transparent_70%)]" />
        <div className="absolute inset-0 backdrop-blur-[0.5px]" />

      </div>

      {/* Camada de gráfico moderno do hero */}
      


      <div className="section-shell relative z-10">
        <div className="mx-auto max-w-5xl">
          <Reveal className="relative flex flex-col items-center justify-center space-y-7 px-4 py-16 sm:px-12 sm:py-28 overflow-visible">
            {/* Efeito de luz sutil no card */}
            <div className="absolute -top-32 -left-32 size-64 rounded-full bg-[#1FAE6D]/15 blur-[100px] animate-pulse" />
            <div className="absolute -bottom-32 -right-32 size-64 rounded-full bg-[#1FAE6D]/10 blur-[100px]" />

            <div className="flex items-center gap-2 rounded-full border border-[#1FAE6D]/20 bg-[#1FAE6D]/10 px-4 py-1.5 backdrop-blur-md">
              <Sparkles className="size-3.5 text-[#1FAE6D]" />
              <span className="text-[10px] font-bold uppercase tracking-widest text-[#1FAE6D]">Tecnologia Fintech de Elite</span>
            </div>

            <h1 className="text-center font-display text-[clamp(2.25rem,10vw,5.5rem)] font-black leading-[1.1] tracking-[-0.05em] text-white drop-shadow-[0_4px_12px_rgba(0,0,0,0.5)]">
              Controle o seu <br className="hidden sm:block" />
              <span className="bg-gradient-to-r from-white via-[#1FAE6D] to-[#1FAE6D] bg-clip-text text-transparent">patrimônio.</span>
            </h1>

            <p
              className="mx-auto max-w-2xl text-center text-[15px] font-medium leading-[1.6] tracking-tight text-white/90 drop-shadow-sm [text-wrap:balance] sm:text-[20px]"
              style={{ fontFamily: '"Space Grotesk", var(--font-display)' }}
            >
              A engenharia financeira definitiva para quem busca precisão,{" "}
              <span className="text-white">segurança e total domínio sobre os gastos.</span>
            </p>

            <div className="flex flex-col items-center justify-center gap-3 pt-2 sm:flex-row">
              <Button
                size="lg"
                className="cta-lift h-14 w-full rounded-2xl bg-gradient-to-br from-[#1FAE6D] to-[#54d693] px-10 text-[15px] font-black uppercase tracking-widest text-black shadow-[0_20px_40px_-10px_rgba(31,174,109,0.5)] transition-all sm:w-auto"
                asChild
              >
                <Link to="/auth" search={{ mode: "signup" }}>
                  Começar Jornada
                  <ArrowRight className="ml-2 size-4" />
                </Link>
              </Button>

              <Button
                variant="outline"
                size="lg"
                className="h-14 w-full rounded-2xl border-white/10 bg-white/5 px-10 text-[15px] font-bold uppercase tracking-wider text-white backdrop-blur-3xl transition-all hover:bg-white/10 hover:border-[#1FAE6D]/30 sm:w-auto active:scale-95"
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
                  className="group relative flex cursor-pointer items-center gap-2.5 overflow-hidden rounded-xl border border-white/5 bg-white/[0.03] px-5 py-2.5 text-[11px] font-bold uppercase tracking-[0.2em] text-white/50 transition-all duration-500 animate-in fade-in slide-in-from-bottom-4 fill-mode-both hover:-translate-y-1 hover:border-[#1FAE6D]/30 hover:bg-[#1FAE6D]/5 hover:text-[#1FAE6D] hover:shadow-[0_20px_40px_-12px_rgba(0,0,0,0.5)]"
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
