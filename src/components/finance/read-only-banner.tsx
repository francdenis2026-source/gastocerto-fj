import { Link } from "@tanstack/react-router";
import { Lock } from "lucide-react";

import { Button } from "@/components/ui/button";
import { usePlanAccess } from "@/hooks/use-plan";
import { cn } from "@/lib/utils";

/**
 * Aviso fixo de conta somente leitura: aparece quando o teste/licença venceu e
 * não há plano pago. A consulta continua liberada; a escrita fica bloqueada.
 */
export function ReadOnlyBanner() {
  const { data: access } = usePlanAccess();
  if (!access?.readOnly) return null;

  return (
    <div
      role="status"
      className={cn(
        "mb-2.5 flex flex-wrap items-center gap-2 rounded-xl border border-banner-amber-border bg-banner-amber-bg px-3 py-2 backdrop-blur-sm shadow-sm"
      )}
    >
      <Lock className="size-4 shrink-0 text-banner-amber-icon" aria-hidden />
      <p className="min-w-0 flex-1 text-[12px] font-medium leading-snug text-banner-amber-text">
        <strong>Modo somente leitura.</strong> {access.readOnlyReason}
      </p>
      <Button size="sm" asChild variant="default" className="h-7 px-3 text-[11px]">
        <Link to="/perfil">Ativar plano</Link>
      </Button>
    </div>
  );
}
