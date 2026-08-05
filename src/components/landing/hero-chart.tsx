/**
 * Camada de gráfico do hero: curva suave com área em gradiente, brilho,
 * grade pontilhada e ponto de destaque animado. SVG puro (sem biblioteca),
 * responsivo e com animações desativadas em `prefers-reduced-motion`.
 */
const points = [72, 58, 66, 44, 52, 34, 41, 26, 32, 18, 24, 10];

const W = 1200;
const H = 800;
const TOP = 260;
const BASE = 720;

function coords() {
  return points.map((v, i) => ({
    x: (i / (points.length - 1)) * W,
    y: TOP + (v / 100) * (BASE - TOP),
  }));
}

function smooth(pts: { x: number; y: number }[]) {
  let d = `M ${pts[0].x} ${pts[0].y}`;
  for (let i = 0; i < pts.length - 1; i += 1) {
    const p0 = pts[i - 1] ?? pts[i];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[i + 2] ?? p2;
    d += ` C ${p1.x + (p2.x - p0.x) / 6} ${p1.y + (p2.y - p0.y) / 6} ${
      p2.x - (p3.x - p1.x) / 6
    } ${p2.y - (p3.y - p1.y) / 6} ${p2.x} ${p2.y}`;
  }
  return d;
}

export function HeroChart() {
  const pts = coords();
  const line = smooth(pts);
  const last = pts[pts.length - 1];

  return (
    <svg
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 -z-10 h-full w-full"
      preserveAspectRatio="none"
      viewBox={`0 0 ${W} ${H}`}
    >
      <defs>
        <linearGradient id="hc-area" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#54A860" stopOpacity="0.34" />
          <stop offset="70%" stopColor="#54A860" stopOpacity="0.06" />
          <stop offset="100%" stopColor="#54A860" stopOpacity="0" />
        </linearGradient>
        <linearGradient id="hc-line" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#54A860" stopOpacity="0" />
          <stop offset="22%" stopColor="#8FCB9B" stopOpacity="0.85" />
          <stop offset="100%" stopColor="#B7E4C0" />
        </linearGradient>
        <filter id="hc-glow" x="-10%" y="-40%" width="120%" height="200%">
          <feGaussianBlur stdDeviation="10" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <linearGradient id="hc-grid" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0" />
          <stop offset="50%" stopColor="#ffffff" stopOpacity="0.16" />
          <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
        </linearGradient>
      </defs>

      {/* grade horizontal com fade nas bordas */}
      {[0, 1, 2, 3].map((i) => (
        <line
          key={i}
          x1="0"
          x2={W}
          y1={TOP + i * ((BASE - TOP) / 3)}
          y2={TOP + i * ((BASE - TOP) / 3)}
          stroke="url(#hc-grid)"
          strokeWidth="1.5"
          strokeDasharray="6 14"
        />
      ))}

      {/* colunas discretas de volume */}
      {pts.map((p, i) =>
        i % 2 === 0 ? (
          <rect
            key={`bar-${p.x}`}
            x={p.x - 9}
            y={p.y}
            width="18"
            height={BASE - p.y}
            rx="9"
            fill="#54A860"
            opacity="0.1"
          />
        ) : null,
      )}

      <path d={`${line} L ${W} ${H} L 0 ${H} Z`} fill="url(#hc-area)" />

      <path
        d={line}
        fill="none"
        stroke="url(#hc-line)"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
        filter="url(#hc-glow)"
        pathLength={1}
        strokeDasharray="1"
        className="motion-safe:animate-[hc-draw_2s_ease-out_both]"
      />

      {/* ponto final pulsante */}
      <circle cx={last.x - 6} cy={last.y} r="7" fill="#B7E4C0">
        <animate attributeName="r" values="5;11;5" dur="2.8s" repeatCount="indefinite" />
        <animate attributeName="opacity" values="1;0.55;1" dur="2.8s" repeatCount="indefinite" />
      </circle>

      {/* nós intermediários */}
      {pts.slice(2, -1).map((p, i) =>
        i % 3 === 0 ? (
          <circle key={`n-${p.x}`} cx={p.x} cy={p.y} r="4" fill="#8FCB9B" opacity="0.7" />
        ) : null,
      )}

      <style>{`@keyframes hc-draw{from{stroke-dashoffset:1}to{stroke-dashoffset:0}}`}</style>
    </svg>
  );
}
