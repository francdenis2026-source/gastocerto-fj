/**
 * Configuração por criança: o responsável escolhe o que aparece no painel Kids.
 * O restante fica oculto para a criança.
 */

export type KidVisibility = {
  balance: boolean;
  income: boolean;
  goals: boolean;
  history: boolean;
  siblings: boolean;
};

export const DEFAULT_KID_VISIBILITY: KidVisibility = {
  balance: true,
  income: true,
  goals: true,
  history: true,
  siblings: true,
};

export const KID_VISIBILITY_FIELDS: { key: keyof KidVisibility; label: string; hint: string }[] = [
  { key: "balance", label: "Saldo mágico", hint: "Mostra quanto ela tem disponível." },
  { key: "income", label: "Ganhos e gastos", hint: "Cartões de quanto ganhou e gastou." },
  { key: "goals", label: "Metas de poupança", hint: "Progresso das metas e prêmios." },
  { key: "history", label: "Histórico", hint: "Lista dos lançamentos dela." },
  { key: "siblings", label: "Avatares dos irmãos", hint: "Mostra os irmãos cadastrados." },
];

/** Normaliza o JSON salvo no banco, aplicando os padrões seguros. */
export function parseKidVisibility(value: unknown): KidVisibility {
  if (!value || typeof value !== "object") return { ...DEFAULT_KID_VISIBILITY };
  const raw = value as Record<string, unknown>;
  const result = { ...DEFAULT_KID_VISIBILITY };
  for (const field of KID_VISIBILITY_FIELDS) {
    if (typeof raw[field.key] === "boolean") result[field.key] = raw[field.key] as boolean;
  }
  return result;
}

export const KID_ACCESS_ACTION_LABELS: Record<string, string> = {
  created: "Código criado",
  updated: "Código/senha trocados",
  rotated: "Código rotacionado",
  revoked: "Acesso revogado",
  visibility: "Permissões alteradas",
};

/** Rótulo amigável para a validade do código. */
export function describeKidCodeExpiry(expiresAt: string | null | undefined): {
  label: string;
  expired: boolean;
} {
  if (!expiresAt) return { label: "Sem validade definida", expired: false };
  const date = new Date(expiresAt);
  const expired = date.getTime() < Date.now();
  return {
    label: expired
      ? `Expirado em ${date.toLocaleDateString("pt-BR")}`
      : `Válido até ${date.toLocaleDateString("pt-BR")} ${date.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}`,
    expired,
  };
}
