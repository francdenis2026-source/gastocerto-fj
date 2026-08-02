/** Helpers de servidor para o acesso independente das crianças. */

export function traduzirErroKid(message: string): string {
  if (/already been registered|already exists|duplicate/i.test(message)) {
    return "Este código já está em uso. Escolha outro.";
  }
  return message;
}

export const KID_MAX_ATTEMPTS_SERVER = 5;
export const KID_LOCK_MINUTES_SERVER = 10;
