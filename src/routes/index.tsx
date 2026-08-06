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
        comando mais recente enviado por ele: REMOVA DA HOMEPAGE A BARRA DE ROLAGEM VERTICAL,DEIXE A ROLAGEM PELO MOUSE; 

        Implementar suporte a prefers-reduced-motion para ajustar transições e microinterações, mantendo a sensação de qualidade para quem prefere menos animação. 

        Conferir a consistência do Design System e corrigir quaisquer divergências restantes de tipografia, espaçamento e estilos entre homepage e demais páginas. 

        Otimizar o carregamento de imagens e fontes com lazy loading, compressão e preload/prefetch para reduzir o tempo de renderização sem perder qualidade visual. Auditar a navegação por teclado e garantir que todo elemento focável tenha ordem lógica e estados de foco visíveis em toda a aplicação.
      */}
    </div>
  );
}
