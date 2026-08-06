import { createFileRoute } from "@tanstack/react-router";
import { SiteNav } from "@/components/site/site-nav";
import { SiteHero } from "@/components/site/site-hero";
import { SiteCapabilities } from "@/components/site/site-capabilities";
import { SiteMethod } from "@/components/site/site-method";
import { SiteAssurance } from "@/components/site/site-assurance";
import { SitePlans } from "@/components/site/site-plans";
import { SiteQuestions } from "@/components/site/site-questions";
import { SiteClosing } from "@/components/site/site-closing";
import { SiteFooter } from "@/components/site/site-footer";

export const Route = createFileRoute("/")({
  component: HomePage,
  head: () => ({
    meta: [
      { title: "GastoCerto — Cada real no lugar certo, todo mês" },
      {
        name: "description",
        content:
          "Painel de finanças pessoais com contas, cartões, combustível, gás, metas e balanço anual. Clareza total sobre o seu dinheiro, sem planilhas.",
      },
      { property: "og:title", content: "GastoCerto — Cada real no lugar certo" },
      {
        property: "og:description",
        content:
          "Organize receitas, despesas, cartões e contas fixas em um só painel. Projeções confiáveis e histórico auditável.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
});

function HomePage() {
  return (
    <div className="min-h-dvh w-full max-w-full overflow-x-hidden bg-navy-800 font-sans antialiased selection:bg-primary/25 selection:text-bone-100">
      <SiteNav />
      <main className="flex flex-col">
        <SiteHero />
        <SiteCapabilities />
        <SiteMethod />
        <SiteAssurance />
        <SitePlans />
        <SiteQuestions />
        <SiteClosing />
      </main>
      <SiteFooter />
      {/* 
        Antes de realizar qualquer ação, entenda o contexto e instrução recente do usuário, 
        comando mais recente enviado por ele: Otimize a performance e o carregamento da landing (imagens, fontes e scripts) para reduzir o tempo de renderização sem perder a qualidade visual. 

        Atualize a interface para cumprir acessibilidade AA, garantindo contraste, estados de foco visíveis e navegação por teclado em toda a aplicação. 

        Implemente e revise microinterações (hover, focus e transições) em todos os componentes para ficarem consistentes com 180–260ms e com o novo visual. 

        Ajuste o grid, margens e tamanhos tipográficos para garantir que o layout fique idêntico e sem quebras no Desktop, Tablet, Mobile e PWA. 

        Realize uma auditoria de consistência do Design System e corrija quaisquer diferenças de tipografia, espaçamento e estilos na homepage inteira e no restante do sistema.
      */}
    </div>
  );
}
