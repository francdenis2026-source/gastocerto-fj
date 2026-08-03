import { Link } from "@tanstack/react-router";
import { ArrowRight, PlayCircle, ShieldCheck } from "lucide-react";

import { Button } from "@/components/ui/button";
import { GridPattern } from "@/components/landing/decor";
import { Reveal } from "@/components/landing/reveal";

export function CtaBanner() {
  return (
    <section className="section-y">
      <Reveal className="section-shell">
        <div className="relative isolate overflow-hidden rounded-3xl bg-cta-bg px-5 py-5 text-cta-fg shadow-lifted sm:px-10 sm:py-7 border border-cta-border">
          <GridPattern className="absolute inset-0 -z-10 size-full text-cta-fg/10" />
          <div
            aria-hidden="true"
            className="absolute -right-24 -top-24 -z-10 size-[320px] rounded-full bg-cta-accent-glow blur-[120px]"
          />

          <div className="grid items-center gap-4 lg:grid-cols-[1.35fr_1fr]">
            <div className="min-w-0">
              <h2 className="section-title text-cta-fg">
                Decisões melhores começam com números claros
              </h2>
              <p className="mt-2 max-w-xl text-[13px] leading-snug text-cta-fg-muted sm:text-sm">
                Conta gratuita, sem cartão de crédito e sem instalar nada. Prefere ver antes?
                Abra a demonstração com dados de exemplo.
              </p>
              <p className="mt-2 inline-flex items-center gap-2 text-[12.5px] text-cta-fg-muted">
                <ShieldCheck className="size-3.5 shrink-0 text-success" aria-hidden="true" />
                Seus dados são só seus: exporte ou apague quando quiser.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2 lg:grid-cols-1">
              <Button className="h-10 w-full shadow-lifted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cta-fg/70 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent" asChild>
                <Link to="/auth" search={{ mode: "signup" }}>
                  Criar conta grátis
                  <ArrowRight className="size-4" aria-hidden="true" />
                </Link>
              </Button>
              <Button
                variant="outline"
                className="h-10 w-full border-cta-fg/25 bg-cta-surface text-cta-fg hover:bg-cta-fg/15 hover:text-cta-fg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cta-fg/70 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent"
                asChild
              >
                <Link to="/demonstracao">
                  <PlayCircle className="size-4" aria-hidden="true" />
                  Demonstração
                </Link>
              </Button>
              <Button
                variant="ghost"
                className="col-span-2 h-9 w-full text-cta-fg-muted hover:bg-cta-fg/10 hover:text-cta-fg lg:col-span-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cta-fg/70 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent"
                asChild
              >
                <Link to="/auth" search={{ mode: "login" }}>
                  Já tenho conta — entrar
                </Link>
              </Button>
            </div>
          </div>

        </div>
      </Reveal>
    </section>
  );
}
