import workspaceBg from "@/assets/hero-bg-real.jpg";

/**
 * Plano de fundo discreto da homepage: textura fixa com véu sólido,
 * sem brilhos fortes, para preservar contraste do texto.
 */
export function PageBackground() {
  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 -z-50">
      <img
        src={workspaceBg}
        alt=""
        width={1920}
        height={1080}
        loading="lazy"
        decoding="async"
        className="size-full object-cover opacity-[0.015] dark:opacity-[0.08]"
      />
      <div className="absolute inset-0 bg-background/94 dark:bg-background/88" />
    </div>
  );
}
