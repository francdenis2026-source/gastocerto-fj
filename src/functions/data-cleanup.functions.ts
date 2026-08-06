import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/lib/integrations/supabase/auth-middleware";
import { supabaseAdmin } from "@/lib/integrations/supabase/client.server";

/**
 * Deleta todas as transações de julho de 2026 para o usuário específico.
 * Autorizado pelo cliente Franc Denis (CPF 69598193268).
 */
export const cleanupJulyData = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const userId = context.userId;
    
    // Filtro de data para julho de 2026
    const startDate = "2026-07-01";
    const endDate = "2026-07-31T23:59:59";

    const { error } = await supabaseAdmin
      .from("transactions")
      .delete()
      .eq("user_id", userId)
      .gte("transaction_date", startDate)
      .lte("transaction_date", endDate);

    if (error) throw error;

    return { success: true };
  });
