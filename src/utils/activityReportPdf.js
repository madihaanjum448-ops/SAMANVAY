import { jsPDF } from 'jspdf';
import { formatActivityDateTime, getPeriodLabel } from './activityLogUtils';

function formatGeneratedAt() {
  return new Date().toLocaleString([], {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

function buildRequestIncident(log) {
  const parts = [];
  if (log.requestId) parts.push(log.requestId);
  if (log.incidentId) parts.push(log.incidentId);
  if (log.agency) parts.push(log.agency);

  if (parts.length === 0) {
    const detail = log.detail || '';
    const reqMatch = detail.match(/REQ-\d+/);
    const incMatch = detail.match(/INC-\d+/);
    if (reqMatch) parts.push(reqMatch[0]);
    if (incMatch) parts.push(incMatch[0]);
  }

  return parts.join(' / ') || '—';
}

function buildStatus(log) {
  if (log.status) return log.status;
  if (log.severity) return log.severity;
  if (log.type === 'verification') return 'VERIFIED';
  return '—';
}

export function generateActivityReportPdf({
  activities,
  periodKey,
  district = 'Pune',
  state = 'Maharashtra'
}) {
  const doc = new jsPDF({ unit: 'pt', format: 'a4' });
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 40;
  const contentWidth = pageWidth - margin * 2;
  let y = margin;

  const addLine = (text, options = {}) => {
    const {
      size = 10,
      bold = false,
      color = [15, 23, 42],
      gap = 14
    } = options;

    doc.setFont('helvetica', bold ? 'bold' : 'normal');
    doc.setFontSize(size);
    doc.setTextColor(...color);

    const lines = doc.splitTextToSize(text, contentWidth);
    if (y + lines.length * (size + 2) > doc.internal.pageSize.getHeight() - margin) {
      doc.addPage();
      y = margin;
    }

    doc.text(lines, margin, y);
    y += lines.length * (size + 2) + gap;
  };

  addLine('SAMANVAY', { size: 18, bold: true, color: [22, 101, 52], gap: 4 });
  addLine('District Emergency Operations Centre', { size: 12, bold: true, gap: 4 });
  addLine('Activity Log Report', { size: 12, bold: true, gap: 16 });

  addLine(`District: ${district}`, { size: 10, gap: 4 });
  addLine(`State: ${state}`, { size: 10, gap: 12 });
  addLine(`Reporting Period: ${getPeriodLabel(periodKey)}`, { size: 10, gap: 4 });
  addLine(`Generated: ${formatGeneratedAt()}`, { size: 10, gap: 20 });

  doc.setDrawColor(203, 213, 225);
  doc.line(margin, y, pageWidth - margin, y);
  y += 20;

  const colWidths = [90, 100, 80, 90, 55, contentWidth - 415];
  const headers = ['TIME', 'ACTIVITY', 'USER / ROLE', 'REQUEST / INCIDENT', 'STATUS', 'DETAILS'];

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(71, 85, 105);
  let x = margin;
  headers.forEach((header, i) => {
    doc.text(header, x, y);
    x += colWidths[i];
  });
  y += 14;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(15, 23, 42);

  activities.forEach((log) => {
    const row = [
      formatActivityDateTime(log),
      log.action || '—',
      log.actor || '—',
      buildRequestIncident(log),
      buildStatus(log),
      log.detail || '—'
    ];

    const wrapped = row.map((cell, i) => doc.splitTextToSize(String(cell), colWidths[i] - 4));
    const rowHeight = Math.max(...wrapped.map(lines => lines.length)) * 10 + 8;

    if (y + rowHeight > doc.internal.pageSize.getHeight() - margin) {
      doc.addPage();
      y = margin;
    }

    x = margin;
    wrapped.forEach((lines, i) => {
      doc.text(lines, x, y);
      x += colWidths[i];
    });

    y += rowHeight;
    doc.setDrawColor(226, 232, 240);
    doc.line(margin, y - 4, pageWidth - margin, y - 4);
  });

  if (activities.length === 0) {
    addLine('No activity records found for the selected reporting period.', { size: 10, gap: 8 });
  }

  return doc;
}

export function downloadActivityReportPdf(options) {
  const doc = generateActivityReportPdf(options);
  const dateStr = new Date().toISOString().split('T')[0];
  doc.save(`SAMANVAY-Activity-Report-${dateStr}.pdf`);
}

export function getActivityReportBlob(options) {
  const doc = generateActivityReportPdf(options);
  return doc.output('blob');
}
