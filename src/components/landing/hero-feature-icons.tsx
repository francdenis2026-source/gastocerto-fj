import { cn } from "@/lib/utils";

type IconProps = { className?: string };

/** IA Financeira — núcleo neural com nós orbitais */
export function AiFinanceIcon({ className }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn("size-4 stroke-current", className)}
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="3" className="fill-current/20" />
      <path d="M12 9V4.5M12 15v4.5M9 12H4.5M15 12h4.5" />
      <path d="M9.7 9.7 6.5 6.5M14.3 14.3l3.2 3.2M14.3 9.7l3.2-3.2M9.7 14.3l-3.2 3.2" opacity="0.55" />
      <circle cx="12" cy="3" r="1.2" />
      <circle cx="21" cy="12" r="1.2" />
      <circle cx="3" cy="12" r="1.2" />
      <circle cx="12" cy="21" r="1.2" />
    </svg>
  );
}

/** Espaço Kids — cofrinho lúdico com moeda */
export function KidsSpaceIcon({ className }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn("size-4 stroke-current", className)}
      aria-hidden="true"
    >
      <path d="M4 13a7 7 0 0 1 7-7h2a7 7 0 0 1 7 7v1a3 3 0 0 1-3 3H7a3 3 0 0 1-3-3z" />
      <path d="M7 17v2.5M17 17v2.5" />
      <path d="M10 9h4" />
      <circle cx="16.5" cy="12" r="0.9" className="fill-current" stroke="none" />
      <path d="M20 10.5h1.5a1.5 1.5 0 0 1 0 3H20" opacity="0.6" />
    </svg>
  );
}

/** Multi-Contas — camadas de carteiras empilhadas */
export function MultiAccountIcon({ className }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn("size-4 stroke-current", className)}
      aria-hidden="true"
    >
      <rect x="3" y="9" width="18" height="11" rx="3" className="fill-current/15" />
      <path d="M5.5 9V7.5A2.5 2.5 0 0 1 8 5h8a2.5 2.5 0 0 1 2.5 2.5V9" opacity="0.6" />
      <path d="M7.5 5V4a1.5 1.5 0 0 1 1.5-1.5h6A1.5 1.5 0 0 1 16.5 4v1" opacity="0.35" />
      <path d="M14 14.5h4" />
      <circle cx="9" cy="14.5" r="1.4" />
    </svg>
  );
}
