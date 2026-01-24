import { jsPDF } from "jspdf";
import type { ServiceReportData, PartnerPaymentReport } from "./serviceReports";

export function generateClientReportPDF(report: ServiceReportData): Buffer {
  const doc = new jsPDF();
  let yPosition = 20;

  // Header
  doc.setFontSize(18);
  doc.setTextColor(255, 0, 0);
  doc.text("Relatório de Prestação de Serviço", 20, yPosition);

  yPosition += 10;
  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  doc.text("Monstter Consultoria e Tecnologia", 20, yPosition);

  // Line separator
  yPosition += 8;
  doc.setDrawColor(255, 0, 0);
  doc.line(20, yPosition, 190, yPosition);

  // Client Info Section
  yPosition += 10;
  doc.setFontSize(12);
  doc.setTextColor(0, 0, 0);
  doc.text("Informações do Cliente", 20, yPosition);

  yPosition += 8;
  doc.setFontSize(10);
  const clientInfo = [
    [`Cliente: ${report.clientName}`, `E-mail: ${report.clientEmail}`],
    [
      `Tipo de Pagamento: ${report.paymentType === "fixed" ? "Fixo" : "Por Hora"}`,
      `Valor Cobrado: R$ ${parseFloat(report.chargedValue).toFixed(2)}`,
    ],
  ];

  clientInfo.forEach((row) => {
    doc.text(row[0], 20, yPosition);
    doc.text(row[1], 110, yPosition);
    yPosition += 6;
  });

  // Period Section
  yPosition += 6;
  doc.setFontSize(12);
  doc.text("Período do Relatório", 20, yPosition);

  yPosition += 8;
  doc.setFontSize(10);
  doc.text(
    `De: ${new Date(report.periodStart).toLocaleDateString("pt-BR")} a ${new Date(report.periodEnd).toLocaleDateString("pt-BR")}`,
    20,
    yPosition
  );

  // Orders Table
  yPosition += 10;
  doc.setFontSize(12);
  doc.text("Ordens de Serviço", 20, yPosition);

  yPosition += 8;
  doc.setFontSize(9);
  doc.setTextColor(255, 255, 255);
  doc.setFillColor(255, 0, 0);

  // Table header
  const headers = ["N° OS", "Tipo de Serviço", "Data Início", "Data Fim", "Horas"];
  const columnWidths = [35, 45, 30, 30, 20];
  let xPosition = 20;

  headers.forEach((header, idx) => {
    doc.text(header, xPosition, yPosition, { maxWidth: columnWidths[idx] });
    xPosition += columnWidths[idx];
  });

  yPosition += 7;
  doc.setDrawColor(200, 200, 200);
  doc.line(20, yPosition, 190, yPosition);

  // Table rows
  yPosition += 6;
  doc.setTextColor(0, 0, 0);
  report.orders.forEach((order) => {
    xPosition = 20;
    const rowData = [order.osNumber, order.serviceType, order.startDate, order.endDate, `${order.totalHours}h`];

    rowData.forEach((data, idx) => {
      doc.text(data, xPosition, yPosition, { maxWidth: columnWidths[idx] });
      xPosition += columnWidths[idx];
    });

    yPosition += 6;
  });

  // Summary Section
  yPosition += 8;
  doc.setFillColor(245, 245, 245);
  doc.rect(20, yPosition, 170, 20, "F");

  doc.setFontSize(11);
  doc.setTextColor(0, 0, 0);
  doc.text(`Total de Horas: ${report.totalHours}h`, 30, yPosition + 6);
  doc.text(`Valor Total: R$ ${parseFloat(report.totalAmount).toFixed(2)}`, 30, yPosition + 12);

  // Footer
  yPosition = doc.internal.pageSize.getHeight() - 15;
  doc.setFontSize(8);
  doc.setTextColor(150, 150, 150);
  doc.text(
    `Relatório gerado em ${new Date(report.generatedAt).toLocaleDateString("pt-BR")} às ${new Date(report.generatedAt).toLocaleTimeString("pt-BR")}`,
    20,
    yPosition
  );
  doc.text("Monstter Consultoria e Tecnologia", 20, yPosition + 5);

  return Buffer.from(doc.output("arraybuffer"));
}

export function generatePartnerReportPDF(report: PartnerPaymentReport): Buffer {
  const doc = new jsPDF();
  let yPosition = 20;

  // Header
  doc.setFontSize(18);
  doc.setTextColor(255, 0, 0);
  doc.text("Relatório de Pagamento", 20, yPosition);

  yPosition += 10;
  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  doc.text("Monstter Consultoria e Tecnologia", 20, yPosition);

  // Line separator
  yPosition += 8;
  doc.setDrawColor(255, 0, 0);
  doc.line(20, yPosition, 190, yPosition);

  // Partner Info Section
  yPosition += 10;
  doc.setFontSize(12);
  doc.setTextColor(0, 0, 0);
  doc.text("Informações do Parceiro", 20, yPosition);

  yPosition += 8;
  doc.setFontSize(10);
  const partnerInfo = [
    [`Parceiro: ${report.partnerName}`, `E-mail: ${report.partnerEmail}`],
    [
      `Tipo de Pagamento: ${report.paymentType === "fixed" ? "Fixo" : "Por Hora"}`,
      `Valor Pago: R$ ${parseFloat(report.paidValue).toFixed(2)}`,
    ],
  ];

  partnerInfo.forEach((row) => {
    doc.text(row[0], 20, yPosition);
    doc.text(row[1], 110, yPosition);
    yPosition += 6;
  });

  // Period Section
  yPosition += 6;
  doc.setFontSize(12);
  doc.text("Período do Relatório", 20, yPosition);

  yPosition += 8;
  doc.setFontSize(10);
  doc.text(
    `De: ${new Date(report.periodStart).toLocaleDateString("pt-BR")} a ${new Date(report.periodEnd).toLocaleDateString("pt-BR")}`,
    20,
    yPosition
  );

  // Orders Table
  yPosition += 10;
  doc.setFontSize(12);
  doc.text("Ordens de Serviço Executadas", 20, yPosition);

  yPosition += 8;
  doc.setFontSize(9);
  doc.setTextColor(255, 255, 255);
  doc.setFillColor(255, 0, 0);

  // Table header
  const headers = ["N° OS", "Cliente", "Tipo de Serviço", "Horas"];
  const columnWidths = [35, 50, 50, 25];
  let xPosition = 20;

  headers.forEach((header, idx) => {
    doc.text(header, xPosition, yPosition, { maxWidth: columnWidths[idx] });
    xPosition += columnWidths[idx];
  });

  yPosition += 7;
  doc.setDrawColor(200, 200, 200);
  doc.line(20, yPosition, 190, yPosition);

  // Table rows
  yPosition += 6;
  doc.setTextColor(0, 0, 0);
  report.orders.forEach((order) => {
    xPosition = 20;
    const rowData = [order.osNumber, order.clientName, order.serviceType, `${order.totalHours}h`];

    rowData.forEach((data, idx) => {
      doc.text(data, xPosition, yPosition, { maxWidth: columnWidths[idx] });
      xPosition += columnWidths[idx];
    });

    yPosition += 6;
  });

  // Summary Section
  yPosition += 8;
  doc.setFillColor(245, 245, 245);
  doc.rect(20, yPosition, 170, 20, "F");

  doc.setFontSize(11);
  doc.setTextColor(0, 0, 0);
  doc.text(`Total de Horas: ${report.totalHours}h`, 30, yPosition + 6);
  doc.text(`Valor Total a Pagar: R$ ${parseFloat(report.totalAmount).toFixed(2)}`, 30, yPosition + 12);

  // Footer
  yPosition = doc.internal.pageSize.getHeight() - 15;
  doc.setFontSize(8);
  doc.setTextColor(150, 150, 150);
  doc.text(
    `Relatório gerado em ${new Date(report.generatedAt).toLocaleDateString("pt-BR")} às ${new Date(report.generatedAt).toLocaleTimeString("pt-BR")}`,
    20,
    yPosition
  );
  doc.text("Monstter Consultoria e Tecnologia", 20, yPosition + 5);

  return Buffer.from(doc.output("arraybuffer"));
}
