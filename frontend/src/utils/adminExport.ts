import * as XLSX from 'xlsx';

export type ExportRow = Record<string, string | number>;

export const exportDateStamp = (): string => new Date().toISOString().slice(0, 10);

export const downloadExcel = (rows: ExportRow[], sheetName: string, filename: string): void => {
  downloadExcelSheets([{ name: sheetName, rows }], filename);
};

export const downloadExcelSheets = (
  sheets: { name: string; rows: ExportRow[] }[],
  filename: string,
): void => {
  const workbook = XLSX.utils.book_new();
  sheets.forEach((sheet) => {
    const worksheet = XLSX.utils.json_to_sheet(sheet.rows.length ? sheet.rows : [{ Note: 'No records' }]);
    XLSX.utils.book_append_sheet(workbook, worksheet, sheet.name.slice(0, 31));
  });
  XLSX.writeFile(workbook, filename.endsWith('.xlsx') ? filename : `${filename}.xlsx`);
};

export const downloadJson = (data: unknown, filename: string): void => {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename.endsWith('.json') ? filename : `${filename}.json`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
};
