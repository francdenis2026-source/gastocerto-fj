/**
 * Tema unificado para gráficos (Recharts) em todo o painel.
 * Todas as cores usam variáveis do design system, garantindo legibilidade
 * automática em modo claro e escuro.
 */

/** Paleta de séries — use sempre nesta ordem para manter consistência visual. */
export const CHART_SERIES = [
  "#10B981", // Emerald (Primary)
  "#3B82F6", // Blue
  "#F472B6", // Pink
  "#F59E0B", // Amber
  "#8B5CF6", // Violet
  "#06B6D4", // Cyan
  "#F43F5E", // Rose
] as const;

/** Cores semânticas fixas por tipo de valor. */
export const CHART_TOKENS = {
  expense: "#F43F5E",
  income: "#10B981",
  neutral: "#3B82F6",
  warning: "#F59E0B",
  muted: "#64748B",
} as const;

export function seriesColor(index: number) {
  return CHART_SERIES[index % CHART_SERIES.length];
}

/** Tipografia e traços padronizados dos eixos. */
export const axisProps = {
  tick: { fontSize: 12, fill: "#94A3B8", fontWeight: "500" },
  tickLine: false,
  axisLine: false,
  stroke: "rgba(255, 255, 255, 0.08)",
} as const;

export const gridProps = {
  strokeDasharray: "3 3",
  vertical: false,
  stroke: "var(--border)",
} as const;

export const tooltipProps = {
  cursor: { fill: "rgba(255, 255, 255, 0.03)" },
  contentStyle: {
    background: "#111827",
    border: "1px solid rgba(255, 255, 255, 0.08)",
    borderRadius: "16px",
    color: "#F8FAFC",
    fontSize: 13,
    boxShadow: "0 20px 25px -5px rgb(0 0 0 / 0.3)",
    padding: "12px 16px",
    backdropFilter: "blur(12px)",
  },
  labelStyle: { color: "#94A3B8", fontSize: 11, fontWeight: "700", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.1em" },
  itemStyle: { color: "#F8FAFC", fontSize: 14, fontWeight: "600", padding: "4px 0" },
} as const;

export const legendProps = {
  wrapperStyle: { fontSize: 12, color: "var(--muted-foreground)", paddingTop: 8 },
  iconType: "circle" as const,
  iconSize: 8,
};

/** Raio padrão para barras verticais. */
export const barRadius: [number, number, number, number] = [6, 6, 0, 0];
