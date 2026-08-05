/**
 * Tema unificado para gráficos (Recharts) em todo o painel.
 * Todas as cores usam variáveis do design system, garantindo legibilidade
 * automática em modo claro e escuro.
 */

/** Paleta de séries — use sempre nesta ordem para manter consistência visual. */
export const CHART_SERIES = [
  "#22C55E", // Emerald (Primário)
  "#4ADE80", // Menta (Apoio)
  "#E8C468", // Dourado (Aviso)
  "#EF4444", // Vermelho (Erro)
  "#2DD4BF", // Ciano (Outro)
  "#14B8A6", // Teal (Outro)
] as const;

/** Cores semânticas fixas por tipo de valor. */
export const CHART_TOKENS = {
  expense: "var(--destructive)",
  income: "var(--success)",
  neutral: "var(--chart-1)",
  warning: "var(--warning)",
  muted: "var(--muted-foreground)",
} as const;

export function seriesColor(index: number) {
  return CHART_SERIES[index % CHART_SERIES.length];
}

/** Tipografia e traços padronizados dos eixos. */
export const axisProps = {
  tick: { fontSize: 11, fill: "var(--muted-foreground)" },
  tickLine: false,
  axisLine: false,
  stroke: "var(--border)",
} as const;

export const gridProps = {
  strokeDasharray: "3 3",
  vertical: false,
  stroke: "var(--border)",
} as const;

export const tooltipProps = {
  cursor: { fill: "color-mix(in oklab, var(--muted-foreground) 8%, transparent)" },
  contentStyle: {
    background: "var(--popover)",
    border: "1px solid var(--border)",
    borderRadius: "1rem",
    color: "var(--popover-foreground)",
    fontSize: 12,
    boxShadow: "0 10px 30px -10px oklch(0 0 0 / 15%)",
    padding: "10px 14px",
    backdropFilter: "blur(8px)",
  },
  labelStyle: { color: "var(--muted-foreground)", fontSize: 11, fontWeight: "700", marginBottom: 4, textTransform: "uppercase", letterSpacing: "0.05em" },
  itemStyle: { color: "var(--popover-foreground)", fontSize: 13, fontWeight: "600", padding: "2px 0" },
} as const;

export const legendProps = {
  wrapperStyle: { fontSize: 12, color: "var(--muted-foreground)", paddingTop: 8 },
  iconType: "circle" as const,
  iconSize: 8,
};

/** Raio padrão para barras verticais. */
export const barRadius: [number, number, number, number] = [6, 6, 0, 0];
