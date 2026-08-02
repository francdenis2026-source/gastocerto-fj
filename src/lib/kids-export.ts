import { formatCurrency, formatDateTime } from "@/lib/format";

/** Linha de movimentação usada nas exportações do Espaço Kids. */
export type KidExportRow = {
  date: string;
  description: string;
  type: "income" | "expense";
  amount: number;
};

/** Filtros aplicados no momento da exportação (aparecem no cabeçalho). */
export type KidExportFilters = {
  kidName: string;
  periodLabel: string;
  typeLabel: string;
};

export type KidExportTotals = {
  income: number;
  expense: number;
  balance: number;
  count: number;
};

function download(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

function cell(value: string | number) {
  return `"${String(value).replace(/"/g, '""')}"`;
}

function fileSlug(name: string) {
  return (
    name
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-zA-Z0-9]+/g, "-")
      .replace(/^-|-$/g, "")
      .toLowerCase() || "crianca"
  );
}

function formatRowDate(date: string) {
  return new Date(`${date}T12:00:00`).toLocaleDateString("pt-BR");
}

function summaryRows(totals: KidExportTotals, filters: KidExportFilters): [string, string][] {
  return [
    ["Criança", filters.kidName],
    ["Período", filters.periodLabel],
    ["Tipo de movimentação", filters.typeLabel],
    ["Registros no filtro", String(totals.count)],
    ["Total de gastos", formatCurrency(totals.expense)],
    ["Total de entradas", formatCurrency(totals.income)],
    ["Saldo do período", formatCurrency(totals.balance)],
  ];
}

const MOVEMENT_HEADER = ["Data", "Descrição", "Tipo", "Valor"];

function movementRows(rows: KidExportRow[]) {
  return rows.map((row) => [
    formatRowDate(row.date),
    row.description,
    row.type === "income" ? "Entrada" : "Gasto",
    formatCurrency(row.amount),
  ]);
}

/** Resumo + movimentações da criança em CSV (separador ponto e vírgula). */
export function exportKidsSummaryCsv(
  rows: KidExportRow[],
  totals: KidExportTotals,
  filters: KidExportFilters,
) {
  const lines = [
    cell("GastoCerto — Espaço Kids · resumo por criança"),
    cell(`Gerado em ${formatDateTime(new Date().toISOString())}`),
    "",
    [cell("Indicador"), cell("Valor")].join(";"),
    ...summaryRows(totals, filters).map(([label, value]) => [cell(label), cell(value)].join(";")),
    "",
    MOVEMENT_HEADER.map(cell).join(";"),
    ...movementRows(rows).map((row) => row.map(cell).join(";")),
  ];

  download(
    new Blob(["\uFEFF" + lines.join("\n")], { type: "text/csv;charset=utf-8" }),
    `espaco-kids-${fileSlug(filters.kidName)}.csv`,
  );
}

/** Resumo + movimentações da criança em PDF, respeitando os filtros da tela. */
export async function exportKidsSummaryPdf(
  rows: KidExportRow[],
  totals: KidExportTotals,
  filters: KidExportFilters,
) {
  const [{ default: JsPDF }, { default: autoTable }] = await Promise.all([
    import("jspdf"),
    import("jspdf-autotable"),
  ]);

  const doc = new JsPDF({ orientation: "portrait", unit: "pt", format: "a4" });

  doc.setFontSize(15);
  doc.text("GastoCerto — Espaço Kids", 40, 40);
  doc.setFontSize(10);
  doc.text(`Criança: ${filters.kidName}`, 40, 58);
  doc.setFontSize(9);
  doc.text(
    `${filters.periodLabel} · ${filters.typeLabel} · gerado em ${formatDateTime(new Date().toISOString())}`,
    40,
    72,
  );

  autoTable(doc, {
    startY: 88,
    head: [["Indicador", "Valor"]],
    body: summaryRows(totals, filters),
    styles: { fontSize: 9, cellPadding: 4 },
    headStyles: { fillColor: [16, 45, 70] },
  });

  const cursor =
    (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 24;

  doc.setFontSize(11);
  doc.text("Movimentações no filtro selecionado", 40, cursor);

  autoTable(doc, {
    startY: cursor + 10,
    head: [MOVEMENT_HEADER],
    body: rows.length
      ? movementRows(rows)
      : [["—", "Nenhuma movimentação encontrada com os filtros atuais.", "—", "—"]],
    styles: { fontSize: 9, cellPadding: 4 },
    headStyles: { fillColor: [16, 110, 90] },
    columnStyles: { 3: { halign: "right" } },
  });

  doc.save(`espaco-kids-${fileSlug(filters.kidName)}.pdf`);
}
