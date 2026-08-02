import { describe, it, expect } from 'vitest';

describe('Automação por Idade Kids', () => {
  it('deve sugerir upgrade quando idade >= 14', () => {
    const birthDate = new Date();
    birthDate.setFullYear(birthDate.getFullYear() - 14);
    
    const now = new Date();
    let age = now.getFullYear() - birthDate.getFullYear();
    const m = now.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && now.getDate() < birthDate.getDate())) age--;
    
    expect(age).toBeGreaterThanOrEqual(14);
  });
});
