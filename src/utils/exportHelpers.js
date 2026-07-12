/**
 * Helper utilities to export tabular data to CSV, Excel, and trigger Print/PDF layouts.
 */

// Export data array to CSV format
export const exportToCSV = (data, filename = 'export.csv') => {
  if (!data || !data.length) return;
  
  const headers = Object.keys(data[0]);
  const csvRows = [];
  
  // Headers row
  csvRows.push(headers.join(','));
  
  // Data rows
  for (const row of data) {
    const values = headers.map(header => {
      const val = row[header];
      const escaped = ('' + val).replace(/"/g, '\\"');
      return `"${escaped}"`;
    });
    csvRows.push(values.join(','));
  }
  
  const csvContent = 'data:text/csv;charset=utf-8,' + csvRows.join('\n');
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement('a');
  link.setAttribute('href', encodedUri);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

// Export data array to Excel (Tab-delimited XLS mockup)
export const exportToExcel = (data, filename = 'export.xls') => {
  if (!data || !data.length) return;
  
  const headers = Object.keys(data[0]);
  let xml = '<table><tr>';
  
  // Headers
  headers.forEach(h => {
    xml += `<th style="background-color: #6366f1; color: white; font-weight: bold;">${h}</th>`;
  });
  xml += '</tr>';
  
  // Rows
  data.forEach(row => {
    xml += '<tr>';
    headers.forEach(h => {
      xml += `<td>${row[h] !== undefined ? row[h] : ''}</td>`;
    });
    xml += '</tr>';
  });
  xml += '</table>';
  
  const blob = new Blob([xml], { type: 'application/vnd.ms-excel' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

// Open print dialogue for a specific element or print window
export const triggerPrint = (title, tableHeaders, tableRows) => {
  const printWindow = window.open('', '_blank');
  
  let headersHtml = '';
  tableHeaders.forEach(h => {
    headersHtml += `<th style="border: 1px solid #e2e8f0; padding: 10px; text-align: left; background-color: #f8fafc; font-size: 11px; font-weight: 600; text-transform: uppercase;">${h}</th>`;
  });

  let rowsHtml = '';
  tableRows.forEach(row => {
    rowsHtml += '<tr>';
    row.forEach(cell => {
      rowsHtml += `<td style="border: 1px solid #e2e8f0; padding: 10px; font-size: 12px; color: #334155;">${cell}</td>`;
    });
    rowsHtml += '</tr>';
  });

  printWindow.document.write(`
    <html>
      <head>
        <title>${title}</title>
        <style>
          body { font-family: 'Inter', system-ui, sans-serif; color: #1e293b; padding: 40px; margin: 0; }
          .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #e2e8f0; padding-bottom: 20px; margin-bottom: 30px; }
          .title { font-size: 20px; font-weight: 700; color: #0f172a; margin: 0; }
          .meta { font-size: 11px; color: #64748b; margin-top: 5px; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          .footer { margin-top: 40px; text-align: center; font-size: 10px; color: #94a3b8; border-top: 1px dashed #e2e8f0; padding-top: 20px; }
        </style>
      </head>
      <body>
        <div class="header">
          <div>
            <div class="title">${title}</div>
            <div class="meta">Generated on ${new Date().toLocaleString()}</div>
          </div>
          <div style="font-weight: 800; font-size: 14px; color: #6366f1;">UNIVERSITY ATTENDANCE</div>
        </div>
        <table>
          <thead>
            <tr>${headersHtml}</tr>
          </thead>
          <tbody>
            ${rowsHtml}
          </tbody>
        </table>
        <div class="footer">
          &copy; ${new Date().getFullYear()} University Biometric Attendance Management System. Confidential Document.
        </div>
        <script>
          window.onload = function() {
            window.print();
            setTimeout(function() { window.close(); }, 500);
          };
        </script>
      </body>
    </html>
  `);
  printWindow.document.close();
};
