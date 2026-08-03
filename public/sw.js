/**
 * Service worker do GastoCerto.
 *
 * Estratégia: network-first com fallback de cache. Navegações offline caem no
 * app shell ("/") já cacheado, o que permite ao Espaço Kids abrir sem rede.
 * Nada de cache-first em HTML — o app publicado nunca serve build obsoleto.
 */

const CACHE_NAME = "gastocerto-v3";

// Somente arquivos que existem de fato: um 404 em addAll aborta toda a instalação
// (era o motivo do modo offline nunca funcionar antes).
const PRECACHE = [
  "/",
  "/site.webmanifest",
  "/kids.webmanifest",
  "/favicon-32.png",
  "/favicon-192.png",
  "/favicon-512.png",
  "/icons/icon-192x192.png",
  "/icons/icon-512x512.png",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(CACHE_NAME);
      await Promise.allSettled(PRECACHE.map((url) => cache.add(new Request(url, { cache: "reload" }))));
      // Sem skipWaiting automático: a nova versão espera o aviso discreto na
      // interface (mensagem SKIP_WAITING) para não recarregar a criança no meio
      // de um registro.
    })(),
  );
});

self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});


self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const names = await caches.keys();
      await Promise.allSettled(
        names.filter((name) => name.startsWith("gastocerto-") && name !== CACHE_NAME).map((name) => caches.delete(name)),
      );
      await self.clients.claim();
    })(),
  );
});

self.addEventListener("fetch", (event) => {
  const request = event.request;
  if (request.method !== "GET") return;
  if (!request.url.startsWith("http")) return;

  const url = new URL(request.url);

  // Backend e autenticação nunca são cacheados.
  if (url.hostname.includes("supabase.co") || url.pathname.startsWith("/api/")) return;

  event.respondWith(
    (async () => {
      const cache = await caches.open(CACHE_NAME);
      try {
        const response = await fetch(request);
        if (response && response.status === 200 && response.type !== "opaque") {
          cache.put(request, response.clone()).catch(() => {});
        }
        return response;
      } catch (error) {
        const cached = await cache.match(request);
        if (cached) return cached;

        // Offline em uma navegação: devolve o app shell para o app abrir.
        if (request.mode === "navigate") {
          const shell = await cache.match("/");
          if (shell) return shell;
        }
        throw error;
      }
    })(),
  );
});
