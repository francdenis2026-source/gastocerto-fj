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
    <section 
      ref={ref} 
      aria-labelledby="home-title" 
      className="relative isolate overflow-hidden bg-[#00050a] pt-24 sm:pt-32"
    >
      {/* Background with optimized image and overlay */}
      <motion.div 
        style={{ y }} 
        aria-hidden="true" 
        className="absolute -inset-y-20 inset-x-0 z-0 motion-reduce:transform-none"
      >
        <picture>
          <source media="(max-width: 767px)" srcSet={heroMobile} />
          <img 
            src={heroDesktop} 
            alt="" 
            className="h-full w-full object-cover object-center opacity-40 brightness-75 grayscale-[0.2]" 
            loading="eager" 
            fetchPriority="high" 
          />
        </picture>
      </motion.div>
      
      {/* Cinematic Overlays */}
      <div aria-hidden="true" className="absolute inset-0 z-[1] bg-gradient-to-b from-[#00050a]/80 via-[#00050a]/60 to-[#000a14]" />
      <div aria-hidden="true" className="absolute inset-0 z-[1] bg-[radial-gradient(circle_at_50%_40%,color-mix(in_oklab,var(--primary)_12%,transparent),transparent_50%)]" />
      
      <div className="shell relative z-10 py-12 sm:py-20 lg:py-24">
        <div className="flex flex-col items-center text-center">
          <motion.div 
            initial={{ opacity: 0, y: 10 }} 
            animate={{ opacity: 1, y: 0 }} 
            className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-1.5 text-[11px] font-black uppercase tracking-[0.2em] text-primary backdrop-blur-xl"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
            </span>
            Gestão Financeira de Elite
          </motion.div>
          
          <motion.h1 
            id="home-title" 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }} 
            className="max-w-4xl text-balance font-display text-5xl font-black leading-[0.95] tracking-[-0.05em] text-white sm:text-7xl lg:text-8xl"
          >
            Seu dinheiro sob <br className="hidden sm:block" />
            <span className="text-primary">controle absoluto.</span>
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 12 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ duration: 0.6, delay: 0.1 }} 
            className="mt-8 max-w-2xl text-pretty text-lg font-medium leading-relaxed text-slate-300 sm:text-xl"
          >
            A plataforma definitiva para quem busca clareza, segurança e o domínio total das finanças pessoais e familiares.
          </motion.p>
          
          <motion.div 
            initial={{ opacity: 0, y: 12 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ duration: 0.6, delay: 0.2 }} 
            className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:gap-6"
          >
            <Button size="lg" className="h-14 rounded-2xl px-10 text-base font-black shadow-2xl shadow-primary/30 transition-all hover:scale-105 active:scale-95" asChild>
              <Link to="/auth" search={{ mode: "signup" }}>
                Começar agora <ArrowRight aria-hidden="true" className="ml-2 size-5" />
              </Link>
            </Button>
            <Button variant="outline" size="lg" className="h-14 rounded-2xl border-white/10 bg-white/5 px-10 text-base font-bold text-white backdrop-blur-xl hover:bg-white/10 transition-all" asChild>
              <Link to="/demonstracao">Ver demonstração</Link>
            </Button>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            transition={{ delay: 0.4 }} 
            className="mt-12 flex flex-wrap justify-center gap-x-8 gap-y-3 text-xs font-black uppercase tracking-widest text-slate-500"
          >
            <span className="flex items-center gap-2"><Shield className="size-4 text-primary/60" /> Criptografia de Ponta</span>
            <span className="flex items-center gap-2"><Zap className="size-4 text-primary/60" /> Insights em Tempo Real</span>
            <span className="flex items-center gap-2"><CheckCircle2 className="size-4 text-primary/60" /> Multi-plataforma</span>
          </motion.div>
        </div>
      </div>
      
      <div aria-hidden="true" className="absolute inset-x-0 bottom-0 z-[1] h-32 bg-gradient-to-b from-transparent to-[#000a14]" />
    </section>
  );
}
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
