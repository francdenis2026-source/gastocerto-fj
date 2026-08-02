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

import heroBg from "@/assets/hero-bg-2027.jpg";
import heroMobileBg from "@/assets/hero-bg-2027-mobile.jpg";
import { Button } from "@/components/ui/button";
import { CodeAccessDialog } from "@/components/landing/code-access-dialog";
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
      className="relative isolate flex items-center overflow-hidden bg-[oklch(0.15_0.026_252)] pt-[4.75rem] pb-8 text-white sm:min-h-[48svh] sm:max-h-[560px] sm:pt-20 lg:pt-24"
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
        width={768}
        height={1344}
        fetchPriority="high"
        decoding="async"
        className="absolute inset-0 -z-20 size-full object-cover object-center sm:hidden"
      />
      {/* véu e blur: garante contraste AA e evita conflito visual com os textos */}
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 bg-[linear-gradient(180deg,oklch(0.14_0.02_252/0.88),oklch(0.14_0.02_252/0.65)_55%,oklch(0.14_0.02_252/0.92))] backdrop-blur-[2px] sm:bg-[linear-gradient(100deg,oklch(0.13_0.02_252/0.95)_0%,oklch(0.13_0.02_252/0.78)_46%,oklch(0.14_0.02_252/0.32)_100%)] sm:backdrop-blur-[3px]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 -z-10 h-16 bg-[linear-gradient(180deg,transparent,oklch(0.15_0.026_252))]"
      />

      <div className="section-shell relative grid w-full items-center gap-6 lg:grid-cols-[1.06fr_1fr] lg:gap-10">
        <div className="min-w-0">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.08] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-white sm:text-[12.5px]">
            <ShieldCheck className="size-3.5 shrink-0 text-success" aria-hidden="true" />
            Controle financeiro e tranquilidade sempre
          </span>

          <h1 className="font-display mt-3 text-[2.15rem] font-extrabold leading-[1.03] tracking-[-0.032em] text-white [text-wrap:balance] sm:text-[2.7rem] lg:text-[3.15rem]">
            Controle financeiro
            <br className="hidden sm:block" />{" "}
            <span className="text-[oklch(0.88_0.11_165)]">organizado e simples.</span>
          </h1>

          <p className="mt-3.5 max-w-[48ch] text-[15px] leading-[1.65] text-white/90 sm:text-base">
            Despesas, veículos, gás, cartões, Espaço Kids e um consultor com IA — organizados
            em módulos simples, rápidos de usar todos os dias.
          </p>

          <div className="mt-5 grid gap-2 sm:flex sm:flex-wrap sm:items-center">
            <Button
              className="h-12 w-full justify-center px-5 text-sm font-semibold sm:h-11 sm:w-auto sm:px-6"
              asChild
            >
              <Link to="/auth" search={{ mode: "signup" }}>
                <span className="truncate">Criar conta grátis</span>
                <ArrowRight className="size-4 shrink-0" aria-hidden="true" />
              </Link>
            </Button>
            <CodeAccessDialog>
              <Button
                variant="outline"
                className="h-12 w-full justify-center border-white/25 bg-white/[0.08] px-5 text-sm text-white hover:bg-white/[0.16] hover:text-white sm:h-11 sm:w-auto sm:px-6"
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
                    className="inline-flex items-center gap-1.5 rounded-full border border-white/12 bg-white/[0.06] px-2.5 py-1 text-[12.5px] font-semibold text-white transition-colors hover:border-white/35 hover:bg-white/[0.16] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70"
                  >
                    <mod.icon className="size-3.5 shrink-0 text-[oklch(0.85_0.11_165)]" aria-hidden="true" />
                    {mod.label}
                  </button>
                </FeatureDetailDialog>
              </li>
            ))}
          </ul>

          {/* resumo compacto: aparece no lugar da arte no celular */}
          <div className="mt-5 rounded-2xl border border-white/12 bg-[oklch(0.2_0.03_252/0.7)] p-3.5 backdrop-blur-sm lg:hidden">
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/80">
                  Mês atual
                </p>
                <p className="tabular mt-0.5 text-xl font-bold text-white">
                  {formatCurrency(3782.45)}
                </p>
                <p className="text-[12.5px] text-white/70">despesas consolidadas</p>
              </div>
              <div className="flex shrink-0 items-center gap-2 rounded-xl border border-white/12 bg-white/[0.06] px-2.5 py-2">
                <RingChart className="size-9 shrink-0 text-[oklch(0.82_0.11_165)]" value={45} />
                <div className="min-w-0">
                  <p className="text-[10px] text-white/70">Orçamento</p>
                  <p className="tabular text-[13px] font-bold text-white">45%</p>
                </div>
              </div>
            </div>
            <div className="mt-3 flex items-center justify-between gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-2.5 py-2">
              <span className="inline-flex items-center gap-1.5 text-[12.5px] font-medium text-white/85">
                <TrendingDown className="size-3.5 shrink-0 text-success" aria-hidden="true" />
                Despesas vs. mês anterior
              </span>
              <span className="inline-flex items-center gap-2">
                <Sparkline className="h-6 w-16 text-success" />
                <span className="tabular text-[12.5px] font-semibold text-success">-12,4%</span>
              </span>
            </div>
          </div>

          <dl className="mt-5 hidden grid-cols-3 gap-3 border-t border-white/10 pt-3 sm:grid">
            {stats.map((stat) => (
              <div key={stat.label} className="min-w-0">
                <dt className="truncate text-[10px] uppercase tracking-wide text-white/70 sm:text-[12.5px]">
                  {stat.label}
                </dt>
                <dd className="tabular mt-0.5 truncate text-sm font-bold text-white sm:text-base">
                  {stat.value}
                </dd>
                <p className="truncate text-[12.5px] text-white/75">{stat.hint}</p>
              </div>
            ))}
          </dl>
        </div>

        <div className="relative hidden pt-8 lg:block">
          <div className="relative origin-top scale-[0.58] text-foreground -mb-[34%] xl:-mb-[30%] xl:scale-[0.63]">
            <Suspense fallback={<div className="h-[420px] rounded-2xl bg-white/5" />}>
              <DashboardPreview />
            </Suspense>
          </div>

          <div className="absolute -left-8 bottom-14 w-44 rounded-2xl border border-white/12 bg-[oklch(0.19_0.028_252/0.9)] p-3 backdrop-blur-sm">
            <div className="flex items-center justify-between text-[12.5px]">
              <span className="inline-flex items-center gap-1.5 font-medium text-white/85">
                <TrendingDown className="size-3.5 text-success" aria-hidden="true" />
                Despesas
              </span>
              <span className="font-semibold text-success">-12,4%</span>
            </div>
            <Sparkline className="mt-2 h-12 w-full text-success" />
          </div>

          <div className="absolute right-0 top-24 flex w-40 items-center gap-3 rounded-2xl border border-white/12 bg-[oklch(0.19_0.028_252/0.9)] p-3 backdrop-blur-sm">
            <RingChart className="size-12 shrink-0 text-[oklch(0.82_0.11_165)]" value={45} />
            <div className="min-w-0">
              <p className="text-[12.5px] text-white/70">Orçamento</p>
              <p className="tabular text-sm font-bold text-white">45% usado</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
