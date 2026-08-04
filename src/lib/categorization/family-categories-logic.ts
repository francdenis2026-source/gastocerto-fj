// Função pura para testar a lógica de categorização sem depender do contexto de servidor
export function categorizeLogic(description: string, beneficiaryType?: string) {
  const desc = description.toLowerCase();
  
  const childKeywords = [
    "mesada", "presente", "roupa", "tenis", "escola", "faculdade", 
    "curso", "brinquedo", "game", "jogo", "cinema", "lanche", 
    "transferencia", "pix", "filho", "filha", "neto", "neta"
  ];

  const familyKeywords = [
    "pai", "mãe", "mae", "tio", "tia", "sobrinho", "sobrinha", 
    "avô", "avó", "avo", "esposo", "esposa", "marido", "mulher", 
    "enteado", "enteada", "cunhado", "cunhada", "familiar", "parente",
    "primo", "prima", "vovô", "vovó"
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

  if (beneficiaryType === "adult_child") {
    return { categoryName: "Filhos", subCategoryName: "Gastos com Filhos" };
  }
  
  if (beneficiaryType === "family_member") {
    return { categoryName: "Outros Familiares", subCategoryName: "Geral" };
  }

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
}
