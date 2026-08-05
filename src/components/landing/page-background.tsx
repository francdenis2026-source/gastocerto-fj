/**
 * Plano de fundo temático da homepage: imagem realista de finanças
 * com overlays de gradiente para garantir legibilidade absoluta.
 */
export function PageBackground() {
  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 -z-50 bg-[#0A1512]">
      {/* Imagem Temática Realista (Crescimento e Planejamento Financeiro) */}
      <div className="absolute inset-0">
        <img 
          src="https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?q=80&w=2670&auto=format&fit=crop" 
          alt=""
          className="h-full w-full object-cover opacity-20 contrast-125 saturate-[0.8] brightness-[0.4]"
        />
        {/* Overlay de Vinheta para focar no conteúdo central */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,#0A1512_100%)]" />
      </div>
      
      {/* Camada de Profundidade e Cor (Azul marinho profundo para harmonizar) */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#0A1512]/40 via-[#0A1512]/90 to-[#0A1512]" />
      
      {/* Textura de Grão para Aspeto Premium */}
      <div className="absolute inset-0 opacity-[0.05] mix-blend-overlay" 
           style={{ backgroundImage: 'url("https://www.transparenttextures.com/patterns/stardust.png")' }} />
    </div>
  );
}
