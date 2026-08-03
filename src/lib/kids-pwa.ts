import { useEffect, useState } from "react";

/**
 * Modo aplicativo/offline do Espaço Kids.
 *
 * Enquanto a tela da criança está montada trocamos o manifesto do site pelo
 * manifesto dedicado (`/kids.webmanifest`), que abre direto em `/meu-espaco`.
 * Assim, ao instalar pelo Espaço Kids, o atalho leva a criança para o painel
 * dela — e não para a landing page do responsável. Ao sair, o manifesto do
 * site é restaurado.
 *
 * O service worker (registrado na raiz) faz o cache network-first, então o
 * espaço abre mesmo sem conexão. Aqui apenas expomos o convite de instalação
 * capturado pelo evento `beforeinstallprompt`.
 */

type InstallPromptEvent = Event & { prompt: () => Promise<void>; userChoice?: Promise<unknown> };

const KIDS_MANIFEST = "/kids.webmanifest";
const SITE_MANIFEST = "/site.webmanifest";

function manifestLink(): HTMLLinkElement | null {
  if (typeof document === "undefined") return null;
  return document.querySelector<HTMLLinkElement>('link[rel="manifest"]');
}

export function useKidsAppMode() {
  const [installPrompt, setInstallPrompt] = useState<InstallPromptEvent | null>(null);
  const [installed, setInstalled] = useState(false);
  const [online, setOnline] = useState(true);

  useEffect(() => {
    const link = manifestLink();
    const previous = link?.getAttribute("href") ?? SITE_MANIFEST;
    link?.setAttribute("href", KIDS_MANIFEST);

    const standalone =
      typeof window !== "undefined" &&
      (window.matchMedia?.("(display-mode: standalone)").matches ||
        (window.navigator as unknown as { standalone?: boolean }).standalone === true);
    setInstalled(Boolean(standalone));
    setOnline(typeof navigator === "undefined" ? true : navigator.onLine);

    const onPrompt = (event: Event) => {
      event.preventDefault();
      setInstallPrompt(event as InstallPromptEvent);
    };
    const onInstalled = () => {
      setInstalled(true);
      setInstallPrompt(null);
    };
    const onOnline = () => setOnline(true);
    const onOffline = () => setOnline(false);

    window.addEventListener("beforeinstallprompt", onPrompt);
    window.addEventListener("appinstalled", onInstalled);
    window.addEventListener("online", onOnline);
    window.addEventListener("offline", onOffline);

    return () => {
      window.removeEventListener("beforeinstallprompt", onPrompt);
      window.removeEventListener("appinstalled", onInstalled);
      window.removeEventListener("online", onOnline);
      window.removeEventListener("offline", onOffline);
      manifestLink()?.setAttribute("href", previous);
    };
  }, []);

  async function install() {
    if (!installPrompt) return;
    try {
      await installPrompt.prompt();
    } finally {
      setInstallPrompt(null);
    }
  }

  return { canInstall: Boolean(installPrompt) && !installed, installed, online, install };
}
