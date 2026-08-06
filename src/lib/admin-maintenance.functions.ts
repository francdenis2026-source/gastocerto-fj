import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/lib/integrations/supabase/auth-middleware";

/**
 * Função de manutenção para limpar contas temporárias expiradas.
 * Deve ser chamada periodicamente ou por um administrador.
 */
export const adminCleanupExpiredAccounts = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { assertAdminCtx, auditLog } = await import("@/lib/admin-guard.server");
    await assertAdminCtx(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const now = new Date().toISOString();

    // 1. Localizar perfis com trial expirado
    const { data: expiredProfiles, error: fetchError } = await supabaseAdmin
      .from("profiles")
      .select("user_id, full_name, contact_email")
      .not("trial_ends_at", "is", null)
      .lt("trial_ends_at", now);

    if (fetchError) throw new Error("Falha ao buscar contas expiradas");
    if (!expiredProfiles || expiredProfiles.length === 0) {
      return { ok: true, count: 0 };
    }

    const userIds = expiredProfiles.map(p => p.user_id);

    // 2. Revogar licenças
    await supabaseAdmin
      .from("licenses")
      .update({ status: "revoked" })
      .in("user_id", userIds)
      .in("status", ["active", "pending"]);

    // 3. Excluir usuários do Auth (isso apaga o perfil via cascade se configurado, ou limpa os dados)
    let deletedCount = 0;
    for (const userId of userIds) {
      const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(userId);
      if (!deleteError) {
        deletedCount++;
      }
    }

    await auditLog(context, "cleanup_expired_accounts", { 
      found: expiredProfiles.length, 
      deleted: deletedCount 
    });

    return { ok: true, count: deletedCount };
  });
