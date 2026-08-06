import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
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
  CreditCard,
  PieChart,
  ChevronRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "@tanstack/react-router";
import { useRef } from "react";
import { Logo } from "@/components/logo";

export function Hero() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollY } = useScroll();
  const y1 = useTransform(scrollY, [0, 500], [0, 200]);
  const opacity = useTransform(scrollY, [0, 300], [1, 0]);
  useMouseGlow();

  return (
    <section ref={containerRef} className="relative min-h-[90vh] flex items-center justify-center overflow-hidden bg-[#000c18] pt-20">
      {/* Cinematic Background */}
      <motion.div style={{ y: y1, opacity }} className="absolute inset-0 z-0">
        <img 
          src="https://images.unsplash.com/photo-1639762681485-074b7f938ba0?q=80&w=2232&auto=format&fit=crop" 
          alt="Abstract Financial Future" 
          className="w-full h-full object-cover opacity-20 mix-blend-overlay"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#000c18]/0 via-[#000c18]/80 to-[#000c18]" />
      </motion.div>

      <div className="container relative z-10 px-4 md:px-6">
        <div className="flex flex-col items-center text-center max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mb-8 px-4 py-1.5 rounded-full border border-primary/20 bg-primary/5 backdrop-blur-xl text-primary text-xs md:text-sm font-bold tracking-wider uppercase"
          >
            A Próxima Geração em Controle Financeiro
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-black tracking-tight text-white leading-[0.9] mb-8"
          >
            Seu dinheiro, <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-emerald-400 to-primary animate-gradient">sob domínio total.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            className="text-lg md:text-xl text-slate-400 max-w-2xl mb-12 font-medium"
          >
            Chega de planilhas complicadas. O jeito mais fácil e bonito de cuidar do seu dinheiro e realizar seus sonhos.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto"
          >
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="w-full sm:w-auto">
              <Button size="lg" className="h-14 px-10 rounded-2xl text-base font-bold group bg-primary hover:bg-primary/90 shadow-2xl shadow-primary/20 w-full glow-effect" asChild>
                <Link to="/auth" search={{ mode: "signup" }}>
                  Começar Jornada
                  <ArrowRight className="ml-2 size-5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
            </motion.div>
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="w-full sm:w-auto">
              <Button variant="outline" size="lg" className="h-14 px-10 rounded-2xl text-base font-bold border-white/10 bg-white/5 hover:bg-white/10 backdrop-blur-md text-white w-full glow-effect">
                Ver Demonstração
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* Modern Visual Element: Mesh Gradient */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full -z-10 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-primary/20 blur-[120px] rounded-full animate-pulse-subtle" />
        <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-blue-500/10 blur-[100px] rounded-full" />
      </div>
    </section>
  );
}

const trustItems = [
  { icon: Shield, label: "Criptografia de Ponta" },
  { icon: LayoutDashboard, label: "Interface Premium" },
  { icon: TrendingUp, label: "Análise Preditiva" },
];

export function Features() {
  return (
    <section className="py-24 bg-[#000c18] relative">
      <div className="container px-4 mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-end gap-8 mb-20">
          <div className="max-w-2xl">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="text-primary font-black uppercase tracking-[0.2em] text-xs mb-4"
            >
              Exclusividade & Poder
            </motion.div>
            <h2 className="text-3xl md:text-5xl font-black text-white tracking-tighter leading-tight">
              Recursos desenhados para <br /> quem busca o topo.
            </h2>
          </div>
          <div className="flex gap-8">
            {trustItems.map((item, i) => (
              <div key={i} className="flex items-center gap-3">
                <item.icon className="text-primary size-5" />
                <span className="text-white/60 text-xs font-bold uppercase tracking-wider">{item.label}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              icon: LayoutDashboard,
              title: "Tudo em um só lugar",
              desc: "Organize suas contas, cartões e despesas mensais sem complicações.",
              gradient: "from-blue-500/20 to-primary/20"
            },
            {
              icon: Zap,
              title: "Rápido e Simples",
              desc: "Registre seus gastos em poucos segundos pelo celular, onde quer que você esteja.",
              gradient: "from-primary/20 to-emerald-500/20"
            },
            {
              icon: Users,
              title: "Espaço Kids",
              desc: "Ensine educação financeira para os filhos com um painel exclusivo e divertido.",
              gradient: "from-emerald-500/20 to-teal-500/20"
            }
          ].map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              whileHover={{ y: -8, scale: 1.02 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, type: "spring", stiffness: 300 }}
              className="group relative p-6 rounded-[2rem] bg-white/5 border border-white/10 hover:border-primary/50 transition-all duration-500 overflow-hidden"
            >
              <Link to="/auth" search={item.title === "Espaço Kids" ? { mode: "kid" } : { mode: "signup" }} className="absolute inset-0 z-20" />
              <div className={`absolute inset-0 bg-gradient-to-br ${item.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
              <div className="relative z-10">
                <div className="size-12 rounded-xl bg-white/5 flex items-center justify-center mb-6 border border-white/10 group-hover:scale-110 group-hover:bg-primary group-hover:border-primary transition-all duration-500">
                  <item.icon className="text-primary group-hover:text-white transition-colors size-5" />
                </div>
                <h3 className="text-xl font-black text-white mb-3">{item.title}</h3>
                <p className="text-sm text-slate-400 font-medium leading-relaxed">
                  {item.desc}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function BentoGrid() {
  return (
    <section className="py-24 bg-[#000c18]">
      <div className="container px-4 mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 auto-rows-[280px]">
          {/* Main: IA Advisor */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            whileHover={{ scale: 1.01 }}
            className="lg:col-span-8 bg-gradient-to-br from-primary/10 to-blue-600/10 rounded-[2.5rem] border border-white/10 p-8 flex flex-col justify-center relative overflow-hidden group transition-all duration-500 hover:border-primary/30"
          >
            <Link to="/auth" search={{ mode: "signup" }} className="absolute inset-0 z-20" />
            <div className="max-w-md relative z-10">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-white text-[10px] font-black uppercase tracking-widest mb-6">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                </span>
                AI Core Engine
              </div>
              <h3 className="text-4xl md:text-5xl font-black text-white mb-4 leading-[0.9]">Dicas de Economia Inteligente.</h3>
              <p className="text-slate-400 font-medium text-base leading-relaxed">
                Nosso sistema avisa onde você pode economizar mais para sobrar dinheiro no final do mês.
              </p>
            </div>
            <div className="absolute right-[2%] top-1/2 -translate-y-1/2 opacity-30 group-hover:opacity-60 transition-all duration-700 group-hover:scale-110 pointer-events-none">
              <Search className="size-64 text-primary/40" strokeWidth={1} />
            </div>
          </motion.div>

          {/* Secondary: Reports */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            whileHover={{ scale: 1.02, y: -5 }}
            className="lg:col-span-4 bg-[#001830] rounded-[2.5rem] border border-white/10 p-8 flex flex-col justify-between group overflow-hidden transition-all duration-500 hover:border-primary/30"
          >
            <Link to="/auth" search={{ mode: "signup" }} className="absolute inset-0 z-20" />
            <div className="relative z-10">
              <Layers className="text-primary size-8 mb-6" />
              <h3 className="text-xl font-black text-white mb-3">Relatórios para Impressão</h3>
              <p className="text-sm text-slate-400 font-medium leading-relaxed">
                Gere arquivos em PDF ou Excel para ver como estão seus gastos de forma organizada.
              </p>
            </div>
            <div className="flex gap-2">
              <div className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-[10px] font-black text-white/40">PDF</div>
              <div className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-[10px] font-black text-white/40">CSV</div>
            </div>
          </motion.div>

          {/* Third: Mobile */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            whileHover={{ scale: 1.02, y: -5 }}
            className="lg:col-span-5 bg-primary rounded-[2.5rem] p-8 flex flex-col justify-between group relative overflow-hidden transition-all duration-500 shadow-2xl shadow-primary/0 hover:shadow-primary/20"
          >
            <Link to="/auth" search={{ mode: "signup" }} className="absolute inset-0 z-20" />
            <div className="relative z-10">
              <Smartphone className="text-white size-10 mb-6" />
              <h3 className="text-2xl font-black text-white mb-3 leading-tight">Use em qualquer lugar</h3>
              <p className="text-white/90 font-medium text-base">
                Suas contas sempre com você, no computador, tablet ou celular.
              </p>
            </div>
            <div className="absolute -bottom-10 -right-10 opacity-20 group-hover:rotate-12 transition-transform duration-700">
              <Smartphone className="size-64 text-white" strokeWidth={0.5} />
            </div>
          </motion.div>

          {/* Fourth: Cloud */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            whileHover={{ scale: 1.01 }}
            className="lg:col-span-7 bg-white/5 rounded-[2.5rem] border border-white/10 p-8 flex items-center justify-between group transition-all duration-500 hover:border-primary/30"
          >
            <Link to="/auth" search={{ mode: "signup" }} className="absolute inset-0 z-20" />
            <div className="max-w-sm">
              <Globe className="text-primary size-8 mb-6" />
              <h3 className="text-2xl font-black text-white mb-3">Seus dados protegidos</h3>
              <p className="text-sm text-slate-400 font-medium">
                Tudo é salvo automaticamente na nuvem com a mesma segurança dos grandes bancos.
              </p>
            </div>
            <div className="hidden md:block relative">
              <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full" />
              <div className="relative size-32 rounded-full border border-primary/30 flex items-center justify-center animate-spin-slow">
                <Plus className="text-primary size-8" />
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

import { Mail, MapPin } from "lucide-react";

export function Footer() {
  return (
    <footer className="py-24 bg-[#000c18]">
      <div className="container px-4 mx-auto">
        <div className="flex flex-col lg:flex-row justify-between gap-16 mb-20">
          <div className="max-w-xs">
            <div className="mb-8">
              <Logo onDark />
            </div>
            <p className="text-slate-400 font-medium leading-relaxed mb-10">
              A tecnologia definitiva para quem não aceita nada menos que a excelência na gestão do próprio patrimônio.
            </p>
            <div className="flex flex-col gap-4 mb-10">
              <div className="flex items-center gap-3 text-slate-400 font-medium">
                <Mail className="size-5 text-primary" />
                <span>contato@gastocerto.com</span>
              </div>
              <div className="flex items-center gap-3 text-slate-400 font-medium">
                <MapPin className="size-5 text-primary" />
                <span>Feijó - Acre</span>
              </div>
            </div>
            <div className="flex gap-4">
              {[Globe, Shield, LayoutDashboard].map((Icon, i) => (
                <div key={i} className="size-12 rounded-2xl border border-white/10 flex items-center justify-center text-white/40 hover:text-primary hover:border-primary/50 hover:bg-primary/5 transition-all cursor-pointer">
                  <Icon size={20} />
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-16 lg:gap-32">
            <div className="space-y-8">
              <h4 className="text-xs font-black uppercase tracking-[0.2em] text-white">Ecossistema</h4>
              <ul className="space-y-4 text-slate-500 font-bold text-sm">
                <li className="hover:text-primary transition-colors cursor-pointer">Dashboard</li>
                <li className="hover:text-primary transition-colors cursor-pointer">Planejamento</li>
                <li className="hover:text-primary transition-colors cursor-pointer">Análises</li>
                <li className="hover:text-primary transition-colors cursor-pointer">Segurança</li>
              </ul>
            </div>
            <div className="space-y-8">
              <h4 className="text-xs font-black uppercase tracking-[0.2em] text-white">Suporte</h4>
              <ul className="space-y-4 text-slate-500 font-bold text-sm">
                <li className="hover:text-primary transition-colors cursor-pointer">Ajuda</li>
                <li className="hover:text-primary transition-colors cursor-pointer">Blog</li>
                <li className="hover:text-primary transition-colors cursor-pointer">Contato</li>
                <li className="hover:text-primary transition-colors cursor-pointer">FAQ</li>
              </ul>
            </div>
            <div className="space-y-8">
              <h4 className="text-xs font-black uppercase tracking-[0.2em] text-white">Legal</h4>
              <ul className="space-y-4 text-slate-500 font-bold text-sm">
                <li className="hover:text-primary transition-colors cursor-pointer">Termos</li>
                <li className="hover:text-primary transition-colors cursor-pointer">Privacidade</li>
                <li className="hover:text-primary transition-colors cursor-pointer">Cookies</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="pt-12 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-8">
          <p className="text-slate-600 text-sm font-bold">
            © 2026 GastoCerto — Desenvolvido por Franc D&apos;nis.
          </p>
          <div className="flex gap-8">
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-700">Brasil / PT-BR</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
