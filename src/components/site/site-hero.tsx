import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Appear } from "./appear";
import { ProductConsole } from "./product-console";

const proof = [
  { value: "R$ 1,2 mi", label: "movimentados e organizados" },
  { value: "8 anos", label: "de histórico auditável" },
  { value: "100%", label: "dos dados criptografados" },
];

export function SiteHero() {
  return (
    <section className="relative overflow-hidden bg-navy-800 pt-28 lg:pt-36">
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-[-18rem] h-[36rem] w-[72rem] -translate-x-1/2 rounded-full bg-brand-600/8 blur-[160px]"
      />

      <div className="shell relative">
        <div className="grid items-start gap-16 lg:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)] lg:gap-20">
          <Appear className="max-w-xl lg:pt-6">
            <p className="kicker">Gestão financeira pessoal</p>

            <h1 className="mt-6 font-display text-[clamp(2.4rem,5.2vw,3.9rem)] font-semibold tracking-tight leading-[1.04] text-bone-100">
              Cada real no lugar certo.
              <span className="block text-bone-100/45">Todo mês, sem esforço.</span>
            </h1>

            <p className="mt-7 max-w-md text-[17px] leading-relaxed text-bone-100/55">
              O GastoCerto reúne contas, cartões, receitas e despesas em um único painel claro — com
              projeções confiáveis e histórico que não se perde.
            </p>

            <div className="mt-10 flex flex-col gap-3 sm:flex-row">
              <Button
                className="h-13 rounded-full bg-primary px-8 text-[15px] font-semibold text-primary-foreground transition-all duration-220 hover:bg-brand-400 hover:shadow-lifted active:scale-[0.98]"
                asChild
              >
                <Link to="/auth" search={{ mode: "signup" }}>
                  Criar minha conta
                  <ArrowRight className="ml-2 size-4" />
                </Link>
              </Button>
              <Button
                variant="outline"
                className="h-13 rounded-full border-border bg-transparent px-8 text-[15px] font-semibold text-bone-100 transition-all duration-220 hover:bg-navy-600 hover:border-primary/30 active:scale-[0.98]"
                asChild
              >
                <Link to="/demonstracao">Ver a plataforma</Link>
              </Button>
            </div>

            <dl className="mt-14 grid grid-cols-3 gap-6 border-t border-border pt-8">
              {proof.map((item) => (
                <div key={item.label}>
                  <dt className="numeric text-[19px] font-semibold text-bone-100">{item.value}</dt>
                  <dd className="mt-1 text-[12px] leading-snug text-bone-100/40">{item.label}</dd>
                </div>
              ))}
            </dl>
          </Appear>

          <Appear delay={120} className="lg:-mr-6">
            <ProductConsole />
          </Appear>
        </div>
      </div>

      <div className="mt-24 h-px w-full bg-border lg:mt-32" />
    </section>
  );
}
