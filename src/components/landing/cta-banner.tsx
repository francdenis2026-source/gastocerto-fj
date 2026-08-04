
import { Link } from "@tanstack/react-router";
import { ArrowRight, PlayCircle, ShieldCheck, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/landing/reveal";

export function CtaBanner() {
  return (
    <section className="py-24 lg:py-32 overflow-hidden relative">
      <div className="container mx-auto px-6 lg:px-12">
        <Reveal delay={100}>
          <div className="relative isolate overflow-hidden rounded-[48px] bg-foreground px-8 py-20 text-background sm:px-16 sm:py-24 shadow-2xl">
            {/* High-Fidelity Background Effects */}
            <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top_right,rgba(16,185,129,0.2),transparent_50%)]" />
            <div className="absolute -top-24 -left-24 size-[500px] bg-primary/20 blur-[150px] rounded-full -z-10 animate-pulse" />
            
            <div className="flex flex-col lg:flex-row items-center justify-between gap-16 relative z-10">
              <div className="max-w-2xl text-center lg:text-left">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/20 text-primary mb-8">
                  <Sparkles className="size-4" />
                  <span className="text-[10px] font-black uppercase tracking-[0.2em]">Pronto para evoluir?</span>
                </div>
                <h2 className="text-4xl lg:text-6xl font-black tracking-tight leading-[0.95] mb-8">
                  A sua liberdade financeira começa <span className="text-primary italic">agora</span>.
                </h2>
                <p className="text-lg lg:text-xl text-background/70 font-medium leading-relaxed mb-4">
                  Junte-se a milhares de usuários que já transformaram sua relação com o dinheiro. 
                  Sem letras miúdas, sem complicações.
                </p>
                <div className="flex items-center justify-center lg:justify-start gap-3 text-background/50">
                   <ShieldCheck className="size-5 text-primary" />
                   <span className="text-xs font-bold uppercase tracking-widest">100% Seguro & Privado</span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row lg:flex-col gap-4 w-full sm:w-auto min-w-[320px]">
                <Link
                  to="/auth"
                  search={{ mode: "signup" }}
                  className="group relative flex h-16 w-full items-center justify-center gap-3 overflow-hidden rounded-2xl bg-primary px-10 text-lg font-black text-primary-foreground shadow-2xl transition-all hover:scale-[1.02] active:scale-95"
                >
                  Comece Grátis
                  <ArrowRight className="size-6 transition-transform group-hover:translate-x-1" />
                </Link>
                
                <Link
                  to="/demonstracao"
                  className="flex h-16 w-full items-center justify-center gap-3 rounded-2xl border border-background/20 bg-background/10 px-10 text-lg font-black text-background backdrop-blur-sm transition-all hover:bg-background/20 active:scale-95"
                >
                  <PlayCircle className="size-6" />
                  Ver Demo
                </Link>
              </div>
            </div>

            {/* Floating Brand Elements */}
            <div className="absolute top-10 right-10 opacity-5 hidden lg:block">
              <Sparkles className="size-32" />
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
