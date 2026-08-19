import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Eraser, Loader2 } from "lucide-react";
import { toast } from "sonner";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";

type Props = {
  /** Tabela de auditoria/histórico que será limpa. */
  table: string;
  /** Nome amigável exibido na confirmação. */
  label: string;
  /** Coluna que identifica o dono do registro. */
  ownerColumn?: string;
  /** Chaves do cache a invalidar após limpar. */
  invalidateKeys?: string[];
  /** Callback extra após limpar (ex.: refetch manual). */
  onCleared?: () => void;
  className?: string;
};

/**
 * Botão padrão para limpar registros de auditoria e histórico.
 * Remove apenas os registros do usuário autenticado.
 */
export function ClearHistoryButton({
  table,
  label,
  ownerColumn = "user_id",
  invalidateKeys = [],
  onCleared,
  className,
}: Props) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [busy, setBusy] = useState(false);

  async function handleClear() {
    if (!user?.id || busy) return;
    setBusy(true);
    try {
      const { error } = await supabase
        .from(table as never)
        .delete()
        .eq(ownerColumn, user.id);
      if (error) throw error;
      toast.success(`${label} limpo com sucesso.`);
      invalidateKeys.forEach((key) => queryClient.invalidateQueries({ queryKey: [key] }));
      onCleared?.();
    } catch (err) {
      toast.error(
        `Não foi possível limpar. ${err instanceof Error ? err.message : "Tente novamente."}`,
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          disabled={busy}
          className={className ?? "min-h-11 gap-2 px-3 text-xs"}
          aria-label={`Limpar ${label}`}
          aria-busy={busy}
        >
          {busy ? (
            <Loader2 className="size-4 animate-spin motion-reduce:animate-none" aria-hidden="true" />
          ) : (
            <Eraser className="size-4" aria-hidden="true" />
          )}
          {busy ? "Limpando…" : "Limpar"}
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Limpar {label}?</AlertDialogTitle>
          <AlertDialogDescription>
            Todos os seus registros deste histórico serão apagados definitivamente. Recomendamos
            exportar antes, caso precise guardar um comprovante.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={busy}>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            disabled={busy}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            onClick={handleClear}
          >
            {busy ? "Apagando…" : "Apagar registros"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
