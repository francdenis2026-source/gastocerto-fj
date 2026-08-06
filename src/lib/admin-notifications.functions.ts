import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

/**
 * Envia lembretes de expiração para contas que vencem em 3 ou 1 dia.
 */
export const adminSendExpirationReminders = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { assertAdminCtx } = await import("@/lib/admin-guard.server");
    await assertAdminCtx(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { sendAdminNotification } = await import("./admin-notifications.server");

    // Calcular datas alvo (exatamente 3 dias e 1 dia a partir de agora)
    const threeDays = new Date();
    threeDays.setDate(threeDays.getDate() + 3);
    const oneDay = new Date();
    oneDay.setDate(oneDay.getDate() + 1);

    const start3 = new Date(threeDays).setHours(0,0,0,0);
    const end3 = new Date(threeDays).setHours(23,59,59,999);
    const start1 = new Date(oneDay).setHours(0,0,0,0);
    const end1 = new Date(oneDay).setHours(23,59,59,999);

    // Buscar quem expira em 3 dias
    const { data: exp3 } = await supabaseAdmin
      .from("profiles")
      .select("user_id")
      .gte("trial_ends_at", new Date(start3).toISOString())
      .lte("trial_ends_at", new Date(end3).toISOString());

    for (const p of (exp3 || [])) {
      await sendAdminNotification(
        p.user_id,
        "trial_expiring",
        "Seu teste expira em 3 dias",
        "Aproveite os últimos dias de acesso premium ou faça o upgrade agora para não perder seus dados.",
        "warning"
      );
    }

    // Buscar quem expira em 1 dia
    const { data: exp1 } = await supabaseAdmin
      .from("profiles")
      .select("user_id")
      .gte("trial_ends_at", new Date(start1).toISOString())
      .lte("trial_ends_at", new Date(end1).toISOString());

    for (const p of (exp1 || [])) {
      await sendAdminNotification(
        p.user_id,
        "trial_expiring",
        "Seu acesso expira amanhã!",
        "Amanhã sua conta temporária será encerrada definitivamente. Salve seus dados ou torne-se PRO.",
        "warning"
      );
    }

    return { ok: true, sent3: exp3?.length || 0, sent1: exp1?.length || 0 };
  });
