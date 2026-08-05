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
      {/* 1. FUNDO DO HERO (Foto Real) */}
      <div className="absolute inset-0 -z-20">
        <img 
          src="https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?q=80&w=2670&auto=format&fit=crop" 
          alt="" 
          className="h-full w-full object-cover brightness-[0.45] contrast-[1.15]"
        />




        <div className="absolute inset-0 bg-gradient-to-b from-[#001640]/80 via-[#001640]/40 to-[#001640]/90 mix-blend-multiply" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,#001640_80%)] opacity-60" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#001640]/40 via-transparent to-[#001640]/40" />

      </div>

      <div className="section-shell relative z-10">
        <div className="mx-auto max-w-4xl text-center">
          {/* Logo Centralizada no Mobile */}
          <div className="mb-8 flex justify-center lg:hidden">
            <Logo onDark href="/" className="group" />
          </div>


          <Reveal className="space-y-6">
            <h1 className="font-display text-[clamp(2.5rem,8vw,5rem)] font-black leading-[0.95] tracking-tight text-white drop-shadow-2xl">
              Domine seu<br />
              <span className="bg-gradient-to-r from-emerald-400 via-emerald-500 to-emerald-400 bg-clip-text text-transparent">dinheiro.</span>
            </h1>
            
            <p className="mx-auto max-w-2xl text-lg font-bold leading-relaxed text-emerald-50/90 drop-shadow-md sm:text-2xl">
              Precisão absoluta e controle estratégico para sua vida financeira. Uma única tela, poder ilimitado.
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

            {/* Microcopy compacta */}
            <div className="flex flex-wrap justify-center gap-x-8 gap-y-2 pt-8 text-xs font-black uppercase tracking-[0.2em] text-emerald-500/60">
              <span className="flex items-center gap-2"><Sparkles className="size-3" /> IA Financeira</span>
              <span className="flex items-center gap-2"><Sparkles className="size-3" /> Espaço Kids</span>
              <span className="flex items-center gap-2"><Sparkles className="size-3" /> Multi-Contas</span>
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
