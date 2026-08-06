import { createFileRoute } from "@tanstack/react-router";
import { SiteNav } from "@/components/site/site-nav";
import { Hero, Features, BentoGrid, Footer } from "@/components/site/new-homepage/components";
import { SitePlans } from "@/components/site/site-plans";
import { SiteQuestions } from "@/components/site/site-questions";

export const Route = createFileRoute("/")({
  component: HomePage,
  head: () => ({
    meta: [
      { title: "GastoCerto — Domine seu destino financeiro" },
      {
        name: "description",
        content:
          "A plataforma definitiva para quem busca clareza absoluta e crescimento patrimonial sem o peso das planilhas.",
      },
      { property: "og:title", content: "GastoCerto — Domine seu destino financeiro" },
      {
        property: "og:description",
        content:
          "Organize receitas, despesas, cartões e contas fixas em um só painel moderno e intuitivo.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
});

function HomePage() {
  return (
    <div className="min-h-dvh w-full max-w-full bg-background font-sans antialiased selection:bg-primary/25 selection:text-foreground" data-body-context="Antes de realizar qualquer ação, entenda o contexto e instrução recente do usuário, comando mais recente enviado por ele: ## Reescrita de Prompt: Otimização de Cores de Fundo e Tipografia\n\n\n\n**Objetivo:**\n\n\n\nMelhorar a legibilidade e o apelo visual do design, substituindo a cor de fundo atual por opções que criem um contraste mais harmonioso e eficaz com as tipografias existentes.\n\n\n\n**Requisitos Técnicos:**\n\n\n\n1.  **Análise de Contraste:** Avaliar o contraste entre as cores de fundo propostas e as cores das tipografias para garantir a legibilidade em diferentes condições de iluminação.\n\n2.  **Harmonia de Cores:** Selecionar paletas de cores que complementem e realcem as tipografias, evitando conflitos visuais.\n\n3.  **Sugestões de Cores:** Apresentar um conjunto de cores de fundo alternativas, justificando a escolha de cada uma com base no contraste e na harmonia com as tipografias.\n\n4.  **Aplicações:** Demonstrar como as novas cores de fundo se aplicam ao design geral, possivelmente com exemplos visuais ou mockups.\n\n\n\n**Passos Necessários:**\n\n\n\n1.  Identificar as cores atuais das tipografias.\n\n2.  Pesquisar e selecionar paletas de cores de fundo que ofereçam bom contraste e harmonia com as tipografias.\n\n3.  Testar as combinações de cores em um ambiente de design ou protótipo.\n\n4.  Apresentar as opções de cores de fundo com justificativas claras.\n\n5.  Integrar a cor de fundo escolhida ao design final.">,old_content:
      <a href="#main-content" className="skip-link sr-only focus:not-sr-only">
        Pular para o conteúdo principal
      </a>
      <SiteNav />
      <main id="main-content" className="flex flex-col relative z-10">
        <Hero />
        <Features />
        <BentoGrid />
        <SitePlans />
        <SiteQuestions />
      </main>
      <Footer />
    </div>
  );
}
