import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

export const getKidGoals = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => z.object({
    kidUserId: z.string().uuid(),
  }).parse(data))
  .handler(async ({ data }) => {
    const { data: goals, error } = await supabaseAdmin
      .from("kids_savings_goals" as any)
      .select("*")
      .eq("user_id", data.kidUserId)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return goals;
  });

export const updateKidGoal = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => z.object({
    goalId: z.string().uuid(),
    currentAmount: z.number().min(0),
  }).parse(data))
  .handler(async ({ data }) => {
    const { error } = await supabaseAdmin
      .from("kids_savings_goals" as any)
      .update({ current_amount: data.currentAmount })
      .eq("id", data.goalId);

    if (error) throw error;
    return { success: true };
  });
