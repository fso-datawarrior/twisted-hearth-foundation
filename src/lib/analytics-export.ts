import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export interface MetricData {
  label: string;
  value: number | string;
}

export interface TableData {
  title: string;
  headers: string[];
  rows: (string | number)[][];
}

export interface ExportData {
  title: string;
  dateRange: string;
  metrics: MetricData[];
  tables?: TableData[];
}

/**
 * Export analytics data to CSV format
 */
export function exportToCSV(data: ExportData): void {
  const { title, dateRange, metrics, tables = [] } = data;
  
  let csv = `${title}\n`;
  csv += `Date Range: ${dateRange}\n\n`;
  
  // Add metrics section
  csv += 'Key Metrics\n';
  csv += 'Metric,Value\n';
  metrics.forEach(({ label, value }) => {
    csv += `"${label}","${value}"\n`;
  });
  csv += '\n';
  
  // Add tables
  tables.forEach((table) => {
    csv += `${table.title}\n`;
    csv += table.headers.map(h => `"${h}"`).join(',') + '\n';
    table.rows.forEach((row) => {
      csv += row.map(cell => `"${cell}"`).join(',') + '\n';
    });
    csv += '\n';
  });
  
  // Create and download file
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  const timestamp = new Date().toISOString().split('T')[0];
  
  link.setAttribute('href', url);
  link.setAttribute('download', `analytics-export-${timestamp}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Export analytics data to PDF format
 */
export function exportToPDF(data: ExportData): void {
  const { title, dateRange, metrics, tables = [] } = data;
  
  const doc = new jsPDF();
  let yPosition = 20;
  
  // Add title
  doc.setFontSize(18);
  doc.text(title, 14, yPosition);
  yPosition += 10;
  
  // Add date range
  doc.setFontSize(10);
  doc.setTextColor(100);
  doc.text(`Date Range: ${dateRange}`, 14, yPosition);
  yPosition += 10;
  
  // Add metrics section
  doc.setFontSize(14);
  doc.setTextColor(0);
  doc.text('Key Metrics', 14, yPosition);
  yPosition += 5;
  
  const metricsData = metrics.map(m => [m.label, String(m.value)]);
  
  autoTable(doc, {
    startY: yPosition,
    head: [['Metric', 'Value']],
    body: metricsData,
    theme: 'grid',
    headStyles: { fillColor: [59, 130, 246] },
    margin: { left: 14 },
  });
  
  yPosition = (doc as any).lastAutoTable.finalY + 10;
  
  // Add tables
  tables.forEach((table, index) => {
    // Check if we need a new page
    if (yPosition > 250) {
      doc.addPage();
      yPosition = 20;
    }
    
    doc.setFontSize(12);
    doc.text(table.title, 14, yPosition);
    yPosition += 5;
    
    autoTable(doc, {
      startY: yPosition,
      head: [table.headers],
      body: table.rows,
      theme: 'striped',
      headStyles: { fillColor: [59, 130, 246] },
      margin: { left: 14 },
    });
    
    yPosition = (doc as any).lastAutoTable.finalY + 10;
  });
  
  // Add footer with timestamp
  const pageCount = doc.getNumberOfPages();
  doc.setFontSize(8);
  doc.setTextColor(100);
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.text(
      `Generated: ${new Date().toLocaleString()} | Page ${i} of ${pageCount}`,
      14,
      doc.internal.pageSize.height - 10
    );
  }
  
  // Save the PDF
  const timestamp = new Date().toISOString().split('T')[0];
  doc.save(`analytics-report-${timestamp}.pdf`);
}
