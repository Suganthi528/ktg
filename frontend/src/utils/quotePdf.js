import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

// Built-in PDF fonts have no rupee glyph, so amounts are written as "Rs."
const rs = (n) => 'Rs. ' + Math.round(n || 0).toLocaleString('en-IN');
const fmtDate = (d) =>
  new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });

export const PDF_MODES = {
  monthly: { label: 'Monthly', title: 'Monthly Plan Quotation' },
  yearly: { label: 'Yearly', title: 'Yearly Plan Quotation' },
  full: { label: 'Full + Setup', title: 'Complete Quotation (incl. initial setup)' },
};

// mode: 'monthly' | 'yearly' | 'full'
export function downloadQuotePdf(q, mode = 'full', logo = null) {
  const doc = new jsPDF({ unit: 'pt', format: 'a4' });
  const W = doc.internal.pageSize.getWidth();
  const H = doc.internal.pageSize.getHeight();
  const M = 36;
  const teal = [15, 118, 110];
  const dark = [15, 23, 42];
  const ink = [30, 41, 59];
  const muted = [100, 116, 139];
  const line = [226, 232, 240];
  const soft = [240, 253, 250];

  const base = {
    theme: 'plain',
    margin: { left: M, right: M },
    styles: { fontSize: 8, cellPadding: { top: 3.5, bottom: 3.5, left: 6, right: 6 }, textColor: ink, lineColor: line, lineWidth: 0 },
    headStyles: { fillColor: teal, textColor: 255, fontStyle: 'bold', fontSize: 8 },
    alternateRowStyles: { fillColor: [248, 250, 252] },
    didDrawCell: (d) => {
      if (d.section === 'body') {
        doc.setDrawColor(...line);
        doc.setLineWidth(0.4);
        doc.line(d.cell.x, d.cell.y + d.cell.height, d.cell.x + d.cell.width, d.cell.y + d.cell.height);
      }
    },
  };
  const bold = (t) => ({ content: t, styles: { fontStyle: 'bold' } });
  const totalRow = (label, value) => [
    { content: label, styles: { fontStyle: 'bold', fillColor: soft, textColor: teal, fontSize: 8.5 } },
    { content: value, styles: { fontStyle: 'bold', fillColor: soft, textColor: teal, fontSize: 8.5, halign: 'right' } },
  ];
  const section = (text, y) => {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(...teal);
    doc.text(text.toUpperCase(), M, y);
  };
  const nextY = (gap = 14) => doc.lastAutoTable.finalY + gap;
  const room = (need) => {
    if (nextY() + need > H - 48) {
      doc.addPage();
      return 44;
    }
    return nextY();
  };

  // ---- Header: company logo left, quotation details right ----
  if (logo) {
    try {
      doc.addImage(logo, 'PNG', M, 16, 108, 43.6);
    } catch {
      /* logo is optional */
    }
  }
  doc.setTextColor(...teal);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.text('QUOTATION', W - M, 30, { align: 'right' });
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(...muted);
  doc.text(PDF_MODES[mode].title, W - M, 43, { align: 'right' });
  doc.setFontSize(8);
  doc.setTextColor(...ink);
  doc.text(
    `Quote No: ${q.quoteNo}     Date: ${fmtDate(q.date)}     Valid till: ${fmtDate(q.validTill)}`,
    W - M,
    57,
    { align: 'right' }
  );
  doc.setFillColor(...teal);
  doc.rect(0, 72, W, 3, 'F');

  // ---- Prepared for / scope ----
  let y = 98;
  doc.setTextColor(...muted);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  doc.text('PREPARED FOR', M, y);
  doc.text('SCOPE', W / 2 + 20, y);
  doc.setTextColor(...dark);
  doc.setFontSize(11);
  doc.text(q.client || 'Client name', M, y + 15);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(...muted);
  doc.text(q.contact ? `Contact: ${q.contact}` : 'Contact: -', M, y + 28);
  doc.setTextColor(...ink);
  doc.text(
    `${q.scope.staff.toLocaleString('en-IN')} Staff   |   ${q.scope.branches.toLocaleString('en-IN')} Branches   |   ${q.scope.customers.toLocaleString('en-IN')} Customers`,
    W / 2 + 20,
    y + 15
  );
  doc.setDrawColor(...line);
  doc.line(M, y + 38, W - M, y + 38);

  // ---- Modules ----
  autoTable(doc, {
    ...base,
    startY: y + 48,
    head: [['Included modules', 'Description']],
    body: q.modules.length ? q.modules.map((m) => [bold(m.label), m.hint]) : [['No module selected', '-']],
    columnStyles: { 0: { cellWidth: 130 } },
  });

  // ---- Recurring ----
  const rec = q.plans;
  let note = '';
  if (mode === 'monthly' || mode === 'yearly') {
    const p = mode === 'monthly' ? rec.monthly : rec.yearly;
    autoTable(doc, {
      ...base,
      startY: nextY(),
      head: [[mode === 'monthly' ? 'Monthly charges' : 'Yearly charges (12 months service, pay 11)', 'Amount']],
      body: [
        [mode === 'monthly' ? 'Hosting & infrastructure (per month)' : 'Hosting & infrastructure (per year)', rs(p.sub)],
        [`GST @ ${q.gstPct}%`, rs(p.gst)],
        totalRow(mode === 'monthly' ? 'Monthly payable (incl. GST)' : 'Yearly payable (incl. GST)', rs(p.total)),
      ],
      columnStyles: { 1: { halign: 'right', cellWidth: 110 } },
    });
    if (mode === 'yearly') {
      doc.setFont('helvetica', 'italic');
      doc.setFontSize(8);
      doc.setTextColor(...muted);
      doc.text(`You save ${rs(rec.yearly.saving)} compared with paying monthly (about ${rs(rec.yearly.perMonth)} per month).`, M, nextY(12));
    }
    doc.lastAutoTable.finalY += 6;
    note = 'One-time setup charges are not included in this quotation. Request the Full quotation for the complete cost.';
  } else {
    autoTable(doc, {
      ...base,
      startY: nextY(),
      head: [['A. Recurring charges', 'Monthly plan', 'Yearly plan (pay 11 months)']],
      body: [
        ['Hosting & infrastructure', rs(rec.monthly.sub), rs(rec.yearly.sub)],
        [`GST @ ${q.gstPct}%`, rs(rec.monthly.gst), rs(rec.yearly.gst)],
        [
          { content: 'Payable (incl. GST)', styles: { fontStyle: 'bold', fillColor: soft, textColor: teal, fontSize: 8.5 } },
          { content: rs(rec.monthly.total) + ' / month', styles: { fontStyle: 'bold', fillColor: soft, textColor: teal, fontSize: 8.5, halign: 'right' } },
          { content: rs(rec.yearly.total) + ' / year', styles: { fontStyle: 'bold', fillColor: soft, textColor: teal, fontSize: 8.5, halign: 'right' } },
        ],
      ],
      columnStyles: { 1: { halign: 'right', cellWidth: 115 }, 2: { halign: 'right', cellWidth: 135 } },
    });

    // ---- One-time ----
    autoTable(doc, {
      ...base,
      startY: nextY(),
      head: [['B. One-time charges (initial setup)', 'Amount']],
      body: [
        ...q.oneTime.lines.map(([l, v]) => [l, rs(v)]),
        [bold('Sub-total'), { content: rs(q.oneTime.sub), styles: { fontStyle: 'bold', halign: 'right' } }],
        [`GST @ ${q.gstPct}%`, rs(q.oneTime.gst)],
        totalRow('One-time payable (incl. GST)', rs(q.oneTime.total)),
      ],
      columnStyles: { 1: { halign: 'right', cellWidth: 110 } },
    });

    // ---- Summary boxes ----
    const sy = room(58);
    const bw = (W - M * 2 - 12) / 2;
    const box = (x, label, val, sub) => {
      doc.setFillColor(...soft);
      doc.setDrawColor(153, 246, 228);
      doc.roundedRect(x, sy, bw, 50, 5, 5, 'FD');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7);
      doc.setTextColor(...muted);
      doc.text(label, x + 10, sy + 15);
      doc.setFontSize(13);
      doc.setTextColor(...teal);
      doc.text(val, x + 10, sy + 33);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7);
      doc.setTextColor(...muted);
      doc.text(sub, x + 10, sy + 44);
    };
    box(M, 'FIRST YEAR - MONTHLY PLAN (INCL. GST)', rs(q.oneTime.total + rec.monthly.total * 12), 'One-time + 12 monthly payments');
    box(M + bw + 12, 'FIRST YEAR - YEARLY PLAN (INCL. GST)', rs(q.oneTime.total + rec.yearly.total), 'One-time + 1 yearly payment (1 month free)');
    doc.lastAutoTable.finalY = sy + 50;
  }

  // ---- Terms ----
  let ty = room(70);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(...dark);
  doc.text('Terms & notes', M, ty);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(...muted);
  const terms = [
    `1. This quotation is valid until ${fmtDate(q.validTill)}. Amounts are in Indian Rupees; GST @ ${q.gstPct}% is shown separately.`,
    '2. Recurring charges cover server, database, storage, backup and map services for the selected modules.',
    '3. One-time charges are payable once at the start of the engagement.',
    '4. Usage beyond the sized capacity may require a plan upgrade.',
    ...(note ? [note] : []),
  ];
  terms.forEach((t, i) => doc.text(t, M, ty + 12 + i * 10));

  // ---- Footer ----
  const n = doc.getNumberOfPages();
  for (let i = 1; i <= n; i++) {
    doc.setPage(i);
    doc.setDrawColor(...line);
    doc.line(M, H - 34, W - M, H - 34);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(...muted);
    doc.text(`Knock The Globe Technologies  |  Give Us Your Hands`, M, H - 22);
    doc.text(`Quote ${q.quoteNo}  |  ${q.client || 'Client'}`, W / 2 + 40, H - 22, { align: 'center' });
    doc.text(`Page ${i} of ${n}`, W - M, H - 22, { align: 'right' });
  }

  const safe = (q.client || 'Quotation').replace(/[^\w-]+/g, '_');
  doc.save(`Quotation_${safe}_${mode}_${q.quoteNo}.pdf`);
}
