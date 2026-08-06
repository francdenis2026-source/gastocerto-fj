import { format, parseISO, startOfMonth, endOfMonth, isWithinInterval } from "date-fns";
import { ptBR } from "date-fns/locale";

const currencyFormatter = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

/** Formata um valor em Real brasileiro: R$ 1.234,56 */
export function formatCurrency(value: number): string {
  if (!Number.isFinite(value)) return currencyFormatter.format(0);
  return currencyFormatter.format(value);
}

/** Formata data no padrão DD/MM/AAAA ou padrão customizado. */
export function formatDate(date: string | Date, pattern = "dd/MM/yyyy") {
  if (!date) return "";
  const d = typeof date === "string" ? parseISO(date) : date;
  if (Number.isNaN(d.getTime())) return "";
  return format(d, pattern, { locale: ptBR });
}

export const getMonthInterval = (date: Date) => {
  return {
    start: format(startOfMonth(date), "yyyy-MM-dd"),
    end: format(endOfMonth(date), "yyyy-MM-dd"),
  };
};

export const isDateInInterval = (date: string, start: string, end: string) => {
  return isWithinInterval(parseISO(date), {
    start: parseISO(start),
    end: parseISO(end),
  });
}

/** Converte valores monetários para centavos inteiros. */
export function toCents(value: number): number {
  return Math.round(value * 100);
}

/** Converte centavos inteiros de volta para reais. */
export function fromCents(cents: number): number {
  return cents / 100;
}

