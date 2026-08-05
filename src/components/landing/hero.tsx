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
import {
  AiFinanceIcon,
  KidsSpaceIcon,
  MultiAccountIcon,
} from "@/components/landing/hero-feature-icons";
import { Logo } from "@/components/logo";
import { formatCurrency } from "@/lib/format";
import { cn } from "@/lib/utils";


const DashboardPreview = lazy(() =>
  import("@/components/landing/dashboard-preview").then((m) => ({ default: m.DashboardPreview })),
);

export function Hero() {
  return (
    <section
      id="inicio"
      className="relative isolate flex min-h-dvh items-center overflow-hidden"
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

      {/* Camada decorativa em SVG: malha, arco financeiro e sparkline */}
      <svg
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 h-full w-full opacity-[0.5]"
        preserveAspectRatio="none"
        viewBox="0 0 1200 800"
      >
        <defs>
          <linearGradient id="heroLine" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#54A860" stopOpacity="0" />
            <stop offset="50%" stopColor="#8FCB9B" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#54A860" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="heroArea" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#54A860" stopOpacity="0.28" />
            <stop offset="100%" stopColor="#54A860" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path
          d="M0 700 L120 660 L240 690 L360 600 L480 640 L600 520 L720 560 L840 440 L960 480 L1080 380 L1200 420 L1200 800 L0 800Z"
          fill="url(#heroArea)"
        />
        <path
          d="M0 700 L120 660 L240 690 L360 600 L480 640 L600 520 L720 560 L840 440 L960 480 L1080 380 L1200 420"
          fill="none"
          stroke="url(#heroLine)"
          strokeWidth="2.5"
          strokeLinejoin="round"
        />
        <circle cx="1080" cy="380" r="6" fill="#8FCB9B">
          <animate attributeName="r" values="5;9;5" dur="2.6s" repeatCount="indefinite" />
        </circle>
        <circle cx="600" cy="520" r="4" fill="#54A860" opacity="0.8">
          <animate attributeName="opacity" values="0.3;1;0.3" dur="3.4s" repeatCount="indefinite" />
        </circle>
      </svg>

      <div className="section-shell relative z-10">
        <div className="mx-auto max-w-4xl text-center">


          <Reveal className="space-y-6 sm:space-y-10">
            <h1 className="font-display text-[clamp(2.75rem,12vw,7.5rem)] font-extrabold leading-[1] tracking-[-0.05em] text-white drop-shadow-[0_12px_40px_rgba(0,0,0,0.6)] px-4">
              Domine seu<br />
              <span className="bg-gradient-to-br from-emerald-400 via-emerald-500 to-emerald-600 bg-clip-text text-transparent drop-shadow-none">dinheiro.</span>
            </h1>
            
            <p
              className="mx-auto max-w-2xl px-6 text-[17px] font-medium leading-[1.45] tracking-[-0.015em] text-white/95 [text-wrap:balance] drop-shadow-[0_4px_18px_rgba(0,0,0,0.75)] sm:text-[26px]"
              style={{ fontFamily: '"Space Grotesk", var(--font-display)' }}
            >
              <span className="font-semibold">Gestão estratégica com precisão.</span>{" "}
              <span className="bg-gradient-to-r from-emerald-300 to-emerald-500 bg-clip-text font-bold text-transparent">
                O controle definitivo na palma da sua mão.
              </span>
            </p>

            <div className="flex flex-col items-center justify-center gap-4 pt-6 sm:flex-row">
              <Button
                size="lg"
                className="h-16 w-full rounded-2xl bg-emerald-500 px-10 text-lg font-black text-[#001640] shadow-[0_0_50px_-10px_rgba(16,185,129,0.5)] transition-all hover:scale-105 hover:bg-emerald-400 sm:w-auto active:scale-95"
                asChild
              >
                <Link to="/auth" search={{ mode: "signup" }}>
                  Começar Grátis
                  <ArrowRight className="ml-2 size-6" />
                </Link>
              </Button>
              
              <Button
                variant="outline"
                size="lg"
                className="h-16 w-full rounded-2xl border-white/20 bg-white/5 px-10 text-lg font-bold text-white backdrop-blur-2xl transition-all hover:bg-white/10 sm:w-auto active:scale-95"
                asChild
              >
                <Link to="/auth" search={{ mode: "login" }}>
                  <Users className="mr-2 size-6 text-emerald-400" />
                  Acessar Painel
                </Link>
              </Button>
            </div>

            <svg aria-hidden="true" viewBox="0 0 240 12" className="mx-auto mt-10 h-3 w-52 text-emerald-400/70">
              <path d="M0 6h92" stroke="currentColor" strokeWidth="1" opacity="0.35" />
              <path d="M148 6h92" stroke="currentColor" strokeWidth="1" opacity="0.35" />
              <path d="M112 2l8 4-8 4-8-4z" fill="currentColor" />
              <circle cx="132" cy="6" r="2" fill="currentColor" opacity="0.7" />
              <circle cx="108" cy="6" r="0" fill="currentColor" />
            </svg>

            <div className="flex flex-wrap justify-center gap-3 pt-8 sm:gap-4">
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
