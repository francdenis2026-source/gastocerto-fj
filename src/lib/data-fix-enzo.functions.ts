import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/lib/integrations/supabase/auth-middleware";
import { supabaseAdmin } from "@/lib/integrations/supabase/client.server";

/**
 * Remove permanentemente a transação específica do Enzo que o usuário relatou como erro.
 */
export const fixEnzoTransactionError = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const userId = context.userId;
    
    // Deleta a transação específica pelo conteúdo da descrição que o usuário mencionou
    const { error } = await supabaseAdmin
      .from("transactions")
      .delete()
      .eq("user_id", userId)
      .ilike("description", "%dei 20 reias pro Enzo (PIX)%");

    if (error) throw error;

    return { success: true };
  });
