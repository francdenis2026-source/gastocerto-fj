import { Link } from "@tanstack/react-router";
import { Suspense, lazy } from "react";
import {
  ArrowRight,
  Play,
  Users,
} from "lucide-react";

import heroBgReal from "@/assets/hero-bg-real.jpg";
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
      className="relative isolate flex min-h-[90svh] items-center overflow-hidden bg-background pt-24"
    >
      {/* Imagem Real de Fundo */}
      <div className="absolute inset-0 -z-20 overflow-hidden">
        <img
          src={heroBgReal}
          alt="Finanças pessoais"
          className="size-full object-cover object-center"
        />
        {/* Overlay Escuro Verde-Carvão Gradiente */}
        <div className="absolute inset-0 bg-gradient-to-b from-[oklch(0.12_0.01_160)/0.9] via-[oklch(0.12_0.01_160)/0.8] to-[oklch(0.12_0.01_160)]" />
      </div>

      <div className="section-shell relative z-10 flex flex-col items-center text-center">
        {/* Headline */}
        <div className="max-w-4xl animate-in fade-in slide-in-from-top-4 duration-1000">
          <h1 className="font-display text-[clamp(2.5rem,7vw,4.5rem)] font-extrabold leading-[1.1] tracking-tight text-white">
            Controle financeiro inteligente,<br className="hidden sm:block" /> 
            <span className="text-emerald-500">do jeito que deveria ser.</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-[16px] font-medium leading-relaxed text-muted-foreground sm:text-xl">
            A plataforma completa para organizar gastos, investimentos e o futuro da sua família com simplicidade e segurança.
          </p>
        </div>

        {/* CTA Duplo */}
        <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
          <Button
            className="cta-lift group h-14 w-full justify-center rounded-xl bg-emerald-500 px-8 text-base font-bold text-black shadow-lg shadow-emerald-500/20 transition-all hover:bg-emerald-400 sm:w-auto"
            asChild
          >
            <Link to="/auth" search={{ mode: "signup" }}>
              Começar grátis
              <ArrowRight className="ml-2 size-5 transition-transform group-hover:translate-x-1" />
            </Link>
          </Button>
          <Button
            variant="ghost"
            className="h-14 w-full justify-center rounded-xl border border-white/10 px-8 text-base font-bold text-white transition-all hover:bg-white/5 sm:w-auto"
          >
            <Play className="mr-2 size-5 fill-white" />
            Ver demonstração
          </Button>
        </div>

        {/* Prova Social */}
        <div className="mt-8 flex items-center justify-center gap-3 animate-in fade-in duration-1000 delay-300">
          <div className="flex -space-x-2">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="size-8 rounded-full border-2 border-background bg-muted flex items-center justify-center text-[10px] font-bold overflow-hidden">
                <img src={`https://i.pravatar.cc/150?u=${i}`} alt="User" />
              </div>
            ))}
          </div>
          <div className="text-left">
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((i) => (
                <Sparkles key={i} className="size-3 text-yellow-500 fill-yellow-500" />
              ))}
            </div>
            <p className="text-xs font-bold text-white/80">
              <span className="text-emerald-500">+10.000</span> pessoas já organizaram suas finanças
            </p>
          </div>
        </div>

        {/* Mockup do Produto */}
        <div className="mt-16 w-full max-w-5xl animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-500">
          <div className="relative mx-auto perspective-1000">
            <div className="relative rotate-x-6 rounded-2xl border border-white/10 bg-black/40 p-2 shadow-[0_0_50px_-12px_rgba(34,197,94,0.3)] backdrop-blur-sm transition-transform duration-700 hover:rotate-x-0">
              <div className="overflow-hidden rounded-xl bg-background shadow-2xl">
                <Suspense fallback={<div className="h-[400px] w-full bg-muted/20 animate-pulse" />}>
                  <DashboardPreview />
                </Suspense>
              </div>
            </div>
            
            {/* Elementos flutuantes decorativos */}
            <div className="absolute -left-12 top-1/4 hidden lg:block animate-bounce duration-[4000ms]">
              <div className="rounded-xl border border-white/10 bg-black/60 p-4 shadow-2xl backdrop-blur-md">
                <div className="flex items-center gap-2">
                  <div className="size-2 rounded-full bg-emerald-500" />
                  <span className="text-xs font-bold text-white">Saldo atual</span>
                </div>
                <p className="mt-1 text-lg font-black text-white">{formatCurrency(12450.80)}</p>
              </div>
            </div>
            
            <div className="absolute -right-12 bottom-1/4 hidden lg:block animate-bounce duration-[5000ms]">
              <div className="rounded-xl border border-white/10 bg-black/60 p-4 shadow-2xl backdrop-blur-md">
                <div className="flex items-center gap-2">
                  <div className="size-2 rounded-full bg-red-500" />
                  <span className="text-xs font-bold text-white">Gastos do mês</span>
                </div>
                <p className="mt-1 text-lg font-black text-white">{formatCurrency(3892.45)}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
