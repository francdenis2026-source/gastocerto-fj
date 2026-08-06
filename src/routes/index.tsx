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
    <div className="min-h-dvh w-full max-w-full bg-[#000a14] font-sans antialiased selection:bg-primary/25 selection:text-foreground" data-body-context="Antes de realizar qualquer ação, entenda o contexto e instrução recente do usuário, comando mais recente enviado por ele: identifique o erro e corrija: Erro de runtime\r\n\r\nError: User not found\r\n{\r\n  \&quot;timestamp\&quot;: 1786021536057,\r\n  \&quot;error_type\&quot;: \&quot;RUNTIME_ERROR\&quot;,\r\n  \&quot;filename\&quot;: \&quot;http://localhost:8080/_serverFn/eyJmaWxlIjoiL3NyYy9saWIva2lkcy1hY2NvdW50LmZ1bmN0aW9ucy50cz90c3Mtc2VydmVyZm4tc3BsaXQiLCJleHBvcnQiOiJzYXZlS2lkQWNjZXNzX2NyZWF0ZVNlcnZlckZuX2hhbmRsZXIifQ\&quot;,\r\n  \&quot;lineno\&quot;: 0,\r\n  \&quot;colno\&quot;: 0,\r\n  \&quot;stack\&quot;: \&quot;Error: User not found\\n    at Object.eval (/dev-server/src/lib/kids-account.functions.ts:77:30)\\n    at process.processTicksAndRejections (node:internal/process/task_queues:105:5)\\n    at async server (/dev-server/node_modules/@tanstack/start-client-core/src/createServerFn.ts:944:24)\\n    at async callNextMiddleware (/dev-server/node_modules/@tanstack/start-client-core/src/createServerFn.ts:322:24)\\n    at async userNext (/dev-server/node_modules/@tanstack/start-client-core/src/createServerFn.ts:312:26)\\n    at async callNextMiddleware (/dev-server/node_modules/@tanstack/start-client-core/src/createServerFn.ts:322:24)\\n    at async AsyncFunction.__executeServer (/dev-server/node_modules/@tanstack/start-client-core/src/createServerFn.ts:212:20)\\n    at async eval (/dev-server/node_modules/@tanstack/start-server-core/src/server-functions-handler.ts:159:16)\\n    at async eval (/dev-server/node_modules/@tanstack/start-server-core/src/server-functions-handler.ts:81:17)\\n    at async handleServerAction (/dev-server/node_modules/@tanstack/start-server-core/src/server-functions-handler.ts:418:10)\&quot;,\r\n  \&quot;has_blank_screen\&quot;: true\r\n}">
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
