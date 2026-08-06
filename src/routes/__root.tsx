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

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import { AuthProvider } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { setupServiceWorker } from "@/lib/pwa";
import { OfflineBanner } from "@/components/offline-banner";


export const SITE_URL = "https://gastocerto-fj.lovable.app";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-bold tracking-tight text-foreground">
          Ah não, ocorreu um probleminha 😅
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Algo não carregou como esperado. Tente atualizar a página ou volte para o início.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Try again
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            Go home
          </a>
        </div>
      </div>
    </div>
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
      { name: "theme-color", content: "#0A1512" },
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
      {
        rel: "stylesheet",
        href: appCss,
      },
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
                  document.documentElement.style.backgroundColor = theme === 'dark' ? '#001222' : '#f6f7f8';
                  
                  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
                  if (reduced) document.documentElement.setAttribute('data-reduced-motion', 'true');
                } catch (e) {}
              })();
            `,
          }}
        />
        <HeadContent />
      </head>
      <body className="relative overscroll-none select-none md:select-auto bg-background text-foreground transition-colors duration-300 antialiased text-rendering-optimize-legibility">
        <div className="noise-overlay pointer-events-none opacity-[0.03] dark:opacity-[0.02]" />
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
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      return undefined;
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
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
