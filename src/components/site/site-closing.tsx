import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Appear } from "./appear";

export function SiteClosing() {
  return (
    <section className="relative overflow-hidden border-t border-border bg-navy-700">
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-1/2 h-[26rem] w-[60rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-brand-600/10 blur-[140px]"
      />
      <div className="shell relative py-24 text-center lg:py-32">
        <Appear className="mx-auto max-w-2xl">
          <h2 className="font-display text-[clamp(2rem,4vw,3.1rem)] font-semibold tracking-tight leading-[1.06] text-bone-100">
            Comece o próximo mês sabendo exatamente onde está seu dinheiro
          </h2>
          <p className="mx-auto mt-6 max-w-lg text-[16px] leading-relaxed text-bone-100/50">
            Criar conta leva menos de um minuto. Os primeiros 14 dias liberam tudo.
          </p>
          <div className="mt-10 flex flex-col justify-center gap-3 sm:flex-row">
            <Button
              className="h-13 rounded-full bg-primary px-8 text-[15px] font-semibold text-primary-foreground hover:bg-brand-400"
              asChild
            >
              <Link to="/auth" search={{ mode: "signup" }}>
                Criar minha conta
                <ArrowRight className="ml-2 size-4" />
              </Link>
            </Button>
            <Button
              variant="outline"
              className="h-13 rounded-full border-border bg-transparent px-8 text-[15px] font-semibold text-bone-100 hover:bg-navy-600"
              asChild
            >
              <Link to="/auth" search={{ mode: "login" }}>
                Já tenho conta
              </Link>
            </Button>
          </div>
        </Appear>
      </div>
    </section>
  );
}
