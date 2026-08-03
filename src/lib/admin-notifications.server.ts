import { supabaseAdmin } from "@/integrations/supabase/client.server";

export async function sendAdminNotification(
  userId: string,
  type: string,
  title: string,
  message: string,
  severity: "info" | "warning" | "critical" = "info"
) {
  // Notificação in-app
  const { error: notifyError } = await supabaseAdmin.from("notifications").insert({
    user_id: userId,
    notification_type: type,
    title,
    message,
    severity,
    dedupe_key: `admin_${type}_${Date.now()}`
  });

  if (notifyError) console.error("[admin-notify] In-app error:", notifyError);
}
