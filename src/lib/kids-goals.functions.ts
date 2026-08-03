import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

export const getKidGoals = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => 
    z.object({ dependentId: z.string().uuid() }).parse(data)
  )
  .handler(async ({ data, context }) => {
    const { data: goals, error } = await supabaseAdmin
      .from("kid_goals")
      .select("*")
      .eq("dependent_id", data.dependentId)
      .is("deleted_at", null)
      .order("created_at", { ascending: false });
    
    if (error) throw error;
    return goals;
  });

export const saveKidGoal = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => 
    z.object({
      id: z.string().uuid().optional(),
      dependentId: z.string().uuid(),
      title: z.string().min(1),
      targetAmount: z.number().positive(),
      period: z.enum(["monthly", "yearly"]),
    }).parse(data)
  )
  .handler(async ({ data, context }) => {
    const { id, dependentId, title, targetAmount, period } = data;
    
    if (id) {
      const { error } = await supabaseAdmin
        .from("kid_goals")
        .update({ title, target_amount: targetAmount, period, updated_at: new Date().toISOString() } as any)
        .eq("id", id);
      if (error) throw error;
    } else {
      const { error } = await supabaseAdmin
        .from("kid_goals")
        .insert({ dependent_id: dependentId, title, target_amount: targetAmount, period } as any);
      if (error) throw error;
    }
    
    return { success: true };
  });

export const deleteKidGoal = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => 
    z.object({ id: z.string().uuid() }).parse(data)
  )
  .handler(async ({ data }) => {
    const { error } = await supabaseAdmin
      .from("kid_goals")
      .update({ deleted_at: new Date().toISOString() } as any)
      .eq("id", data.id);
    if (error) throw error;
    return { success: true };
  });

export const updateKidSettings = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => 
    z.object({
      dependentId: z.string().uuid(),
      lowBalanceAlertThreshold: z.number().optional().nullable(),
    }).parse(data)
  )
  .handler(async ({ data, context }) => {
    const { error } = await supabaseAdmin
      .from("dependents")
      .update({ 
        monthly_limit: data.lowBalanceAlertThreshold 
      } as any)
      .eq("id", data.dependentId)
      .eq("user_id", context.userId);
    
    if (error) throw error;
    return { success: true };
  });
