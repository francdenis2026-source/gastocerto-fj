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
  Target,
  TrendingDown,
} from "lucide-react";

import heroBg from "@/assets/hero-bg-2027.jpg";
import heroMobileBg from "@/assets/hero-bg-2027.jpg";
import { Button } from "@/components/ui/button";
import { CodeAccessDialog } from "@/components/landing/code-access-dialog";
import { FeatureDetailDialog } from "@/components/landing/feature-detail-dialog";
import { RingChart, Sparkline } from "@/components/landing/decor";
import { formatCurrency } from "@/lib/format";

import { cn } from "@/lib/utils";

const DashboardPreview = lazy(() =>
  import("@/components/landing/dashboard-preview").then((m) => ({ default: m.DashboardPreview })),
);

/** módulos reais do sistema, resumidos em pílulas legíveis */
const modules = [
  {
    label: "Lançamentos",
    icon: BarChart3,
    text: "Despesa ou receita com categoria, anexo, parcelas e data retroativa.",
    highlight: true,
  },
  {
    label: "Combustível",
    icon: Fuel,
    text: "Litros, preço por litro, odômetro validado e custo por km por veículo.",
    highlight: true,
  },
  {
    label: "Gás",
    icon: Flame,
    text: "Histórico de botijões, duração média e aviso quando estiver acabando.",
    highlight: true,
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
      className="relative isolate flex items-center overflow-hidden bg-hero-bg pt-20 pb-0 text-hero-fg sm:min-h-[45svh] sm:max-h-[550px] sm:pb-0 sm:pt-28 lg:pt-32"
    >
      <img
        src={heroBg}
        alt=""
        aria-hidden="true"
        width={1280}
        height={720}
        fetchPriority="high"
        decoding="async"
        className="absolute inset-0 -z-20 hidden size-full object-cover object-right sm:block"
      />
      <img
        src={heroMobileBg}
        alt=""
        aria-hidden="true"
        width={400}
        height={700}
        loading="lazy"
        decoding="async"
        className="absolute inset-0 -z-20 size-full object-cover object-[50%_30%] sm:hidden"
      />
      {/* véu e blur: garante contraste AA e evita conflito visual com os textos */}
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 bg-gradient-to-b from-background/60 via-background/80 to-background"
      />

      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 backdrop-blur-[4px] [mask-image:linear-gradient(to_right,rgba(0,0,0,1)_0%,rgba(0,0,0,0.3)_50%,rgba(0,0,0,1)_100%)]"
      />


      <div className="section-shell relative grid w-full items-center gap-10 lg:grid-cols-[1.1fr_1fr] lg:gap-16 pb-24">
        <div className="min-w-0">



          <h1 className="font-display mt-4 text-[clamp(2.5rem,10vw,3.5rem)] font-extrabold leading-[1.05] tracking-[-0.035em] text-hero-fg [text-wrap:balance] sm:text-[3.75rem] lg:text-[4rem] animate-in fade-in slide-in-from-top-2 duration-1000 ease-out">
            Controle financeiro
            <br className="hidden sm:block" />{" "}
            <span className="bg-gradient-to-br from-[oklch(0.50_0.16_155)] via-[oklch(0.55_0.18_155)] to-[oklch(0.60_0.16_162)] bg-clip-text text-transparent dark:from-brand dark:via-brand/85 dark:to-emerald-400 dark:brightness-115">
              inteligente e simples.
            </span>
          </h1>

          <p className="mt-4 max-w-[50ch] text-[16px] font-medium leading-[1.62] text-hero-fg-muted sm:text-[18px] animate-in fade-in slide-in-from-top-1 duration-1000 delay-150 ease-out">
            A plataforma definitiva para organizar gastos, veículos e investimentos da família com tecnologia de ponta e consultoria por IA.
          </p>

          <div className="mt-5 grid gap-2.5 sm:flex sm:flex-wrap sm:items-center sm:gap-3">
            <Button
              className="cta-lift btn-hover-shine group h-12 w-full justify-center rounded-xl bg-brand px-6 text-[15px] font-bold text-brand-foreground shadow-[0_10px_28px_-14px_color-mix(in_oklab,var(--brand)_70%,transparent)] hover:bg-brand focus-visible:ring-2 focus-visible:ring-brand/60 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent sm:w-auto sm:px-8"
              asChild
            >
              <Link to="/auth" search={{ mode: "signup" }}>
                <span className="truncate">Começar agora — é grátis</span>
                <ArrowRight
                  className="size-4 shrink-0 transition-transform duration-300 group-hover:translate-x-1"
                  aria-hidden="true"
                />
              </Link>
            </Button>
            <CodeAccessDialog>
              <Button
                variant="outline"
                className="press-feedback h-12 w-full justify-center rounded-xl border-hero-border-strong bg-hero-surface px-5 text-[15px] font-semibold text-hero-fg backdrop-blur-sm transition-all hover:border-hero-accent/60 hover:bg-hero-surface hover:text-hero-fg hover:shadow-[0_0_15px_rgba(23,164,95,0.15)] focus-visible:ring-2 focus-visible:ring-hero-border-strong sm:w-auto sm:px-6"
              >
                <KeyRound className="size-4 shrink-0 text-hero-accent animate-pulse" aria-hidden="true" />
                <span className="truncate">Código de acesso</span>
              </Button>
            </CodeAccessDialog>
          </div>


          <ul className="mt-4 flex flex-wrap gap-1.5" aria-label="Módulos disponíveis">
            {modules.map((mod) => (
              <li key={mod.label}>
                <FeatureDetailDialog
                  feature={{ title: mod.label, text: mod.text, tag: "Módulo" }}
                >
                  <button
                    type="button"
                    className={cn(
                      "press-feedback inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[12px] font-semibold transition-all focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-brand",
                      "highlight" in mod && mod.highlight
                        ? "border-brand/30 bg-brand/10 text-brand shadow-[0_0_15px_rgba(23,164,95,0.1)] hover:bg-brand/20"
                        : "border-white/5 bg-white/[0.03] text-hero-fg-muted hover:bg-white/[0.08]"
                    )}
                  >
                    <mod.icon className="size-3.5" />
                    {mod.label}
                  </button>
                </FeatureDetailDialog>
              </li>
            ))}
          </ul>

          {/* resumo compacto: aparece no lugar da arte no celular */}
          <div className="mt-4 grid gap-3 lg:hidden animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Card Principal: Mês Atual */}
            <div className="rounded-2xl border border-hero-border bg-hero-surface p-4 shadow-lg backdrop-blur-md">
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-hero-fg-muted">
                    Mês atual
                  </p>
                  <p className="tabular mt-1 whitespace-nowrap text-xl font-extrabold text-hero-fg">
                    {formatCurrency(3782.45)}
                  </p>
                  <p className="text-[12.5px] font-medium text-hero-fg-soft leading-tight mt-1">Consolidação automática</p>
                </div>
                <div className="flex shrink-0 items-center gap-2 rounded-xl border border-hero-border bg-hero-surface-soft px-3 py-2.5 shadow-sm">
                  <RingChart className="size-10 shrink-0 text-hero-accent" value={45} />
                  <div className="min-w-0">
                    <p className="text-[10px] font-semibold text-hero-fg-soft">Budget</p>
                    <p className="tabular text-[14px] font-bold text-hero-fg">45%</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Grid de Cards Secundários clicáveis */}
            <div className="grid grid-cols-2 gap-3">
              <FeatureDetailDialog
                feature={{ 
                  title: "Metas Financeiras", 
                  text: "Acompanhe seus objetivos de poupança em tempo real. Veja o progresso de cada sonho e receba dicas de como chegar lá mais rápido.", 
                  tag: "Objetivos" 
                }}
              >
                <button className="press-feedback flex flex-col items-center justify-center rounded-2xl border border-hero-border bg-hero-surface/80 p-3 text-center backdrop-blur-sm transition-all hover:bg-hero-surface">
                  <div className="mb-2 grid size-8 place-items-center rounded-lg bg-brand/10 text-brand">
                    <Target className="size-4" />
                  </div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-hero-fg-muted">Metas</span>
                  <span className="mt-1 text-sm font-extrabold text-hero-fg">65%</span>
                </button>
              </FeatureDetailDialog>

              <FeatureDetailDialog
                feature={{ 
                  title: "Gestão de Cartões", 
                  text: "Controle faturas de múltiplos cartões, limites disponíveis e datas de vencimento em uma visão unificada e inteligente.", 
                  tag: "Cartões" 
                }}
              >
                <button className="press-feedback flex flex-col items-center justify-center rounded-2xl border border-hero-border bg-hero-surface/80 p-3 text-center backdrop-blur-sm transition-all hover:bg-hero-surface">
                  <div className="mb-2 grid size-8 place-items-center rounded-lg bg-purple-500/10 text-purple-500">
                    <CreditCard className="size-4" />
                  </div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-hero-fg-muted">Cartões</span>
                  <span className="mt-1 text-sm font-extrabold text-hero-fg">R$ 1.250</span>
                </button>
              </FeatureDetailDialog>
            </div>

            <div className="flex items-center justify-between gap-2 rounded-xl border border-hero-border bg-hero-surface-soft px-3 py-2.5 shadow-sm">
              <span className="inline-flex items-center gap-1.5 text-[12.5px] font-semibold text-hero-fg-muted">
                <TrendingDown className="size-3.5 shrink-0 text-success" aria-hidden="true" />
                Economia vs. Junho
              </span>
              <span className="inline-flex items-center gap-2">
                <Sparkline className="h-6 w-16 text-success" />
                <span className="tabular text-[13px] font-extrabold text-success">-12,4%</span>
              </span>
            </div>
          </div>

          <dl className="mt-4 hidden grid-cols-3 gap-3 border-t border-hero-border pt-3 sm:grid">
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

        <div className="relative hidden pt-4 lg:block overflow-hidden">
          <div className="relative origin-top scale-[0.55] text-foreground -mb-[42%] xl:-mb-[38%] xl:scale-[0.6]">

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
