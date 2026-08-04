
import { createFileRoute } from "@tanstack/react-router";

import { Benefits } from "@/components/landing/benefits";
import { CompactOverview } from "@/components/landing/compact-overview";
import { CtaBanner } from "@/components/landing/cta-banner";
import { Hero } from "@/components/landing/hero";
import { LandingFooter } from "@/components/landing/landing-footer";
import { LandingHeader } from "@/components/landing/landing-header";
import { PageBackground } from "@/components/landing/page-background";
import { Pricing } from "@/components/landing/pricing";

const title = "GameCarto — O Futuro da Gestão Financeira com IA";
const description =
  "A plataforma definitiva para maestria financeira. Inteligência Artificial, dashboard premium e ferramentas avançadas para controle total de gastos e investimentos.";

const siteUrl = "https://gamecarto.lovable.app";
const ogImage = `${siteUrl}/og-gamecarto.jpg`;

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
      { property: "og:image:alt", content: "GameCarto Dashboard Preview" },
      { property: "og:locale", content: "pt_BR" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: title },
      { name: "twitter:description", content: description },
      { name: "twitter:image", content: ogImage },
      { name: "twitter:image:alt", content: "GameCarto Dashboard Preview" },
    ],
    links: [
      { rel: "canonical", href: `${siteUrl}/` },
    ],
  }),

  component: LandingPage,
});

function LandingPage() {
  return (
    <div className="relative flex min-h-dvh flex-col bg-background overflow-x-hidden">
      <PageBackground />
      <LandingHeader />
      <main id="conteudo" tabIndex={-1} className="flex-1 outline-none pt-20">
        <Hero />
        <Benefits />
        <CompactOverview />
        <Pricing />
        <CtaBanner />
      </main>
      <LandingFooter />
    </div>
  );
}
