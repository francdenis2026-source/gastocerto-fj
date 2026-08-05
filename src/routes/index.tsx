import { createFileRoute } from "@tanstack/react-router";
import { LandingHeader } from "@/components/landing/landing-header";
import { Hero } from "@/components/landing/hero";
import { CompactOverview } from "@/components/landing/compact-overview";
import { Benefits } from "@/components/landing/benefits";
import { HowItWorks } from "@/components/landing/how-it-works";
import { Pricing } from "@/components/landing/pricing";
import { Faq } from "@/components/landing/faq";
import { LandingFooter } from "@/components/landing/landing-footer";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/")({
  component: HomePage,
  head: () => ({
    title: "GastoCerto — Controle financeiro com experiência de app",
    meta: [
      {
        name: "description",
        content: "Organize suas finanças com uma experiência fluida de aplicativo: dashboard inteligente, metas, Espaço Kids e insights com IA no GastoCerto.",
      },
      { property: "og:title", content: "GastoCerto | Controle financeiro premium" },
      {
        property: "og:description",
        content: "Plataforma de gestão financeira pessoal com interface refinada, microinterações e segurança de nível bancário.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
});

function HomePage() {
  return (
    <div className={cn(
      "min-h-dvh w-full max-w-full overflow-x-hidden bg-[#020617] font-sans",
      "selection:bg-primary/20 selection:text-primary antialiased scroll-smooth"
    )}>
      <LandingHeader />
      <main className="flex flex-col">
        <Hero />
        <Benefits />
        <HowItWorks />
        <CompactOverview />
        <Pricing />
        <Faq />
      </main>
      <LandingFooter />
    </div>
  );
}
