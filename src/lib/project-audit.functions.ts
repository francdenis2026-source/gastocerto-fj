import { createServerFn } from "@tanstack/react-start";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { z } from "zod";

export const getProjectHealth = createServerFn({ method: "GET" })
  .handler(async () => {
    const results: Record<string, any> = {};
    
    // Lista de tabelas críticas para verificar
    const tables = [
      "profiles", 
      "accounts", 
      "categories", 
      "transactions", 
      "budgets", 
      "licenses", 
      "user_roles",
      "admin_access_codes",
      "monthly_closings",
      "vehicles",
      "fuel_entries"
    ];

    for (const table of tables) {
      try {
      const { count, error } = await (supabaseAdmin
        .from(table)
        .select("*", { count: "exact", head: true }) as any);
        
        if (error) {
          results[table] = { status: "error", message: error.message };
        } else {
          results[table] = { status: "ok", count };
        }
      } catch (e: any) {
        results[table] = { status: "exception", message: e.message };
      }
    }

    // Verificar transações órfãs (sem user_id válido ou sem conta)
    const { data: orphanTxs } = await supabaseAdmin
      .from("transactions")
      .select("id")
      .is("user_id", null)
      .limit(10);
    
    results.orphaned_transactions = { status: orphanTxs?.length ? "warning" : "ok", count: orphanTxs?.length || 0 };

    return results;
  });

export const fixOrphanedTransactions = createServerFn({ method: "POST" })
  .inputValidator((data) => z.object({ userId: z.string().uuid() }).parse(data))
  .handler(async ({ data }) => {
    const { userId } = data;
    const { data: updated, error } = await supabaseAdmin
      .from("transactions")
      .update({ user_id: userId })
      .is("user_id", null)
      .select("id");
    
    if (error) throw error;
    return { success: true, fixed: updated?.length || 0 };
  });
