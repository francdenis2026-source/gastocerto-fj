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
  ChevronRight
} from "lucide-react";
import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/logo";

const resources = [
  {
    title: "Gestão de Lançamentos",
    description: "Controle total de suas receitas e despesas com categorias inteligentes e anexos.",
    icon: BarChart3,
    color: "text-blue-500",
  },
  {
    title: "Módulo Veicular",
    description: "Acompanhe o consumo de combustível, manutenção e custo por quilômetro.",
    icon: Fuel,
    color: "text-orange-500",
  },
  {
    title: "Controle de Gás",
    description: "Previsão de término e histórico de consumo de botijões de gás.",
    icon: Flame,
    color: "text-red-500",
  },
  {
    title: "Cartões de Crédito",
    description: "Visualize faturas, limites e parcelamentos em um só lugar.",
    icon: CreditCard,
    color: "text-purple-500",
  },
  {
    title: "Espaço Kids",
    description: "Educação financeira para crianças com interface lúdica e segura.",
    icon: Baby,
    color: "text-pink-500",
  },
  {
    title: "PIX para Filhos",
    description: "Envio de mesadas e acompanhamento de gastos em tempo real.",
    icon: Send,
    color: "text-green-500",
  },
  {
    title: "Consultor de IA",
    description: "Insights personalizados e planos de economia gerados por inteligência artificial.",
    icon: Sparkles,
    color: "text-brand",
  },
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
          <Button variant="ghost" size="sm" asChild>
            <Link to="/" className="flex items-center gap-2">
              <ArrowLeft className="size-4" />
              Voltar
            </Link>
          </Button>
        </div>
      </header>

      <main className="pb-20">
        <section className="bg-secondary/20 py-16 sm:py-24">
          <div className="section-shell text-center">
            <h1 className="font-display text-3xl font-extrabold tracking-tight sm:text-5xl">
              Recursos do <span className="text-brand">GastoCerto</span>
            </h1>
            <p className="mx-auto mt-6 max-w-[65ch] text-lg text-muted-foreground sm:text-xl">
              Explore todas as ferramentas desenvolvidas para transformar sua relação com o dinheiro.
            </p>
          </div>
        </section>

        <section className="section-shell mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {resources.map((res) => (
            <div 
              key={res.title}
              className="group rounded-2xl border border-border bg-card p-6 transition-all hover:border-brand/40 hover:shadow-lg"
            >
              <div className={`mb-4 inline-flex size-12 items-center justify-center rounded-xl bg-secondary ${res.color}`}>
                <res.icon className="size-6" />
              </div>
              <h3 className="text-xl font-bold">{res.title}</h3>
              <p className="mt-2 text-muted-foreground leading-relaxed">
                {res.description}
              </p>
              <div className="mt-4 flex items-center text-sm font-semibold text-brand opacity-0 transition-opacity group-hover:opacity-100">
                Saiba mais <ChevronRight className="ml-1 size-4" />
              </div>
            </div>
          ))}
        </section>

        <section className="section-shell mt-24 rounded-3xl bg-brand p-8 text-center text-white sm:p-12">
          <h2 className="text-2xl font-bold sm:text-3xl">Pronto para assumir o controle?</h2>
          <p className="mx-auto mt-4 max-w-[50ch] text-white/90">
            Junte-se a milhares de pessoas que já organizam suas finanças com o GastoCerto.
          </p>
          <Button 
            className="mt-8 bg-white font-bold text-brand hover:bg-white/90" 
            size="lg"
            asChild
          >
            <Link to="/auth" search={{ mode: "signup" }}>
              Criar minha conta grátis
            </Link>
          </Button>
        </section>
      </main>

      <footer className="border-t border-border bg-secondary/30 py-12">
        <div className="section-shell flex flex-col items-center justify-between gap-6 sm:flex-row">
          <Logo />
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} GastoCerto. Todos os direitos reservados.
          </p>
        </div>
      </footer>
    </div>
  );
}
