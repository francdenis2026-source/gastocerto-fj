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
    if (!user?.id) return;
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
          className={className ?? "h-8 gap-1.5 text-[11px]"}
          aria-label={`Limpar ${label}`}
        >
          {busy ? <Loader2 className="size-3.5 animate-spin" /> : <Eraser className="size-3.5" />}
          Limpar
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Limpar {label}?</AlertDialogTitle>
          <AlertDialogDescription>
            Todos os seus registros deste histórico serão apagados definitivamente. Recomendamos
            exportar antes, se precisar guardar o comprovante.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction onClick={handleClear}>Apagar registros</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
