/**
 * Exclusão reversível de lançamentos.
 *
 * - Verifica a permissão do usuário antes de excluir (conta somente leitura,
 *   conta de criança) e devolve uma mensagem clara quando não há acesso.
 * - Aplica a remoção otimista na tela (totais, gráficos e listas) e faz
 *   rollback automático quando o backend recusa a exclusão.
 * - Oferece "Desfazer" por até 10 minutos após apagar.
 */
import { useCallback } from "react";
import { toast } from "sonner";

import { usePlanAccess } from "@/hooks/use-plan";
import { useKidSession } from "@/lib/kids-session";
import { useDeleteTransaction, useRestoreTransaction } from "@/lib/transactions";

/** Janela de arrependimento: 10 minutos. */
export const UNDO_WINDOW_MS = 10 * 60 * 1000;

export type DeletePermission = { allowed: boolean; reason: string | null };

/** Permissão de exclusão do usuário logado. */
export function useDeletePermission(): DeletePermission {
  const plan = usePlanAccess();
  const { isKid } = useKidSession();

  if (isKid) {
    return {
      allowed: false,
      reason:
        "Somente o responsável pode excluir registros. Peça ajuda a quem cuida da sua conta.",
    };
  }

  if (plan.data?.readOnly) {
    return {
      allowed: false,
      reason:
        plan.data.readOnlyReason ??
        "Sua conta está em modo somente leitura. Ative um plano para excluir registros.",
    };
  }

  return { allowed: true, reason: null };
}

/**
 * Exclusão com rollback e desfazer.
 *
 * `onOptimisticRemove` / `onRollback` permitem que o modal ou painel remova as
 * linhas na hora e volte ao estado anterior se algo falhar.
 */
export function useUndoableDelete(options?: {
  onOptimisticRemove?: (ids: string[]) => void;
  onRollback?: (ids: string[]) => void;
}) {
  const permission = useDeletePermission();
  const remove = useDeleteTransaction();
  const restore = useRestoreTransaction();

  const requestDelete = useCallback(
    async (ids: string[], label?: string | null) => {
      if (!permission.allowed) {
        toast.error("Exclusão não permitida", { description: permission.reason ?? undefined });
        return false;
      }

      options?.onOptimisticRemove?.(ids);

      try {
        await remove.mutateAsync(ids);
      } catch (error) {
        // Rollback automático: o painel volta ao estado anterior.
        options?.onRollback?.(ids);
        toast.error("Não foi possível excluir", {
          description:
            error instanceof Error
              ? error.message
              : "Nada foi alterado — os valores voltaram ao estado anterior.",
        });
        return false;
      }

      const deletedAt = Date.now();
      toast.success(label ? `"${label}" foi excluído` : "Lançamento excluído", {
        description: "Você pode desfazer esta exclusão em até 10 minutos.",
        duration: UNDO_WINDOW_MS,
        action: {
          label: "Desfazer",
          onClick: () => {
            if (Date.now() - deletedAt > UNDO_WINDOW_MS) {
              toast.error("O prazo de 10 minutos para desfazer já passou.");
              return;
            }
            restore
              .mutateAsync(ids)
              .then(() => {
                options?.onRollback?.(ids);
                toast.success("Exclusão desfeita", {
                  description: "Totais e gráficos foram recalculados.",
                });
              })
              .catch((error: unknown) =>
                toast.error(
                  error instanceof Error ? error.message : "Não foi possível restaurar",
                ),
              );
          },
        },
      });

      return true;
    },
    [options, permission, remove, restore],
  );

  return {
    requestDelete,
    permission,
    pending: remove.isPending,
    restoring: restore.isPending,
  };
}
