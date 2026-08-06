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
  Globe,
  Star,
  Layers,
  Search,
  LayoutDashboard
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "@tanstack/react-router";

export function Hero() {
  return (
    <section className="relative pt-24 pb-12 md:pt-32 md:pb-20 overflow-hidden bg-background">
      {/* Dynamic Background Elements */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-full -z-10 opacity-30">
        <div className="absolute top-[-10%] left-[10%] w-[40%] h-[50%] bg-primary/20 blur-[120px] rounded-full animate-pulse" />
        <div className="absolute bottom-[10%] right-[10%] w-[35%] h-[40%] bg-primary/10 blur-[100px] rounded-full" />
      </div>

      <div className="container px-4 mx-auto relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/5 border border-primary/10 text-primary text-xs font-bold mb-8 shadow-sm"
          >
            <Star size={14} className="fill-primary" />
            <span>O futuro da gestão financeira pessoal</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tighter text-foreground leading-[0.9] mb-8"
          >
            Gestão inteligente <br />
            para sua <span className="text-primary italic">evolução.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1, ease: "easeOut" }}
            className="text-lg md:text-xl text-muted-foreground mb-12 max-w-2xl mx-auto font-medium leading-relaxed"
          >
            Simplifique sua vida, recupere o controle e projete seu patrimônio com a plataforma mais rápida e intuitiva do mercado. Sem atritos, apenas resultados.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Button size="lg" className="h-14 px-8 rounded-full text-base font-bold group shadow-xl shadow-primary/25 hover:scale-105 transition-transform" asChild>
              <Link to="/auth" search={{ mode: "signup" }}>
                Começar agora gratuitamente
                <ArrowRight className="ml-2 size-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </Button>
            <Button variant="ghost" size="lg" className="h-14 px-8 rounded-full text-base font-bold hover:bg-muted transition-colors">
              Explorar funcionalidades
            </Button>
          </motion.div>

          {/* Device Mockup Section */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4, ease: "circOut" }}
            className="mt-20 relative max-w-5xl mx-auto group"
          >
            <div className="relative rounded-[2rem] border border-border bg-card p-2 md:p-3 shadow-2xl overflow-hidden group-hover:border-primary/30 transition-colors duration-500">
              <div className="bg-background rounded-[1.5rem] border border-border shadow-inner overflow-hidden aspect-video relative">
                <div className="absolute inset-0 bg-gradient-to-b from-transparent to-card/50 pointer-events-none" />
                
                {/* Mockup Content */}
                <div className="p-6 md:p-10 h-full flex flex-col gap-6 opacity-80">
                  <div className="flex items-center justify-between">
                    <div className="h-8 w-32 bg-muted rounded-full" />
                    <div className="h-10 w-10 rounded-full bg-primary/20" />
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="h-24 bg-card border border-border rounded-xl p-3 flex flex-col justify-end gap-1">
                       <div className="h-1.5 w-12 bg-primary/20 rounded-full" />
                       <div className="h-4 w-16 bg-primary/10 rounded-full" />
                    </div>
                    <div className="h-24 bg-card border border-border rounded-xl p-3 flex flex-col justify-end gap-1">
                       <div className="h-1.5 w-12 bg-primary/20 rounded-full" />
                       <div className="h-4 w-16 bg-primary/10 rounded-full" />
                    </div>
                    <div className="h-24 bg-card border border-border rounded-xl p-3 flex flex-col justify-end gap-1">
                       <div className="h-1.5 w-12 bg-muted rounded-full" />
                       <div className="h-4 w-16 bg-muted/50 rounded-full" />
                    </div>
                  </div>
                  <div className="flex-1 bg-card border border-border rounded-2xl p-6 flex items-center justify-center">
                    <BarChart3 className="size-20 text-muted/30" strokeWidth={1} />
                  </div>
                </div>
              </div>
            </div>
            
            {/* Floating UI Elements */}
            <motion.div 
              animate={{ y: [0, -10, 0] }}
              transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
              className="absolute -right-6 top-1/4 hidden lg:flex bg-background border border-border p-4 rounded-2xl shadow-xl items-center gap-3 z-20"
            >
              <div className="size-10 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600">
                <CheckCircle2 size={20} />
              </div>
              <div className="pr-4">
                <p className="text-[10px] uppercase font-black text-muted-foreground tracking-widest">Saldo Atualizado</p>
                <p className="text-sm font-bold">+ R$ 4.250,00</p>
              </div>
            </motion.div>

            <motion.div 
              animate={{ y: [0, 10, 0] }}
              transition={{ repeat: Infinity, duration: 5, ease: "easeInOut" }}
              className="absolute -left-6 bottom-1/4 hidden lg:flex bg-background border border-border p-4 rounded-2xl shadow-xl items-center gap-3 z-20"
            >
              <div className="size-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600">
                <TrendingUp size={20} />
              </div>
              <div className="pr-4">
                <p className="text-[10px] uppercase font-black text-muted-foreground tracking-widest">Meta de Economia</p>
                <p className="text-sm font-bold">85% Completa</p>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

const featureGroups = [
  {
    icon: LayoutDashboard,
    title: "Dashboard Pessoal",
    desc: "Visualize sua saúde financeira em segundos com gráficos interativos e resumos inteligentes.",
    theme: "blue"
  },
  {
    icon: Zap,
    title: "Entrada Ultrarrápida",
    desc: "Registre gastos em menos de 2 segundos. Projetado para quem não tem tempo a perder.",
    theme: "primary"
  },
  {
    icon: Users,
    title: "Espaço Kids & Família",
    desc: "Educação financeira prática para seus filhos com interface simplificada e gamificada.",
    theme: "amber"
  },
  {
    icon: Shield,
    title: "Segurança de Nível Bancário",
    desc: "Seus dados são criptografados e protegidos com os mais altos padrões de privacidade.",
    theme: "indigo"
  }
];

export function Features() {
  return (
    <section className="py-24 bg-muted/30 border-y border-border">
      <div className="container px-4 mx-auto">
        <div className="flex flex-col lg:flex-row items-end justify-between gap-8 mb-16">
          <div className="max-w-2xl">
            <h2 className="text-3xl md:text-5xl font-black tracking-tight mb-4">
              Tudo o que você precisa <br /> para dominar seu dinheiro.
            </h2>
            <p className="text-muted-foreground text-lg font-medium leading-relaxed">
              Desenvolvemos as ferramentas mais robustas do mercado sob uma interface minimalista e acolhedora.
            </p>
          </div>
          <Button variant="link" className="text-primary font-bold gap-2 p-0 h-auto">
            Ver todas as ferramentas <ArrowRight size={16} />
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {featureGroups.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="bg-card p-8 rounded-[2rem] border border-border hover:border-primary/30 hover:shadow-xl hover:shadow-primary/5 transition-all group flex flex-col h-full"
            >
              <div className="size-14 rounded-2xl bg-muted flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-primary/5 transition-all duration-500">
                <f.icon size={28} className="text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-4">{f.title}</h3>
              <p className="text-muted-foreground font-medium leading-relaxed text-sm flex-1">
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
    <section className="py-24 bg-background overflow-hidden">
      <div className="container px-4 mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 auto-rows-[320px]">
          {/* Main Bento */}
          <motion.div 
            whileHover={{ y: -5 }}
            className="lg:col-span-7 bg-muted/50 rounded-[2.5rem] border border-border p-10 flex flex-col justify-center overflow-hidden relative group"
          >
            <div className="relative z-10 max-w-md">
              <span className="text-[10px] font-black uppercase tracking-widest text-primary mb-4 block">Inteligência Artificial</span>
              <h3 className="text-3xl md:text-5xl font-black mb-6 leading-[0.95]">Conselheiro Financeiro 24/7</h3>
              <p className="text-muted-foreground font-medium text-base mb-8 leading-relaxed">
                Nossa IA analisa seus hábitos de consumo e sugere ajustes em tempo real para você economizar mais e investir melhor.
              </p>
              <Button className="rounded-full px-6 font-bold shadow-lg">Saiba mais</Button>
            </div>
            
            {/* Visual background for the bento */}
            <div className="absolute top-1/2 right-[-5%] -translate-y-1/2 w-[40%] h-[80%] bg-primary/10 rounded-full blur-[60px] pointer-events-none" />
            <Search className="absolute bottom-[-20px] right-[-20px] size-64 text-primary/5 -rotate-12 pointer-events-none group-hover:scale-110 transition-transform duration-700" />
          </motion.div>

          {/* Secondary Bento */}
          <motion.div 
            whileHover={{ y: -5 }}
            className="lg:col-span-5 bg-foreground rounded-[2.5rem] p-10 text-background flex flex-col justify-between relative overflow-hidden group"
          >
            <div className="relative z-10">
              <div className="size-14 rounded-2xl bg-primary flex items-center justify-center mb-8">
                <Plus size={32} className="text-white" />
              </div>
              <h3 className="text-3xl font-black mb-4 leading-tight">Adição Mágica</h3>
              <p className="text-background/60 font-medium leading-relaxed">
                Importe faturas de cartão de crédito e extratos bancários automaticamente sem burocracia.
              </p>
            </div>
            <div className="relative z-10 flex items-center gap-2 text-primary font-black uppercase text-xs tracking-widest group-hover:gap-4 transition-all cursor-pointer">
              Descobrir como funciona <ArrowRight size={16} />
            </div>
            
            <div className="absolute top-[-20%] left-[-20%] size-64 bg-primary/20 rounded-full blur-[80px]" />
          </motion.div>

          {/* Tertiary Bento */}
          <motion.div 
            whileHover={{ y: -5 }}
            className="lg:col-span-4 bg-card rounded-[2.5rem] border border-border p-10 flex flex-col justify-between group"
          >
            <div className="size-14 rounded-2xl bg-muted flex items-center justify-center group-hover:bg-blue-500/5 transition-colors">
              <Smartphone size={28} className="text-blue-500" />
            </div>
            <div>
              <h3 className="text-2xl font-black mb-3">App Híbrido</h3>
              <p className="text-muted-foreground font-medium text-sm leading-relaxed">
                Instale em qualquer dispositivo e tenha seus dados sincronizados instantaneamente.
              </p>
            </div>
          </motion.div>

          {/* Quaternary Bento */}
          <motion.div 
            whileHover={{ y: -5 }}
            className="lg:col-span-8 bg-primary rounded-[2.5rem] p-10 text-white flex flex-col md:flex-row items-center justify-between gap-10 relative overflow-hidden group"
          >
            <div className="relative z-10 max-w-sm">
              <h3 className="text-4xl font-black mb-4 leading-tight">Relatórios em um clique</h3>
              <p className="text-white/80 font-medium leading-relaxed mb-6">
                PDF, Excel ou CSV. Exporte tudo com um design profissional pronto para compartilhar.
              </p>
              <div className="flex gap-3">
                <div className="size-10 rounded-lg bg-white/20 border border-white/20 flex items-center justify-center backdrop-blur-md font-black text-[10px]">PDF</div>
                <div className="size-10 rounded-lg bg-white/20 border border-white/20 flex items-center justify-center backdrop-blur-md font-black text-[10px]">XLS</div>
              </div>
            </div>
            
            <motion.div
              animate={{ rotate: [0, 5, 0] }}
              transition={{ repeat: Infinity, duration: 6 }}
              className="relative z-10 hidden md:block"
            >
              <Layers className="size-32 text-white/20" strokeWidth={1} />
            </motion.div>
            
            <div className="absolute bottom-[-30%] right-[-10%] size-80 bg-white/10 rounded-full blur-[100px]" />
          </motion.div>
        </div>
      </div>
    </section>
  );
}

export function Footer() {
  return (
    <footer className="py-20 bg-background border-t border-border overflow-hidden">
      <div className="container px-4 mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start gap-12 mb-20">
          <div className="max-w-xs">
            <div className="text-2xl font-black tracking-tighter mb-6 flex items-center gap-3">
              <div className="size-9 bg-primary rounded-xl flex items-center justify-center text-white text-xs">GC</div>
              GASTO<span className="text-primary italic">CERTO</span>
            </div>
            <p className="text-muted-foreground font-medium leading-relaxed mb-8">
              Ajudando brasileiros a construir liberdade financeira através de dados e tecnologia.
            </p>
            <div className="flex gap-4">
              {[1,2,3,4].map(i => (
                <div key={i} className="size-10 rounded-full border border-border flex items-center justify-center hover:bg-muted transition-colors cursor-pointer">
                  <Globe size={18} className="text-muted-foreground" />
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-12 md:gap-24">
            <div className="space-y-6">
              <h4 className="text-sm font-black uppercase tracking-widest text-foreground">Produto</h4>
              <ul className="space-y-4 text-muted-foreground font-medium text-sm">
                <li className="hover:text-primary transition-colors cursor-pointer">Funcionalidades</li>
                <li className="hover:text-primary transition-colors cursor-pointer">Preços</li>
                <li className="hover:text-primary transition-colors cursor-pointer">Segurança</li>
                <li className="hover:text-primary transition-colors cursor-pointer">Updates</li>
              </ul>
            </div>
            <div className="space-y-6">
              <h4 className="text-sm font-black uppercase tracking-widest text-foreground">Empresa</h4>
              <ul className="space-y-4 text-muted-foreground font-medium text-sm">
                <li className="hover:text-primary transition-colors cursor-pointer">Sobre nós</li>
                <li className="hover:text-primary transition-colors cursor-pointer">Blog</li>
                <li className="hover:text-primary transition-colors cursor-pointer">Carreiras</li>
                <li className="hover:text-primary transition-colors cursor-pointer">Contato</li>
              </ul>
            </div>
            <div className="space-y-6">
              <h4 className="text-sm font-black uppercase tracking-widest text-foreground">Legal</h4>
              <ul className="space-y-4 text-muted-foreground font-medium text-sm">
                <li className="hover:text-primary transition-colors cursor-pointer">Privacidade</li>
                <li className="hover:text-primary transition-colors cursor-pointer">Termos</li>
                <li className="hover:text-primary transition-colors cursor-pointer">Cookies</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="flex flex-col md:flex-row justify-between items-center gap-6 pt-12 border-t border-border">
          <p className="text-muted-foreground text-xs font-medium">
            © 2026 GastoCerto. Todos os direitos reservados.
          </p>
          <div className="flex items-center gap-6">
             <div className="text-[10px] font-black uppercase tracking-tighter text-muted-foreground/50">Brasil</div>
             <div className="text-[10px] font-black uppercase tracking-tighter text-muted-foreground/50">Português</div>
          </div>
        </div>
      </div>
    </footer>
  );
}
