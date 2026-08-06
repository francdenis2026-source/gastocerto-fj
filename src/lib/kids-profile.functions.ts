import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export const updateDependentProfile = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) => z.object({
    id: z.string(),
    gender: z.enum(['boy', 'girl', 'other']),
    avatarUrl: z.string().optional()
  }).parse(data))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase
      .from("dependents")
      .update({
        gender: data.gender,
        avatar_url: data.avatarUrl || null
      })
      .eq("id", data.id)
      .eq("user_id", context.userId);

    if (error) throw error;
    return { success: true };
  });
