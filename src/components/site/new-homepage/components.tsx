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
    <section className="relative min-h-[75vh] md:min-h-[85vh] flex items-center justify-center overflow-hidden bg-background py-16 md:py-24 lg:py-32">
      {/* Optimized Background Image Layer */}
      <div className="absolute inset-0 z-0">
        <img 
          src="https://images.unsplash.com/photo-1554224155-6726b3ff858f?q=80&w=2000&auto=format&fit=crop" 
          alt="Financial Hero Background" 
          className="w-full h-full object-cover opacity-25 dark:opacity-20 mix-blend-soft-light scale-100 md:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background via-background/60 to-background" />
        <div className="absolute inset-0 bg-gradient-to-r from-background via-transparent to-background" />
      </div>

      <div className="container px-4 mx-auto relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px] md:text-xs font-bold mb-6 md:mb-8 backdrop-blur-md"
          >
            <Star size={12} className="fill-primary md:size-14" />
            <span>O futuro da gestão financeira pessoal</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-black tracking-tighter text-foreground leading-[1.1] mb-6 md:mb-8"
          >
            Gestão inteligente <br />
            para sua <span className="text-primary italic">evolução.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1, ease: "easeOut" }}
            className="text-base md:text-lg lg:text-xl text-muted-foreground mb-8 md:mb-12 max-w-2xl mx-auto font-medium leading-relaxed px-4 md:px-0"
          >
            Simplifique sua vida, recupere o controle e projete seu patrimônio com a plataforma mais rápida e intuitiva do mercado.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
            className="flex flex-col sm:flex-row items-center justify-center gap-3 md:gap-4 px-6 md:px-0"
          >
            <Button size="lg" className="w-full sm:w-auto h-12 md:h-14 px-6 md:px-8 rounded-full text-sm md:text-base font-bold group shadow-xl shadow-primary/25 hover:scale-105 transition-transform" asChild>
              <Link to="/auth" search={{ mode: "signup" }}>
                Começar agora gratuitamente
                <ArrowRight className="ml-2 size-4 md:size-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </Button>
            <Button variant="outline" size="lg" className="w-full sm:w-auto h-12 md:h-14 px-6 md:px-8 rounded-full text-sm md:text-base font-bold backdrop-blur-sm bg-background/20 hover:bg-background/40 transition-colors">
              Explorar funcionalidades
            </Button>
          </motion.div>
        </div>
      </div>
      
      {/* Decorative Glows */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-7xl h-full -z-10 opacity-30 pointer-events-none">
        <div className="absolute top-[-20%] left-[10%] w-[40%] h-[50%] bg-primary/30 blur-[120px] rounded-full animate-pulse" />
        <div className="absolute bottom-[0%] right-[10%] w-[35%] h-[40%] bg-blue-500/20 blur-[100px] rounded-full" />
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
    <section className="py-16 bg-muted/30 border-y border-border">
      <div className="container px-4 mx-auto">
        <div className="flex flex-col lg:flex-row items-end justify-between gap-6 mb-12">
          <div className="max-w-2xl">
            <h2 className="text-2xl md:text-4xl font-black tracking-tight mb-3">
              Tudo o que você precisa <br /> para dominar seu dinheiro.
            </h2>
            <p className="text-muted-foreground text-base font-medium leading-relaxed">
              Desenvolvemos as ferramentas mais robustas do mercado sob uma interface minimalista e acolhedora.
            </p>
          </div>
          <Button variant="link" className="text-primary font-bold gap-2 p-0 h-auto">
            Ver todas as ferramentas <ArrowRight size={16} />
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {featureGroups.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="bg-card p-6 rounded-[1.5rem] border border-border hover:border-primary/50 hover:shadow-2xl hover:shadow-primary/10 transition-all duration-300 group flex flex-col h-full lift"
            >
              <div className="size-12 rounded-xl bg-muted flex items-center justify-center mb-4 group-hover:scale-110 group-hover:bg-primary/5 transition-all duration-500">
                <f.icon size={24} className="text-primary" />
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
    <section className="py-16 bg-background overflow-hidden">
      <div className="container px-4 mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 auto-rows-[280px]">
          {/* Main Bento */}
          <motion.div 
            whileHover={{ y: -5 }}
            className="lg:col-span-7 bg-muted/50 rounded-[2rem] border border-border p-8 flex flex-col justify-center overflow-hidden relative group"
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
            className="lg:col-span-5 bg-foreground rounded-[2rem] p-8 text-background flex flex-col justify-between relative overflow-hidden group"
          >
            <div className="relative z-10">
              <div className="size-12 rounded-xl bg-primary flex items-center justify-center mb-6">
                <Plus size={28} className="text-white" />
              </div>
              <h3 className="text-2xl font-black mb-3 leading-tight">Adição Mágica</h3>
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
            className="lg:col-span-4 bg-card rounded-[2rem] border border-border p-8 flex flex-col justify-between group"
          >
            <div className="size-12 rounded-xl bg-muted flex items-center justify-center group-hover:bg-primary/5 transition-colors">
              <Smartphone size={24} className="text-primary" />
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
            className="lg:col-span-8 bg-primary rounded-[2rem] p-8 text-white flex flex-col md:flex-row items-center justify-between gap-8 relative overflow-hidden group"
          >
            <div className="relative z-10 max-w-sm">
              <h3 className="text-3xl font-black mb-3 leading-tight">Relatórios em um clique</h3>
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
