import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

export const checkKidAccountStatus = createServerFn({ method: "GET" })
  .inputValidator((data) => z.object({ kidUserId: z.string() }).parse(data))
  .handler(async ({ data }) => {
    const { data: kid, error: kidErr } = await supabaseAdmin
      .from("dependents")
      .select("user_id, name")
      .eq("kid_user_id", data.kidUserId)
      .maybeSingle();

    if (kidErr || !kid) {
      return { active: false, reason: "kid_not_found" };
    }

    const { data: profile, error: profErr } = await supabaseAdmin
      .from("profiles")
      .select("id, plan_id, trial_ends_at, status")
      .eq("user_id", kid.user_id)
      .maybeSingle();

    if (profErr || !profile) {
      return { active: false, reason: "parent_not_found" };
    }

    // Se o perfil está inativo ou bloqueado
    if (profile.status === 'inactive' || profile.status === 'blocked') {
      return { 
        active: false, 
        readOnly: true, 
        reason: "parent_inactive",
        message: "A conta do seu responsável está inativa ou bloqueada. Novos lançamentos estão suspensos."
      };
    }

    const trialExpired = profile.trial_ends_at ? new Date(profile.trial_ends_at) < new Date() : false;
    
    // Se não tem plano (plan_id nulo) e o trial expirou
    if (!profile.plan_id && trialExpired) {
      return { 
        active: true, 
        readOnly: true, 
        reason: "parent_expired",
        message: "A assinatura do seu responsável expirou. Você ainda pode ver seus dados, mas para fazer novos lançamentos o responsável precisa renovar o plano."
      };
    }

    return { active: true, readOnly: false };
  });
