import { Link } from "@tanstack/react-router";
import {
  ArrowRight,
  BellRing,
  Fuel,
  Gauge,
  PiggyBank,
  ShieldCheck,
  Smartphone,
  Sparkles,
  type LucideIcon,
} from "lucide-react";

import { Reveal } from "@/components/landing/reveal";
import { Button } from "@/components/ui/button";
import { DemoDialog } from "@/components/landing/demo-dialog";
import { FeatureDetailDialog } from "@/components/landing/feature-detail-dialog";

type Benefit = {
  icon: LucideIcon;
  title: string;
  text: string;
  metric: string;
  metricLabel: string;
  accent: string;
};

const benefits: Benefit[] = [
  {
    icon: Gauge,
    title: "Visão mensal em um toque",
    text: "Receitas, despesas, sobra e pendências consolidados assim que você abre o app.",
    metric: "10 s",
    metricLabel: "para lançar",
    accent: "var(--acc-1)",
  },
  {
    icon: Fuel,
    title: "Custo real do veículo",
    text: "Abastecimentos, consumo médio, custo por km e alertas de desvio por veículo.",
    metric: "R$/km",
    metricLabel: "calculado",
    accent: "var(--acc-3)",
  },
  {
    icon: PiggyBank,
    title: "Orçamentos inteligentes",
    text: "Limite por categoria com barra de consumo e aviso antes de estourar o mês.",
    metric: "80%",
    metricLabel: "alerta do limite",
    accent: "var(--acc-2)",
  },
  {
    icon: BellRing,
    title: "Contas sempre em dia",
    text: "Recorrências lançadas sozinhas e lembretes três dias antes do vencimento.",
    metric: "0",
    metricLabel: "juros por atraso",
    accent: "var(--acc-5)",
  },
  {
    icon: ShieldCheck,
    title: "Dados isolados por conta",
    text: "Cada usuário acessa apenas os próprios registros, com regras aplicadas no banco.",
    metric: "LGPD",
    metricLabel: "na prática",
    accent: "var(--acc-6)",
  },
  {
    icon: Smartphone,
    title: "Funciona instalado no celular",
    text: "Instale como aplicativo, use offline e continue lançando sem conexão.",
    metric: "PWA",
    metricLabel: "com modo offline",
    accent: "var(--acc-4)",
  },
];

/**
 * Seção de benefícios e diferenciais logo abaixo do hero.
 * Cards responsivos: 1 coluna no mobile, 2 no tablet e 3 no desktop.
 */
export function Benefits() {
  return (
    <section
      id="beneficios"
      aria-labelledby="beneficios-titulo"
      className="relative border-b border-border bg-background section-y"
    >
      <div className="section-shell">
        <Reveal className="max-w-2xl">
          <p className="inline-flex items-center gap-1.5 text-[10.5px] font-semibold uppercase tracking-[0.18em] text-brand sm:text-[12.5px]">
            <Sparkles className="size-3.5" aria-hidden="true" />
            Benefícios e diferenciais
          </p>
          <h2 id="beneficios-titulo" className="mt-1.5 section-title">
            Por que o GastoCerto facilita o controle do seu dinheiro
          </h2>
          <p className="mt-2 hidden text-[13px] leading-relaxed text-muted-foreground sm:block sm:text-sm">
            Seis diferenciais que separam um controle improvisado de uma gestão financeira
            documentada — do lançamento diário ao relatório do mês.
          </p>
        </Reveal>

        <ul className="mt-3 grid grid-cols-2 gap-2 sm:mt-5 sm:gap-3 lg:grid-cols-3">
          {benefits.map((benefit, index) => (
            <Reveal as="li" key={benefit.title} delay={index * 60}>
              <FeatureDetailDialog
                feature={{ title: benefit.title, text: benefit.text, tag: benefit.metricLabel }}
              >
                <button
                  type="button"
                  className="group flex h-full w-full flex-col rounded-3xl border border-border bg-card/40 p-3 text-left shadow-soft backdrop-blur-md transition-all duration-300 hover:-translate-y-1.5 hover:border-brand/40 hover:shadow-[0_20px_40px_rgba(23,164,95,0.1)] active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background sm:p-5"
                  style={{
                    backgroundImage: `linear-gradient(150deg, color-mix(in oklab, ${benefit.accent} 10%, transparent), transparent 62%)`,
                  }}
                >
                  <div className="flex w-full items-start justify-between gap-1.5">
                    <span
                      className="grid size-9 shrink-0 place-items-center rounded-xl border sm:size-10"
                      style={{
                        borderColor: `color-mix(in oklab, ${benefit.accent} 30%, transparent)`,
                        background: `color-mix(in oklab, ${benefit.accent} 14%, transparent)`,
                        color: benefit.accent,
                      }}
                    >
                      <benefit.icon className="size-4.5" aria-hidden="true" />
                    </span>
                    <span className="text-right">
                      <span
                        className="block font-display text-sm font-bold leading-none tabular"
                        style={{ color: benefit.accent }}
                      >
                        {benefit.metric}
                      </span>
                      <span className="mt-0.5 block text-[10px] font-medium uppercase tracking-[0.08em] text-muted-foreground">
                        {benefit.metricLabel}
                      </span>
                    </span>
                  </div>
                  <h3 className="mt-2 font-display text-[13px] font-bold leading-snug tracking-tight sm:text-[15px]">
                    {benefit.title}
                  </h3>
                  <p className="mt-1 line-clamp-3 text-[11.5px] leading-snug text-muted-foreground sm:line-clamp-none sm:text-[13px] sm:leading-relaxed">
                    {benefit.text}
                  </p>
                  <span className="mt-1.5 inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wide text-primary">
                    Ver detalhes
                  </span>
                </button>
              </FeatureDetailDialog>
            </Reveal>
          ))}
        </ul>

        <Reveal className="mt-3.5 hidden gap-2 rounded-2xl border border-brand/25 bg-brand/8 p-3.5 sm:mt-4 sm:grid sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center sm:p-4">
          <p className="text-[13px] font-medium leading-relaxed sm:text-sm">
            Comece com o plano Gratuito e evolua quando precisar de relatórios detalhados, múltiplos
            veículos e consultor com inteligência artificial.
          </p>
          <div className="grid gap-2 sm:flex sm:items-center">
            <DemoDialog>
              <Button variant="outline" className="w-full sm:w-auto">
                Ver demonstração
              </Button>
            </DemoDialog>
            <Button asChild className="w-full sm:w-auto">
              <Link to="/auth">
                Criar conta gratuita
                <ArrowRight className="ml-2 size-4" aria-hidden="true" />
              </Link>
            </Button>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
