/**
 * Acesso independente da criança: ela entra na tela inicial com um CÓDIGO
 * (definido pelo responsável) e uma senha de 4 a 6 dígitos, sem precisar de
 * CPF nem e-mail. O código é convertido em um endereço técnico interno.
 */

export const KID_EMAIL_DOMAIN = "kids.gastocerto.app";

/** Normaliza o código: maiúsculas, sem espaços e apenas letras, números e hífen. */
export function normalizeKidCode(value: string): string {
  return (value ?? "")
    .toUpperCase()
    .replace(/[^A-Z0-9-]/g, "")
    .slice(0, 20);
}

export function isValidKidCode(value: string): boolean {
  const code = normalizeKidCode(value);
  return code.length >= 4 && /^[A-Z0-9][A-Z0-9-]*[A-Z0-9]$/.test(code);
}

export function kidCodeToEmail(code: string): string {
  return `${normalizeKidCode(code).toLowerCase()}@${KID_EMAIL_DOMAIN}`;
}

export function isKidLoginEmail(email: string | null | undefined): boolean {
  return Boolean(email && email.toLowerCase().endsWith(`@${KID_EMAIL_DOMAIN}`));
}

/** Senha real enviada ao provedor: o PIN sozinho seria fraco demais. */
export function kidPassword(code: string, pin: string): string {
  return `GCK.${normalizeKidCode(code)}.${(pin ?? "").replace(/\D/g, "")}`;
}

export function isValidKidPin(pin: string): boolean {
  const digits = (pin ?? "").replace(/\D/g, "");
  return digits.length >= 4 && digits.length <= 6;
}

/** Sugere um código fácil de digitar a partir do nome da criança. */
export function suggestKidCode(name: string): string {
  const base = normalizeKidCode(name.replace(/\s+/g, "")).slice(0, 6) || "KID";
  const random = Math.random().toString(36).toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 3);
  return `${base}-${random || "001"}`;
}
