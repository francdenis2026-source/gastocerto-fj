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
      .select("plan, trial_expires_at")
      .eq("id", kid.user_id)
      .maybeSingle();

    if (profErr || !profile) {
      return { active: false, reason: "parent_not_found" };
    }

    const isFree = profile.plan === 'free';
    const trialExpired = profile.trial_expires_at ? new Date(profile.trial_expires_at) < new Date() : false;
    
    if (!isFree && trialExpired) {
      return { 
        active: true, 
        readOnly: true, 
        reason: "parent_expired",
        message: "A assinatura do seu responsável expirou. Você ainda pode ver seus dados, mas para fazer novos lançamentos o responsável precisa renovar o plano."
      };
    }

    return { active: true, readOnly: false };
  });
