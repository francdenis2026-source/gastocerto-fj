/**
 * GastoCerto Global Constants
 */

export const APP_NAME = "GastoCerto";
export const APP_DESCRIPTION = "Controle hoje, tranquilidade sempre";

export const COLORS = {
  primary: "#1FAE6D",
  background: "#001640",
  accent: "#D4AF6A",
};

export const DEFAULT_CURRENCY = "BRL";
export const DEFAULT_LOCALE = "pt-BR";

export const PLAN_TIERS = {
  FREE: "FREE",
  TRIAL: "TRIAL",
  BASIC: "BASIC",
  PRO: "PRO",
} as const;

export const TRANSACTION_TYPES = {
  EXPENSE: "expense",
  INCOME: "income",
  TRANSFER: "transfer",
} as const;
