import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";
import { AlertTriangle, Home, RefreshCw } from "lucide-react";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import { Button } from "@/components/ui/button";
import { AuthProvider } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { setupServiceWorker } from "@/lib/pwa";
import { OfflineBanner } from "@/components/offline-banner";

export const SITE_URL = "https://gastocerto-fj.lovable.app";

function NotFoundComponent() {
  return (
    <main className="flex min-h-dvh items-center justify-center bg-background px-4 py-12">
      <section className="w-full max-w-lg rounded-3xl border border-border bg-card p-6 text-center shadow-soft sm:p-8" aria-labelledby="not-found-title">
        <div className="mx-auto mb-5 flex size-14 items-center justify-center rounded-2xl bg-accent text-accent-foreground" aria-hidden="true">
          <AlertTriangle className="size-6" />
        </div>
        <p className="kicker mb-3">Erro 404</p>
        <h1 id="not-found-title" className="text-3xl font-bold text-foreground sm:text-4xl">Página não encontrada</h1>
        <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-muted-foreground sm:text-base">
          O endereço pode ter mudado ou não existir mais. Volte ao início para continuar usando o GastoCerto.
        </p>
        <div className="mt-7 flex justify-center">
          <Button asChild size="lg">
            <Link to="/">
              <Home className="size-4" />
              Voltar ao início
            </Link>
          </Button>
        </div>
      </section>
    </main>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();

  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <main className="flex min-h-dvh items-center justify-center bg-background px-4 py-12">
      <section className="w-full max-w-lg rounded-3xl border border-border bg-card p-6 text-center shadow-soft sm:p-8" aria-labelledby="error-title">
        <div className="mx-auto mb-5 flex size-14 items-center justify-center rounded-2xl bg-destructive/10 text-destructive" aria-hidden="true">
          <AlertTriangle className="size-6" />
        </div>
        <p className="kicker mb-3">Não foi possível carregar</p>
        <h1 id="error-title" className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          Algo saiu do esperado
        </h1>
        <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-muted-foreground sm:text-base">
          Tente carregar novamente. Se o problema continuar, volte ao início e repita a ação em alguns instantes.
        </p>
        <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
          <Button
            onClick={() => {
              router.invalidate();
              reset();
            }}
          >
            <RefreshCw className="size-4" />
            Tentar novamente
          </Button>
          <Button asChild variant="outline">
            <a href="/">
              <Home className="size-4" />
              Voltar ao início
            </a>
          </Button>
        </div>
      </section>
    </main>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1, maximum-scale=5" },
      { title: "GastoCerto — Controle hoje, tranquilidade sempre" },
      { name: "description", content: "A plataforma completa para gestão de finanças pessoais. Controle hoje, tranquilidade sempre." },
      { name: "author", content: "GastoCerto" },
      { name: "theme-color", content: "#000d1a" },
      { name: "application-name", content: "GastoCerto" },
      { name: "apple-mobile-web-app-title", content: "GastoCerto" },
      { property: "og:site_name", content: "GastoCerto" },
      { property: "og:title", content: "GastoCerto — Controle de gastos pessoais" },
      { property: "og:description", content: "Domine suas finanças com o GastoCerto. Controle hoje, tranquilidade sempre." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "mobile-web-app-capable", content: "yes" },
      { name: "apple-mobile-web-app-status-bar-style", content: "black-translucent" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Space+Grotesk:wght@300;400;500;600;700&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Outfit:wght@600;700;800;900&family=Geist+Mono:wght@400;600&display=swap",
      },
      { rel: "icon", type: "image/png", sizes: "512x512", href: "/favicon-512.png" },
      { rel: "icon", type: "image/png", sizes: "192x192", href: "/favicon-192.png" },
      { rel: "icon", type: "image/png", sizes: "32x32", href: "/favicon-32.png" },
      { rel: "icon", type: "image/png", sizes: "16x16", href: "/favicon-16.png" },
      { rel: "icon", href: "/favicon-32.png", sizes: "any" },
      { rel: "apple-touch-icon", sizes: "180x180", href: "/apple-touch-icon.png" },
      { rel: "mask-icon", href: "/favicon-32.png", color: "#1FAE6D" },
      { rel: "manifest", href: "/site.webmanifest" },
    ],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@graph": [
            {
              "@type": "Organization",
              "@id": `${SITE_URL}/#organization`,
              name: "GastoCerto",
              url: SITE_URL,
              logo: {
                "@type": "ImageObject",
                url: `${SITE_URL}/favicon-512.png`,
                width: 512,
                height: 512,
              },
              image: `${SITE_URL}/og-gastocerto-v2.jpg`,
              description:
                "Plataforma brasileira de controle de gastos pessoais: combustível, gás, mercado, contas e assinaturas em um painel só.",
              founder: { "@type": "Person", name: "Franc D'nis" },
              areaServed: "BR",
              address: {
                "@type": "PostalAddress",
                addressLocality: "Feijó",
                addressRegion: "AC",
                addressCountry: "BR",
              },
            },
            {
              "@type": "WebSite",
              "@id": `${SITE_URL}/#website`,
              url: SITE_URL,
              name: "GastoCerto",
              inLanguage: "pt-BR",
              description: "Despesas, receitas, cartões, contas fixas, combustível, gás, metas e relatórios em um único painel de finanças pessoais.",
              publisher: { "@id": `${SITE_URL}/#organization` },
            },
          ],
        }),
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var theme = localStorage.getItem('gastocerto-theme');
                  if (!theme) theme = 'dark';
                  document.documentElement.classList.toggle('dark', theme === 'dark');
                  document.documentElement.style.colorScheme = theme;
                  document.documentElement.style.backgroundColor = theme === 'dark' ? '#000d1a' : '#f8fafc';

                  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
                  if (reduced) document.documentElement.setAttribute('data-reduced-motion', 'true');
                } catch (e) {}
              })();
            `,
          }}
        />
        <HeadContent />
      </head>
      <body className="relative bg-background text-foreground antialiased transition-colors duration-300">
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  const router = useRouter();

  useEffect(() => {
    void setupServiceWorker();
  }, []);

  useEffect(() => {
    const { data } = supabase.auth.onAuthStateChange((event) => {
      if (event !== "SIGNED_IN" && event !== "SIGNED_OUT" && event !== "USER_UPDATED") return;
      router.invalidate();
      if (event !== "SIGNED_OUT") queryClient.invalidateQueries();
    });
    return () => data.subscription.unsubscribe();
  }, [router, queryClient]);

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <Outlet />
        </AuthProvider>
        <OfflineBanner />
        <Toaster richColors position="top-right" />
      </ThemeProvider>
    </QueryClientProvider>
  );
}
