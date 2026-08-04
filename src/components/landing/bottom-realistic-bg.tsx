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
        className="hidden size-full object-cover object-top opacity-[0.5] dark:opacity-[0.6] mix-blend-soft-light sm:block"
      />
      <img
        src={bottomMobileBg}
        alt=""
        width={400}
        height={800}
        loading="lazy"
        decoding="async"
        className="size-full object-cover object-top opacity-[0.5] dark:opacity-[0.7] mix-blend-soft-light sm:hidden"
      />
      {/* Transição suave: o topo da imagem desaparece para não brigar com o conteúdo superior */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-background/20 to-transparent h-1/2" />
      <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
    </div>
  );
}
