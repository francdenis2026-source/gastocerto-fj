import { Link } from "@tanstack/react-router";
import { Suspense, lazy } from "react";
import {
  ArrowRight,
  Play,
  Sparkles,
  Users,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/format-utils";
import { useHydrated } from "@/hooks/use-hydrated";

const DashboardPreview = lazy(() =>
  import("@/components/landing/dashboard-preview").then((m) => ({ default: m.DashboardPreview })),
);

export function MobileHeroSection() {
  const hydrated = useHydrated();

  if (!hydrated) return null;

  return (
    <section className="relative overflow-hidden bg-[#0A1210] px-4 pt-20 pb-12 md:hidden">
      {/* Background System 1:1 with Web */}
      <div className="absolute inset-0 -z-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-[#0A1210] to-[#0F1B16]" />
        <div className="absolute left-1/2 top-1/4 h-[400px] w-[400px] -translate-x-1/2 rounded-full bg-emerald-500/10 blur-[80px] animate-pulse-glow" />
        {/* REMOVED GRID PATTERN */}
        
        <svg className="absolute inset-0 h-full w-full opacity-[0.07]" viewBox="0 0 1000 1000" fill="none" preserveAspectRatio="none">
          <path d="M-100,200 C150,150 350,450 600,350 S850,50 1100,100" stroke="white" strokeWidth="0.8" className="animate-draw" />
          <path d="M-100,800 C100,700 400,900 700,750 S900,600 1100,650" stroke="white" strokeWidth="0.8" className="animate-draw" style={{ animationDelay: '1s' }} />
        </svg>
      </div>

      <div className="relative z-10 flex flex-col items-center text-center">
        {/* Top Badge */}
        <div className="mb-6 flex animate-in fade-in slide-in-from-top-4 duration-1000 items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-400 backdrop-blur-md">
          <Zap className="size-2.5" />
          Controle Total
        </div>

        {/* Headline 1:1 with Web Typography */}
        <h1 className="animate-in fade-in slide-in-from-top-4 duration-1000 font-display text-[32px] font-bold leading-[1.1] tracking-tight text-white px-2">
          Controle financeiro<br />
          <span className="bg-gradient-to-r from-emerald-400 to-emerald-600 bg-clip-text text-transparent">inteligente.</span>
        </h1>
        
        <p className="mt-4 animate-in fade-in slide-in-from-top-4 duration-1000 delay-100 max-w-[300px] text-[15px] font-medium leading-[1.6] text-[#9CA8A3]">
          Organize seus gastos e o futuro da sua família de forma simples e segura.
        </p>

        {/* CTA 1:1 with Web */}
        <div className="mt-8 flex w-full flex-col gap-3 px-4 animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-200">
          <Button
            className="cta-lift group relative h-14 w-full rounded-xl bg-gradient-to-b from-emerald-500 to-emerald-600 text-[15px] font-bold text-[#0A1210] shadow-[0_0_20px_-5px_rgba(34,197,94,0.3)] overflow-hidden"
            asChild
          >
            <Link to="/auth" search={{ mode: "signup" }}>
              <span className="relative z-10 flex items-center justify-center">
                Começar agora
                <ArrowRight className="ml-2 size-4 transition-transform active:translate-x-1" />
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full animate-[shimmer_2s_infinite]" />
            </Link>
          </Button>
          
          <Button
            variant="outline"
            className="h-14 w-full rounded-xl border-white/10 bg-white/5 text-[15px] font-bold text-white backdrop-blur-md"
            asChild
          >
            <Link to="/auth" search={{ mode: "login" }}>
              <div className="mr-3 flex size-6 items-center justify-center rounded-full bg-white/10">
                <Users size={10} className="text-emerald-400" />
              </div>
              Acessar Painel
            </Link>
          </Button>
        </div>

        {/* Mockup Product Focus 1:1 */}
        <div className="mt-12 w-full px-2 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-500">
          <div className="relative perspective-1000">
            <div className="relative rotate-x-6 rounded-2xl border border-white/10 bg-[#0F1B16]/60 p-1 shadow-[0_40px_80px_-20px_rgba(0,0,0,0.6),0_0_60px_-20px_rgba(34,197,94,0.2)] backdrop-blur-xl">
              <div className="overflow-hidden rounded-xl bg-[#0A1210]">
                <div className="flex items-center gap-1 border-b border-white/5 bg-white/5 px-3 py-2">
                  <div className="size-1.5 rounded-full bg-white/10" />
                  <div className="size-1.5 rounded-full bg-white/10" />
                  <div className="size-1.5 rounded-full bg-white/10" />
                </div>
                <Suspense fallback={<div className="h-[240px] w-full bg-[#1a2e26]/20 animate-pulse" />}>
                  <DashboardPreview />
                </Suspense>
              </div>
            </div>
            
            {/* Floating Card 1:1 */}
            <div className="absolute -right-2 -top-6 animate-float">
              <div className="rounded-xl border border-white/10 bg-white/5 p-3 shadow-2xl backdrop-blur-2xl ring-1 ring-white/5">
                <div className="flex items-center gap-2">
                  <div className="flex size-7 items-center justify-center rounded-lg bg-emerald-500/20 text-emerald-400">
                    <Sparkles size={14} />
                  </div>
                  <div className="text-left">
                    <p className="text-[9px] font-bold uppercase tracking-widest text-[#9CA8A3]">Sugestão IA</p>
                    <p className="text-[12px] font-bold text-white">+12% economia</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
