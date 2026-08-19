import { motion, useScroll, useTransform } from "framer-motion";
import { Link } from "@tanstack/react-router";
import { useRef } from "react";
import {
  ArrowRight,
  CheckCircle2,
  LayoutDashboard,
  Mail,
  MapPin,
  PiggyBank,
  ReceiptText,
  Shield,
  Smartphone,
  TrendingUp,
  Users,
  WalletCards,
  Zap,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Logo } from "@/components/logo";
import { useMouseGlow } from "@/hooks/use-mouse-glow";
import heroDesktop from "@/assets/hero-bg-brand.jpg";
import heroMobile from "@/assets/hero-bg-brand-mobile.jpg";

const reveal = {
  initial: { opacity: 0, y: 16 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.2 },
};

export function Hero() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollY } = useScroll();
  const y = useTransform(scrollY, [0, 420], [0, 52]);
  useMouseGlow();

  return (
    <section ref={ref} aria-labelledby="home-title" className="relative isolate overflow-hidden bg-[#020a12] pt-20 sm:pt-24">
      <motion.div style={{ y }} aria-hidden="true" className="absolute -inset-y-10 inset-x-0 z-0 motion-reduce:transform-none">
        <picture>
          <source media="(max-width: 767px)" srcSet={heroMobile} />
          <img src={heroDesktop} alt="" className="h-full w-full object-cover object-center opacity-70" loading="eager" fetchPriority="high" />
        </picture>
      </motion.div>
      <div aria-hidden="true" className="absolute inset-0 z-[1] bg-[linear-gradient(90deg,rgba(2,10,18,.98)_0%,rgba(2,10,18,.9)_43%,rgba(2,10,18,.48)_75%,rgba(2,10,18,.72)_100%)]" />
      <div aria-hidden="true" className="absolute inset-0 z-[1] bg-[radial-gradient(circle_at_76%_42%,color-mix(in_oklab,var(--primary)_18%,transparent),transparent_30%)]" />
      <div aria-hidden="true" className="absolute inset-x-0 bottom-0 z-[1] h-24 bg-gradient-to-b from-transparent to-[#000a14]" />

      <div className="shell relative z-10 py-10 sm:py-12 lg:py-14">
        <div className="grid items-center gap-8 lg:grid-cols-[1.08fr_.92fr] lg:gap-10 xl:gap-14">
          <div className="max-w-3xl">
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-4 inline-flex min-h-9 items-center gap-2 rounded-full border border-emerald-300/20 bg-emerald-300/10 px-3.5 py-1.5 text-xs font-bold uppercase tracking-[0.12em] text-emerald-200 backdrop-blur-xl">
              <CheckCircle2 aria-hidden="true" className="size-4" /> Gestão financeira pessoal e familiar
            </motion.div>
            <motion.h1 id="home-title" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.62, ease: [0.16, 1, 0.3, 1] }} className="max-w-4xl text-balance font-display text-4xl font-black leading-[1] tracking-[-0.045em] text-white sm:text-5xl lg:text-6xl">
              Clareza para controlar gastos e planejar melhor.
            </motion.h1>
            <motion.p initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.58, delay: 0.06 }} className="mt-4 max-w-2xl text-pretty text-base font-medium leading-7 text-slate-200 sm:text-lg">
              Centralize receitas, despesas, cartões, contas, metas e finanças da família em uma visão objetiva e fácil de acompanhar.
            </motion.p>
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.58, delay: 0.12 }} className="mt-6 flex flex-col gap-2.5 sm:flex-row">
              <Button size="lg" className="h-12 rounded-xl px-7 text-sm font-bold shadow-xl shadow-primary/25" asChild>
                <Link to="/auth" search={{ mode: "signup" }}>Começar agora <ArrowRight aria-hidden="true" className="ml-2 size-4" /></Link>
              </Button>
              <Button variant="outline" size="lg" className="h-12 rounded-xl border-white/20 bg-black/20 px-7 text-sm font-bold text-white backdrop-blur-xl hover:bg-white/10 hover:text-white" asChild>
                <Link to="/demonstracao">Ver demonstração</Link>
              </Button>
            </motion.div>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.24 }} className="mt-6 flex flex-wrap gap-x-5 gap-y-2 text-xs font-medium text-slate-300 sm:text-sm">
              <span className="inline-flex items-center gap-2"><Shield aria-hidden="true" className="size-4 text-emerald-300" /> Dados protegidos</span>
              <span className="inline-flex items-center gap-2"><Smartphone aria-hidden="true" className="size-4 text-emerald-300" /> Responsivo</span>
              <span className="inline-flex items-center gap-2"><Zap aria-hidden="true" className="size-4 text-emerald-300" /> Lançamentos rápidos</span>
            </motion.div>
          </div>

          <motion.div initial={{ opacity: 0, x: 22, scale: 0.98 }} animate={{ opacity: 1, x: 0, scale: 1 }} transition={{ duration: 0.68, delay: 0.1 }} className="relative mx-auto w-full max-w-lg lg:mx-0">
            <div aria-hidden="true" className="absolute -inset-6 rounded-[2rem] bg-primary/15 blur-3xl" />
            <div className="relative overflow-hidden rounded-[1.4rem] border border-white/15 bg-[#07131f]/82 p-4 shadow-[0_24px_64px_rgba(0,0,0,.42)] backdrop-blur-2xl">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <div><p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">Resumo financeiro</p><p className="mt-1 text-base font-bold text-white">Visão do mês</p></div>
                <div className="flex size-9 items-center justify-center rounded-xl border border-emerald-300/20 bg-emerald-300/10 text-emerald-300"><LayoutDashboard aria-hidden="true" className="size-4" /></div>
              </div>
              <div className="mt-3 grid grid-cols-2 gap-2.5">
                <PreviewMetric label="Receitas" value="R$ 5.240" icon={TrendingUp} positive />
                <PreviewMetric label="Gastos" value="R$ 3.180" icon={ReceiptText} />
                <PreviewMetric label="Saldo" value="R$ 2.060" icon={WalletCards} positive />
                <PreviewMetric label="Meta" value="64%" icon={PiggyBank} positive />
              </div>
              <div className="mt-3 rounded-xl border border-white/10 bg-black/20 p-3">
                <div className="flex items-center justify-between gap-3"><div><p className="text-xs text-slate-400">Planejamento</p><p className="mt-0.5 text-sm font-semibold text-white">Dentro do previsto</p></div><span className="rounded-full bg-emerald-400/10 px-2 py-1 text-xs font-bold text-emerald-300">68%</span></div>
                <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/10"><div className="h-full w-[68%] rounded-full bg-gradient-to-r from-emerald-500 to-emerald-300" /></div>
              </div>
              <p className="mt-2 text-center text-[10px] font-medium text-slate-500">Prévia ilustrativa</p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

function PreviewMetric({ label, value, icon: Icon, positive = false }: { label: string; value: string; icon: typeof TrendingUp; positive?: boolean }) {
  return <div className="rounded-xl border border-white/10 bg-white/[0.045] p-3"><div className="flex items-center justify-between gap-2"><span className="text-[11px] font-medium text-slate-400">{label}</span><Icon aria-hidden="true" className={`size-3.5 ${positive ? "text-emerald-300" : "text-slate-300"}`} /></div><strong className="mt-1.5 block text-base font-bold tabular-nums text-white">{value}</strong></div>;
}

const features = [
  { icon: LayoutDashboard, title: "Visão centralizada", desc: "Receitas, despesas, contas, cartões e metas em um único painel." },
  { icon: TrendingUp, title: "Análise objetiva", desc: "Indicadores e histórico para entender evolução, padrões e prioridades." },
  { icon: Users, title: "Controle familiar", desc: "Recursos para organizar despesas da casa e acompanhar a família." },
  { icon: Shield, title: "Organização segura", desc: "Informações centralizadas com foco em privacidade e continuidade." },
];

export function Features() {
  return (
    <section aria-labelledby="features-title" className="bg-[#000a14] py-12 sm:py-14">
      <div className="shell">
        <div className="grid gap-6 lg:grid-cols-[.8fr_1.2fr] lg:items-start">
          <div className="max-w-md">
            <p className="kicker mb-3">O essencial</p>
            <h2 id="features-title" className="text-balance text-2xl font-bold text-white sm:text-3xl">Informação financeira organizada para decisões melhores.</h2>
            <p className="mt-3 text-sm leading-6 text-slate-400">Sem excesso de telas ou informação dispersa. O GastoCerto reúne o que importa para acompanhar sua rotina financeira.</p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {features.map((item, index) => (
              <motion.article key={item.title} {...reveal} transition={{ delay: index * 0.04 }} className="rounded-xl border border-white/10 bg-white/[0.04] p-4 transition-colors hover:border-primary/35 hover:bg-white/[0.06]">
                <div className="flex items-start gap-3"><div className="flex size-9 shrink-0 items-center justify-center rounded-lg border border-primary/20 bg-primary/10"><item.icon aria-hidden="true" className="size-4 text-primary" /></div><div><h3 className="text-sm font-bold text-white">{item.title}</h3><p className="mt-1 text-sm leading-5 text-slate-400">{item.desc}</p></div></div>
              </motion.article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export function Footer() {
  return (
    <footer className="border-t border-white/10 bg-[#000a14] py-10 text-slate-300 sm:py-12">
      <div className="shell">
        <div className="grid gap-8 lg:grid-cols-[1.2fr_2fr]">
          <div className="max-w-sm"><Logo onDark /><p className="mt-4 text-sm leading-6 text-slate-400">Tecnologia para organizar sua vida financeira com clareza, segurança e autonomia.</p><div className="mt-4 flex flex-wrap gap-x-5 gap-y-1 text-sm"><a href="mailto:contato@gastocerto.com" className="inline-flex min-h-10 items-center gap-2 hover:text-white"><Mail aria-hidden="true" className="size-4 text-primary" /> contato@gastocerto.com</a><span className="inline-flex min-h-10 items-center gap-2"><MapPin aria-hidden="true" className="size-4 text-primary" /> Feijó, Acre</span></div></div>
          <nav aria-label="Links do rodapé" className="grid grid-cols-2 gap-6 sm:grid-cols-3">
            <FooterGroup title="Produto" links={[{ label: "Recursos", to: "/recursos" }, { label: "Demonstração", to: "/demonstracao" }]} />
            <FooterGroup title="Acesso" links={[{ label: "Entrar", to: "/auth", mode: "login" }, { label: "Criar conta", to: "/auth", mode: "signup" }]} />
            <FooterGroup title="Legal" links={[{ label: "Privacidade", to: "/privacidade" }]} />
          </nav>
        </div>
        <div className="mt-8 flex flex-col gap-2 border-t border-white/10 pt-5 text-xs font-semibold text-slate-500 sm:flex-row sm:items-center sm:justify-between"><p>© 2026 GastoCerto. Todos os direitos reservados.</p><p>Brasil · PT-BR</p></div>
      </div>
    </footer>
  );
}

function FooterGroup({ title, links }: { title: string; links: Array<{ label: string; to: string; mode?: "login" | "signup" }> }) {
  return <div><h3 className="mb-2 text-sm font-bold text-white">{title}</h3><ul className="space-y-1 text-sm text-slate-400">{links.map((link) => <li key={link.label}><Link to={link.to} search={link.mode ? { mode: link.mode } : undefined} className="inline-flex min-h-9 items-center hover:text-white">{link.label}</Link></li>)}</ul></div>;
}
