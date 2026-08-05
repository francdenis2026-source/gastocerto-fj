/**
 * Plano de fundo temático com Blur Equilibrado: imagem realista de finanças
 * com efeito de desfoque sutil para destacar o conteúdo sem esconder a imagem.
 */
export function PageBackground() {
  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 -z-50 bg-black">
      {/* Imagem Temática Realista com Blur Reduzido */}
      <div className="absolute inset-0">
        <img 
          src="https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?q=80&w=2670&auto=format&fit=crop" 
          alt=""
          className="h-full w-full object-cover opacity-45 contrast-115 brightness-[0.35] blur-[3px]"
          style={{ transform: 'scale(1.05)' }} // Escala reduzida para acompanhar o blur menor
        />
        {/* Camada sutil de vinheta para manter o foco no conteúdo central */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.4)_100%)]" />
      </div>
      
      {/* Textura de Grão para Aspeto Premium */}
      <div className="absolute inset-0 opacity-[0.04] mix-blend-overlay" 
           style={{ backgroundImage: 'url("https://www.transparenttextures.com/patterns/stardust.png")' }} />
    </div>
  );
}
