import { createFileRoute } from "@tanstack/react-router";
import { LandingHeader } from "@/components/landing/landing-header";
import { Hero } from "@/components/landing/hero";
import { CompactOverview } from "@/components/landing/compact-overview";
import { Benefits } from "@/components/landing/benefits";
import { HowItWorks } from "@/components/landing/how-it-works";
import { Pricing } from "@/components/landing/pricing";
import { ContactSection } from "@/components/landing/contact-section";
import { LandingFooter } from "@/components/landing/landing-footer";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/")({
  component: HomePage,
  head: () => ({
    title: "GastoCerto — Controle hoje, tranquilidade sempre",
    meta: [
      {
        name: "description",
        content: "Organize suas finanças com precisão absoluta. GastoCerto oferece dashboard inteligente, consultoria com IA e controle de metas em uma interface premium.",
      },
      { property: "og:title", content: "GastoCerto | Precisão Financeira Absoluta" },
      {
        property: "og:description",
        content: "A plataforma de gestão financeira SaaS definitiva para quem busca organização e sofisticação.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
});

function HomePage() {
  return (
    <div className={cn(
      "min-h-screen bg-background font-sans selection:bg-primary/20 selection:text-primary",
      "antialiased scroll-smooth"
    )}>
      <LandingHeader />
      <main>
        <Hero />
        <CompactOverview />
        <Benefits />
        <HowItWorks />
        <Pricing />
        <ContactSection />
      </main>
      <LandingFooter />
    </div>
  );
}
