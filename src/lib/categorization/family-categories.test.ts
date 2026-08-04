import { describe, it, expect } from "vitest";
import { autoCategorizeFamilyExpense } from "./family-categories.functions";

describe("autoCategorizeFamilyExpense", () => {
  it("should categorize 'mesada' as Filhos > Gastos com Filhos", async () => {
    const result = await autoCategorizeFamilyExpense({ data: { description: "mesada do enzo" } });
    expect(result).toEqual({ categoryName: "Filhos", subCategoryName: "Gastos com Filhos" });
  });

  it("should categorize 'pai' as Outros Familiares", async () => {
    const result = await autoCategorizeFamilyExpense({ data: { description: "remedio para o pai" } });
    expect(result).toEqual({ categoryName: "Outros Familiares" });
  });

  it("should honor explicit beneficiaryType 'adult_child'", async () => {
    const result = await autoCategorizeFamilyExpense({ 
      data: { description: "compra", beneficiaryType: "adult_child" } 
    });
    expect(result).toEqual({ categoryName: "Filhos", subCategoryName: "Gastos com Filhos" });
  });

  it("should return null for unrelated descriptions", async () => {
    const result = await autoCategorizeFamilyExpense({ data: { description: "supermercado" } });
    expect(result).toBeNull();
  });
});
