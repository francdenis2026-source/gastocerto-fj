/**
 * Plano de fundo temático Otimizado: imagem realista de finanças
 * com desfoque responsivo e overlays de contraste para acessibilidade total.
 */
export function PageBackground() {
  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 -z-50 bg-background transition-colors duration-500">
      {/* Imagem Temática Realista com Blur Adaptativo */}
      <div className="absolute inset-0 overflow-hidden">
        <img 
          src="https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?q=80&w=2670&auto=format&fit=crop" 
          alt=""
          className="h-full w-full object-cover opacity-10 brightness-[1.0] dark:opacity-25 dark:brightness-[0.45] sm:opacity-15 dark:sm:opacity-35 blur-[1px] transition-all duration-500"
          style={{ transform: 'scale(1.1)' }}
        />
        
        {/* Camada de Gradiente Sutil para contraste */}
        <div className="absolute inset-0 bg-gradient-to-b from-background/40 via-transparent to-background transition-colors duration-500" />
      </div>
      
      {/* Textura de Grão para Aspeto de Filme Premium */}
      <div className="absolute inset-0 opacity-[0.03] mix-blend-overlay" 
           style={{ backgroundImage: 'url("https://www.transparenttextures.com/patterns/stardust.png")' }} />
    </div>
  );
}
