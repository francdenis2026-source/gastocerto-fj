/**
 * Plano de fundo temático da homepage: imagem realista de finanças
 * com overlays de gradiente para garantir legibilidade absoluta.
 */
export function PageBackground() {
  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 -z-50 bg-[#0A1512]">
      {/* Imagem Temática Realista (Planejamento Financeiro Doméstico) */}
      <img 
        src="https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?q=80&w=2671&auto=format&fit=crop" 
        alt=""
        className="h-full w-full object-cover opacity-[0.07] contrast-125 saturate-0"
      />
      
      {/* Camada de Profundidade e Cor */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#0A1512]/60 via-[#0A1512]/95 to-[#0A1512]" />
      
      {/* Textura de Grão para Aspeto Premium */}
      <div className="absolute inset-0 opacity-[0.03] mix-blend-overlay" 
           style={{ backgroundImage: 'url("https://www.transparenttextures.com/patterns/stardust.png")' }} />
    </div>
  );
}
