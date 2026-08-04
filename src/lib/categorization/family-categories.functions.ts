import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const categorizationInput = z.object({
  description: z.string(),
  beneficiaryType: z.enum(["adult_child", "family_member"]).optional()
});

export const autoCategorizeFamilyExpense = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => categorizationInput.parse(data))
  .handler(async ({ data }) => {
    const desc = data.description.toLowerCase();
    
    // Palavras-chave para "Gastos com Filhos"
    const childKeywords = [
      "mesada", "presente", "roupa", "tenis", "escola", "faculdade", 
      "curso", "brinquedo", "game", "jogo", "cinema", "lanche", 
      "transferencia", "pix", "filho", "filha", "neto", "neta"
    ];

    // Palavras-chave para "Outros Familiares"
    const familyKeywords = [
      "pai", "mãe", "mae", "tio", "tia", "sobrinho", "sobrinha", 
      "avô", "avó", "avo", "esposo", "esposa", "marido", "mulher", 
      "enteado", "enteada", "cunhado", "cunhada", "familiar", "parente",
      "sobrinho", "sobrinha", "tio", "tia", "primo", "prima", "vovô", "vovó"
    ];

    const familySubcategories: Record<string, string> = {
      "pai": "Pai",
      "mãe": "Mãe",
      "mae": "Mãe",
      "tio": "Tio/Tia",
      "tia": "Tio/Tia",
      "sobrinho": "Sobrinho(a)",
      "sobrinha": "Sobrinho(a)",
      "esposo": "Cônjuge",
      "esposa": "Cônjuge",
      "marido": "Cônjuge",
      "mulher": "Cônjuge",
      "enteado": "Enteado(a)",
      "enteada": "Enteado(a)",
      "avô": "Avô(ó)",
      "avó": "Avô(ó)",
      "avo": "Avô(ó)",
    };

    // Se o usuário explicitamente marcou o tipo de beneficiário
    if (data.beneficiaryType === "adult_child") {
      return { categoryName: "Filhos", subCategoryName: "Gastos com Filhos" };
    }
    
    if (data.beneficiaryType === "family_member") {
      return { categoryName: "Outros Familiares" };
    }

    // Detecção automática por palavras-chave
    if (childKeywords.some(k => desc.includes(k))) {
      return { categoryName: "Filhos", subCategoryName: "Gastos com Filhos" };
    }

    const matchedFamilyKey = familyKeywords.find(k => desc.includes(k));
    if (matchedFamilyKey) {
      return { 
        categoryName: "Outros Familiares", 
        subCategoryName: familySubcategories[matchedFamilyKey] || "Geral" 
      };
    }

    return null;
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
