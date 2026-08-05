/**
 * Plano de fundo temático Otimizado: imagem realista de finanças
 * com desfoque responsivo e overlays de contraste para acessibilidade total.
 */
export function PageBackground() {
  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 -z-50 bg-[#0A1512]">
      {/* Imagem Temática Realista com Blur Adaptativo */}
      <div className="absolute inset-0">
        <img 
          src="https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?q=80&w=2670&auto=format&fit=crop" 
          alt=""
          className="h-full w-full object-cover opacity-35 contrast-110 brightness-[0.3] sm:opacity-45 blur-[2px] sm:blur-[3px]"
          style={{ transform: 'scale(1.05)' }}
        />
        
        {/* Camada de Gradiente Estratégico para Acessibilidade (Contraste de Texto) */}
        {/* Escurece as áreas onde o texto costuma ficar para garantir WCAG AA/AAA */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#0A1512]/40 via-[#0A1512]/20 to-[#0A1512]/90" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0A1512]/60 via-transparent to-[#0A1512]/60" />
      </div>
      
      {/* Textura de Grão para Aspeto Premium */}
      <div className="absolute inset-0 opacity-[0.04] mix-blend-overlay" 
           style={{ backgroundImage: 'url("https://www.transparenttextures.com/patterns/stardust.png")' }} />
    </div>
  );
}
