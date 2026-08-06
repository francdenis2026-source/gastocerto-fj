import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/lib/integrations/supabase/auth-middleware";
import { categorizeLogic } from "@/lib/family-categories-logic";

const categorizationInput = z.object({
  description: z.string(),
  beneficiaryType: z.enum(["adult_child", "family_member"]).optional()
});

export const autoCategorizeFamilyExpense = createServerFn({ method: "POST" })
  .validator((data: unknown) => categorizationInput.parse(data))
  .handler(async ({ data }) => {
    return categorizeLogic(data.description, data.beneficiaryType);
  });


export const updateTransactionBeneficiary = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => z.object({
    transactionId: z.string().uuid(),
    beneficiaryType: z.enum(["adult_child", "family_member", "none"]),
    beneficiaryName: z.string().optional()
  }).parse(data))
  .handler(async ({ data, context }) => {
    const { supabase } = context;
    
    // Como ainda não temos colunas específicas no DB, anexamos às notas
    const { data: transaction } = await supabase
      .from("transactions")
      .select("notes")
      .eq("id", data.transactionId)
      .single();
      
    if (!transaction) throw new Error("Transação não encontrada");

    let notes = (transaction as any).notes || "";
    if (data.beneficiaryType !== "none" && data.beneficiaryName) {
      const prefix = data.beneficiaryType === "adult_child" ? "[Filho Maior]" : "[Outro Familiar]";
      if (!notes.includes(prefix)) {
        notes = `${prefix} ${data.beneficiaryName}${notes ? ` - ${notes}` : ""}`;
      }
    }

    const { error } = await supabase
      .from("transactions")
      .update({ 
        notes,
      } as any)
      .eq("id", data.transactionId);

    if (error) throw error;
    return { ok: true };
  });
