import { motion } from "framer-motion";
import { ArrowRight, ChevronRight, Globe, Shield, Zap, Sparkles, Smartphone, BarChart3, Users, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "@tanstack/react-router";

export function Hero() {
  return (
    <section className="relative pt-24 pb-16 md:pt-32 md:pb-24 overflow-hidden bg-background">
      <div className="container px-4 mx-auto relative z-10">
        <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
          <div className="flex-1 text-center lg:text-left">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold uppercase tracking-widest mb-8 backdrop-blur-sm"
            >
              <Sparkles size={14} className="animate-pulse" />
              Gestão Financeira Descomplicada
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-4xl md:text-6xl lg:text-7xl font-black tracking-tighter text-foreground leading-[1.1] mb-8"
            >
              O controle que sua <br className="hidden md:block" />
              <span className="text-primary italic">família merece.</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-lg md:text-xl text-muted-foreground mb-10 max-w-2xl mx-auto lg:mx-0 font-medium leading-relaxed"
            >
              Organize contas, cartões e economize de verdade com o GastoCerto. 
              Interface moderna e ultra-compacta para quem não tem tempo a perder.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4"
            >
              <Button size="lg" className="h-14 px-8 rounded-2xl text-base font-bold group bg-primary text-primary-foreground hover:scale-105 transition-all shadow-xl shadow-primary/20" asChild>
                <Link to="/auth" search={{ mode: "signup" }}>
                  Começar agora
                  <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
              <Button variant="ghost" size="lg" className="h-14 px-8 rounded-2xl text-base font-bold hover:bg-muted transition-all">
                Ver todos os recursos
              </Button>
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="mt-10 flex items-center justify-center lg:justify-start gap-6 text-sm text-muted-foreground font-medium"
            >
              <div className="flex -space-x-2">
                {[1,2,3,4].map(i => (
                  <div key={i} className="size-8 rounded-full border-2 border-background bg-muted overflow-hidden flex items-center justify-center text-[10px] font-bold">
                    U{i}
                  </div>
                ))}
              </div>
              <span>+2.000 usuários ativos</span>
            </motion.div>
          </div>

          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="flex-1 relative w-full max-w-[500px] lg:max-w-none"
          >
            <div className="relative aspect-square lg:aspect-video rounded-[2rem] bg-gradient-to-br from-primary/20 to-blue-500/10 border border-primary/20 overflow-hidden shadow-2xl">
                {/* Mockup visual representativo do dashboard compacto */}
                <div className="absolute inset-4 bg-card rounded-2xl border border-border shadow-lg overflow-hidden flex flex-col">
                    <div className="h-10 border-b border-border bg-muted/30 flex items-center px-4 gap-2">
                        <div className="size-2 rounded-full bg-red-400" />
                        <div className="size-2 rounded-full bg-amber-400" />
                        <div className="size-2 rounded-full bg-emerald-400" />
                    </div>
                    <div className="p-4 grid grid-cols-2 gap-3">
                        <div className="h-20 bg-primary/10 rounded-xl border border-primary/20 p-3">
                            <div className="text-[10px] text-primary font-bold uppercase tracking-wider mb-1">Saldo Total</div>
                            <div className="text-lg font-black tracking-tight text-foreground">R$ 12.450,00</div>
                        </div>
                        <div className="h-20 bg-muted/50 rounded-xl border border-border p-3">
                            <div className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider mb-1">Gastos Mês</div>
                            <div className="text-lg font-black tracking-tight text-destructive">R$ 3.820,00</div>
                        </div>
                        <div className="col-span-2 h-32 bg-muted/20 rounded-xl border border-border p-3 flex flex-col justify-between">
                            <div className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">Fluxo Semanal</div>
                            <div className="flex items-end justify-between h-16 px-2">
                                {[30, 60, 45, 90, 65, 80, 50].map((h, i) => (
                                    <div key={i} className="w-4 bg-primary rounded-t-sm" style={{ height: `${h}%` }} />
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
                
                {/* Mobile Floating Card */}
                <div className="absolute -bottom-6 -right-6 w-40 h-72 bg-card rounded-[2.5rem] border-8 border-foreground shadow-2xl overflow-hidden hidden md:block z-20">
                    <div className="h-full bg-background p-4 flex flex-col gap-4">
                        <div className="w-8 h-1 bg-muted rounded-full mx-auto" />
                        <div className="size-8 rounded-lg bg-primary/20 flex items-center justify-center text-primary">
                            <Wallet size={16} />
                        </div>
                        <div className="space-y-2">
                            <div className="h-2 w-3/4 bg-muted rounded-full" />
                            <div className="h-4 w-full bg-primary/20 rounded-full" />
                        </div>
                        <div className="mt-auto grid grid-cols-2 gap-2">
                            <div className="h-10 bg-muted rounded-lg" />
                            <div className="h-10 bg-muted rounded-lg" />
                        </div>
                    </div>
                </div>
            </div>
            
            {/* Background elements */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[140%] h-[140%] -z-10 pointer-events-none opacity-20 dark:opacity-10">
                <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_center,var(--primary)_0%,transparent_70%)] blur-[100px]" />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

const services = [
  {
    icon: BarChart3,
    title: "Análise Inteligente",
    desc: "Gráficos intuitivos que mostram para onde cada centavo está indo.",
    color: "text-blue-500",
    bg: "bg-blue-500/10"
  },
  {
    icon: Users,
    title: "Espaço Kids",
    desc: "Ensine educação financeira para seus filhos de forma lúdica e segura.",
    color: "text-emerald-500",
    bg: "bg-emerald-500/10"
  },
  {
    icon: Smartphone,
    title: "App Híbrido",
    desc: "Acesse pelo PC ou Celular com a mesma experiência fluída e rápida.",
    color: "text-amber-500",
    bg: "bg-amber-500/10"
  },
  {
      icon: Shield,
      title: "Segurança Total",
      desc: "Dados criptografados e proteção de meses anteriores com senha.",
      color: "text-primary",
      bg: "bg-primary/10"
  }
];

export function Features() {
  return (
    <section id="plataforma" className="py-20 bg-background border-t border-border/50">
      <div className="container px-4 mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl md:text-5xl font-black tracking-tight mb-4">Recursos que facilitam sua vida</h2>
            <p className="text-muted-foreground font-medium">Tudo o que você precisa para sair do vermelho e começar a investir no que importa.</p>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {services.map((s, i) => (
            <motion.div
              key={s.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="group p-6 rounded-3xl border border-border bg-card/50 hover:border-primary/30 hover:bg-card transition-all duration-300"
            >
              <div className={`size-12 rounded-2xl ${s.bg} ${s.color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                <s.icon size={24} />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-3">{s.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed font-medium">
                {s.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function BentoGrid() {
  return (
    <section className="py-20 bg-muted/10 overflow-hidden">
      <div className="container px-4 mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          <div className="md:col-span-7 lg:col-span-8 bg-card rounded-[2rem] border border-border p-8 relative overflow-hidden group">
            <div className="relative z-10">
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary mb-4 block">Visualização Premium</span>
              <h3 className="text-3xl md:text-5xl font-black text-foreground mb-4">Dashboard de <br/>Alta Performance</h3>
              <p className="text-muted-foreground max-w-sm mb-8 font-medium">
                Entenda seu patrimônio com clareza absoluta e tome decisões baseadas em dados reais.
              </p>
              <Button variant="outline" className="rounded-xl font-bold">Explorar Painel</Button>
            </div>
            {/* Decorative background for the card */}
            <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-primary/5 to-transparent pointer-events-none" />
            <div className="absolute -bottom-10 -right-10 size-64 bg-primary/10 rounded-full blur-3xl group-hover:bg-primary/20 transition-colors" />
          </div>
          
          <div className="md:col-span-5 lg:col-span-4 bg-foreground rounded-[2rem] p-8 text-background flex flex-col justify-between group overflow-hidden relative">
            <div className="relative z-10">
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary mb-4 block">Familiar</span>
              <h3 className="text-3xl font-bold mb-4">Ensine seus filhos</h3>
              <p className="text-background/60 font-medium">
                Gamificação financeira para crianças. O modo Kids torna o aprendizado divertido.
              </p>
            </div>
            <div className="relative z-10 mt-8">
                <div className="inline-flex items-center gap-2 text-primary font-bold group-hover:gap-4 transition-all">
                    Conhecer modo kids <ArrowRight size={18} />
                </div>
            </div>
            <div className="absolute -bottom-20 -left-20 size-64 bg-primary/20 rounded-full blur-[80px]" />
          </div>

          <div className="md:col-span-5 lg:col-span-4 bg-primary rounded-[2rem] p-8 text-primary-foreground group overflow-hidden relative">
            <h3 className="text-2xl font-bold mb-4">Relatórios em PDF/CSV</h3>
            <p className="font-medium text-primary-foreground/80 text-sm mb-6">
                Leve seus dados para onde quiser. Exportação completa para contadores ou análise offline.
            </p>
            <div className="flex gap-2">
                <div className="size-10 rounded-xl bg-white/20 flex items-center justify-center font-bold text-xs">PDF</div>
                <div className="size-10 rounded-xl bg-white/20 flex items-center justify-center font-bold text-xs">CSV</div>
            </div>
          </div>

          <div className="md:col-span-7 lg:col-span-8 bg-card rounded-[2rem] border border-border p-8 flex flex-col md:flex-row items-center justify-between group overflow-hidden">
             <div className="max-w-md">
                <h3 className="text-2xl font-bold text-foreground mb-4">Controle de Combustível</h3>
                <p className="text-muted-foreground font-medium text-sm">
                    Módulo exclusivo para gerenciar gastos com veículos e botijão de gás. Saiba exatamente quanto custa seu transporte.
                </p>
             </div>
             <div className="flex gap-3 mt-6 md:mt-0">
                 {[1,2].map(i => (
                     <div key={i} className="size-16 rounded-2xl bg-muted/50 border border-border flex items-center justify-center text-muted-foreground">
                         <Zap size={20} />
                     </div>
                 ))}
             </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export function Footer() {
  return (
    <footer className="py-16 bg-background border-t border-border">
      <div className="container px-4 mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-10 mb-16">
          <div className="col-span-2 lg:col-span-2">
            <div className="text-xl font-black tracking-tighter mb-6 flex items-center gap-2">
              <div className="size-8 bg-primary rounded-lg flex items-center justify-center text-white text-xs">GC</div>
              GASTO<span className="text-primary">CERTO</span>
            </div>
            <p className="text-muted-foreground max-w-sm mb-8 font-medium text-sm leading-relaxed">
              Simplificando o dia a dia financeiro de milhares de brasileiros. 
              Seguro, intuitivo e completo.
            </p>
          </div>
          <div>
            <h4 className="font-bold text-sm uppercase tracking-widest mb-6 text-foreground">Produto</h4>
            <ul className="space-y-4 text-muted-foreground text-sm font-medium">
              <li><a href="#plataforma" className="hover:text-primary transition-colors">Recursos</a></li>
              <li><a href="#planos" className="hover:text-primary transition-colors">Preços</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Segurança</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-sm uppercase tracking-widest mb-6 text-foreground">Empresa</h4>
            <ul className="space-y-4 text-muted-foreground text-sm font-medium">
              <li><a href="#" className="hover:text-primary transition-colors">Sobre nós</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Contato</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Privacidade</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-sm uppercase tracking-widest mb-6 text-foreground">Social</h4>
            <div className="flex gap-4">
                {[1,2,3].map(i => (
                    <div key={i} className="size-10 rounded-xl bg-muted border border-border hover:bg-primary/10 hover:border-primary/30 transition-all cursor-pointer" />
                ))}
            </div>
          </div>
        </div>
        <div className="pt-8 border-t border-border flex flex-col md:flex-row items-center justify-between gap-6 text-[10px] text-muted-foreground font-black uppercase tracking-widest">
          <p>© 2026 GastoCerto — Feito com paixão pelas suas finanças.</p>
          <div className="flex gap-8">
            <a href="#" className="hover:text-foreground transition-colors">Status do Sistema</a>
            <a href="#" className="hover:text-foreground transition-colors">Acessibilidade</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
