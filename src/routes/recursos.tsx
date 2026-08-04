import { createFileRoute } from "@tanstack/react-router";
import { 
  BarChart3, 
  Fuel, 
  Flame, 
  CreditCard, 
  Baby, 
  Send, 
  Sparkles, 
  ArrowLeft,
  ChevronRight,
  ShieldCheck,
  Zap,
  Target,
  Smartphone,
  Globe,
  Wallet
} from "lucide-react";
import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/logo";
import { LandingFooter } from "@/components/landing/landing-footer";

const resourceSections = [
  {
    category: "Controle & Gestão",
    items: [
      {
        title: "Lançamentos Inteligentes",
        description: "Registre receitas e despesas com categorias automáticas, anexos de comprovantes e parcelamentos complexos. Tenha uma visão clara de para onde seu dinheiro está indo.",
        icon: BarChart3,
        color: "text-blue-500",
        features: ["Categorias personalizáveis", "Anexo de fotos/PDF", "Filtros avançados"]
      },
      {
        title: "Cartões de Crédito",
        description: "Centralize todas as suas faturas. Monitore limites disponíveis, datas de fechamento e vencimento, e saiba exatamente quanto cada cartão compromete do seu orçamento.",
        icon: CreditCard,
        color: "text-purple-500",
        features: ["Múltiplos cartões", "Aviso de fechamento", "Histórico de faturas"]
      },
      {
        title: "Metas e Objetivos",
        description: "Defina metas de economia para seus sonhos. Acompanhe o progresso em tempo real e receba dicas de como acelerar a conquista dos seus objetivos.",
        icon: Target,
        color: "text-brand",
        features: ["Barra de progresso", "Previsão de conclusão", "Metas de curto/longo prazo"]
      }
    ]
  },
  {
    category: "Módulos Especializados",
    items: [
      {
        title: "Gestão Veicular",
        description: "Controle completo da manutenção e consumo de seus veículos. Calcule o custo por quilômetro e receba alertas de revisões e trocas de óleo.",
        icon: Fuel,
        color: "text-orange-500",
        features: ["Média de consumo", "Histórico de manutenção", "Alertas de documentos"]
      },
      {
        title: "Consumo de Gás",
        description: "Exclusivo sistema de previsão de duração do botijão de gás. Saiba exatamente quando precisará trocar e evite imprevistos na hora de cozinhar.",
        icon: Flame,
        color: "text-red-500",
        features: ["Previsão inteligente", "Histórico de trocas", "Custo médio mensal"]
      },
      {
        title: "Educação Financeira Kids",
        description: "Um espaço seguro e lúdico para seus filhos aprenderem a lidar com dinheiro. Com PIN de segurança e interface simplificada para as crianças.",
        icon: Baby,
        color: "text-pink-500",
        features: ["Mesada automática", "Metas infantis", "Login com PIN"]
      }
    ]
  },
  {
    category: "Tecnologia & Segurança",
    items: [
      {
        title: "Consultor de IA",
        description: "Nossa inteligência artificial analisa seus hábitos e sugere planos personalizados para sair de dívidas ou investir melhor seu excedente.",
        icon: Sparkles,
        color: "text-brand",
        features: ["Análise mensal", "Dicas antifraude", "Plano de economia"]
      },
      {
        title: "Segurança de Dados",
        description: "Seus dados são protegidos com criptografia de ponta a ponta e camadas de segurança de nível bancário. Privacidade total para sua família.",
        icon: ShieldCheck,
        color: "text-emerald-500",
        features: ["Criptografia AES-256", "Backup automático", "Conformidade LGPD"]
      },
      {
        title: "Multiplataforma",
        description: "Acesse suas finanças de qualquer lugar. Web, tablet ou smartphone, com sincronização instantânea em todos os seus dispositivos.",
        icon: Smartphone,
        color: "text-slate-500",
        features: ["Web responsiva", "Modo offline parcial", "Push notifications"]
      }
    ]
  }
];

export const Route = createFileRoute("/recursos")({
  component: RecursosPage,
});

function RecursosPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-md">
        <div className="section-shell flex h-16 items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <Logo />
          </Link>
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" asChild className="hidden sm:flex">
              <Link to="/" className="flex items-center gap-2">
                <ArrowLeft className="size-4" />
                Voltar
              </Link>
            </Button>
            <Button size="sm" asChild>
              <Link to="/auth">Entrar</Link>
            </Button>
          </div>
        </div>
      </header>

      <main>
        <section className="relative overflow-hidden bg-gradient-to-b from-secondary/30 to-background py-20 sm:py-32">
          <div className="absolute inset-0 -z-10 bg-[radial-gradient(45%_45%_at_50%_50%,var(--brand-muted)_0%,transparent_100%)] opacity-20" />
          <div className="section-shell text-center">
            <h1 className="font-display text-4xl font-extrabold tracking-tight sm:text-6xl">
              Recursos <span className="text-brand">Profissionais</span>
            </h1>
            <p className="mx-auto mt-6 max-w-[65ch] text-lg text-muted-foreground sm:text-xl">
              Uma suíte completa de ferramentas financeiras projetadas para simplificar sua vida e potencializar seu patrimônio.
            </p>
          </div>
        </section>

        {resourceSections.map((section, idx) => (
          <section key={section.category} className={`py-16 ${idx % 2 === 1 ? 'bg-secondary/10' : ''}`}>
            <div className="section-shell">
              <h2 className="text-sm font-bold uppercase tracking-[0.2em] text-brand/80">{section.category}</h2>
              <div className="mt-10 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                {section.items.map((res) => (
                  <div 
                    key={res.title}
                    className="flex flex-col rounded-3xl border border-border bg-card p-8 transition-all hover:border-brand/40 hover:shadow-xl"
                  >
                    <div className={`mb-6 inline-flex size-14 items-center justify-center rounded-2xl bg-secondary ${res.color}`}>
                      <res.icon className="size-7" />
                    </div>
                    <h3 className="text-2xl font-bold tracking-tight">{res.title}</h3>
                    <p className="mt-4 text-muted-foreground leading-relaxed flex-grow">
                      {res.description}
                    </p>
                    <ul className="mt-6 space-y-2 border-t border-border pt-6">
                      {res.features.map(f => (
                        <li key={f} className="flex items-center gap-2 text-sm text-foreground/80">
                          <Zap className="size-3 text-brand" />
                          {f}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          </section>
        ))}

        <section className="section-shell my-24 overflow-hidden rounded-[2.5rem] bg-[#001640] p-8 text-center text-white sm:p-20 relative">
          <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 size-96 rounded-full bg-brand/20 blur-[100px]" />
          <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/2 size-96 rounded-full bg-emerald-500/10 blur-[100px]" />
          
          <div className="relative z-10">
            <h2 className="text-3xl font-bold sm:text-5xl tracking-tight">Evolua sua vida financeira hoje</h2>
            <p className="mx-auto mt-6 max-w-[55ch] text-lg text-white/70">
              Não perca mais tempo com planilhas complexas ou anotações perdidas. O GastoCerto é a solução inteligente que você procurava.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button 
                className="h-14 bg-brand px-10 text-lg font-bold text-white hover:bg-brand/90 w-full sm:w-auto rounded-2xl" 
                asChild
              >
                <Link to="/auth" search={{ mode: "signup" }}>
                  Começar Grátis
                </Link>
              </Button>
              <Button 
                variant="outline" 
                className="h-14 border-white/20 bg-white/5 px-10 text-lg font-bold text-white hover:bg-white/10 w-full sm:w-auto rounded-2xl"
                asChild
              >
                <Link to="/#planos">Ver Planos</Link>
              </Button>
            </div>
          </div>
        </section>
      </main>

      <LandingFooter />
    </div>
  );
}

