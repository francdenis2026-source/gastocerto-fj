import { Transaction } from "@/lib/transactions";
import { formatCurrency, formatDate } from "@/lib/format-utils";

export async function exportRecurrentSpendPdf(
  recurrentData: any[],
  categories: { id: string; name: string }[]
) {
  const [{ default: JsPDF }, { default: autoTable }] = await Promise.all([
    import("jspdf"),
    import("jspdf-autotable"),
  ]);

  const doc = new JsPDF();
  
  doc.setFontSize(18);
  doc.text("GastoCerto — Relatório de Consumo Recorrente", 14, 22);
  
  doc.setFontSize(10);
  doc.text(`Gerado em ${new Date().toLocaleString("pt-BR")}`, 14, 30);

  const tableData = recurrentData.map((item) => [
    item.categories?.name || "Sem categoria",
    formatCurrency(Number(item.amount)),
    item.transaction_type === "income" ? "Receita" : "Despesa"
  ]);

  autoTable(doc, {
    startY: 40,
    head: [["Categoria", "Valor", "Tipo"]],
    body: tableData,
    foot: [
      [
        "Total",
        formatCurrency(recurrentData.reduce((sum, item) => sum + Number(item.amount), 0)),
        ""
      ]
    ],
    theme: "striped",
    headStyles: { fillColor: [15, 42, 69] },
  });

  doc.save(`consumo-recorrente-${formatDate(new Date())}.pdf`);
}

export function exportRecurrentSpendCsv(recurrentData: any[]) {
  const headers = ["Categoria", "Valor", "Tipo", "Data"];
  const rows = recurrentData.map((item) => [
    item.categories?.name || "Sem categoria",
    item.amount,
    item.transaction_type,
    item.transaction_date || ""
  ]);

  const csvContent = [
    headers.join(","),
    ...rows.map(row => row.join(","))
  ].join("\n");

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);
  link.setAttribute("href", url);
  link.setAttribute("download", `consumo-recorrente-${formatDate(new Date())}.csv`);
  link.style.visibility = "hidden";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
