import { createFileRoute } from "@tanstack/react-router";
import { LandingHeader } from "@/components/landing/landing-header";
import { Hero } from "@/components/landing/hero";
import { CompactOverview } from "@/components/landing/compact-overview";
import { Benefits } from "@/components/landing/benefits";
import { HowItWorks } from "@/components/landing/how-it-works";
import { Pricing } from "@/components/landing/pricing";
import { LandingFooter } from "@/components/landing/landing-footer";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/")({
  component: HomePage,
  head: () => ({
    title: "GastoCerto — Engenharia Financeira de Elite",
    meta: [
      {
        name: "description",
        content: "Redefina sua gestão financeira com precisão absoluta. GastoCerto combina tecnologia premium, IA e segurança bancária para sua total liberdade.",
      },
      { property: "og:title", content: "GastoCerto | Engenharia Financeira de Elite" },
      {
        property: "og:description",
        content: "A plataforma SaaS definitiva para gestão financeira pessoal com design premium e insights inteligentes.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
});

function HomePage() {
  return (
    <div className={cn(
      "min-h-screen bg-[#020617] font-sans selection:bg-primary/20 selection:text-primary",
      "antialiased scroll-smooth"
    )}>
      <LandingHeader />
      <main className="flex flex-col">
        <Hero />
        <Benefits />
        <HowItWorks />
        <CompactOverview />
        <Pricing />
      </main>
      <LandingFooter />
    </div>
  );
}
