import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const filtersSchema = z.object({
  from: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).nullable().optional(),
  to: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).nullable().optional(),
  limit: z.number().min(1).max(2000).optional(),
  page: z.number().min(1).optional(),
  pageSize: z.number().min(1).max(100).optional(),
  search: z.string().optional(),
});

/** Lista os logs de auditoria administrativos, com filtro opcional por período. */
export const adminListAuditLogs = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => filtersSchema.parse(input ?? {}))
  .handler(async ({ data, context }) => {
    const { assertStaffCtx } = await import("@/lib/admin-guard.server");
    await assertStaffCtx(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const page = data.page ?? 1;
    const pageSize = data.pageSize ?? 50;
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    let query = supabaseAdmin
      .from("admin_logs")
      .select("id, created_at, actor_id, target_user_id, action, details", { count: "exact" })
      .order("created_at", { ascending: false });

    if (data.from) query = query.gte("created_at", `${data.from}T00:00:00.000Z`);
    if (data.to) query = query.lte("created_at", `${data.to}T23:59:59.999Z`);
    
    if (data.search) {
      // Usando textSearch ou or() para filtrar logs
      // Como o campo details é JSON, o filtro é mais limitado no or() do PostgREST sem extensões complexas
      // Mas podemos filtrar por action e actor_id/target_user_id se necessário. 
      // Para simplificar, filtramos pela action (que é texto) ou detalhes (se for convertido)
      query = query.or(`action.ilike.%${data.search}%,details.cast.text.ilike.%${data.search}%`);
    }

    const { data: logs, error, count } = await query.range(from, to);
    if (error) throw error;

    const ids = Array.from(
      new Set(
        (logs ?? []).flatMap((log) =>
          [log.actor_id, log.target_user_id].filter((value): value is string => Boolean(value)),
        ),
      ),
    );

    let people: Array<{ user_id: string; full_name: string | null }> = [];
    if (ids.length > 0) {
      const { data: profiles } = await supabaseAdmin
        .from("profiles")
        .select("user_id, full_name")
        .in("user_id", ids);
      people = profiles ?? [];
    }

    return { 
      logs: logs ?? [], 
      people, 
      count: count ?? 0,
      page,
      pageSize,
      totalPages: Math.ceil((count ?? 0) / pageSize)
    };
  });

export const adminExportAuditLogsCsv = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => filtersSchema.parse(input ?? {}))
  .handler(async ({ data, context }) => {
    const { assertStaffCtx } = await import("@/lib/admin-guard.server");
    await assertStaffCtx(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    let query = supabaseAdmin
      .from("admin_logs")
      .select("created_at, action, actor_id, target_user_id, details")
      .order("created_at", { ascending: false });

    if (data.from) query = query.gte("created_at", `${data.from}T00:00:00.000Z`);
    if (data.to) query = query.lte("created_at", `${data.to}T23:59:59.999Z`);
    if (data.search) {
      query = query.or(`action.ilike.%${data.search}%,details.cast.text.ilike.%${data.search}%`);
    }

    const { data: logs, error } = await query.limit(2000); // Limite razoável para export
    if (error) throw error;

    const ids = Array.from(new Set(logs.flatMap(l => [l.actor_id, l.target_user_id].filter(Boolean))));
    let namesMap = new Map();
    if (ids.length > 0) {
      const { data: profiles } = await supabaseAdmin.from("profiles").select("user_id, full_name").in("user_id", ids as string[]);
      profiles?.forEach(p => namesMap.set(p.user_id, p.full_name));
    }

    const csvHeader = "Data;Ação;Ator;Alvo;Detalhes\n";
    const csvRows = (logs ?? []).map(log => {
      const actor = log.actor_id ? namesMap.get(log.actor_id) || log.actor_id : "Sistema";
      const target = log.target_user_id ? namesMap.get(log.target_user_id) || log.target_user_id : "-";
      const details = JSON.stringify(log.details).replace(/"/g, '""');
      return `${log.created_at};${log.action};${actor};${target};"${details}"`;
    }).join("\n");

    return { csv: csvHeader + csvRows };
  });
