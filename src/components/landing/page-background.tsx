/**
 * Plano de fundo temático da homepage: imagem realista de finanças
 * com overlays de gradiente para garantir legibilidade absoluta.
 */
export function PageBackground() {
  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 -z-50 bg-[#0A1512]">
      {/* Imagem Temática Realista (Fundo de Planejamento Financeiro) */}
      <div className="absolute inset-0">
        <img 
          src="https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?q=80&w=2670&auto=format&fit=crop" 
          alt=""
          className="h-full w-full object-cover opacity-30 contrast-125 saturate-[0.8] brightness-[0.4]"
          style={{ 
            filter: 'grayscale(0.3) contrast(1.1)',
            WebkitFilter: 'grayscale(0.3) contrast(1.1)' 
          }}
        />
        {/* Camada de Gradiente para focar no conteúdo e suavizar bordas */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#0A1512]/30 via-[#0A1512]/80 to-[#0A1512]" />
      </div>
      
      {/* Textura de Grão para Aspeto Premium */}
      <div className="absolute inset-0 opacity-[0.05] mix-blend-overlay" 
           style={{ backgroundImage: 'url("https://www.transparenttextures.com/patterns/stardust.png")' }} />
    </div>
  );
}
