import workspaceBg from "@/assets/hero-bg-desk.jpg";

/**
 * Plano de fundo discreto da homepage: textura fixa com véu sólido,
 * sem brilhos fortes, para preservar contraste do texto.
 */
export function PageBackground() {
  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 -z-50 bg-transparent">
      <div className="absolute inset-0 bg-transparent" />
    </div>
  );
}
