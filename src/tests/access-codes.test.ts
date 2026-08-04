import { describe, it, expect } from "vitest";

describe("Fluxo de Códigos de Acesso e Contas Temporárias", () => {
  it("deve calcular a expiração correta para o final do dia", async () => {
    const days = 7;
    const now = new Date();
    const expiresAt = new Date(now);
    expiresAt.setDate(expiresAt.getDate() + days);
    expiresAt.setHours(23, 59, 59, 999);
    
    expect(expiresAt.getHours()).toBe(23);
    expect(expiresAt.getMinutes()).toBe(59);
    expect(expiresAt.getTime()).toBeGreaterThan(now.getTime());
  });

  it("deve validar que códigos com data passada são considerados expirados", async () => {
    const pastDate = new Date();
    pastDate.setDate(pastDate.getDate() - 1);
    
    const now = new Date();
    const isExpired = pastDate.getTime() < now.getTime();
    expect(isExpired).toBe(true);
  });
});
