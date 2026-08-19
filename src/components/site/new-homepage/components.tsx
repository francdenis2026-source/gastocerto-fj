import { motion, useScroll, useTransform } from "framer-motion";
import { useMouseGlow } from "@/hooks/use-mouse-glow";
import {
  ArrowRight,
  Zap,
  Shield,
  Users,
  LayoutDashboard,
  Search,
  Plus,
  Smartphone,
  Layers,
  Globe,
  TrendingUp,
  Mail,
  MapPin,
  WalletCards,
  ReceiptText,
  PiggyBank,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "@tanstack/react-router";
import { useRef } from "react";
import { Logo } from "@/components/logo";
import heroDesktop from "@/assets/hero-bg-brand.jpg";
import heroMobile from "@/assets/hero-bg-brand-mobile.jpg";

const reveal = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.2 },
};

export function Hero() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollY } = useScroll();
  const y1 = useTransform(scrollY, [0, 520], [0, 90]);
  useMouseGlow();

  return (
    <section
      ref={containerRef}
      aria-labelledby="home-title"
      className="relative isolate flex min-h-[92svh] items-center overflow-hidden bg-[#020a12] pt-24 sm:pt-28"
    >
      <motion.div style={{ y: y1 }} aria-hidden="true" className="absolute -inset-y-16 inset-x-0 z-0 motion-reduce:transform-none">
        <picture>
          <source media="(max-width: 767px)" srcSet={heroMobile} />
          <img
            src={heroDesktop}
            alt=""
            className="h-full w-full object-cover object-center opacity-75"
            loading="eager"
            fetchPriority="high"
          />
        </picture>
      </motion.div>

      <div aria-hidden="true" className="absolute inset-0 z-[1] bg-[linear-gradient(90deg,rgba(2,10,18,.98)_0%,rgba(2,10,18,.88)_38%,rgba(2,10,18,.42)_68%,rgba(2,10,18,.72)_100%)]" />
      <div aria-hidden="true" className="absolute inset-0 z-[1] bg-[radial-gradient(circle_at_72%_42%,color-mix(in_oklab,var(--primary)_22%,transparent),transparent_32%)]" />
      <div aria-hidden="true" className="absolute inset-x-0 bottom-0 z-[1] h-48 bg-gradient-to-b from-transparent to-[#000a14]" />
      <div aria-hidden="true" className="absolute inset-0 z-[1] opacity-[0.06] [background-image:linear-gradient(rgba(255,255,255,.12)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.12)_1px,transparent_1px)] [background-size:48px_48px]" />

      <div className="shell relative z-10 w-full py-12 sm:py-16 lg:py-20">
        <div className="grid items-center gap-12 lg:grid-cols-[minmax(0,1.05fr)_minmax(390px,.95fr)] lg:gap-14 xl:gap-20">
          <div className="max-w-3xl text-left">
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55 }}
              className="mb-6 inline-flex min-h-10 items-center gap-2 rounded-full border border-emerald-300/20 bg-emerald-300/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.14em] text-emerald-200 backdrop-blur-xl sm:text-sm"
            >
              <CheckCircle2 aria-hidden="true" className="size-4" />
              Seu controle financeiro em um só lugar
            </motion.div>

            <motion.h1
              id="home-title"
              initial={{ opacity: 0, y: 28 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.72, ease: [0.16, 1, 0.3, 1] }}
              className="max-w-4xl text-balance font-display text-4xl font-black leading-[0.98] tracking-[-0.05em] text-white sm:text-6xl lg:text-6xl xl:text-7xl"
            >
              Transforme seus gastos em decisões mais inteligentes.
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.68, delay: 0.08, ease: [0.16, 1, 0.3, 1] }}
              className="mt-6 max-w-2xl text-pretty text-base font-medium leading-7 text-slate-200 sm:text-lg md:text-xl"
            >
              Veja para onde seu dinheiro vai, acompanhe cartões, contas, metas e despesas da família e tenha uma visão clara para planejar o próximo passo.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.68, delay: 0.16 }}
              className="mt-8 flex w-full max-w-xl flex-col gap-3 sm:w-auto sm:max-w-none sm:flex-row"
            >
              <Button size="lg" className="h-14 w-full rounded-xl px-8 text-base font-bold shadow-2xl shadow-primary/25 sm:w-auto" asChild>
                <Link to="/auth" search={{ mode: "signup" }}>
                  Começar agora
                  <ArrowRight aria-hidden="true" className="ml-2 size-5" />
                </Link>
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="h-14 w-full rounded-xl border-white/25 bg-black/20 px-8 text-base font-bold text-white backdrop-blur-xl hover:bg-white/10 hover:text-white sm:w-auto"
                asChild
              >
                <Link to="/demonstracao">Explorar demonstração</Link>
              </Button>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.32 }}
              className="mt-8 grid max-w-2xl gap-3 text-sm text-slate-300 sm:grid-cols-3"
            >
              <span className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-white/10 bg-black/15 px-3 backdrop-blur-sm">
                <Shield aria-hidden="true" className="size-4 shrink-0 text-emerald-300" /> Dados protegidos
              </span>
              <span className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-white/10 bg-black/15 px-3 backdrop-blur-sm">
                <Smartphone aria-hidden="true" className="size-4 shrink-0 text-emerald-300" /> Desktop e celular
              </span>
              <span className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-white/10 bg-black/15 px-3 backdrop-blur-sm">
                <Zap aria-hidden="true" className="size-4 shrink-0 text-emerald-300" /> Registro rápido
              </span>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, x: 30, scale: 0.97 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.14, ease: [0.16, 1, 0.3, 1] }}
            className="relative mx-auto w-full max-w-xl lg:mx-0"
          >
            <div aria-hidden="true" className="absolute -inset-10 rounded-[3rem] bg-primary/20 blur-3xl" />
            <div className="relative overflow-hidden rounded-[1.75rem] border border-white/15 bg-[#07131f]/78 p-4 shadow-[0_30px_90px_rgba(0,0,0,.48)] backdrop-blur-2xl sm:p-5">
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">Visão financeira</p>
                  <p className="mt-1 text-lg font-bold text-white">Seu mês em uma leitura</p>
                </div>
                <div className="flex size-11 items-center justify-center rounded-2xl border border-emerald-300/20 bg-emerald-300/10 text-emerald-300">
                  <LayoutDashboard aria-hidden="true" className="size-5" />
                </div>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-3">
                <HeroPreviewMetric label="Receitas" value="R$ 5.240" icon={TrendingUp} positive />
                <HeroPreviewMetric label="Gastos" value="R$ 3.180" icon={ReceiptText} />
                <HeroPreviewMetric label="Saldo" value="R$ 2.060" icon={WalletCards} positive />
                <HeroPreviewMetric label="Meta poupada" value="64%" icon={PiggyBank} positive />
              </div>

              <div className="mt-4 rounded-2xl border border-white/10 bg-black/20 p-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-xs font-medium text-slate-400">Planejamento mensal</p>
                    <p className="mt-1 text-sm font-semibold text-white">Você está dentro do planejado</p>
                  </div>
                  <span className="rounded-full bg-emerald-400/10 px-2.5 py-1 text-xs font-bold text-emerald-300">+12%</span>
                </div>
                <div className="mt-4 h-2.5 overflow-hidden rounded-full bg-white/10">
                  <div className="h-full w-[68%] rounded-full bg-gradient-to-r from-emerald-500 to-emerald-300" />
                </div>
                <div className="mt-4 grid grid-cols-7 items-end gap-1.5" aria-hidden="true">
                  {[38, 55, 42, 68, 52, 79, 64].map((height, index) => (
                    <div key={index} className="flex h-20 items-end rounded-md bg-white/[0.035] px-1">
                      <div className="w-full rounded-sm bg-emerald-300/70" style={{ height: `${height}%` }} />
                    </div>
                  ))}
                </div>
              </div>

              <p className="mt-3 text-center text-[11px] font-medium text-slate-500">Prévia ilustrativa do painel GastoCerto</p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

function HeroPreviewMetric({
  label,
  value,
  icon: Icon,
  positive = false,
}: {
  label: string;
  value: string;
  icon: typeof TrendingUp;
  positive?: boolean;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.045] p-3.5 sm:p-4">
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs font-medium text-slate-400">{label}</span>
        <Icon aria-hidden="true" className={`size-4 ${positive ? "text-emerald-300" : "text-slate-300"}`} />
      </div>
      <strong className="mt-2 block text-lg font-bold tabular-nums text-white sm:text-xl">{value}</strong>
    </div>
  );
}

const trustItems = [
  { icon: Shield, label: "Segurança e privacidade" },
  { icon: LayoutDashboard, label: "Visão financeira clara" },
  { icon: TrendingUp, label: "Decisões mais conscientes" },
];

const features = [
  { icon: LayoutDashboard, title: "Tudo em um só lugar", desc: "Acompanhe contas, cartões, receitas e despesas sem depender de planilhas espalhadas." },
  { icon: Zap, title: "Rotina sem complicação", desc: "Registre movimentações rapidamente e mantenha sua vida financeira atualizada." },
  { icon: Users, title: "Finanças para a família", desc: "Use recursos pensados para organizar a casa e apoiar a educação financeira dos filhos." },
];

export function Features() {
  return (
    <section aria-labelledby="features-title" className="bg-[#000a14] py-20 sm:py-24">
      <div className="shell">
        <div className="mb-12 grid gap-8 lg:grid-cols-[1fr_auto] lg:items-end">
          <div className="max-w-2xl">
            <p className="kicker mb-4">Organização que vira tranquilidade</p>
            <h2 id="features-title" className="text-balance text-3xl font-bold text-white sm:text-4xl lg:text-5xl">O essencial para entender para onde seu dinheiro está indo.</h2>
          </div>
          <div className="grid gap-3 sm:grid-cols-3 lg:max-w-xl">
            {trustItems.map((item) => (
              <div key={item.label} className="flex items-center gap-2 text-sm font-semibold text-slate-300">
                <item.icon aria-hidden="true" className="size-4 shrink-0 text-primary" />
                <span>{item.label}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="grid gap-5 md:grid-cols-3">
          {features.map((item, i) => (
            <motion.article key={item.title} {...reveal} transition={{ delay: i * 0.06 }} className="group rounded-2xl border border-white/10 bg-white/[0.045] p-6 transition-colors hover:border-primary/40 hover:bg-white/[0.07] sm:p-7">
              <div className="mb-6 flex size-12 items-center justify-center rounded-xl border border-primary/20 bg-primary/10">
                <item.icon aria-hidden="true" className="size-5 text-primary" />
              </div>
              <h3 className="mb-3 text-xl font-bold text-white">{item.title}</h3>
              <p className="mb-6 text-sm font-medium leading-6 text-slate-300">{item.desc}</p>
              <Link to="/auth" search={item.title === "Finanças para a família" ? { mode: "kid" } : { mode: "signup" }} className="inline-flex min-h-11 items-center gap-2 rounded-lg font-bold text-emerald-300 underline-offset-4 hover:underline focus-visible:outline-none">
                Conhecer recurso <ArrowRight aria-hidden="true" className="size-4" />
              </Link>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}

const bentoItems = [
  { icon: Search, title: "Orientação para economizar", desc: "Identifique padrões de gasto e encontre oportunidades para fazer o dinheiro render melhor.", className: "lg:col-span-7", featured: true },
  { icon: Layers, title: "Relatórios organizados", desc: "Visualize e exporte informações financeiras para acompanhar sua evolução com mais contexto.", className: "lg:col-span-5" },
  { icon: Smartphone, title: "Funciona onde você estiver", desc: "Consulte e atualize sua vida financeira no computador, tablet ou celular.", className: "lg:col-span-5" },
  { icon: Globe, title: "Informações sempre disponíveis", desc: "Mantenha seus dados centralizados e acessíveis para acompanhar a rotina sem perder o histórico.", className: "lg:col-span-7" },
];

export function BentoGrid() {
  return (
    <section aria-labelledby="capabilities-title" className="bg-[#000a14] py-20 sm:py-24">
      <div className="shell">
        <div className="mb-10 max-w-2xl">
          <p className="kicker mb-4">Visão completa</p>
          <h2 id="capabilities-title" className="text-balance text-3xl font-bold text-white sm:text-4xl">Ferramentas que ajudam no dia a dia, sem excesso de complexidade.</h2>
        </div>
        <div className="grid gap-5 lg:grid-cols-12">
          {bentoItems.map((item, i) => (
            <motion.article key={item.title} {...reveal} transition={{ delay: i * 0.05 }} className={`${item.className} relative overflow-hidden rounded-2xl border p-7 sm:p-8 ${item.featured ? "border-primary/30 bg-primary/10" : "border-white/10 bg-white/[0.045]"}`}>
              <div className="relative z-10 max-w-xl">
                <item.icon aria-hidden="true" className="mb-6 size-8 text-primary" />
                <h3 className="mb-3 text-2xl font-bold text-white">{item.title}</h3>
                <p className="mb-6 max-w-lg text-sm font-medium leading-6 text-slate-300 sm:text-base">{item.desc}</p>
                <Link to="/auth" search={{ mode: "signup" }} className="inline-flex min-h-11 items-center gap-2 rounded-lg font-bold text-emerald-300 underline-offset-4 hover:underline">
                  Experimentar GastoCerto <ArrowRight aria-hidden="true" className="size-4" />
                </Link>
              </div>
              {item.featured && <Plus aria-hidden="true" className="absolute -bottom-12 -right-8 size-56 text-primary/10" strokeWidth={1} />}
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}

export function Footer() {
  return (
    <footer className="border-t border-white/10 bg-[#000a14] py-16 text-slate-300 sm:py-20">
      <div className="shell">
        <div className="grid gap-12 lg:grid-cols-[1.2fr_2fr]">
          <div className="max-w-sm">
            <Logo onDark />
            <p className="mt-6 text-sm font-medium leading-6 text-slate-400">Tecnologia para organizar sua vida financeira com mais clareza, segurança e autonomia.</p>
            <div className="mt-6 space-y-3 text-sm">
              <a href="mailto:contato@gastocerto.com" className="flex min-h-11 items-center gap-3 rounded-lg hover:text-white"><Mail aria-hidden="true" className="size-4 text-primary" /> contato@gastocerto.com</a>
              <div className="flex min-h-11 items-center gap-3"><MapPin aria-hidden="true" className="size-4 text-primary" /> Feijó, Acre</div>
            </div>
          </div>

          <nav aria-label="Links do rodapé" className="grid grid-cols-2 gap-8 sm:grid-cols-3">
            <div>
              <h3 className="mb-4 text-sm font-bold text-white">Produto</h3>
              <ul className="space-y-2 text-sm text-slate-400">
                <li><Link to="/recursos" className="inline-flex min-h-11 items-center hover:text-white">Recursos</Link></li>
                <li><Link to="/demonstracao" className="inline-flex min-h-11 items-center hover:text-white">Demonstração</Link></li>
                <li><Link to="/auth" search={{ mode: "signup" }} className="inline-flex min-h-11 items-center hover:text-white">Criar conta</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="mb-4 text-sm font-bold text-white">Acesso</h3>
              <ul className="space-y-2 text-sm text-slate-400">
                <li><Link to="/auth" search={{ mode: "login" }} className="inline-flex min-h-11 items-center hover:text-white">Entrar</Link></li>
                <li><Link to="/auth" search={{ mode: "signup" }} className="inline-flex min-h-11 items-center hover:text-white">Começar agora</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="mb-4 text-sm font-bold text-white">Legal</h3>
              <ul className="space-y-2 text-sm text-slate-400">
                <li><Link to="/privacidade" className="inline-flex min-h-11 items-center hover:text-white">Privacidade</Link></li>
              </ul>
            </div>
          </nav>
        </div>
        <div className="mt-12 flex flex-col gap-3 border-t border-white/10 pt-8 text-xs font-semibold text-slate-500 sm:flex-row sm:items-center sm:justify-between">
          <p>© 2026 GastoCerto. Todos os direitos reservados.</p>
          <p>Brasil · PT-BR</p>
        </div>
      </div>
    </footer>
  );
}
