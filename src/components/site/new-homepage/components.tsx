import { motion } from "framer-motion";
import { ArrowRight, ChevronRight, Globe, Shield, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "@tanstack/react-router";

export function Hero() {
  return (
    <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 overflow-hidden bg-background">
      <div className="container px-4 mx-auto relative z-10">
        <div className="max-w-5xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold uppercase tracking-widest mb-8 backdrop-blur-sm"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
            </span>
            Nova Versão 2.0 Disponível
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-5xl md:text-8xl lg:text-9xl font-black tracking-tighter text-foreground leading-[0.85] mb-10"
          >
            Seu dinheiro <br />
            <span className="text-primary relative inline-block">
              sob controle.
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: "100%" }}
                transition={{ duration: 0.8, delay: 0.6 }}
                className="absolute -bottom-2 left-0 h-2 bg-primary/20 rounded-full" 
              />
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-xl md:text-2xl text-muted-foreground mb-12 max-w-3xl mx-auto font-medium leading-relaxed"
          >
            A inteligência financeira que faltava para você conquistar sua liberdade. 
            Modo claro, escuro e uma interface que respira tecnologia.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-6"
          >
            <Button size="lg" className="h-16 px-10 rounded-2xl text-lg font-bold group bg-foreground text-background hover:scale-105 transition-all shadow-2xl shadow-foreground/10" asChild>
              <Link to="/auth" search={{ mode: "signup" }}>
                Começar Grátis
                <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
              </Link>
            </Button>
            <Button variant="outline" size="lg" className="h-16 px-10 rounded-2xl text-lg font-bold border-2 hover:bg-muted/50 transition-all">
              Tour Completo
            </Button>
          </motion.div>
        </div>
      </div>

      {/* Modern Gradient Backgrounds */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full pointer-events-none -z-10 overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-primary/20 rounded-full blur-[120px] animate-glow opacity-50 dark:opacity-30" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-500/10 rounded-full blur-[100px] animate-glow opacity-50 dark:opacity-20" style={{ animationDelay: '2s' }} />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(var(--primary-rgb),0.05)_0%,transparent_50%)]" />
      </div>
    </section>
  );
}

const features = [
  {
    icon: Zap,
    title: "Velocidade Extrema",
    desc: "Registre seus gastos em segundos. Interface otimizada para o dia a dia corrido.",
    color: "bg-blue-500"
  },
  {
    icon: Shield,
    title: "Privacidade Total",
    desc: "Seus dados são criptografados e nunca vendidos. Segurança nível bancário.",
    color: "bg-emerald-500"
  },
  {
    icon: Globe,
    title: "Acesso em Qualquer Lugar",
    desc: "Web e Mobile em perfeita sincronia. Seus dados onde você estiver.",
    color: "bg-amber-500"
  }
];

export function Features() {
  return (
    <section className="py-24 bg-background border-t border-border/50">
      <div className="container px-4 mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="group p-8 rounded-[2rem] bg-muted/20 border border-transparent hover:border-primary/20 hover:bg-card transition-all duration-500"
            >
              <div className={`size-14 rounded-2xl ${f.color} flex items-center justify-center text-white mb-6 group-hover:scale-110 transition-transform duration-500 shadow-lg shadow-current/10`}>
                <f.icon size={28} />
              </div>
              <h3 className="text-2xl font-bold text-foreground mb-4">{f.title}</h3>
              <p className="text-muted-foreground leading-relaxed font-medium">
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
    <section className="py-24 bg-muted/10">
      <div className="container px-4 mx-auto">
        <div className="max-w-3xl mb-16">
          <h2 className="text-4xl md:text-7xl font-black tracking-tight text-foreground mb-6">
            Tudo o que você precisa em <br />
            <span className="text-primary italic">um só lugar.</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 h-auto md:h-[650px]">
          <div className="md:col-span-8 bg-card rounded-[2.5rem] border border-border p-8 md:p-12 relative overflow-hidden group hover:border-primary/30 transition-colors">
            <div className="relative z-10">
              <h3 className="text-4xl font-bold text-foreground mb-4">Dashboard Inteligente</h3>
              <p className="text-muted-foreground max-w-sm mb-8 font-medium text-lg">
                Uma visão panorâmica e imediata da sua saúde financeira através de gráficos dinâmicos.
              </p>
              <div className="flex gap-2">
                <Button size="icon" className="rounded-full bg-primary/10 text-primary hover:bg-primary hover:text-white transition-all">
                    <ChevronRight size={24} />
                </Button>
              </div>
            </div>
            <div className="absolute bottom-0 right-0 w-3/4 h-2/3 bg-muted/30 rounded-tl-[3rem] border-t border-l border-border group-hover:translate-y-4 transition-transform duration-700" />
          </div>
          <div className="md:col-span-4 bg-foreground rounded-[2.5rem] p-8 md:p-12 text-background flex flex-col justify-between group overflow-hidden relative">
            <div className="relative z-10">
              <h3 className="text-4xl font-bold mb-4">Modo Kids</h3>
              <p className="text-background/60 font-medium text-lg">
                Eduque a próxima geração com ferramentas lúdicas de gestão.
              </p>
            </div>
            <div className="relative z-10 flex justify-end">
                <div className="size-20 rounded-full bg-background/10 flex items-center justify-center group-hover:bg-primary transition-colors text-background">
                    <ArrowRight size={32} />
                </div>
            </div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-primary/20 rounded-full blur-[80px] group-hover:scale-150 transition-transform duration-700" />
          </div>
          <div className="md:col-span-4 bg-primary rounded-[2.5rem] p-8 md:p-12 text-primary-foreground group overflow-hidden relative">
            <h3 className="text-4xl font-bold mb-4">IA Consultora</h3>
            <p className="font-medium text-primary-foreground/80 text-lg">
                Insights reais baseados no seu comportamento.
            </p>
            <Zap size={120} className="absolute -bottom-8 -right-8 text-white/10 group-hover:scale-110 transition-transform duration-500" />
          </div>
          <div className="md:col-span-8 bg-card rounded-[2.5rem] border border-border p-8 md:p-12 flex flex-col md:flex-row items-center justify-between group overflow-hidden hover:border-primary/30 transition-colors">
             <div className="max-w-md">
                <h3 className="text-4xl font-bold text-foreground mb-4">Multi-Contas</h3>
                <p className="text-muted-foreground font-medium text-lg">
                    Gerencie cartões, bancos e dinheiro vivo em fluxos separados mas integrados.
                </p>
             </div>
             <div className="hidden md:flex gap-4 mt-8 md:mt-0">
                 {[1,2,3].map(i => (
                     <div key={i} className="size-20 rounded-2xl bg-muted/50 border border-border group-hover:-translate-y-4 transition-transform duration-500" style={{ transitionDelay: `${i*100}ms` }} />
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
    <footer className="py-20 bg-slate-950 text-white">
      <div className="container px-4 mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-20">
          <div className="md:col-span-2">
            <div className="text-2xl font-black tracking-tighter mb-6">
              GASTO<span className="text-primary">CERTO</span>
            </div>
            <p className="text-slate-400 max-w-sm mb-8 font-medium">
              Transformando a relação das pessoas com o dinheiro através de design, tecnologia e transparência.
            </p>
          </div>
          <div>
            <h4 className="font-bold mb-6">Produto</h4>
            <ul className="space-y-4 text-slate-400 font-medium">
              <li><a href="#" className="hover:text-primary transition-colors">Recursos</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Segurança</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Planos</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold mb-6">Suporte</h4>
            <ul className="space-y-4 text-slate-400 font-medium">
              <li><a href="#" className="hover:text-primary transition-colors">Central de Ajuda</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Comunidade</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Contato</a></li>
            </ul>
          </div>
        </div>
        <div className="pt-8 border-t border-white/5 flex flex-col md:row items-center justify-between gap-6 text-sm text-slate-500 font-medium">
          <p>© 2026 GastoCerto. Todos os direitos reservados.</p>
          <div className="flex gap-8">
            <a href="#" className="hover:text-white transition-colors">Privacidade</a>
            <a href="#" className="hover:text-white transition-colors">Termos</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
