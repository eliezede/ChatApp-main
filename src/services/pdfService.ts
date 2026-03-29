
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { ClientInvoice } from '../types';

export const PdfService = {
  generateClientInvoice: (invoice: ClientInvoice) => {
    // eslint-disable-next-line new-cap
    const doc = new jsPDF();

    // --- Header ---
    doc.setFillColor(59, 130, 246); // Blue header
    doc.rect(0, 0, 210, 40, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(26);
    doc.setFont("helvetica", "bold");
    doc.text('INVOICE', 14, 28);

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text('Lingland Ltd', 160, 18);
    doc.text('123 Business Park', 160, 23);
    doc.text('London, UK', 160, 28);

    // --- Meta Data ---
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(10);

    doc.text(`Reference:`, 14, 55);
    doc.setFont("helvetica", "bold");
    doc.text(invoice.reference || invoice.id, 40, 55);

    doc.setFont("helvetica", "normal");
    doc.text(`Date Issued:`, 14, 62);
    doc.text(new Date(invoice.issueDate).toLocaleDateString(), 40, 62);

    doc.text(`Bill To:`, 120, 55);
    doc.setFont("helvetica", "bold");
    doc.text(invoice.clientName, 120, 62);

    // --- Table ---
    const tableColumn = ["Description", "Quantity", "Rate", "Total"];
    const tableRows = invoice.items?.map(item => [
      item.description,
      item.units || 1,
      `£${item.rate.toFixed(2)}`,
      `£${item.total.toFixed(2)}`
    ]) || [];

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 75,
      theme: 'striped',
      headStyles: { fillColor: [59, 130, 246] },
      styles: { fontSize: 9 },
    });

    // --- Totals ---
    const finalY = (doc as any).lastAutoTable.finalY + 10;

    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text(`Total Amount: £${invoice.totalAmount.toFixed(2)}`, 140, finalY);

    // --- Footer ---
    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(150);
    doc.text('Thank you for your business. Please pay within 30 days.', 105, 280, { align: 'center' });

    // Save
    doc.save(`${invoice.reference || 'invoice'}.pdf`);
  },

  generateJobSheet: (booking: any) => {
    // eslint-disable-next-line new-cap
    const doc = new jsPDF();

    // --- Header ---
    doc.setFillColor(79, 70, 229); // Indigo header
    doc.rect(0, 0, 210, 40, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(26);
    doc.setFont("helvetica", "bold");
    doc.text('JOB SHEET', 14, 28);

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text('Lingland Ltd', 160, 18);
    doc.text('Operations: ops@lingland.net', 160, 23);
    doc.text('Ref: ' + (booking.bookingRef || booking.id.substring(0, 6)), 160, 28);

    // --- Session Details ---
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text('Session Information', 14, 55);

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");

    const details = [
      ["Reference", booking.bookingRef || booking.id],
      ["Interpreter", booking.interpreterName || "N/A"],
      ["Client", booking.clientName],
      ["Language", `${booking.languageFrom} to ${booking.languageTo}`],
      ["Date", new Date(booking.date).toLocaleDateString()],
      ["Start Time", booking.startTime],
      ["Duration", `${booking.durationMinutes} minutes`],
      ["Location Type", booking.locationType],
      ["Location", booking.locationType === 'ONLINE' ? (booking.onlineLink || 'Link TBC') : (booking.address || 'Address TBC')]
    ];

    autoTable(doc, {
      body: details,
      startY: 62,
      theme: 'grid',
      styles: { fontSize: 10, cellPadding: 3 },
      columnStyles: { 0: { fontStyle: 'bold', cellWidth: 40 } }
    });

    let finalY = (doc as any).lastAutoTable.finalY + 15;

    if (booking.notes) {
      doc.setFont("helvetica", "bold");
      doc.text("Booking Notes:", 14, finalY);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      const splitNotes = doc.splitTextToSize(booking.notes, 180);
      doc.text(splitNotes, 14, finalY + 7);
      finalY += (splitNotes.length * 5) + 15;
    }

    // --- Signature Section ---
    doc.setDrawColor(200);
    doc.line(14, finalY, 196, finalY);

    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.text("Verification & Approval", 14, finalY + 12);

    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.text("I confirm that the service was provided as described above.", 14, finalY + 20);

    doc.text("Client Signature:", 14, finalY + 45);
    doc.line(45, finalY + 45, 120, finalY + 45);

    doc.text("Date:", 130, finalY + 45);
    doc.line(142, finalY + 45, 180, finalY + 45);

    // --- Footer ---
    doc.setFontSize(8);
    doc.setTextColor(150);
    doc.text('This document must be signed and kept as proof of attendance.', 105, 285, { align: 'center' });

    doc.save(`JobSheet_${booking.bookingRef || booking.id.substring(0, 6)}.pdf`);
  },

  generateRemittance: (payment: any) => {
    // eslint-disable-next-line new-cap
    const doc = new jsPDF();

    // --- Header ---
    doc.setFillColor(16, 185, 129); // Emerald header
    doc.rect(0, 0, 210, 40, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(26);
    doc.setFont("helvetica", "bold");
    doc.text('REMITTANCE', 14, 28);

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text('Lingland Ltd', 160, 18);
    doc.text('Finance: accounts@lingland.net', 160, 23);

    // --- Meta Data ---
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(10);

    doc.text(`Payment Ref:`, 14, 55);
    doc.setFont("helvetica", "bold");
    doc.text(payment.id.toUpperCase(), 45, 55);

    doc.setFont("helvetica", "normal");
    doc.text(`Payment Date:`, 14, 62);
    doc.text(new Date().toLocaleDateString(), 45, 62);

    doc.text(`Paid To:`, 120, 55);
    doc.setFont("helvetica", "bold");
    doc.text(payment.interpreterName, 120, 62);

    // --- Table ---
    const tableColumn = ["Job Reference", "Date", "Description", "Amount"];
    const tableRows = payment.items?.map((item: any) => [
      item.jobRef || "N/A",
      item.date || "N/A",
      item.description,
      `£${item.total.toFixed(2)}`
    ]) || [];

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 75,
      theme: 'striped',
      headStyles: { fillColor: [16, 185, 129] },
      styles: { fontSize: 9 },
    });

    // --- Totals ---
    const finalY = (doc as any).lastAutoTable.finalY + 10;

    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text(`Total Balanced: £${payment.totalAmount.toFixed(2)}`, 140, finalY);

    // Footer
    doc.setFontSize(8);
    doc.setTextColor(150);
    doc.text('Payment was processed via bank transfer. Thank you for your service.', 105, 280, { align: 'center' });

    doc.save(`Remittance_${payment.id}.pdf`);
  },

  generateBookingSummary: (booking: any) => {
    // For now, use the Job Sheet format as a summary
    PdfService.generateJobSheet(booking);
  }
};
