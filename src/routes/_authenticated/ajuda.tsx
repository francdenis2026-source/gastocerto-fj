import { createFileRoute } from "@tanstack/react-router";
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
  PlayCircle
} from "lucide-react";
import { useState } from "react";

import { AppShell } from "@/components/app-shell";
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
    title: "Dashboard e Visão Geral",
    icon: LayoutDashboard,
    content: "O Dashboard é o coração do GastoCerto. Aqui você vê seu saldo consolidado, receitas e despesas do mês, e os principais indicadores financeiros. O gráfico de evolução mostra se você está gastando mais do que ganha em tempo real.",
    tips: ["Clique nos cards para ver detalhes", "Acompanhe a barra de progresso do seu orçamento"]
  },
  {
    id: "transactions",
    title: "Lançamentos e Categorias",
    icon: ArrowLeftRight,
    content: "Registre cada centavo que entra e sai. Você pode classificar em categorias e subcategorias para saber exatamente para onde vai seu dinheiro. Use o 'Lançamento Rápido' para agilizar seu dia a dia.",
    tips: ["Anexe comprovantes para não esquecer", "Crie categorias personalizadas no menu Planejamento"]
  },
  {
    id: "consumption",
    title: "Consumo e Utilidades (Gás e Energia)",
    icon: Zap,
    content: "Módulos exclusivos para monitorar o botijão de gás e sua conta de luz. O sistema prevê quando o gás vai acabar e analisa se sua conta de energia está acima da média histórica.",
    tips: ["Registre a leitura do medidor para maior precisão", "Acompanhe o custo por kWh"]
  },
  {
    id: "planning",
    title: "Planejamento e Compromissos",
    icon: PiggyBank,
    content: "Defina orçamentos mensais por categoria. Se você tem dívidas, financiamentos ou parcelamentos, use o módulo de 'Compromissos' para gerenciar o saldo devedor e os vencimentos.",
    tips: ["Ative alertas de vencimento no seu perfil", "Feche o mês para garantir a segurança dos dados"]
  },
  {
    id: "kids",
    title: "Espaço Kids",
    icon: Baby,
    content: "Uma área lúdica para educar financeiramente seus filhos. Eles podem registrar a mesada, criar metas de poupança (como um brinquedo novo) e você acompanha tudo pelo seu painel.",
    tips: ["Defina uma recompensa por metas atingidas", "A mesada pode ser automatizada mensalmente"]
  }
];

function HelpPage() {
  const [activeVideo, setActiveVideo] = useState<string | null>(null);

  return (
    <AppShell>
      <div className="max-w-4xl mx-auto space-y-8 pb-12">
        <header className="text-center space-y-2">
          <div className="inline-flex items-center justify-center size-12 rounded-full bg-primary/10 mb-2">
            <HelpCircle className="size-6 text-primary" />
          </div>
          <h1 className="page-title text-3xl">Central de Ajuda GastoCerto</h1>
          <p className="page-subtitle max-w-lg mx-auto">
            Tudo o que você precisa saber para dominar suas finanças e tirar o máximo proveito da nossa plataforma.
          </p>
        </header>

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
              {HELP_SECTIONS.map((section) => (
                <AccordionItem key={section.id} value={section.id} className="border-border/50">
                  <AccordionTrigger className="text-sm hover:no-underline py-3">
                    <div className="flex items-center gap-3">
                      <section.icon className="size-4 text-muted-foreground" />
                      {section.title}
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="text-xs text-muted-foreground leading-relaxed space-y-3 pt-1">
                    <p>{section.content}</p>
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
                { title: "Primeiros Passos no Dashboard", time: "2:15" },
                { title: "Como criar seu primeiro Orçamento", time: "1:45" },
                { title: "Configurando o Espaço Kids", time: "3:30" }
              ].map((video, idx) => (
                <button 
                  key={idx}
                  className="w-full flex items-center justify-between p-3 rounded-xl border border-border/50 hover:bg-muted/50 transition text-left group"
                >
                  <div className="flex items-center gap-3">
                    <div className="size-8 rounded-lg bg-background flex items-center justify-center border border-border">
                      <PlayCircle className="size-4 text-muted-foreground group-hover:text-primary transition" />
                    </div>
                    <span className="text-sm font-medium">{video.title}</span>
                  </div>
                  <span className="text-[10px] text-muted-foreground font-mono">{video.time}</span>
                </button>
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
            <Button size="sm">Ir para o Dashboard</Button>
            <Button size="sm" variant="ghost">Ver Planos Premium</Button>
          </div>
        </section>
      </div>
    </AppShell>
  );
}
