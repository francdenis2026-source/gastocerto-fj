import { motion } from "framer-motion";
import { 
  ArrowRight, 
  ChevronRight, 
  Shield, 
  Zap, 
  Sparkles, 
  Smartphone, 
  BarChart3, 
  Users, 
  Wallet, 
  Plus, 
  CheckCircle2, 
  Bell, 
  PieChart, 
  TrendingUp,
  Lock,
  Target,
  Globe
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "@tanstack/react-router";

export function Hero() {
  return (
    <section className="relative pt-20 pb-12 md:pt-28 md:pb-20 overflow-hidden bg-background">
      <div className="container px-4 mx-auto relative z-10">
        <div className="flex flex-col lg:flex-row items-center gap-8 lg:gap-16">
          <div className="flex-1 text-center lg:text-left">
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px] font-bold uppercase tracking-widest mb-6"
            >
              <Sparkles size={12} />
              Redefinindo sua relação com o dinheiro
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tight text-foreground leading-[1.05] mb-6"
            >
              Domine suas finanças <br />
              com <span className="text-primary underline decoration-primary/30 underline-offset-4">inteligência real.</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-base md:text-lg text-muted-foreground mb-8 max-w-xl mx-auto lg:mx-0 font-medium leading-relaxed"
            >
              O GastoCerto combina simplicidade extrema com recursos avançados. 
              Organize cada centavo, planeje o futuro e veja seu patrimônio crescer.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="flex flex-wrap items-center justify-center lg:justify-start gap-3"
            >
              <Button size="lg" className="h-12 px-6 rounded-xl text-sm font-bold group shadow-lg shadow-primary/20" asChild>
                <Link to="/auth" search={{ mode: "signup" }}>
                  Começar Grátis
                  <ArrowRight className="ml-2 size-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
              <Button variant="outline" size="lg" className="h-12 px-6 rounded-xl text-sm font-bold border-2">
                Ver Demonstração
              </Button>
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="mt-8 flex items-center justify-center lg:justify-start gap-4 text-[11px] text-muted-foreground font-bold uppercase tracking-wider"
            >
              <div className="flex -space-x-1.5">
                {[1,2,3,4].map(i => (
                  <div key={i} className="size-6 rounded-full border-2 border-background bg-muted flex items-center justify-center text-[8px]">
                    U{i}
                  </div>
                ))}
              </div>
              <span>Confiado por +5.000 pessoas</span>
            </motion.div>
          </div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="flex-1 relative w-full"
          >
            <div className="relative rounded-2xl md:rounded-[2.5rem] bg-gradient-to-tr from-muted/50 to-muted border border-border/50 p-2 md:p-4 shadow-2xl">
                {/* Interface Mockup */}
                <div className="bg-background rounded-xl md:rounded-[1.5rem] border border-border shadow-sm overflow-hidden flex flex-col aspect-[4/3] md:aspect-video">
                  {/* Top Bar */}
                  <div className="h-8 md:h-12 border-b border-border bg-muted/20 flex items-center justify-between px-4">
                    <div className="flex gap-1.5 md:gap-2">
                      <div className="size-2 md:size-3 rounded-full bg-destructive/40" />
                      <div className="size-2 md:size-3 rounded-full bg-amber-400/40" />
                      <div className="size-2 md:size-3 rounded-full bg-emerald-400/40" />
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="size-5 md:size-7 rounded-full bg-muted" />
                      <div className="h-2 w-16 md:w-24 bg-muted rounded-full" />
                    </div>
                  </div>
                  
                  {/* Content Layout */}
                  <div className="flex-1 flex overflow-hidden">
                    {/* Sidebar mockup */}
                    <div className="w-12 md:w-16 border-r border-border bg-muted/10 p-2 md:p-3 space-y-4">
                      {[1,2,3,4].map(i => (
                        <div key={i} className={`size-8 md:size-10 rounded-lg ${i === 1 ? 'bg-primary/20 text-primary' : 'bg-muted'} flex items-center justify-center`}>
                          <div className="size-4 bg-current opacity-50 rounded-sm" />
                        </div>
                      ))}
                    </div>
                    
                    {/* Main area mockup */}
                    <div className="flex-1 p-3 md:p-6 space-y-4 md:space-y-6 overflow-y-auto custom-scrollbar">
                      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
                        {[
                          { label: 'Saldo', val: 'R$ 12.450', color: 'text-primary' },
                          { label: 'Gastos', val: 'R$ 3.820', color: 'text-destructive' },
                          { label: 'Cartões', val: 'R$ 1.200', color: 'text-blue-500' }
                        ].map((card, i) => (
                          <div key={i} className="bg-card p-3 rounded-xl border border-border space-y-1">
                            <div className="text-[9px] md:text-[10px] font-black uppercase text-muted-foreground tracking-tighter">{card.label}</div>
                            <div className={`text-sm md:text-xl font-black ${card.color}`}>{card.val}</div>
                          </div>
                        ))}
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                         <div className="h-32 md:h-48 bg-card rounded-xl border border-border p-4 flex flex-col justify-between">
                            <div className="h-2 w-24 bg-muted rounded-full" />
                            <div className="flex items-end justify-between h-20 md:h-32 px-1">
                              {[40, 70, 45, 90, 60, 80, 50, 65].map((h, i) => (
                                <div key={i} className="w-2 md:w-3 bg-primary/20 hover:bg-primary transition-colors rounded-t-sm" style={{ height: `${h}%` }} />
                              ))}
                            </div>
                         </div>
                         <div className="bg-card rounded-xl border border-border p-4 space-y-3">
                            <div className="h-2 w-24 bg-muted rounded-full mb-4" />
                            {[1,2,3].map(i => (
                              <div key={i} className="flex items-center justify-between pb-2 border-b border-border last:border-0">
                                <div className="flex items-center gap-2">
                                  <div className="size-6 rounded bg-muted" />
                                  <div className="h-2 w-16 bg-muted rounded-full" />
                                </div>
                                <div className="h-2 w-8 bg-muted rounded-full" />
                              </div>
                            ))}
                         </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Floating Action Button Mockup */}
                <div className="absolute -bottom-4 -right-4 size-10 md:size-14 rounded-full bg-primary text-white flex items-center justify-center shadow-xl shadow-primary/40 border-4 border-background animate-bounce md:animate-none">
                  <Plus size={24} />
                </div>
            </div>

            {/* Background elements */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] -z-10 pointer-events-none opacity-30">
                <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_center,var(--primary)_0%,transparent_70%)] blur-[80px]" />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

const features = [
  {
    icon: PieChart,
    title: "Análise Visual",
    desc: "Categorização automática e gráficos de pizza/barras que dão clareza.",
    color: "bg-blue-500"
  },
  {
    icon: Bell,
    title: "Alertas Inteligentes",
    desc: "Não esqueça mais de pagar contas ou ultrapassar limites de orçamento.",
    color: "bg-amber-500"
  },
  {
    icon: Users,
    title: "Multicontas",
    desc: "Gerencie finanças pessoais e empresariais ou familiares separadamente.",
    color: "bg-emerald-500"
  },
  {
    icon: Lock,
    title: "Segurança Bancária",
    desc: "Dados criptografados de ponta a ponta com as melhores práticas.",
    color: "bg-indigo-500"
  },
  {
    icon: Target,
    title: "Metas e Sonhos",
    desc: "Defina objetivos financeiros e acompanhe seu progresso real.",
    color: "bg-rose-500"
  },
  {
    icon: TrendingUp,
    title: "Balanço Anual",
    desc: "Visão macro da sua evolução financeira ao longo dos anos.",
    color: "bg-cyan-500"
  }
];

export function Features() {
  return (
    <section id="recursos" className="py-16 bg-muted/30 relative">
      <div className="container px-4 mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-3xl md:text-4xl font-black tracking-tight mb-4">Essencial para seu sucesso</h2>
            <p className="text-muted-foreground font-medium text-sm md:text-base leading-relaxed">
              Desenvolvemos cada ferramenta focando no que realmente importa: 
              economizar seu tempo e seu dinheiro.
            </p>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
              className="bg-card p-5 rounded-2xl border border-border hover:shadow-lg hover:shadow-primary/5 transition-all group"
            >
              <div className={`size-10 rounded-xl ${f.color} text-white flex items-center justify-center mb-4 shadow-lg shadow-current/20 group-hover:scale-110 transition-transform`}>
                <f.icon size={20} />
              </div>
              <h3 className="text-lg font-bold text-foreground mb-2">{f.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed font-medium">
                {f.desc}
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
    <section className="py-16 bg-background">
      <div className="container px-4 mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-5 auto-rows-[280px]">
          {/* Bento item 1 */}
          <div className="md:col-span-8 bg-muted/50 rounded-3xl border border-border p-6 md:p-10 flex flex-col justify-center overflow-hidden relative group">
            <div className="relative z-10 max-w-md">
              <span className="text-[9px] font-black uppercase tracking-widest text-primary mb-3 block">Inovação</span>
              <h3 className="text-3xl md:text-5xl font-black text-foreground mb-4">Controle Total em suas mãos</h3>
              <p className="text-muted-foreground font-medium text-sm md:text-base mb-6 leading-relaxed">
                Nossa interface compacta foi desenhada para carregar instantaneamente, 
                mesmo em conexões lentas. Gestão financeira de alta performance.
              </p>
              <div className="flex gap-4">
                <div className="flex items-center gap-1.5 text-xs font-bold text-foreground">
                  <CheckCircle2 size={14} className="text-primary" /> Offline First
                </div>
                <div className="flex items-center gap-1.5 text-xs font-bold text-foreground">
                  <CheckCircle2 size={14} className="text-primary" /> Sync em Tempo Real
                </div>
              </div>
            </div>
            {/* Background elements */}
            <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-primary/10 to-transparent pointer-events-none group-hover:from-primary/15 transition-all" />
            <div className="absolute -bottom-10 -right-10 size-48 md:size-64 bg-primary/5 rounded-full blur-3xl group-hover:bg-primary/10 transition-colors" />
          </div>
          
          {/* Bento item 2 */}
          <div className="md:col-span-4 bg-foreground rounded-3xl p-6 md:p-8 text-background flex flex-col justify-between overflow-hidden relative group">
            <div className="relative z-10">
              <div className="size-10 rounded-xl bg-primary flex items-center justify-center mb-6">
                <Users size={20} className="text-white" />
              </div>
              <h3 className="text-2xl font-black mb-3 leading-tight">Espaço Kids</h3>
              <p className="text-background/60 text-sm font-medium leading-relaxed">
                Gamificação financeira para os pequenos. Educação que transforma o futuro.
              </p>
            </div>
            <div className="relative z-10 mt-6 flex items-center gap-2 text-primary text-xs font-black uppercase tracking-wider group-hover:gap-3 transition-all cursor-pointer">
                Ver mais <ChevronRight size={14} />
            </div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 size-48 bg-primary/20 rounded-full blur-[60px]" />
          </div>

          {/* Bento item 3 */}
          <div className="md:col-span-5 bg-card rounded-3xl border border-border p-6 md:p-8 flex flex-col justify-between group">
            <div>
              <h3 className="text-xl font-black text-foreground mb-3">Mobilidade Híbrida</h3>
              <p className="text-muted-foreground text-sm font-medium leading-relaxed mb-6">
                Instale como um aplicativo no seu celular ou use no navegador. 
                Sua conta sempre com você.
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className="size-10 rounded-xl bg-muted flex items-center justify-center">
                <Smartphone size={20} className="text-primary" />
              </div>
              <div className="size-10 rounded-xl bg-muted flex items-center justify-center">
                <Globe size={20} className="text-primary" />
              </div>
            </div>
          </div>

          {/* Bento item 4 */}
          <div className="md:col-span-7 bg-primary rounded-3xl p-6 md:p-8 text-white flex flex-col md:flex-row items-center justify-between gap-6 overflow-hidden relative group">
             <div className="max-w-xs relative z-10">
                <h3 className="text-2xl font-black mb-3">Exportação Profissional</h3>
                <p className="text-white/80 text-sm font-medium leading-relaxed">
                    Gere relatórios completos em PDF ou CSV para sua contabilidade ou análise pessoal profunda.
                </p>
             </div>
             <div className="flex gap-2 relative z-10">
                <div className="px-4 py-2 rounded-lg bg-white/20 border border-white/30 text-[10px] font-black uppercase tracking-widest backdrop-blur-sm">PDF</div>
                <div className="px-4 py-2 rounded-lg bg-white/20 border border-white/30 text-[10px] font-black uppercase tracking-widest backdrop-blur-sm">CSV</div>
                <div className="px-4 py-2 rounded-lg bg-white/20 border border-white/30 text-[10px] font-black uppercase tracking-widest backdrop-blur-sm">XLS</div>
             </div>
             <div className="absolute -bottom-10 -left-10 size-40 bg-white/10 rounded-full blur-2xl" />
          </div>
        </div>
      </div>
    </section>
  );
}

export function Footer() {
  return (
    <footer className="py-12 bg-muted/20 border-t border-border mt-10">
      <div className="container px-4 mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-8 mb-12">
          <div className="col-span-2">
            <div className="text-xl font-black tracking-tighter mb-4 flex items-center gap-2">
              <div className="size-7 bg-primary rounded-lg flex items-center justify-center text-white text-[10px]">GC</div>
              GASTO<span className="text-primary">CERTO</span>
            </div>
            <p className="text-muted-foreground max-w-xs mb-6 font-medium text-xs leading-relaxed">
              Transformando a complexidade financeira em clareza absoluta. 
              O app para quem quer crescer.
            </p>
            <div className="flex gap-3">
              {[1,2,3].map(i => (
                <div key={i} className="size-8 rounded-lg bg-card border border-border flex items-center justify-center hover:bg-muted transition-colors cursor-pointer">
                  <div className="size-3.5 bg-muted-foreground/30 rounded-sm" />
                </div>
              ))}
            </div>
          </div>
          
          <div>
            <h4 className="font-black text-[10px] uppercase tracking-[0.2em] mb-4 text-foreground">Plataforma</h4>
            <ul className="space-y-2.5 text-muted-foreground text-xs font-bold">
              <li><a href="#recursos" className="hover:text-primary transition-colors">Funcionalidades</a></li>
              <li><a href="#planos" className="hover:text-primary transition-colors">Planos e Preços</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Segurança</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">App Mobile</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-black text-[10px] uppercase tracking-[0.2em] mb-4 text-foreground">Suporte</h4>
            <ul className="space-y-2.5 text-muted-foreground text-xs font-bold">
              <li><a href="#" className="hover:text-primary transition-colors">Central de Ajuda</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Dúvidas Frequentes</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Contato</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Status</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-black text-[10px] uppercase tracking-[0.2em] mb-4 text-foreground">Legal</h4>
            <ul className="space-y-2.5 text-muted-foreground text-xs font-bold">
              <li><a href="#" className="hover:text-primary transition-colors">Privacidade</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Termos de Uso</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Cookies</a></li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-border flex flex-col md:flex-row items-center justify-between gap-4 text-[9px] text-muted-foreground font-black uppercase tracking-[0.2em]">
          <p>© 2026 GastoCerto — Inteligência Financeira.</p>
          <div className="flex gap-6">
            <span className="flex items-center gap-1.5"><div className="size-1.5 rounded-full bg-emerald-500 animate-pulse" /> Servidores Online</span>
            <span className="opacity-50">v1.4.0-stable</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
