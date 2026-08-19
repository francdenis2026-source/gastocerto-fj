import { WifiOff } from "lucide-react";
import { useEffect, useState } from "react";

/** Aviso discreto quando o usuário fica sem conexão (o app segue navegável via cache). */
export function OfflineBanner() {
  const [offline, setOffline] = useState(false);

  useEffect(() => {
    const update = () => setOffline(!navigator.onLine);
    update();
    window.addEventListener("online", update);
    window.addEventListener("offline", update);
    return () => {
      window.removeEventListener("online", update);
      window.removeEventListener("offline", update);
    };
  }, []);

  if (!offline) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed inset-x-0 bottom-0 z-[60] flex min-h-11 items-center justify-center gap-2 border-t border-amber-500/30 bg-amber-400/95 px-4 pt-2 text-center text-xs font-semibold text-amber-950 shadow-lg pb-[calc(0.5rem+env(safe-area-inset-bottom))]"
    >
      <WifiOff className="size-4 shrink-0" aria-hidden="true" />
      <span>Você está offline — mostrando os dados salvos no dispositivo.</span>
    </div>
  );
}
