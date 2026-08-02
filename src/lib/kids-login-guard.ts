/**
 * Bloqueio temporário do login infantil: 5 tentativas erradas travam o código
 * por 10 minutos. O controle real fica no servidor (tabela kid_login_attempts),
 * aqui ficam apenas as constantes e as mensagens.
 */

export const KID_MAX_ATTEMPTS = 5;
export const KID_LOCK_MINUTES = 10;

export function kidLockMessage(secondsLeft: number): string {
  const minutes = Math.max(1, Math.ceil(secondsLeft / 60));
  return `Muitas tentativas erradas. Espere ${minutes} minuto${minutes > 1 ? "s" : ""} e tente de novo, ou peça ajuda ao responsável.`;
}

export function kidRemainingMessage(remaining: number): string {
  if (remaining <= 0) return "Código ou senha incorretos.";
  return `Código ou senha incorretos. Você ainda tem ${remaining} tentativa${remaining > 1 ? "s" : ""}.`;
}
