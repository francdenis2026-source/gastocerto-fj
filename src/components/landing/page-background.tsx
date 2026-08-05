/**
 * Plano de fundo temático Otimizado: imagem realista de finanças
 * com desfoque responsivo e overlays de contraste para acessibilidade total.
 */
export function PageBackground() {
  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 -z-50 bg-[#0A1512]">
      {/* Imagem Temática Realista com Blur Adaptativo */}
      <div className="absolute inset-0 overflow-hidden">
        <img 
          src="https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?q=80&w=2670&auto=format&fit=crop" 
          alt=""
          className="h-full w-full object-cover opacity-25 brightness-[0.45] sm:opacity-35 blur-[1px]"
          style={{ transform: 'scale(1.1)' }}
        />
        
        {/* Camadas de Gradiente Dinâmicas Suavizadas */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#0A1512]/60 via-[#0A1512]/20 to-[#0A1512]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_-20%,rgba(31,174,109,0.08)_0%,transparent_70%)] opacity-60" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_0%_100%,rgba(31,174,109,0.05)_0%,transparent_50%)] opacity-40" />
      </div>
      
      {/* Textura de Grão para Aspeto de Filme Premium */}
      <div className="absolute inset-0 opacity-[0.03] mix-blend-overlay" 
           style={{ backgroundImage: 'url("https://www.transparenttextures.com/patterns/stardust.png")' }} />
    </div>
  );
}
