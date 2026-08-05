import { createFileRoute } from "@tanstack/react-router";
import { useEffect } from "react";

import heroBg from "@/assets/hero-bg-2027.jpg";
import heroMobileBg from "@/assets/hero-bg-2027.jpg";
import { Benefits } from "@/components/landing/benefits";
import { CompactOverview } from "@/components/landing/compact-overview";
import { ContactSection } from "@/components/landing/contact-section";

import { Hero } from "@/components/landing/hero";
import { LandingFooter } from "@/components/landing/landing-footer";
import { LandingHeader } from "@/components/landing/landing-header";
import { PageBackground } from "@/components/landing/page-background";
import { Pricing } from "@/components/landing/pricing";
import { PricingMobile } from "@/components/landing/pricing-mobile";

const title = "GastoCerto — Sistema de Gestão Financeira Inteligente";
const description =
  "GastoCerto é a solução definitiva para gestão de finanças pessoais. Controle gastos, cartões, metas e combustível com IA. O melhor app de finanças para famílias e profissionais.";

const siteUrl = "https://gastocerto-fj.lovable.app";
const ogImage = `${siteUrl}/og-gastocerto-v4.jpg`;

export const Route = createFileRoute("/")({
  head: () => {
    const jsonLd = {
      "@context": "https://schema.org",
      "@type": "SoftwareApplication",
      "name": "GastoCerto",
      "operatingSystem": "Web",
      "applicationCategory": "FinanceApplication",
      "offers": {
        "@type": "Offer",
        "price": "0",
        "priceCurrency": "BRL"
      },
      "description": description,
      "aggregateRating": {
        "@type": "AggregateRating",
        "ratingValue": "4.9",
        "ratingCount": "1250"
      }
    };

    return {
      meta: [
        { title },
        { name: "description", content: description },
        { name: "keywords", content: "gestão financeira, controle de gastos, finanças pessoais, economia doméstica, aplicativo de finanças, consultor financeiro IA, espaço kids financeiro" },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:type", content: "website" },
        { property: "og:url", content: `${siteUrl}/` },
        { property: "og:image", content: ogImage },
        { property: "og:image:width", content: "1200" },
        { property: "og:image:height", content: "630" },
        { property: "og:image:alt", content: "Interface do sistema GastoCerto exibindo painel de controle financeiro" },
        { property: "og:locale", content: "pt_BR" },
        { name: "twitter:card", content: "summary_large_image" },
        { name: "twitter:title", content: title },
        { name: "twitter:description", content: description },
        { name: "twitter:image", content: ogImage },
        { name: "twitter:image:alt", content: "Interface do sistema GastoCerto exibindo painel de controle financeiro" },
        { name: "robots", content: "index, follow" },
      ],
      links: [
        { rel: "canonical", href: `${siteUrl}/` },
        { rel: "preload", as: "image", href: heroBg, fetchPriority: "high", media: "(min-width: 640px)" },
        { rel: "preload", as: "image", href: heroBg, fetchPriority: "high" },
      ],
      script: [
        {
          type: "application/ld+json",
          children: JSON.stringify(jsonLd),
        },
      ],
    };
  },
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
    <div className="relative flex min-h-dvh select-none flex-col overflow-x-hidden bg-transparent [&_img]:pointer-events-none [&_img]:select-none">
      <PageBackground />
      <LandingHeader />

      <main id="conteudo" tabIndex={-1} className="relative flex flex-col outline-none">
        <Hero />
        <CompactOverview />
        <Pricing />
        <ContactSection />
      </main>

      <LandingFooter />
    </div>
  );
}
