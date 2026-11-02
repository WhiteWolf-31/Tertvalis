// Browser-based CSV, JSON, and Printable PDF Report Generator

export function exportToCSV(filename, headers, rows) {
  if (!Array.isArray(headers) || !Array.isArray(rows)) return false;

  const escapeCell = (val) => {
    if (val === null || val === undefined) return '""';
    const str = String(val).replace(/"/g, '""');
    return `"${str}"`;
  };

  const csvHeader = headers.map(escapeCell).join(',');
  const csvRows = rows.map((row) => row.map(escapeCell).join(','));
  const csvString = '\uFEFF' + [csvHeader, ...csvRows].join('\r\n');

  const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', filename.endsWith('.csv') ? filename : `${filename}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
  return true;
}

export function exportToJSON(filename, dataObject) {
  const jsonString = JSON.stringify(dataObject, null, 2);
  const blob = new Blob([jsonString], { type: 'application/json;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', filename.endsWith('.json') ? filename : `${filename}.json`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
  return true;
}

export function triggerPrintReport() {
  window.print();
}
