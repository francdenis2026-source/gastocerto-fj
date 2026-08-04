import { createFileRoute } from "@tanstack/react-router";
import { useEffect } from "react";

import heroBg from "@/assets/hero-bg-2027-v2.jpg";
import heroMobileBg from "@/assets/hero-bg-real-mobile.jpg";
import { Benefits } from "@/components/landing/benefits";
import { CompactOverview } from "@/components/landing/compact-overview";
import { CtaBanner } from "@/components/landing/cta-banner";
import { Hero } from "@/components/landing/hero";
import { LandingFooter } from "@/components/landing/landing-footer";
import { LandingHeader } from "@/components/landing/landing-header";
import { PageBackground } from "@/components/landing/page-background";
import { Pricing } from "@/components/landing/pricing";
import { PricingMobile } from "@/components/landing/pricing-mobile";
import { MobileHeroSection } from "@/components/landing/mobile-hero-section";

const title = "GastoCerto — Controle hoje, tranquilidade sempre";
const description =
  "Organize despesas, receitas, cartões, contas fixas, combustível e gás em um só painel. Metas, relatórios, mesada do Espaço Kids e consultor financeiro com IA. Comece grátis.";

const siteUrl = "https://gastocerto-fj.lovable.app";
const ogImage = `${siteUrl}/og-gastocerto-v4.jpg`;

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:type", content: "website" },
      { property: "og:url", content: `${siteUrl}/` },
      { property: "og:image", content: ogImage },
      { property: "og:image:width", content: "1200" },
      { property: "og:image:height", content: "630" },
      { property: "og:image:alt", content: "Painel do GastoCerto com gráfico de gastos e saldo do mês" },
      { property: "og:locale", content: "pt_BR" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: title },
      { name: "twitter:description", content: description },
      { name: "twitter:image", content: ogImage },
      { name: "twitter:image:alt", content: "Painel do GastoCerto com gráfico de gastos e saldo do mês" },
    ],
    links: [
      { rel: "canonical", href: `${siteUrl}/` },
      { rel: "preload", as: "image", href: heroBg, fetchPriority: "high", media: "(min-width: 640px)" },
      { rel: "preload", as: "image", href: heroMobileBg, fetchPriority: "high", media: "(max-width: 639px)" },
    ],
  }),


  component: LandingPage,
});

function LandingPage() {
  useEffect(() => {
    const prevent = (event: Event) => event.preventDefault();
    const preventCopyShortcut = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && ["c", "x", "s", "u"].includes(event.key.toLowerCase())) {
        event.preventDefault();
      }
    };

    document.addEventListener("copy", prevent, true);
    document.addEventListener("cut", prevent, true);
    document.addEventListener("contextmenu", prevent, true);
    document.addEventListener("dragstart", prevent, true);
    document.addEventListener("keydown", preventCopyShortcut, true);

    return () => {
      document.removeEventListener("copy", prevent, true);
      document.removeEventListener("cut", prevent, true);
      document.removeEventListener("contextmenu", prevent, true);
      document.removeEventListener("dragstart", prevent, true);
      document.removeEventListener("keydown", preventCopyShortcut, true);
    };
  }, []);

  return (
    <div className="relative flex min-h-dvh select-none flex-col bg-background [&_img]:pointer-events-none [&_img]:select-none">
      <div className="hidden">
        {/* 
          ## Análise e Refinamento de Design da Homepage

          **Objetivo:** Otimizar o design da homepage para torná-la mais compacta, profissional e sofisticada, com foco em melhorias visuais e de contraste.

          **Pontos a serem analisados e aprimorados:**

          1.  **Layout Geral e Pontos Visuais:**
              *   Identificar elementos visuais que podem ser simplificados ou reorganizados para maior compacidade e clareza.
              *   Avaliar a hierarquia visual e a distribuição de elementos para garantir um fluxo de usuário intuitivo.
              *   Propor mudanças que elevem o profissionalismo geral da página.

          2.  **Efeito Blur:**
              *   Analisar a aplicação atual do efeito blur.
              *   Ajustar o blur para aumentar o contraste entre os elementos, conferindo maior profundidade e sofisticação ao design.

          3.  **Modos Claro e Escuro:**
              *   Verificar a consistência e a adequação dos contrastes em ambos os modos (claro e escuro).
              *   Garantir que a legibilidade e a experiência do usuário sejam ótimas em todas as condições de iluminação.

          **Requisito Adicional:**
          *   Implementar mudanças radicais, se necessário, para atingir um alto nível de profissionalismo e impacto visual.

          **Entregáveis:**
          *   Sugestões detalhadas de alterações de design.
          *   Justificativas para as melhorias propostas, com foco em usabilidade, estética e profissionalismo.
        */}
      </div>

      <PageBackground />
      <a
        href="#conteudo"
        className="sr-only z-[60] focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:inline-flex focus:min-h-11 focus:items-center focus:rounded-md focus:bg-primary focus:px-4 focus:text-sm focus:font-semibold focus:text-primary-foreground focus:shadow-lifted focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background"
      >
        Pular para o conteúdo
      </a>
      <LandingHeader hideActions />
      <main id="conteudo" tabIndex={-1} className="flex-1 outline-none">
        <Hero />
        <div className="hidden sm:block">
          <Benefits />
          <CompactOverview />
        </div>
        <div className="hidden md:block">
          <Pricing />
        </div>
        <PricingMobile />
        <MobileHeroSection />
        <section className="px-4 pb-8 md:hidden" aria-label="Segurança e privacidade">
          <ul className="grid grid-cols-3 gap-2 rounded-2xl border border-border bg-card/40 p-3 text-center backdrop-blur-md shadow-soft">
            <li className="min-w-0">
              <p className="text-[13px] font-extrabold">14 dias</p>
              <p className="text-[10px] font-medium text-muted-foreground">teste completo</p>
            </li>
            <li className="min-w-0 border-x border-border/60">
              <p className="text-[13px] font-extrabold">Dados seus</p>
              <p className="text-[10px] font-medium text-muted-foreground">exporte ou exclua</p>
            </li>
            <li className="min-w-0">
              <p className="text-[13px] font-extrabold">Sem cartão</p>
              <p className="text-[10px] font-medium text-muted-foreground">no plano grátis</p>
            </li>
          </ul>
        </section>
        <div className="hidden sm:block">
          <CtaBanner />
        </div>
      </main>
      <LandingFooter />
    </div>
  );
}

