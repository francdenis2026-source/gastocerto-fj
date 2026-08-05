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

      <div className="section-shell relative z-10">
        <div className="mx-auto max-w-4xl text-center">


          <Reveal className="space-y-6 sm:space-y-8">
            <h1 className="font-display text-[clamp(2rem,11vw,5.5rem)] font-[1000] leading-[0.95] sm:leading-[0.9] tracking-[-0.04em] sm:tracking-[-0.05em] text-white drop-shadow-[0_8px_20px_rgba(0,0,0,0.6)] uppercase italic px-2">
              Domine seu<br />
              <span className="bg-gradient-to-r from-emerald-300 via-emerald-400 to-emerald-200 bg-clip-text text-transparent drop-shadow-none">dinheiro.</span>
            </h1>
            
            <p className="mx-auto max-w-2xl px-4 text-base font-medium leading-relaxed text-white/95 drop-shadow-xl sm:text-2xl tracking-tight">
              Precisão absoluta e controle estratégico para sua vida financeira. <span className="text-emerald-400 font-bold">Uma única tela, poder ilimitado.</span>
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

            <div className="flex flex-wrap justify-center gap-x-10 gap-y-4 pt-12">
              {[
                { label: "IA Financeira", icon: Sparkles },
                { label: "Espaço Kids", icon: Sparkles },
                { label: "Multi-Contas", icon: Sparkles }
              ].map((item, i) => (
                <span key={i} className="flex items-center gap-2.5 px-4 py-1.5 rounded-full border border-emerald-500/10 bg-emerald-500/5 text-[10px] font-black uppercase tracking-[0.25em] text-emerald-400/90 shadow-[0_4px_12px_rgba(16,185,129,0.1)] transition-all hover:bg-emerald-500/10 hover:border-emerald-500/20">
                  <item.icon className="size-3 text-emerald-500" />
                  {item.label}
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
