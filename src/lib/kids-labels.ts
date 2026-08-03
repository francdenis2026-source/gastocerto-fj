/**
 * Rótulos padronizados para diferenciar, em todo o site, o dinheiro que a
 * criança RECEBEU do responsável ("Ganho recebido") do dinheiro que a criança
 * GASTOU por conta própria ("Gasto do filho").
 */

export const KID_LABELS = {
  received: "Ganho recebido",
  kidExpense: "Gasto do filho",
  parentExpense: "Gasto do responsável",
  goal: "Reserva / meta",
} as const;

export type KidEntryKind = "received" | "kidExpense" | "parentExpense";

export function kidEntryKind(row: {
  tags?: string[] | null;
  transaction_type?: string | null;
}): KidEntryKind {
  const tags = row.tags ?? [];
  const isIncome = row.transaction_type === "income";

  if (tags.includes("kid_self_expense")) {
    return isIncome ? "received" : "kidExpense";
  }
  
  if (tags.some((t) => t.startsWith("from_parent") || t.startsWith("parent_desc:"))) {
    return "received";
  }
  return isIncome ? "received" : "parentExpense";
}

export function kidEntryLabel(row: { tags?: string[] | null; transaction_type?: string | null }) {
  return KID_LABELS[kidEntryKind(row)];
}

/** Classes semânticas de cor por tipo de lançamento (bom contraste nos 2 temas). */
export function kidEntryTone(kind: KidEntryKind) {
  if (kind === "received") return "text-emerald-600 dark:text-emerald-400";
  if (kind === "kidExpense") return "text-rose-600 dark:text-rose-400";
  return "text-amber-600 dark:text-amber-400";
}

/** Origem/destino legível de um lançamento vinculado a um filho. */
export function kidEntryFlow(kind: KidEntryKind, kidName?: string | null) {
  const name = kidName?.trim() || "filho";
  if (kind === "received") return `Responsável → ${name}`;
  if (kind === "kidExpense") return `${name} → estabelecimento`;
  return `Responsável → gasto com ${name}`;
}

/** Tipos de envio (tags "type:*") em texto claro. */
export const KID_SEND_TYPES: Record<string, string> = {
  pix: "PIX",
  cash: "Dinheiro",
  gift: "Presente",
  allowance: "Mesada",
};

export function kidSendTypeLabel(tags?: string[] | null) {
  const tag = (tags ?? []).find((t) => t.startsWith("type:"));
  if (!tag) return null;
  const key = tag.slice(5);
  return KID_SEND_TYPES[key] ?? key;
}

export type SyncStatus = { label: string; description: string; ok: boolean };

/** Status de sincronização entre o painel dos pais e o Espaço Kids. */
export function syncStatusFor(row: { tags?: string[] | null }): SyncStatus {
  const tags = row.tags ?? [];
  const mirrored = tags.some((t) => t.startsWith("origin:"));
  if (tags.includes("kid_self_expense")) {
    return {
      label: "Informativo",
      description: "Registrado pelo filho. Aparece para o responsável, mas não entra nos cálculos.",
      ok: true,
    };
  }
  if (mirrored) {
    return {
      label: "Sincronizado",
      description: "Espelhado automaticamente no Espaço Kids.",
      ok: true,
    };
  }
  if (tags.some((t) => t.startsWith("dependente:"))) {
    return {
      label: "Aguardando sincronização",
      description: "O espelho no Espaço Kids é criado em instantes.",
      ok: false,
    };
  }
  return { label: "Local", description: "Lançamento apenas no painel do responsável.", ok: true };
}
