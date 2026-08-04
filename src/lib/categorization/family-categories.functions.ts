import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const categorizeSchema = z.object({
  description: z.string(),
  beneficiaryName: z.string().optional(),
  beneficiaryType: z.enum(["adult_child", "family_member", "other"]).optional(),
  amount: z.number().optional(),
});

export const autoCategorizeFamilyExpense = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => categorizeSchema.parse(d))
  .handler(async ({ data }) => {
    // Lógica inteligente de categorização
    const { beneficiaryType, description } = data;
    
    if (beneficiaryType === "adult_child") {
      return { categoryName: "Gastos com Filhos", subCategoryName: "Filho Maior" };
    }
    
    if (beneficiaryType === "family_member") {
      return { categoryName: "Outros Familiares", subCategoryName: "Geral" };
    }
    
    // Heurísticas baseadas em palavras-chave se o beneficiário não foi explícito
    const desc = description.toLowerCase();
    if (desc.includes("filho") || desc.includes("mesada") || desc.includes("faculdade")) {
      return { categoryName: "Gastos com Filhos", subCategoryName: "Educação/Manutenção" };
    }
    
    if (desc.includes("mãe") || desc.includes("pai") || desc.includes("sobrinho") || desc.includes("avó")) {
      return { categoryName: "Outros Familiares", subCategoryName: "Ajuda Familiar" };
    }

    return null;
  });
