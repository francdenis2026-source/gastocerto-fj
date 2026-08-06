import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";
import { formatCurrency, formatDate } from "./format-utils";

export async function exportDashboardToPDF(elementId: string, title: string) {
  const element = document.getElementById(elementId);
  if (!element) return;

  const canvas = await html2canvas(element, {
    scale: 2,
    useCORS: true,
    logging: false,
    backgroundColor: "#001640", // Navy brand color for background consistency
  });

  const imgData = canvas.toDataURL("image/png");
  const pdf = new jsPDF("p", "mm", "a4");
  const imgProps = pdf.getImageProperties(imgData);
  const pdfWidth = pdf.internal.pageSize.getWidth();
  const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

  pdf.setFontSize(18);
  pdf.setTextColor(23, 164, 95); // Emerald brand color
  pdf.text(title, 10, 15);
  
  pdf.setFontSize(10);
  pdf.setTextColor(150, 150, 150);
  pdf.text(`Gerado em ${formatDate(new Date().toISOString())}`, 10, 22);

  pdf.addImage(imgData, "PNG", 0, 30, pdfWidth, pdfHeight);
  pdf.save(`${title.toLowerCase().replace(/\s+/g, "-")}-${new Date().getTime()}.pdf`);
}
