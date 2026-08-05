import { TrendingDown } from "lucide-react";

import { cn } from "@/lib/utils";

type Series = { day: string; expense: number; income: number };

const data: Series[] = [
  { day: "01", expense: 38, income: 52 },
  { day: "05", expense: 61, income: 58 },
  { day: "09", expense: 34, income: 47 },
  { day: "12", expense: 78, income: 64 },
  { day: "15", expense: 52, income: 71 },
  { day: "19", expense: 92, income: 66 },
  { day: "22", expense: 58, income: 79 },
  { day: "26", expense: 71, income: 84 },
  { day: "29", expense: 44, income: 90 },
];

const W = 260;
const H = 84;
const PAD_X = 4;
const TOP = 8;
const BOTTOM = 74;

function pointsOf(key: "expense" | "income") {
  return data.map((d, i) => ({
    x: PAD_X + (i / (data.length - 1)) * (W - PAD_X * 2),
    y: BOTTOM - (d[key] / 100) * (BOTTOM - TOP),
  }));
}

/** Curva suave (Catmull-Rom convertida em cúbicas) — visual moderno sem serrilhado. */
function smoothPath(pts: { x: number; y: number }[]) {
  if (pts.length < 2) return "";
  let path = `M ${pts[0].x} ${pts[0].y}`;
  for (let i = 0; i < pts.length - 1; i += 1) {
    const p0 = pts[i - 1] ?? pts[i];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[i + 2] ?? p2;
    const c1x = p1.x + (p2.x - p0.x) / 6;
    const c1y = p1.y + (p2.y - p0.y) / 6;
    const c2x = p2.x - (p3.x - p1.x) / 6;
    const c2y = p2.y - (p3.y - p1.y) / 6;
    path += ` C ${c1x} ${c1y} ${c2x} ${c2y} ${p2.x} ${p2.y}`;
  }
  return path;
}

/**
 * Gráfico da prévia do painel: duas séries (receitas x despesas) com curvas
 * suaves, área em gradiente, brilho e animação de traçado. Puro SVG — leve,
 * responsivo e sem dependência de biblioteca de charts.
 */
export function PreviewChart({ className }: { className?: string }) {
  const expense = pointsOf("expense");
  const income = pointsOf("income");
  const expensePath = smoothPath(expense);
  const incomePath = smoothPath(income);
  const peak = expense.reduce((a, b) => (b.y < a.y ? b : a), expense[0]);

  return (
    <figure
      className={cn(
        "group/chart relative overflow-hidden rounded-2xl border border-white/[0.07] bg-gradient-to-b from-white/[0.05] to-white/[0.01] p-3 backdrop-blur-md",
        className,
      )}
    >
      {/* brilho sutil no topo */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-16 left-1/2 h-32 w-2/3 -translate-x-1/2 rounded-full bg-brand/20 blur-3xl"
      />

      <figcaption className="relative mb-2 grid grid-cols-[minmax(0,1fr)_auto] items-center gap-2">
        <div className="min-w-0">
          <p className="truncate text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
            Fluxo do mês
          </p>
          <p className="tabular-nums text-[15px] font-black leading-tight tracking-tight text-white">
            R$ 3.782
            <span className="ml-1.5 inline-flex items-center gap-0.5 align-middle text-[10px] font-bold text-success">
              <TrendingDown className="size-3" aria-hidden />
              12%
            </span>
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-2.5 text-[9px] font-semibold uppercase tracking-wider">
          <span className="flex items-center gap-1 text-brand">
            <span className="size-1.5 rounded-full bg-brand" aria-hidden />
            Receitas
          </span>
          <span className="flex items-center gap-1 text-white/50">
            <span className="size-1.5 rounded-full bg-white/40" aria-hidden />
            Despesas
          </span>
        </div>
      </figcaption>

      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="relative h-[92px] w-full overflow-visible"
        role="img"
        aria-label="Gráfico de fluxo mensal comparando receitas e despesas ao longo dos dias"
        preserveAspectRatio="none"
      >
        <defs>
          <linearGradient id="pc-income" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--brand, #54A860)" stopOpacity="0.42" />
            <stop offset="100%" stopColor="var(--brand, #54A860)" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="pc-stroke" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="var(--brand, #54A860)" stopOpacity="0.6" />
            <stop offset="100%" stopColor="var(--brand, #54A860)" />
          </linearGradient>
          <filter id="pc-glow" x="-30%" y="-60%" width="160%" height="240%">
            <feGaussianBlur stdDeviation="2.4" result="b" />
            <feMerge>
              <feMergeNode in="b" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* grade horizontal removida para limpar visual de quadriculados */}


        {/* área de receitas */}
        <path
          d={`${incomePath} L ${income[income.length - 1].x} ${BOTTOM} L ${income[0].x} ${BOTTOM} Z`}
          fill="url(#pc-income)"
        />

        {/* despesas: linha discreta pontilhada */}
        <path
          d={expensePath}
          fill="none"
          stroke="currentColor"
          className="text-white/35"
          strokeWidth="1.1"
          strokeDasharray="3 3"
          strokeLinecap="round"
        />

        {/* receitas: linha principal com brilho e traçado animado */}
        <path
          d={incomePath}
          fill="none"
          stroke="url(#pc-stroke)"
          strokeWidth="1.9"
          strokeLinecap="round"
          strokeLinejoin="round"
          filter="url(#pc-glow)"
          pathLength={1}
          className="[stroke-dasharray:1] [stroke-dashoffset:0] motion-safe:animate-[pc-draw_1.4s_ease-out]"
        />

        {/* ponto de destaque */}
        <g>
          <circle cx={peak.x} cy={peak.y} r="4.5" className="fill-brand/25" />
          <circle cx={peak.x} cy={peak.y} r="2.1" className="fill-brand" />
        </g>

        {/* último ponto pulsante */}
        <circle
          cx={income[income.length - 1].x}
          cy={income[income.length - 1].y}
          r="2.4"
          className="fill-brand motion-safe:animate-pulse"
        />

        <style>{`@keyframes pc-draw{from{stroke-dashoffset:1}to{stroke-dashoffset:0}}`}</style>
      </svg>

      <div className="mt-1.5 flex justify-between text-[9px] font-medium tabular-nums text-muted-foreground">
        {data.map((d) => (
          <span key={d.day}>{d.day}</span>
        ))}
      </div>
    </figure>
  );
}
