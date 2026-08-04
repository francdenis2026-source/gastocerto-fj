import { Link } from "@tanstack/react-router";
import { ArrowRight, PlayCircle, ShieldCheck } from "lucide-react";

import { Button } from "@/components/ui/button";
import { GridPattern } from "@/components/landing/decor";
import { Reveal } from "@/components/landing/reveal";

export function CtaBanner() {
  return (
    <section className="section-y">
      <Reveal className="section-shell">
        <div className="relative isolate overflow-hidden rounded-[2.5rem] bg-cta-bg px-6 py-10 text-cta-fg shadow-2xl sm:px-12 sm:py-14 border border-white/5 transition-all duration-500 hover:border-brand/30">
          <GridPattern className="absolute inset-0 -z-10 size-full text-cta-fg/5" />
          
          {/* Efeitos de Glow High-Tech */}
          <div
            aria-hidden="true"
            className="absolute -right-32 -top-32 -z-10 size-[400px] rounded-full bg-cta-accent-glow blur-[140px] animate-pulse"
          />
          <div
            aria-hidden="true"
            className="absolute -left-32 -bottom-32 -z-10 size-[400px] rounded-full bg-brand/10 blur-[140px]"
          />

          <div className="grid items-center gap-10 lg:grid-cols-[1.4fr_1fr]">
            <div className="min-w-0">
              <h2 className="font-display text-2xl font-black leading-tight tracking-tight text-cta-fg sm:text-4xl">
                Decisões inteligentes começam com dados precisos.
              </h2>
              <p className="mt-4 max-w-xl text-base leading-relaxed text-cta-fg-muted">
                Junte-se à nova era da gestão financeira familiar. Comece grátis, sem cartão, 
                seguro e pronto para uso em segundos.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
              <Button size="lg" className="h-14 w-full rounded-2xl bg-brand text-base font-bold shadow-[0_0_30px_rgba(23,164,95,0.2)] transition-transform hover:scale-105 active:scale-95" asChild>
                <Link to="/auth" search={{ mode: "signup" }}>
                  Começar Agora
                  <ArrowRight className="size-5 ml-1" aria-hidden="true" />
                </Link>
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="h-14 w-full rounded-2xl border-white/10 bg-white/5 text-base font-bold text-white backdrop-blur-md transition-all hover:bg-white/10 hover:border-brand/40"
                asChild
              >
                <Link to="/demonstracao">
                  <PlayCircle className="size-5 mr-2" aria-hidden="true" />
                  Ver Demo Interativa
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </Reveal>
    </section>
  );
}
