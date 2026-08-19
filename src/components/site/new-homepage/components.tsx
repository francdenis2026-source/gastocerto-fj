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
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "@tanstack/react-router";
import { useRef } from "react";
import { Logo } from "@/components/logo";

const reveal = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.2 },
};

export function Hero() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollY } = useScroll();
  const y1 = useTransform(scrollY, [0, 500], [0, 140]);
  useMouseGlow();

  return (
    <section ref={containerRef} aria-labelledby="home-title" className="relative flex min-h-[90svh] items-center justify-center overflow-hidden bg-[#000a14] pt-24 sm:pt-28">
      <motion.div style={{ y: y1 }} aria-hidden="true" className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,color-mix(in_oklab,var(--primary)_16%,transparent),transparent_58%)]" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#000a14]/20 to-[#000a14]" />
      </motion.div>

      <div className="shell relative z-10 py-16 sm:py-20">
        <div className="mx-auto flex max-w-5xl flex-col items-center text-center">
          <motion.p initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} className="mb-7 rounded-full border border-primary/25 bg-primary/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.16em] text-emerald-300 backdrop-blur-xl sm:text-sm">
            Controle financeiro simples, seguro e completo
          </motion.p>

          <motion.h1 id="home-title" initial={{ opacity: 0, y: 28 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }} className="mb-7 max-w-5xl text-balance font-display text-4xl font-black leading-[0.98] tracking-[-0.055em] text-white sm:text-6xl lg:text-7xl xl:text-8xl">
            Seu dinheiro com clareza para você decidir melhor.
          </motion.h1>

          <motion.p initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.08, ease: [0.16, 1, 0.3, 1] }} className="mb-10 max-w-2xl text-pretty text-base font-medium leading-7 text-slate-300 sm:text-lg md:text-xl">
            Organize receitas, despesas, cartões, contas e metas em um painel que transforma sua rotina financeira em informação fácil de entender.
          </motion.p>

          <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.16 }} className="flex w-full max-w-md flex-col gap-3 sm:w-auto sm:max-w-none sm:flex-row">
            <Button size="lg" className="h-14 w-full rounded-xl px-8 text-base font-bold shadow-xl shadow-primary/20 sm:w-auto" asChild>
              <Link to="/auth" search={{ mode: "signup" }}>
                Criar minha conta
                <ArrowRight aria-hidden="true" className="ml-2 size-5" />
              </Link>
            </Button>
            <Button variant="outline" size="lg" className="h-14 w-full rounded-xl border-white/20 bg-white/5 px-8 text-base font-bold text-white hover:bg-white/10 hover:text-white sm:w-auto" asChild>
              <Link to="/demonstracao">Ver demonstração</Link>
            </Button>
          </motion.div>

          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.35 }} className="mt-10 flex flex-wrap items-center justify-center gap-x-6 gap-y-3 text-sm text-slate-400">
            <span className="inline-flex items-center gap-2"><Shield aria-hidden="true" className="size-4 text-primary" /> Dados protegidos</span>
            <span className="inline-flex items-center gap-2"><Smartphone aria-hidden="true" className="size-4 text-primary" /> Feito para qualquer tela</span>
            <span className="inline-flex items-center gap-2"><Zap aria-hidden="true" className="size-4 text-primary" /> Registro rápido</span>
          </motion.div>
        </div>
      </div>
    </section>
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
