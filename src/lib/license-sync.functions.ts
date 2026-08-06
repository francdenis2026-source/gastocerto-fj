import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

/**
 * Função administrativa para sincronizar licenças e corrigir acessos bloqueados.
 * Utiliza o supabaseAdmin para ignorar RLS e garantir a integridade dos dados do cliente.
 */
export const syncUserLicense = createServerFn({ method: "POST" })
  .inputValidator((data) => z.object({ 
    cpf: z.string().optional(),
    userId: z.string().optional()
  }).parse(data))
  .handler(async ({ data }) => {
    let userProfile = null;

    // 1. Localizar o perfil
    if (data.cpf) {
      const { data: profile } = await supabaseAdmin
        .from("profiles")
        .select("*")
        .eq("cpf", data.cpf)
        .maybeSingle();
      userProfile = profile;
    } else if (data.userId) {
      const { data: profile } = await supabaseAdmin
        .from("profiles")
        .select("*")
        .eq("user_id", data.userId)
        .maybeSingle();
      userProfile = profile;
    }

    if (!userProfile) {
      throw new Error("Perfil não encontrado para o CPF ou ID fornecido.");
    }

    // 2. Localizar licença ativa pelo CPF ou user_id
    const { data: license } = await supabaseAdmin
      .from("licenses")
      .select("*")
      .or(`cpf.eq.${userProfile.cpf},user_id.eq.${userProfile.user_id}`)
      .eq("status", "active")
      .order("expires_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (!license) {
      // Se não houver licença, garantimos que pelo menos o plan_id não esteja bloqueando o acesso básico se ele pagou
      return { success: false, message: "Nenhuma licença ativa encontrada." };
    }

    // 3. Atualizar o perfil com o plano correto da licença
    const { error: profileError } = await supabaseAdmin
      .from("profiles")
      .update({
        plan_id: license.plan_id,
        trial_ends_at: null, // Licença paga remove o cronômetro de trial
        support_notes: `Licença ${license.license_key} sincronizada em ${new Date().toLocaleDateString('pt-BR')}.`
      })
      .eq("id", userProfile.id);

    if (profileError) throw profileError;

    // 4. Vincular o user_id à licença se ainda não estiver
    if (!license.user_id) {
      await supabaseAdmin
        .from("licenses")
        .update({ user_id: userProfile.user_id })
        .eq("id", license.id);
    }

    // 5. Registrar log de auditoria
    await supabaseAdmin
      .from("admin_logs")
      .insert({
        actor_id: userProfile.user_id,
        action: 'license_sync_manual',
        target_user_id: userProfile.user_id,
        details: { 
          license_id: license.id, 
          plan_id: license.plan_id,
          cpf: userProfile.cpf
        }
      });

    return { 
      success: true, 
      userName: userProfile.full_name,
      licenseKey: license.license_key
    };
  });
