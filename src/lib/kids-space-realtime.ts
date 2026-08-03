/**
 * Sincronização em tempo real do Espaço Kids.
 *
 * Quando o responsável apaga ou edita um envio no painel dele, o registro
 * espelho da criança é apagado/atualizado no banco (trigger de sincronização).
 * Este hook escuta essas mudanças e atualiza a tela da criança na hora, sem
 * precisar recarregar a página.
 */
import { useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";

import { supabase } from "@/integrations/supabase/client";

export function useKidSpaceRealtime(kidUserId: string | undefined) {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!kidUserId) return;

    const channel = supabase
      .channel(`kid-space-${kidUserId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "transactions",
          filter: `user_id=eq.${kidUserId}`,
        },
        () => {
          void queryClient.invalidateQueries({ queryKey: ["kid_transactions"] });
          void queryClient.invalidateQueries({ queryKey: ["kid_goals"] });
          void queryClient.invalidateQueries({ queryKey: ["kid_pix_alerts"] });
          void queryClient.invalidateQueries({ queryKey: ["notifications"] });
        },
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [kidUserId, queryClient]);
}

/** 
 * Mesma ideia no painel do responsável: reflete gastos feitos pela criança.
 * Agora aceita uma lista de IDs de usuários dos filhos para monitorar em tempo real.
 */
export function useParentKidsRealtime(parentUserId: string | undefined, kidUserIds: (string | null)[] = []) {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!parentUserId) return;

    // Remove nulls e garante IDs únicos
    const validKidIds = kidUserIds.filter((id): id is string => !!id);
    const allWatchedIds = [parentUserId, ...validKidIds];

    const channels = allWatchedIds.map(userId => {
      return supabase
        .channel(`watch-${userId}`)
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "transactions",
            filter: `user_id=eq.${userId}`,
          },
          () => {
            void queryClient.invalidateQueries({ queryKey: ["kids_financial_metrics"] });
            void queryClient.invalidateQueries({ queryKey: ["kid_transactions"] });
            void queryClient.invalidateQueries({ queryKey: ["transactions"] });
          },
        )
        .subscribe();
    });

    return () => {
      channels.forEach(channel => void supabase.removeChannel(channel));
    };
  }, [parentUserId, kidUserIds.join(','), queryClient]);
}
