import { format, parseISO, startOfMonth, endOfMonth, isWithinInterval } from "date-fns";
import { ptBR } from "date-fns/locale";

export const formatDate = (date: string | Date, pattern = "dd/MM/yyyy") => {
  const d = typeof date === "string" ? parseISO(date) : date;
  return format(d, pattern, { locale: ptBR });
};

export const formatCurrency = (value: number) => {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
};

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
};
