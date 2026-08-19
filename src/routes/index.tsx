import { createFileRoute } from "@tanstack/react-router";
import { SiteNav } from "@/components/site/site-nav";
import { Hero, Features, Footer } from "@/components/site/new-homepage/components";
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
          "Organize receitas, despesas, cartões, metas e contas fixas em um só lugar, com clareza para tomar decisões melhores sobre o seu dinheiro.",
      },
      { property: "og:title", content: "GastoCerto — Domine seu destino financeiro" },
      {
        property: "og:description",
        content:
          "Controle sua vida financeira com uma experiência simples, segura e feita para funcionar bem no celular e no computador.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
});

function HomePage() {
  return (
    <div className="min-h-dvh w-full max-w-full overflow-x-clip bg-background font-sans antialiased selection:bg-primary/25 selection:text-foreground">
      <a href="#main-content" className="skip-link sr-only focus:not-sr-only">
        Pular para o conteúdo principal
      </a>
      <SiteNav />
      <main id="main-content" className="relative z-10 flex flex-col" tabIndex={-1}>
        <Hero />
        <Features />
        <SitePlans />
        <SiteQuestions />
      </main>
      <Footer />
    </div>
  );
}
