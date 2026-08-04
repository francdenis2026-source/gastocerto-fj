import { describe, it, expect } from "vitest";
import { categorizeLogic } from "./family-categories-logic";

describe("categorizeLogic", () => {
  it("should categorize 'mesada' as Filhos > Gastos com Filhos", () => {
    const result = categorizeLogic("mesada do enzo");
    expect(result).toEqual({ categoryName: "Filhos", subCategoryName: "Gastos com Filhos" });
  });

  it("should categorize 'pai' correctly with subcategory", () => {
    const result = categorizeLogic("remedio para o pai");
    expect(result).toEqual({ categoryName: "Outros Familiares", subCategoryName: "Pai" });
  });

  it("should honor explicit beneficiaryType 'adult_child'", () => {
    const result = categorizeLogic("compra", "adult_child");
    expect(result).toEqual({ categoryName: "Filhos", subCategoryName: "Gastos com Filhos" });
  });

  it("should return null for unrelated descriptions", () => {
    const result = categorizeLogic("supermercado");
    expect(result).toBeNull();
  });

  it("should identify specific family members like 'tio'", () => {
    const result = categorizeLogic("presente para o tio");
    expect(result).toEqual({ categoryName: "Outros Familiares", subCategoryName: "Tio/Tia" });
  });
});
EOF
