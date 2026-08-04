
import { Link } from "@tanstack/react-router";
import { 
  Sparkles, 
  ArrowRight, 
  Bot, 
  TrendingUp, 
  ShieldCheck, 
  Target, 
  Smartphone, 
  Zap,
  LayoutDashboard,
  BarChart3,
  Flame,
  CreditCard
} from "lucide-react";
import { Reveal } from "@/components/landing/reveal";
import { cn } from "@/lib/utils";

const benefits = [
  {
    icon: Bot,
    title: "IA Financeira Avançada",
    text: "Nossa IA analisa cada centavo, identifica padrões e sugere economias personalizadas para você.",
    metric: "24/7",
    label: "Consultoria Ativa",
    color: "bg-primary/10 text-primary"
  },
  {
    icon: LayoutDashboard,
    title: "Dashboard de Alta Performance",
    text: "Visualize sua vida financeira com clareza absoluta em uma interface premium de alto nível.",
    metric: "Real-time",
    label: "Dados Sincronizados",
    color: "bg-primary/10 text-primary"
  },
  {
    icon: ShieldCheck,
    title: "Segurança Nível Bancário",
    text: "Criptografia de ponta a ponta e isolamento total de dados para sua tranquilidade absoluta.",
    metric: "AES-256",
    label: "Criptografado",
    color: "bg-primary/10 text-primary"
  }
];

const mainFeatures = [
  {
    title: "Controle de Gastos Diários",
    description: "Lançamentos ultra-rápidos, categorias automáticas e anexos de comprovantes.",
    icon: Zap,
    delay: 100
  },
  {
    title: "Gestão de Metas",
    description: "Defina objetivos financeiros, acompanhe o progresso e realize seus sonhos mais rápido.",
    icon: Target,
    delay: 200
  },
  {
    title: "Hub de Cartões",
    description: "Visualize faturas, limites e vencimentos de todos os seus cartões em um só lugar.",
    icon: CreditCard,
    delay: 300
  },
  {
    title: "Análise Preditiva",
    description: "Saiba quanto vai gastar com combustível, gás e energia antes mesmo da conta chegar.",
    icon: Flame,
    delay: 400
  }
];

export function Benefits() {
  return (
    <section id="recursos" className="py-24 lg:py-32 relative overflow-hidden bg-background">
      {/* Decorative Blur */}
      <div className="absolute top-1/2 left-0 -translate-y-1/2 w-64 h-64 bg-primary/10 blur-[100px] rounded-full -z-10" />
      
      <div className="container mx-auto px-6 lg:px-12">
        {/* Section Header */}
        <div className="max-w-3xl mb-20">
          <Reveal delay={100}>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-primary/20 bg-primary/5 mb-6">
              <Sparkles className="size-4 text-primary" />
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary">Recursos Premium</span>
            </div>
          </Reveal>
          <Reveal delay={200}>
            <h2 className="text-4xl lg:text-6xl font-black tracking-tight text-foreground mb-8">
              Tudo o que você precisa para <span className="text-primary italic">dominar</span> suas finanças.
            </h2>
          </Reveal>
          <Reveal delay={300}>
            <p className="text-lg lg:text-xl text-muted-foreground font-medium leading-relaxed">
              Desenvolvemos as ferramentas mais poderosas do mercado para que você tenha controle 
              total e absoluto sobre seu patrimônio, de forma simples e elegante.
            </p>
          </Reveal>
        </div>

        {/* Big Feature Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-24">
          {benefits.map((benefit, index) => (
            <Reveal key={benefit.title} delay={index * 100 + 400}>
              <div className="group relative p-10 rounded-[32px] border border-border bg-card/50 backdrop-blur-sm transition-all hover:-translate-y-2 hover:border-primary/20 hover:shadow-2xl hover:shadow-primary/5">
                <div className={cn("size-16 rounded-2xl flex items-center justify-center mb-8 transition-transform group-hover:scale-110 group-hover:rotate-3", benefit.color)}>
                  <benefit.icon className="size-8" />
                </div>
                
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-2xl font-black text-foreground">{benefit.title}</h3>
                  <div className="text-right">
                    <span className="block text-xl font-black text-primary leading-none">{benefit.metric}</span>
                    <span className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground">{benefit.label}</span>
                  </div>
                </div>
                
                <p className="text-muted-foreground font-medium leading-relaxed">
                  {benefit.text}
                </p>
                
                <div className="mt-10 pt-8 border-t border-border flex items-center gap-2 text-sm font-bold uppercase tracking-[0.15em] text-primary transition-all group-hover:gap-4">
                  Saiba mais <ArrowRight className="size-4" />
                </div>
              </div>
            </Reveal>
          ))}
        </div>

        {/* Feature Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {mainFeatures.map((feature) => (
            <Reveal key={feature.title} delay={feature.delay + 600}>
              <div className="p-8 rounded-3xl border border-border bg-secondary/20 hover:bg-secondary/40 transition-colors">
                <feature.icon className="size-6 text-primary mb-6" />
                <h4 className="text-lg font-bold text-foreground mb-3">{feature.title}</h4>
                <p className="text-sm text-muted-foreground font-medium leading-relaxed">
                  {feature.description}
                </p>
              </div>
            </Reveal>
          ))}
        </div>

        {/* Mobile Experience Block */}
        <Reveal delay={1000} className="mt-24 rounded-[40px] border border-primary/20 bg-primary/5 p-8 lg:p-16 overflow-hidden relative">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 blur-[80px] rounded-full -z-10" />
          
          <div className="flex flex-col lg:flex-row items-center justify-between gap-12">
            <div className="max-w-xl">
              <h3 className="text-3xl lg:text-4xl font-black tracking-tight text-foreground mb-6">
                Leve o GameCarto para qualquer lugar.
              </h3>
              <p className="text-lg text-muted-foreground font-medium leading-relaxed mb-8">
                Nossa plataforma é 100% responsiva e PWA. Instale no seu smartphone e tenha o controle 
                completo na palma da sua mão, mesmo sem conexão com a internet.
              </p>
              <div className="flex flex-wrap gap-4">
                <div className="flex items-center gap-3 px-6 py-3 rounded-2xl bg-foreground text-background font-bold">
                  <Smartphone className="size-5" />
                  Instalar App
                </div>
                <div className="flex items-center gap-3 px-6 py-3 rounded-2xl border border-border bg-card font-bold">
                  <ShieldCheck className="size-5 text-primary" />
                  Privacidade Garantida
                </div>
              </div>
            </div>
            
            <div className="relative w-full lg:w-1/3 aspect-square lg:aspect-video rounded-2xl border border-white/10 bg-black/20 backdrop-blur-3xl overflow-hidden shadow-2xl flex items-center justify-center">
               <div className="text-center">
                 <Bot className="size-16 text-primary mx-auto mb-4 animate-bounce-subtle" />
                 <p className="text-xs font-bold uppercase tracking-[0.3em] text-white/40">Interface Mobile Otimizada</p>
               </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
