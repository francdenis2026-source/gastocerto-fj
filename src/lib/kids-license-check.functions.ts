import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

export type KidAccountStatus = {
  active: boolean;
  readOnly?: boolean;
  reason?: "kid_not_found" | "parent_not_found" | "parent_inactive" | "parent_expired";
  message?: string;
};

export const checkKidAccountStatus = createServerFn({ method: "GET" })
  .inputValidator((data) => z.object({ kidUserId: z.string() }).parse(data))
  .handler(async ({ data }): Promise<KidAccountStatus> => {
    const { data: kid, error: kidErr } = await supabaseAdmin
      .from("dependents")
      .select("user_id, name, id")
      .eq("kid_user_id", data.kidUserId)
      .maybeSingle();

    if (kidErr || !kid) {
      return { active: false, reason: "kid_not_found" };
    }

    const { data: profile, error: profErr } = await supabaseAdmin
      .from("profiles")
      .select("id, plan_id, trial_ends_at, status, plan_tier, has_paid_license, trial_plan_slug, paid_plan_slug")
      .eq("user_id", kid.user_id)
      .maybeSingle();

    if (profErr || !profile) {
      return { active: false, reason: "parent_not_found" };
    }

    if (profile.status === 'inactive' || profile.status === 'blocked') {
      return { 
        active: false, 
        readOnly: true, 
        reason: "parent_inactive",
        message: "A conta do seu responsável está inativa ou bloqueada. Novos lançamentos estão suspensos."
      };
    }

    // Integração com o resolvePlanAccess para garantir consistência total com o app principal.
    const { resolvePlanAccess } = await import("./plan-features");
    const access = resolvePlanAccess({
      planSlug: profile.plan_id,
      planTier: (profile as any).plan_tier,
      trialEndsAt: profile.trial_ends_at,
      hasPaidLicense: (profile as any).has_paid_license,
      trialPlanSlug: (profile as any).trial_plan_slug,
      paidPlanSlug: (profile as any).paid_plan_slug,
      isAdmin: false,
    });

    if (access.readOnly) {
      return { 
        active: true, 
        readOnly: true, 
        reason: "parent_expired",
        message: access.readOnlyReason || "A assinatura do seu responsável expirou. Você ainda pode ver seus dados, mas para fazer novos lançamentos o responsável precisa renovar o plano."
      };
    }

    return { active: true, readOnly: false };
  });

