import { jsPDF } from "jspdf";
import type { AnalysisResults } from "./types";

function formatCurrency(amount: number): string {
  return "$" + amount.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function formatDate(dateStr?: string): string {
  if (!dateStr) return "N/A";
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export function generateDemandLetterPdf(analysis: AnalysisResults): void {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "pt",
    format: "letter",
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const marginLeft = 72; // 1 inch
  const marginRight = 72;
  const contentWidth = pageWidth - marginLeft - marginRight;
  const maxY = pageHeight - 72; // 1-inch bottom margin

  let y = 72; // start at 1-inch top margin

  // Helper: check if we need a new page and advance
  function checkPage(needed: number): void {
    if (y + needed > maxY) {
      doc.addPage();
      y = 72;
    }
  }

  // Helper: write a block of wrapped text and advance y
  function writeWrappedText(
    text: string,
    x: number,
    fontSize: number,
    fontStyle: "normal" | "bold",
    lineHeight: number,
    maxWidth: number
  ): void {
    doc.setFontSize(fontSize);
    doc.setFont("helvetica", fontStyle);
    const lines: string[] = doc.splitTextToSize(text, maxWidth);
    for (const line of lines) {
      checkPage(lineHeight);
      doc.text(line, x, y);
      y += lineHeight;
    }
  }

  // ---------- HEADER ----------
  const today = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  // Title
  doc.setFontSize(18);
  doc.setFont("helvetica", "bold");
  const title = "NOTICE OF INTENT TO SUE";
  const titleWidth = doc.getTextWidth(title);
  doc.text(title, (pageWidth - titleWidth) / 2, y);
  y += 22;

  // Subtitle
  doc.setFontSize(13);
  const subtitle = "DEMAND FOR RETURN OF SECURITY DEPOSIT";
  const subtitleWidth = doc.getTextWidth(subtitle);
  doc.text(subtitle, (pageWidth - subtitleWidth) / 2, y);
  y += 30;

  // Horizontal rule
  doc.setDrawColor(0);
  doc.setLineWidth(1.5);
  doc.line(marginLeft, y, pageWidth - marginRight, y);
  y += 20;

  // "SENT VIA CERTIFIED MAIL" stamp — upper right
  doc.setFontSize(9);
  doc.setFont("helvetica", "bold");
  const stamp = "SENT VIA CERTIFIED MAIL";
  const stampWidth = doc.getTextWidth(stamp);
  doc.text(stamp, pageWidth - marginRight - stampWidth, y);
  y += 18;

  // Date
  doc.setFontSize(11);
  doc.setFont("helvetica", "normal");
  doc.text(today, marginLeft, y);
  y += 24;

  // ---------- LANDLORD ADDRESS BLOCK ----------
  doc.setFontSize(11);
  doc.setFont("helvetica", "normal");
  if (analysis.landlord_name) {
    doc.text(analysis.landlord_name, marginLeft, y);
    y += 15;
  }
  if (analysis.landlord_address) {
    const addressLines = doc.splitTextToSize(analysis.landlord_address, contentWidth);
    for (const line of addressLines) {
      doc.text(line, marginLeft, y);
      y += 15;
    }
  }
  y += 10;

  // ---------- RE: SUBJECT LINE ----------
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  const reLine = `Re: Security Deposit Demand \u2014 ${analysis.property_address}`;
  const reLines = doc.splitTextToSize(reLine, contentWidth);
  for (const line of reLines) {
    checkPage(15);
    doc.text(line, marginLeft, y);
    y += 15;
  }
  y += 14;

  // ---------- SALUTATION ----------
  doc.setFontSize(11);
  doc.setFont("helvetica", "normal");
  doc.text(`Dear ${analysis.landlord_name}:`, marginLeft, y);
  y += 22;

  // ---------- BODY PARAGRAPH 1: INTRODUCTION ----------
  const intro =
    `I am writing to demand the return of my security deposit in connection with the ` +
    `residential property located at ${analysis.property_address}. I was a tenant at this ` +
    `property under a lease commencing on ${formatDate(analysis.lease_start_date)} and ` +
    `ending on ${formatDate(analysis.lease_end_date)}. Upon the termination of my tenancy, ` +
    `I fulfilled all obligations required for the return of my security deposit.`;
  writeWrappedText(intro, marginLeft, 11, "normal", 16, contentWidth);
  y += 10;

  // ---------- BODY PARAGRAPH 2: DEDUCTION OVERVIEW ----------
  const overview =
    `You have withheld ${formatCurrency(analysis.total_deductions)} from my security deposit ` +
    `of ${formatCurrency(analysis.total_deposit)}. After careful analysis, ` +
    `${formatCurrency(analysis.illegal_deductions)} of these deductions are illegal under ` +
    `${analysis.state} law.`;
  writeWrappedText(overview, marginLeft, 11, "normal", 16, contentWidth);
  y += 16;

  // ---------- ITEMIZED ILLEGAL DEDUCTIONS ----------
  const flaggedDeductions = analysis.deduction_analysis.filter(
    (d) => d.classification === "ILLEGAL" || d.classification === "DISPUTED"
  );

  if (flaggedDeductions.length > 0) {
    checkPage(30);
    doc.setFontSize(13);
    doc.setFont("helvetica", "bold");
    doc.text("Itemized Illegal and Disputed Deductions", marginLeft, y);
    y += 8;
    doc.setLineWidth(0.75);
    doc.line(marginLeft, y, pageWidth - marginRight, y);
    y += 16;

    for (const item of flaggedDeductions) {
      checkPage(60);

      // Deduction header: description + amount + classification
      doc.setFontSize(11);
      doc.setFont("helvetica", "bold");
      const itemHeader = `${item.description}  \u2014  ${formatCurrency(item.amount)}  [${item.classification}]`;
      const itemHeaderLines = doc.splitTextToSize(itemHeader, contentWidth);
      for (const line of itemHeaderLines) {
        checkPage(15);
        doc.text(line, marginLeft, y);
        y += 15;
      }

      // Reasoning
      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      const reasoningLines = doc.splitTextToSize(item.reasoning, contentWidth - 18);
      for (const line of reasoningLines) {
        checkPage(14);
        doc.text(line, marginLeft + 18, y);
        y += 14;
      }
      y += 10;
    }
    y += 6;
  }

  // ---------- APPLICABLE LAW ----------
  if (analysis.statutes_cited.length > 0) {
    checkPage(30);
    doc.setFontSize(13);
    doc.setFont("helvetica", "bold");
    doc.text("Applicable Law", marginLeft, y);
    y += 8;
    doc.setLineWidth(0.75);
    doc.line(marginLeft, y, pageWidth - marginRight, y);
    y += 16;

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    for (const statute of analysis.statutes_cited) {
      checkPage(16);
      doc.text(`\u2022  ${statute}`, marginLeft + 10, y);
      y += 16;
    }
    y += 10;
  }

  // ---------- DEMAND CALCULATION TABLE ----------
  checkPage(90);
  doc.setFontSize(13);
  doc.setFont("helvetica", "bold");
  doc.text("Demand Calculation", marginLeft, y);
  y += 8;
  doc.setLineWidth(0.75);
  doc.line(marginLeft, y, pageWidth - marginRight, y);
  y += 18;

  const tableData: [string, string][] = [
    ["Illegal Deductions:", formatCurrency(analysis.illegal_deductions)],
    ["Statutory Penalties:", formatCurrency(analysis.statutory_penalties)],
    ["Total Demand:", formatCurrency(analysis.total_recovery)],
  ];

  const labelX = marginLeft + 20;
  const valueX = marginLeft + contentWidth - 20;

  for (let i = 0; i < tableData.length; i++) {
    const [label, value] = tableData[i];
    const isTotalRow = i === tableData.length - 1;

    if (isTotalRow) {
      // Draw a thin rule above the total
      doc.setLineWidth(0.5);
      doc.line(labelX, y - 6, valueX, y - 6);
      y += 4;
    }

    doc.setFontSize(11);
    doc.setFont("helvetica", isTotalRow ? "bold" : "normal");
    doc.text(label, labelX, y);
    doc.text(value, valueX, y, { align: "right" });
    y += 18;
  }
  y += 10;

  // ---------- DEMAND PARAGRAPH ----------
  const demandText =
    `I demand payment of ${formatCurrency(analysis.total_recovery)} within seven (7) calendar ` +
    `days of receipt of this letter. Payment should be made by certified check or money order ` +
    `payable to ${analysis.tenant_name} and delivered to my address on file.`;
  writeWrappedText(demandText, marginLeft, 11, "normal", 16, contentWidth);
  y += 10;

  // ---------- LITIGATION WARNING ----------
  const litigationText =
    `If payment is not received within this period, I intend to file suit in small claims ` +
    `court to recover the full amount demanded, including all statutory penalties, court ` +
    `costs, and any additional damages permitted by law. This letter serves as formal ` +
    `notice of my intent to pursue legal action.`;
  writeWrappedText(litigationText, marginLeft, 11, "normal", 16, contentWidth);
  y += 30;

  // ---------- SIGNATURE BLOCK ----------
  checkPage(80);
  doc.setFontSize(11);
  doc.setFont("helvetica", "normal");
  doc.text("Sincerely,", marginLeft, y);
  y += 36;

  doc.setFont("helvetica", "bold");
  doc.text(analysis.tenant_name, marginLeft, y);
  y += 16;

  doc.setFont("helvetica", "normal");
  doc.text(today, marginLeft, y);
  y += 16;

  doc.setFontSize(9);
  doc.setFont("helvetica", "italic");
  doc.text("Prepared with DepositGuard AI", marginLeft, y);
  y += 30;

  // ---------- FOOTER DISCLAIMER ----------
  checkPage(30);
  doc.setLineWidth(0.5);
  doc.line(marginLeft, y, pageWidth - marginRight, y);
  y += 12;

  doc.setFontSize(8);
  doc.setFont("helvetica", "italic");
  const disclaimer =
    "This document was generated as a self-help tool and does not constitute legal advice. " +
    "Consult a licensed attorney for guidance specific to your situation.";
  const disclaimerLines = doc.splitTextToSize(disclaimer, contentWidth);
  for (const line of disclaimerLines) {
    checkPage(12);
    doc.text(line, marginLeft, y);
    y += 12;
  }

  // ---------- SAVE ----------
  doc.save("DepositGuard_Demand_Letter.pdf");
}
