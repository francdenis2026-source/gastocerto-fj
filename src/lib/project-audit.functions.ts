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
    ] as const;

    for (const table of tables) {
      try {
        const query = supabaseAdmin.from(table as any).select("*", { count: "exact", head: true });
        const { count, error } = await (query as any);
        
        if (error) {
          results[table] = { status: "error", message: error.message };
        } else {
          results[table] = { status: "ok", count };
        }
      } catch (e: any) {
        results[table] = { status: "exception", message: e.message };
      }
    }

    // Verificar transações órfãs (sem user_id válido)
    try {
      const orphanQuery = supabaseAdmin.from("transactions").select("id").is("user_id", null).limit(10);
      const { data: orphanTxs } = await (orphanQuery as any);
      results.orphaned_transactions = { status: orphanTxs?.length ? "warning" : "ok", count: orphanTxs?.length || 0 };
    } catch (e) {
      results.orphaned_transactions = { status: "error", message: "Failed to check orphans" };
    }

    return results;
  });

export const fixOrphanedTransactions = createServerFn({ method: "POST" })
  .inputValidator((data) => z.object({ userId: z.string().uuid() }).parse(data))
  .handler(async ({ data }) => {
    const { userId } = data;
    const query = supabaseAdmin
      .from("transactions")
      .update({ user_id: userId } as any)
      .is("user_id", null)
      .select("id");
    
    const { data: updated, error } = await (query as any);
    
    if (error) throw error;
    return { success: true, fixed: updated?.length || 0 };
  });
