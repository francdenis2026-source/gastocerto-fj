import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { formatCurrency } from "./format-utils";

export interface KidExportRow {
  date: string;
  description: string;
  type: "income" | "expense";
  amount: number;
}

export interface KidExportMetrics {
  income: number;
  expense: number;
  balance: number;
  count: number;
}

export interface KidExportMeta {
  kidName: string;
  periodLabel: string;
  typeLabel: string;
}

export async function exportKidsSummaryPdf(
  data: KidExportRow[],
  metrics: KidExportMetrics,
  meta: KidExportMeta
) {
  const doc = new jsPDF();
  const now = new Date().toLocaleString("pt-BR");

  // Header
  doc.setFillColor(0, 22, 64); // Navy
  doc.rect(0, 0, 210, 40, "F");
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(22);
  doc.text("GastoCerto Kids", 14, 20);
  
  doc.setFontSize(10);
  doc.text("Relatório de Acompanhamento Financeiro", 14, 28);
  
  doc.setFontSize(8);
  doc.text(`Gerado em: ${now}`, 160, 28);

  // Kid Info
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(14);
  doc.text(`Perfil: ${meta.kidName}`, 14, 55);
  
  doc.setFontSize(10);
  doc.text(`Período: ${meta.periodLabel}`, 14, 62);
  doc.text(`Filtro: ${meta.typeLabel}`, 14, 67);

  // Summary Cards
  const startY = 75;
  
  // Total Recebido
  doc.setFillColor(240, 253, 244); // Light Emerald
  doc.roundedRect(14, startY, 55, 25, 3, 3, "F");
  doc.setTextColor(5, 150, 105);
  doc.setFontSize(8);
  doc.text("TOTAL RECEBIDO", 18, startY + 8);
  doc.setFontSize(12);
  doc.text(formatCurrency(metrics.income), 18, startY + 18);

  // Total Gasto
  doc.setFillColor(254, 242, 242); // Light Rose
  doc.roundedRect(77, startY, 55, 25, 3, 3, "F");
  doc.setTextColor(225, 29, 72);
  doc.setFontSize(8);
  doc.text("TOTAL GASTO", 81, startY + 8);
  doc.setFontSize(12);
  doc.text(formatCurrency(metrics.expense), 81, startY + 18);

  // Saldo
  doc.setFillColor(248, 250, 252); // Light Gray
  doc.roundedRect(140, startY, 55, 25, 3, 3, "F");
  doc.setTextColor(71, 85, 105);
  doc.setFontSize(8);
  doc.text("SALDO ATUAL", 144, startY + 8);
  doc.setFontSize(12);
  doc.text(formatCurrency(metrics.balance), 144, startY + 18);

  // Table
  const tableData = data.map((row) => [
    new Date(row.date).toLocaleDateString("pt-BR"),
    row.description,
    row.type === "income" ? "Recebido" : "Gasto",
    formatCurrency(row.amount),
  ]);

  autoTable(doc, {
    startY: startY + 40,
    head: [["Data", "Descrição", "Tipo", "Valor"]],
    body: tableData,
    headStyles: { fillColor: [0, 22, 64], textColor: [255, 255, 255] },
    alternateRowStyles: { fillColor: [249, 250, 251] },
    margin: { top: 40 },
    didDrawPage: (data) => {
      doc.setFontSize(8);
      doc.setTextColor(150);
      doc.text(
        "GastoCerto - Controle hoje, tranquilidade sempre.",
        data.settings.margin.left,
        doc.internal.pageSize.height - 10
      );
    },
  });

  doc.save(`relatorio-kids-${meta.kidName.toLowerCase()}-${new Date().getTime()}.pdf`);
}

/** Exporta os dados para CSV (versão legada mantida para compatibilidade) */
export function exportKidsSummaryCsv(
  data: KidExportRow[],
  metrics: KidExportMetrics,
  meta: KidExportMeta
) {
  const headers = ["Data", "Descrição", "Tipo", "Valor"];
  const csvRows = data.map((row) => [
    new Date(row.date).toLocaleDateString("pt-BR"),
    row.description,
    row.type === "income" ? "Recebido" : "Gasto",
    row.amount.toString(),
  ]);

  const csvContent = [
    headers.join(","),
    ...csvRows.map((r) => r.join(",")),
    "",
    `Resumo:,,,`,
    `Total Recebido,,,${metrics.income}`,
    `Total Gasto,,,${metrics.expense}`,
    `Saldo,,,${metrics.balance}`,
  ].join("\n");

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", `relatorio-kids-${meta.kidName.toLowerCase()}.csv`);
  link.style.visibility = "hidden";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

