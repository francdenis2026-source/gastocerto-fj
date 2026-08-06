import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export const adminPurgeLogs = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    z
      .object({
        beforeDate: z.string().datetime().nullable().optional(),
        actionType: z.string().optional(),
      })
      .parse(d),
  )
  .handler(async ({ data, context }) => {
    const { assertAdminCtx, auditLog } = await import("@/lib/admin-guard.server");
    await assertAdminCtx(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    let query = supabaseAdmin
      .from("admin_logs")
      .delete();

    if (data.beforeDate) {
      query = query.lt("created_at", data.beforeDate);
    }

    if (data.actionType && data.actionType !== "all") {
      query = query.eq("action", data.actionType);
    }

    const { error, count } = await query;
    if (error) throw new Error("Falha ao limpar logs de auditoria");

    await auditLog(context, "purge_logs", { 
      before_date: data.beforeDate, 
      action_type: data.actionType || "all",
      purged_count: count ?? 0,
      scope: data.beforeDate ? `Anterior a ${data.beforeDate}` : "Todos os logs"
    }, null);

    return { ok: true, count: count ?? 0 };
  });

export const adminUpdateAppSettings = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    z
      .object({
        key: z.string(),
        value: z.any(),
      })
      .parse(d),
  )
  .handler(async ({ data, context }) => {
    const { assertAdminCtx, auditLog } = await import("@/lib/admin-guard.server");
    await assertAdminCtx(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { error } = await supabaseAdmin
      .from("app_settings")
      .upsert({ 
        key: data.key, 
        value: data.value,
        updated_at: new Date().toISOString()
      }, { onConflict: "key" });

    if (error) throw new Error("Falha ao atualizar configuração");

    await auditLog(context, "update_app_setting", { 
      key: data.key, 
      value: data.value 
    }, null as any);

    return { ok: true };
  });

export const adminAutoPurgeLogs = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => z.object({ retentionDays: z.number().default(90) }).parse(d ?? {}))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - data.retentionDays);
    const { error, count } = await supabaseAdmin
      .from("admin_logs")
      .delete()
      .lt("created_at", cutoffDate.toISOString());
    if (error) throw new Error("Falha na limpeza automática");
    return { ok: true, count: count ?? 0 };
  });
