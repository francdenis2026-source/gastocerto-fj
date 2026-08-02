import { createFileRoute, Link } from "@tanstack/react-router";
import { 
  HelpCircle, 
  BookOpen, 
  LayoutDashboard, 
  ArrowLeftRight, 
  Car, 
  Zap, 
  PiggyBank, 
  Baby,
  ChevronRight,
  PlayCircle,
  Lightbulb,
  Search,
  CheckCircle2
} from "lucide-react";
import { useState, useMemo } from "react";
import { cn } from "@/lib/utils";

import { AppShell } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export const Route = createFileRoute("/_authenticated/ajuda")({
  head: () => ({
    meta: [
      { title: "Ajuda e Tutoriais — GastoCerto" },
      { name: "description", content: "Aprenda a usar todas as funcionalidades do GastoCerto com nosso guia ilustrado." },
    ],
  }),
  component: HelpPage,
});

const HELP_SECTIONS = [
  {
    id: "dashboard",
    title: "Dashboard e Inteligência",
    icon: LayoutDashboard,
    content: "O Dashboard é o coração do GastoCerto. Aqui você vê seu saldo consolidado, receitas e despesas. O gráfico de evolução mostra sua saúde financeira em tempo real. Use o Mentor de IA para dicas personalizadas baseadas no seu perfil de gastos.",
    steps: [
      "Monitore o saldo total e variação mensal",
      "Analise os gráficos de categorias para ver onde economizar",
      "Consulte a IA para previsões e ajustes automáticos"
    ],
    tips: ["Clique nos cards para ver detalhes", "Acompanhe a barra de progresso do seu orçamento"]
  },
  {
    id: "transactions",
    title: "Lançamentos e Categorias",
    icon: ArrowLeftRight,
    content: "Registre cada centavo. Classifique em categorias e subcategorias para um controle total. Use o Lançamento Rápido ou anexe comprovantes para manter tudo organizado e fácil de encontrar depois.",
    steps: [
      "Clique em '+ Lançar' no topo da tela",
      "Preencha descrição, valor e escolha a categoria",
      "Se for recorrente, ative o interruptor de repetição"
    ],
    tips: ["Anexe comprovantes para não esquecer", "Crie categorias personalizadas no menu Estratégia"]
  },
  {
    id: "commitments",
    title: "Dívidas e Compromissos",
    icon: PiggyBank,
    content: "Gerencie financiamentos, fiados, empréstimos e compras parceladas. O sistema calcula o saldo devedor restante e alerta sobre vencimentos próximos para você nunca mais pagar juros.",
    steps: [
      "Cadastre o valor total da dívida e número de parcelas",
      "Ao pagar uma parcela, registre-a para abater do saldo",
      "Acompanhe o 'Impacto Mensal' para saber quanto da sua renda está comprometida"
    ],
    tips: ["Pague a dívida registrando um lançamento vinculado", "Dívidas em atraso aparecem em vermelho no histórico"]
  },
  {
    id: "consumption",
    title: "Consumo (Gás e Energia)",
    icon: Zap,
    content: "Módulos exclusivos para monitorar utilidades. O sistema prevê quando o gás vai acabar com base no seu uso histórico e analisa se sua conta de energia está acima da média, emitindo alertas de atenção.",
    steps: [
      "Registre a troca do botijão para iniciar a contagem",
      "Insira o valor e consumo (kWh) da sua conta de luz mensalmente",
      "Observe o status (Ok/Atenção) no widget lateral"
    ],
    tips: ["Registre a leitura do medidor para maior precisão", "Acompanhe o custo por kWh para ver reajustes tarifários"]
  },
  {
    id: "kids",
    title: "Educação Financeira (Kids)",
    icon: Baby,
    content: "O Espaço Kids é uma área lúdica integrada à sua conta, projetada para ensinar finanças na prática. Não é necessário criar uma conta separada para a criança; ela utiliza o seu acesso de forma restrita e segura por meio de um PIN de 4 dígitos. \n\nComo funciona: \n1. Você cadastra o perfil da criança em 'Meus Cadastros' e define um PIN.\n2. No menu 'Espaço Kids', a criança seleciona o nome dela e digita o PIN para entrar no 'Modo Criança'.\n3. Nesse modo, a interface muda para um visual lúdico onde ela só vê o seu próprio 'Saldo Mágico' e metas, sem acesso aos seus gastos pessoais.",
    steps: [
      "Acesse 'Meus Cadastros' e adicione o perfil da criança com um PIN de 4 dígitos",
      "No 'Espaço Kids', peça para a criança selecionar o perfil dela",
      "Ela deve digitar o PIN para destravar o Modo Criança exclusivo",
      "A criança registra ganhos (como mesada) e gastos de forma simples",
      "Você acompanha e aprova as 'Metas Mágicas' pelo seu painel principal"
    ],
    tips: ["A criança não precisa de e-mail ou senha, apenas do PIN", "O Modo Criança esconde todos os dados financeiros do responsável", "Você define o limite de gastos mensal para evitar surpresas"]
  }
];

function HelpPage() {
  const [activeVideo, setActiveVideo] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  const filteredSections = useMemo(() => {
    if (!search.trim()) return HELP_SECTIONS;
    const term = search.toLowerCase();
    return HELP_SECTIONS.filter(s => 
      s.title.toLowerCase().includes(term) || 
      s.content.toLowerCase().includes(term) ||
      s.steps.some(step => step.toLowerCase().includes(term))
    );
  }, [search]);

  return (
    <AppShell>
      <div className="max-w-4xl mx-auto space-y-8 pb-12">
        <header className="text-center space-y-2">
          <div className="inline-flex items-center justify-center size-12 rounded-full bg-primary/10 mb-2">
            <HelpCircle className="size-6 text-primary" />
          </div>
          <h1 className="page-title text-3xl">Central de Ajuda GastoCerto</h1>
          <p className="page-subtitle max-w-lg mx-auto">
            Tudo o que você precisa saber para dominar suas finanças com passos simples, ilustrações e dicas profissionais.
          </p>
        </header>

        <div className="relative max-w-md mx-auto">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input 
            placeholder="O que você precisa fazer? (ex: pagar dívidas)" 
            className="pl-10 h-11 rounded-xl"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <section className="grid gap-6 sm:grid-cols-2">
          <article className="rounded-2xl border border-border bg-card p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="size-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
                <BookOpen className="size-5 text-blue-600" />
              </div>
              <h2 className="text-lg font-semibold">Guias de Uso</h2>
            </div>
            <p className="text-sm text-muted-foreground">
              Explicações passo a passo das ferramentas mais importantes do sistema.
            </p>
            <Accordion type="single" collapsible className="w-full">
              {filteredSections.map((section) => (
                <AccordionItem key={section.id} value={section.id} className="border-border/50">
                  <AccordionTrigger className="text-sm hover:no-underline py-3">
                    <div className="flex items-center gap-3">
                      <section.icon className="size-4 text-muted-foreground" />
                      {section.title}
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="text-xs text-muted-foreground leading-relaxed space-y-3 pt-1">
                    <p>{section.content}</p>
                    {section.steps && (
                      <div className="space-y-2 py-1">
                        <p className="font-semibold text-foreground text-[11px] uppercase tracking-wider">Como fazer:</p>
                        <ol className="list-decimal list-inside space-y-1">
                          {section.steps.map((step, idx) => (
                            <li key={idx} className="pl-1">{step}</li>
                          ))}
                        </ol>
                      </div>
                    )}
                    <div className="bg-muted/50 rounded-lg p-3 space-y-2">
                      <p className="font-semibold text-foreground flex items-center gap-1.5">
                        <Lightbulb className="size-3 text-yellow-500" />
                        Dicas Pro
                      </p>
                      <ul className="list-disc list-inside space-y-1">
                        {section.tips.map((tip, idx) => (
                          <li key={idx}>{tip}</li>
                        ))}
                      </ul>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </article>

          <article className="rounded-2xl border border-border bg-card p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="size-10 rounded-xl bg-purple-500/10 flex items-center justify-center">
                <PlayCircle className="size-5 text-purple-600" />
              </div>
              <h2 className="text-lg font-semibold">Tutoriais em Vídeo</h2>
            </div>
            <p className="text-sm text-muted-foreground">
              Aprenda visualmente com nossos tutoriais rápidos.
            </p>
            
            <div className="space-y-3">
              {[
                { title: "Primeiros Passos no Dashboard", time: "2:15", url: "https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=1" },
                { title: "Como criar seu primeiro Orçamento", time: "1:45", url: "https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=1" },
                { title: "Configurando o Espaço Kids", time: "3:30", url: "https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=1" }
              ].map((video, idx) => (
                <div key={idx} className="space-y-2">
                  <button 
                    onClick={() => setActiveVideo(activeVideo === video.title ? null : video.title)}
                    className="w-full flex items-center justify-between p-3 rounded-xl border border-border/50 hover:bg-muted/50 transition text-left group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="size-8 rounded-lg bg-background flex items-center justify-center border border-border">
                        <PlayCircle className={cn("size-4 text-muted-foreground group-hover:text-primary transition", activeVideo === video.title && "text-primary")} />
                      </div>
                      <span className="text-sm font-medium">{video.title}</span>
                    </div>
                    <span className="text-[10px] text-muted-foreground font-mono">{video.time}</span>
                  </button>
                  {activeVideo === video.title && (
                    <div className="aspect-video rounded-xl overflow-hidden border border-border bg-black">
                      <iframe
                        src={video.url}
                        className="w-full h-full"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="p-4 rounded-xl bg-primary/5 border border-primary/20 mt-4">
              <h3 className="text-sm font-semibold flex items-center gap-2">
                Suporte Personalizado
              </h3>
              <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
                Ainda tem dúvidas? Fale diretamente com o desenvolvedor Franc Denis pelo suporte no perfil ou envie um e-mail para suporte@gastocerto.app
              </p>
              <Button size="sm" className="w-full mt-4 h-8 text-xs" variant="outline">
                Falar com suporte
              </Button>
            </div>
          </article>
        </section>

        <section className="bg-primary/10 rounded-3xl p-8 text-center space-y-4 border border-primary/20">
          <h2 className="text-xl font-bold">Domine seu dinheiro hoje</h2>
          <p className="text-sm text-muted-foreground max-w-lg mx-auto">
            Acompanhar seus gastos não precisa ser uma tarefa difícil. Com o GastoCerto, você tem a clareza necessária para tomar decisões melhores e alcançar sua tranquilidade financeira.
          </p>
          <div className="flex justify-center gap-3">
            <Link to="/painel">
              <Button size="sm">Ir para o Dashboard</Button>
            </Link>
            <Link to="/perfil">
              <Button size="sm" variant="ghost">Ver Planos Premium</Button>
            </Link>
          </div>
        </section>
      </div>
    </AppShell>
  );
}
