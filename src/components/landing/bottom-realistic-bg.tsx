import bottomBg from "@/assets/hero-bg-real.jpg";
import bottomMobileBg from "@/assets/hero-bg-real-mobile.jpg";

/**
 * Imagem de fundo realista para a seção inferior da página.
 * Posicionada de forma a preencher o rodapé e áreas adjacentes.
 */
export function BottomRealisticBg() {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute bottom-0 left-0 right-0 -z-40 h-[1000px] overflow-hidden">
      <img
        src={bottomBg}
        alt=""
        width={1920}
        height={1080}
        loading="lazy"
        decoding="async"
        className="hidden size-full object-cover object-top opacity-[0.08] dark:opacity-[0.12] sm:block"
      />
      <img
        src={bottomMobileBg}
        alt=""
        width={400}
        height={800}
        loading="lazy"
        decoding="async"
        className="size-full object-cover object-top opacity-[0.08] dark:opacity-[0.15] sm:hidden"
      />
      {/* Véu suave para integração com o fundo escuro */}
      <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
      <div className="absolute inset-0 bg-background/20" />
    </div>
  );
}
