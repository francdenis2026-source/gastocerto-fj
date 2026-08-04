import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

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
      "enteado", "enteada", "cunhado", "cunhada", "familiar", "parente"
    ];

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

    if (familyKeywords.some(k => desc.includes(k))) {
      return { categoryName: "Outros Familiares" };
    }

    return null;
  });
