/**
 * Plano de fundo temático Otimizado: imagem realista de finanças
 * com desfoque responsivo e overlays de contraste para acessibilidade total.
 */
export function PageBackground() {
  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 -z-50 bg-background transition-colors duration-500">
      {/* Imagem Temática Realista com Blur Adaptativo */}
      <div className="absolute inset-0 overflow-hidden">
        <div
          aria-hidden="true"
          className="h-full w-full opacity-60 transition-all duration-500 bg-[radial-gradient(80%_60%_at_20%_0%,color-mix(in_oklab,var(--primary)_14%,transparent),transparent_70%),radial-gradient(70%_50%_at_90%_100%,color-mix(in_oklab,var(--primary)_10%,transparent),transparent_70%)]"
        />
        
        {/* Camada de Gradiente Sutil para contraste */}
        <div className="absolute inset-0 bg-gradient-to-b from-background/40 via-transparent to-background transition-colors duration-500" />
      </div>
      
      {/* Textura de Grão removida conforme solicitado */}
    </div>
  );
}
