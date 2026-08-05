/**
 * Plano de fundo temático com Blur: imagem realista de finanças
 * com efeito de desfoque para destacar o conteúdo do site sem overlays coloridos.
 */
export function PageBackground() {
  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 -z-50 bg-black">
      {/* Imagem Temática Realista com Blur */}
      <div className="absolute inset-0">
        <img 
          src="https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?q=80&w=2670&auto=format&fit=crop" 
          alt=""
          className="h-full w-full object-cover opacity-40 contrast-110 brightness-[0.3] blur-[6px]"
          style={{ transform: 'scale(1.1)' }} // Escala para evitar bordas brancas no blur
        />
        {/* Camada sutil de gradiente apenas para profundidade, sem cor verde */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/60" />
      </div>
      
      {/* Textura de Grão para Aspeto Premium */}
      <div className="absolute inset-0 opacity-[0.03] mix-blend-overlay" 
           style={{ backgroundImage: 'url("https://www.transparenttextures.com/patterns/stardust.png")' }} />
    </div>
  );
}
