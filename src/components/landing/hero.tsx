import { Link } from "@tanstack/react-router";
import { Suspense, lazy } from "react";
import {
  ArrowRight,
  BarChart3,
  Baby,
  CreditCard,
  Flame,
  Fuel,
  KeyRound,
  Send,
  ShieldCheck,
  Sparkles,
  TrendingDown,
} from "lucide-react";

import heroBg from "@/assets/hero-bg-desk.jpg";
import heroMobileBg from "@/assets/hero-mobile-pro-2027.jpg";
import { Button } from "@/components/ui/button";
import { CodeAccessDialog } from "@/components/landing/code-access-dialog";
import { FeatureDetailDialog } from "@/components/landing/feature-detail-dialog";
import { RingChart, Sparkline } from "@/components/landing/decor";
import { formatCurrency } from "@/lib/format";

const DashboardPreview = lazy(() =>
  import("@/components/landing/dashboard-preview").then((m) => ({ default: m.DashboardPreview })),
);

/** módulos reais do sistema, resumidos em pílulas legíveis */
const modules = [
  {
    label: "Lançamentos",
    icon: BarChart3,
    text: "Despesa ou receita com categoria, anexo, parcelas e data retroativa.",
  },
  {
    label: "Combustível",
    icon: Fuel,
    text: "Litros, preço por litro, odômetro validado e custo por km por veículo.",
  },
  {
    label: "Gás",
    icon: Flame,
    text: "Histórico de botijões, duração média e aviso quando estiver acabando.",
  },
  {
    label: "Cartões",
    icon: CreditCard,
    text: "Faturas, limites, vencimentos e parcelas em aberto de cada cartão.",
  },
  {
    label: "Espaço Kids",
    icon: Baby,
    text: "Painel simplificado por criança, com PIN, avatar e tema próprio.",
  },
  {
    label: "PIX Kids",
    icon: Send,
    text: "Envie mesada por PIX, com histórico, comprovante e aviso na hora.",
  },
  {
    label: "Consultor IA",
    icon: Sparkles,
    text: "Diagnóstico do mês, plano de saída de dívidas e dicas sob medida.",
  },
] as const;

const stats = [
  { label: "Despesas do mês", value: formatCurrency(3782.45), hint: "consolidação automática" },
  { label: "Sobra do mês", value: formatCurrency(640), hint: "receitas menos despesas" },
  { label: "Novo lançamento", value: "10 s", hint: "categoria, data e anexo" },
] as const;

export function Hero() {
  return (
    <section
      id="inicio"
      className="relative isolate flex items-center overflow-hidden bg-hero-bg pt-[4.75rem] pb-8 text-hero-fg sm:min-h-[48svh] sm:max-h-[560px] sm:pt-20 lg:pt-24"
    >
      <img
        src={heroBg}
        alt=""
        aria-hidden="true"
        width={1920}
        height={1080}
        fetchPriority="high"
        decoding="async"
        className="absolute inset-0 -z-20 hidden size-full object-cover object-right sm:block"
      />
      <img
        src={heroMobileBg}
        alt=""
        aria-hidden="true"
        width={828}
        height={1472}
        fetchPriority="high"
        decoding="async"
        className="absolute inset-0 -z-20 size-full object-cover object-[50%_30%] sm:hidden"
      />
      {/* véu e blur: garante contraste AA e evita conflito visual com os textos */}
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 bg-[image:var(--hero-veil-mobile)] backdrop-blur-[6px] sm:bg-[image:var(--hero-veil-desktop)] sm:backdrop-blur-[3px]"
      />

      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 -z-10 h-16 bg-[image:var(--hero-fade)]"
      />

      <div className="section-shell relative grid w-full items-center gap-6 lg:grid-cols-[1.06fr_1fr] lg:gap-10">
        <div className="min-w-0">
          <span className="inline-flex max-w-full items-center gap-2 rounded-full border border-hero-border bg-hero-surface-soft px-2.5 py-1 text-[10px] font-semibold uppercase leading-tight tracking-[0.12em] text-hero-fg sm:tracking-[0.16em] sm:text-[12.5px]">
            <ShieldCheck className="size-3.5 shrink-0 text-success" aria-hidden="true" />
            <span className="min-w-0">Controle financeiro e tranquilidade sempre</span>
          </span>

          <h1 className="font-display mt-3 text-[clamp(2rem,8vw,2.75rem)] font-extrabold leading-[1.02] tracking-[-0.04em] text-hero-fg [text-wrap:balance] sm:text-[3.2rem] lg:text-[3.75rem]">
            Controle financeiro
            <br className="hidden sm:block" />{" "}
            <span className="bg-gradient-to-br from-brand via-brand/80 to-emerald-400 bg-clip-text text-transparent brightness-110">
              inteligente e simples.
            </span>
          </h1>

          <p className="mt-4 max-w-[50ch] text-[15.5px] font-medium leading-[1.6] text-hero-fg-muted sm:text-lg">
            A plataforma definitiva para organizar gastos, veículos e investimentos da família com tecnologia de ponta e consultoria por IA.
          </p>

          <div className="mt-5 grid gap-2 sm:flex sm:flex-wrap sm:items-center">
            <Button
              className="h-12 w-full justify-center rounded-xl bg-brand px-6 text-sm font-bold shadow-[0_0_20px_rgba(23,164,95,0.3)] transition-all hover:scale-[1.02] hover:bg-brand/90 sm:h-12 sm:w-auto sm:px-8"
              asChild
            >
              <Link to="/auth" search={{ mode: "signup" }}>
                <span className="truncate">Começar Agora — É Grátis</span>
                <ArrowRight className="size-4 shrink-0 animate-pulse" aria-hidden="true" />
              </Link>
            </Button>
            <CodeAccessDialog>
              <Button
                variant="outline"
                className="h-12 w-full justify-center border-hero-border-strong bg-hero-surface-soft px-5 text-sm font-semibold text-hero-fg hover:bg-hero-surface hover:text-hero-fg sm:h-11 sm:w-auto sm:px-6"
              >
                <KeyRound className="size-4 shrink-0" aria-hidden="true" />
                <span className="truncate">Código de acesso</span>
              </Button>
            </CodeAccessDialog>
          </div>

          <ul className="mt-5 flex flex-wrap gap-1.5" aria-label="Módulos disponíveis">
            {modules.map((mod) => (
              <li key={mod.label}>
                <FeatureDetailDialog
                  feature={{ title: mod.label, text: mod.text, tag: "Módulo" }}
                >
                  <button
                    type="button"
                    className="inline-flex items-center gap-1.5 rounded-full border border-hero-border bg-hero-surface-soft px-2.5 py-1 text-[12.5px] font-semibold text-hero-fg transition-colors hover:border-hero-border-strong hover:bg-hero-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-hero-border-strong"
                  >
                    <mod.icon className="size-3.5 shrink-0 text-hero-accent" aria-hidden="true" />
                    {mod.label}
                  </button>
                </FeatureDetailDialog>
              </li>
            ))}
          </ul>

          {/* resumo compacto: aparece no lugar da arte no celular */}
          <div className="mt-5 rounded-2xl border border-hero-border bg-hero-surface p-3.5 backdrop-blur-sm lg:hidden">
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[oklch(0.25_0.04_259)] dark:text-hero-fg-muted">
                  Mês atual
                </p>
                <p className="tabular mt-0.5 whitespace-nowrap text-lg font-bold text-hero-fg sm:text-xl">
                  {formatCurrency(3782.45)}
                </p>

                <p className="text-[12.5px] font-medium text-[oklch(0.35_0.04_259)] dark:text-hero-fg-soft">despesas consolidadas</p>
              </div>
              <div className="flex shrink-0 items-center gap-2 rounded-xl border border-hero-border bg-hero-surface-soft px-2.5 py-2">
                <RingChart className="size-9 shrink-0 text-hero-accent" value={45} />
                <div className="min-w-0">
                  <p className="text-[10px] font-semibold text-[oklch(0.35_0.04_259)] dark:text-hero-fg-soft">Orçamento</p>
                  <p className="tabular text-[13px] font-bold text-hero-fg">45%</p>
                </div>
              </div>
            </div>
            <div className="mt-3 flex items-center justify-between gap-2 rounded-xl border border-hero-border bg-hero-surface-soft px-2.5 py-2">
              <span className="inline-flex items-center gap-1.5 text-[12.5px] font-semibold text-[oklch(0.25_0.04_259)] dark:text-hero-fg-muted">
                <TrendingDown className="size-3.5 shrink-0 text-success" aria-hidden="true" />
                Despesas vs. mês anterior
              </span>
              <span className="inline-flex items-center gap-2">
                <Sparkline className="h-6 w-16 text-success" />
                <span className="tabular text-[12.5px] font-semibold text-success">-12,4%</span>
              </span>
            </div>
          </div>

          <dl className="mt-5 hidden grid-cols-3 gap-3 border-t border-hero-border pt-3 sm:grid">
            {stats.map((stat) => (
              <div key={stat.label} className="min-w-0">
                <dt className="truncate text-[10px] uppercase tracking-wide text-hero-fg-soft sm:text-[12.5px]">
                  {stat.label}
                </dt>
                <dd className="tabular mt-0.5 truncate text-sm font-bold text-hero-fg sm:text-base">
                  {stat.value}
                </dd>
                <p className="truncate text-[12.5px] text-hero-fg-soft">{stat.hint}</p>
              </div>
            ))}
          </dl>
        </div>

        <div className="relative hidden pt-8 lg:block">
          <div className="relative origin-top scale-[0.58] text-foreground -mb-[34%] xl:-mb-[30%] xl:scale-[0.63]">
            <Suspense fallback={<div className="h-[420px] rounded-2xl bg-hero-surface-soft" />}>
              <DashboardPreview />
            </Suspense>
          </div>

          <div className="absolute -left-8 bottom-14 w-44 rounded-2xl border border-hero-border bg-hero-surface p-3 backdrop-blur-sm">
            <div className="flex items-center justify-between text-[12.5px]">
              <span className="inline-flex items-center gap-1.5 font-medium text-hero-fg-muted">
                <TrendingDown className="size-3.5 text-success" aria-hidden="true" />
                Despesas
              </span>
              <span className="font-semibold text-success">-12,4%</span>
            </div>
            <Sparkline className="mt-2 h-12 w-full text-success" />
          </div>

          <div className="absolute right-0 top-24 flex w-40 items-center gap-3 rounded-2xl border border-hero-border bg-hero-surface p-3 backdrop-blur-sm">
            <RingChart className="size-12 shrink-0 text-hero-accent" value={45} />
            <div className="min-w-0">
              <p className="text-[12.5px] text-hero-fg-soft">Orçamento</p>
              <p className="tabular text-sm font-bold text-hero-fg">45% usado</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
