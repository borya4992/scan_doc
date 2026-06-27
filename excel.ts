import * as XLSX from "xlsx";
import { DocumentRecord, EXCEL_COLUMNS } from "./types";

const TEMPLATE_PATH = "/template.xlsx";

function createEmptyWorkbook(): XLSX.WorkBook {
  const worksheet = XLSX.utils.aoa_to_sheet([
    EXCEL_COLUMNS.map((column) => column.header),
  ]);
  return {
    SheetNames: ["Лист1"],
    Sheets: { Лист1: worksheet },
  };
}

async function loadTemplateWorkbook(): Promise<XLSX.WorkBook> {
  try {
    const response = await fetch(TEMPLATE_PATH);
    if (response.ok) {
      const buffer = await response.arrayBuffer();
      return XLSX.read(buffer, { type: "array" });
    }
  } catch {
    // fallback below
  }
  return createEmptyWorkbook();
}

function getWorksheet(workbook: XLSX.WorkBook): XLSX.WorkSheet {
  const sheetName = workbook.SheetNames[0] ?? "Лист1";
  return workbook.Sheets[sheetName] ?? XLSX.utils.aoa_to_sheet([]);
}

function recordsToRows(records: DocumentRecord[]): (string | number)[][] {
  const sorted = [...records].sort(
    (a, b) => new Date(a.scannedAt).getTime() - new Date(b.scannedAt).getTime()
  );

  return sorted.map((record, index) => [
    index + 1,
    record.employee,
    record.tabNumber,
    record.position,
    record.periodEnd,
    record.day,
  ]);
}

function downloadWorkbook(workbook: XLSX.WorkBook, fileName: string): void {
  const buffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
  const blob = new Blob([buffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  link.click();
  URL.revokeObjectURL(url);
}

export async function exportRecordsToExcel(
  records: DocumentRecord[],
  fileName?: string
): Promise<void> {
  const workbook = await loadTemplateWorkbook();
  const worksheet = getWorksheet(workbook);
  const rows = recordsToRows(records);

  XLSX.utils.sheet_add_aoa(worksheet, rows, { origin: "A2" });

  downloadWorkbook(
    workbook,
    fileName ??
      `scan_export_${new Date().toISOString().slice(0, 10)}_${records.length}.xlsx`
  );
}

export async function exportRecordsToExcelBlob(
  records: DocumentRecord[]
): Promise<Blob> {
  const workbook = await loadTemplateWorkbook();
  const worksheet = getWorksheet(workbook);
  const rows = recordsToRows(records);

  XLSX.utils.sheet_add_aoa(worksheet, rows, { origin: "A2" });

  const buffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
  return new Blob([buffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
}
