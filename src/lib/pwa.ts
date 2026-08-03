import { useEffect, useRef, useState } from "react";

/**
 * Registro do service worker com guardas de segurança.
 *
 * O SW só é registrado no app publicado (produção, fora de iframe/preview).
 * Em qualquer contexto recusado, registros antigos de /sw.js são removidos
 * para evitar HTML/chunks obsoletos servidos de cache.
 */

const SW_URL = "/sw.js";

function isRefusedContext(): boolean {
  if (typeof window === "undefined") return true;
  if (!import.meta.env.PROD) return true;

  try {
    if (window.self !== window.top) return true;
  } catch {
    return true;
  }

  const host = window.location.hostname;
  if (host.startsWith("id-preview--") || host.startsWith("preview--")) return true;
  if (host === "lovableproject.com" || host.endsWith(".lovableproject.com")) return true;
  if (host === "lovableproject-dev.com" || host.endsWith(".lovableproject-dev.com")) return true;
  if (host === "beta.lovable.dev" || host.endsWith(".beta.lovable.dev")) return true;

  if (new URLSearchParams(window.location.search).get("sw") === "off") return true;

  return false;
}

async function unregisterAppServiceWorkers(): Promise<void> {
  if (typeof navigator === "undefined" || !("serviceWorker" in navigator)) return;
  try {
    const registrations = await navigator.serviceWorker.getRegistrations();
    await Promise.allSettled(
      registrations
        .filter((registration) => {
          const url =
            registration.active?.scriptURL ??
            registration.waiting?.scriptURL ??
            registration.installing?.scriptURL ??
            "";
          return url.endsWith(SW_URL);
        })
        .map((registration) => registration.unregister()),
    );
  } catch {
    // silencioso: limpeza best-effort
  }
}

export async function setupServiceWorker(): Promise<void> {
  if (typeof navigator === "undefined" || !("serviceWorker" in navigator)) return;

  if (isRefusedContext()) {
    await unregisterAppServiceWorkers();
    return;
  }

  try {
    await navigator.serviceWorker.register(SW_URL, { scope: "/" });
  } catch {
    // registro falhou: o app segue funcionando normalmente online
  }
}

/**
 * Detecção de nova versão do service worker.
 *
 * Quando um novo SW termina de instalar e fica em "waiting", expomos
 * `updateReady` para a interface mostrar um aviso discreto. Ao confirmar,
 * enviamos SKIP_WAITING e recarregamos uma única vez em `controllerchange`.
 */
export function useAppUpdate() {
  const [updateReady, setUpdateReady] = useState(false);
  const registrationRef = useRef<ServiceWorkerRegistration | null>(null);

  useEffect(() => {
    if (typeof navigator === "undefined" || !("serviceWorker" in navigator)) return;
    if (isRefusedContext()) return;

    let cancelled = false;
    let reloading = false;

    const onControllerChange = () => {
      if (reloading) return;
      reloading = true;
      window.location.reload();
    };

    const track = (registration: ServiceWorkerRegistration) => {
      registrationRef.current = registration;
      if (registration.waiting && navigator.serviceWorker.controller) setUpdateReady(true);
      registration.addEventListener("updatefound", () => {
        const installing = registration.installing;
        if (!installing) return;
        installing.addEventListener("statechange", () => {
          if (installing.state === "installed" && navigator.serviceWorker.controller) {
            if (!cancelled) setUpdateReady(true);
          }
        });
      });
    };

    void (async () => {
      try {
        const registration = await navigator.serviceWorker.getRegistration(SW_URL);
        if (!registration || cancelled) return;
        track(registration);
        // checagem periódica leve (30 min) para pegar deploys em sessões longas
        const timer = window.setInterval(() => void registration.update().catch(() => {}), 30 * 60 * 1000);
        cleanupTimer = () => window.clearInterval(timer);
      } catch {
        // sem registro: nada a fazer
      }
    })();

    let cleanupTimer: (() => void) | null = null;
    navigator.serviceWorker.addEventListener("controllerchange", onControllerChange);

    return () => {
      cancelled = true;
      cleanupTimer?.();
      navigator.serviceWorker.removeEventListener("controllerchange", onControllerChange);
    };
  }, []);

  function applyUpdate() {
    const waiting = registrationRef.current?.waiting;
    if (!waiting) {
      window.location.reload();
      return;
    }
    waiting.postMessage({ type: "SKIP_WAITING" });
    setUpdateReady(false);
  }

  return { updateReady, applyUpdate };
}
