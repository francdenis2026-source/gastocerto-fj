import { Link } from "@tanstack/react-router";
import { ArrowRight, PlayCircle, ShieldCheck } from "lucide-react";

import { Button } from "@/components/ui/button";
import { GridPattern } from "@/components/landing/decor";
import { Reveal } from "@/components/landing/reveal";

export function CtaBanner() {
  return (
    <section className="section-padding">
      <Reveal className="section-shell">
        <div className="relative isolate overflow-hidden rounded-[32px] bg-card px-8 py-16 text-foreground shadow-premium sm:px-16 sm:py-20 border border-border transition-all duration-500 hover:shadow-2xl">
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
              <h2 className="font-display text-4xl font-extrabold leading-tight tracking-tight text-foreground sm:text-5xl">
                Decisões inteligentes começam com dados precisos.
              </h2>
              <p className="mt-6 text-lg leading-relaxed text-muted-foreground lg:text-xl">
                Junte-se à nova era da gestão financeira familiar. Comece grátis, sem cartão, 
                seguro e pronto para uso em segundos.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
              <Button className="btn-primary h-14 w-full text-lg" asChild>
                <Link to="/auth" search={{ mode: "signup" }}>
                  Começar Agora
                  <ArrowRight className="size-5 ml-2" aria-hidden="true" />
                </Link>
              </Button>
              <Button
                className="btn-secondary h-14 w-full text-lg"
                asChild
              >
                <Link to="/demonstracao">
                  <PlayCircle className="size-5 mr-2" aria-hidden="true" />
                  Ver Demo
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </Reveal>
    </section>
  );
}
