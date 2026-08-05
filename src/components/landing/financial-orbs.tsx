import { cn } from "@/lib/utils";

/**
 * Novo Elemento Gráfico: Esferas Financeiras em Órbita.
 * Um elemento original e inovador que representa o equilíbrio financeiro
 * e a gestão de múltiplos ativos (receitas, despesas, investimentos, kids).
 * SVG puro com animações CSS otimizadas para performance.
 */
export function FinancialOrbs() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 -z-10 flex items-center justify-center overflow-hidden opacity-[0.45]"
    >
      <div className="relative h-[600px] w-[600px] sm:h-[800px] sm:w-[800px]">
        {/* Órbita Central - Estabilidade */}
        <div className="absolute inset-0 rounded-full border border-emerald-500/10" />
        
        {/* Órbita 2 - Planejamento */}
        <div className="absolute inset-[15%] rounded-full border border-emerald-500/5 animate-[spin_40s_linear_infinite]" />
        
        {/* Órbita 3 - Crescimento */}
        <div className="absolute inset-[30%] rounded-full border border-emerald-500/5 animate-[spin_30s_linear_infinite_reverse]" />

        {/* Esferas Flutuantes */}
        
        {/* Receitas (Verde) */}
        <div className="absolute left-[10%] top-[20%] size-24 animate-[float_8s_ease-in-out_infinite]">
          <div className="size-full rounded-full bg-emerald-500/20 blur-2xl" />
          <div className="absolute inset-0 rounded-full bg-emerald-500/10 border border-emerald-500/20" />
        </div>

        {/* Despesas (Suave) */}
        <div className="absolute right-[15%] top-[10%] size-16 animate-[float_10s_ease-in-out_infinite_1s]">
          <div className="size-full rounded-full bg-white/10 blur-xl" />
          <div className="absolute inset-0 rounded-full bg-white/5 border border-white/10" />
        </div>

        {/* Kids Space (Dourado/Suave) */}
        <div className="absolute bottom-[20%] right-[10%] size-20 animate-[float_12s_ease-in-out_infinite_2s]">
          <div className="size-full rounded-full bg-emerald-400/10 blur-xl" />
          <div className="absolute inset-0 rounded-full bg-emerald-400/5 border border-emerald-400/10" />
        </div>

        {/* Investimentos (Foco) */}
        <div className="absolute bottom-[10%] left-[20%] size-12 animate-[float_7s_ease-in-out_infinite_1.5s]">
          <div className="size-full rounded-full bg-emerald-600/20 blur-lg" />
          <div className="absolute inset-0 rounded-full bg-emerald-600/10 border border-emerald-600/20" />
        </div>

        {/* Núcleo Central de Brilho */}
        <div className="absolute inset-[40%] rounded-full bg-emerald-500/5 blur-[80px] animate-pulse" />
      </div>
      
      <style>{`
        @keyframes float {
          0%, 100% { transform: translate(0, 0); }
          50% { transform: translate(-15px, -25px); }
        }
      `}</style>
    </div>
  );
}
