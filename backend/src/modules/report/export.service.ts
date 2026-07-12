/**
 * @file    export.service.ts
 * @desc    Shared export service supporting JSON, CSV, Excel (xlsx),
 *          and PDF format pipelines.
 */

import XLSX from "xlsx";

export class ExportService {
  /**
   * Export tabular data into a binary download stream.
   *
   * @param headers   Array of column headers to structure the document.
   * @param rows      Array of row records mapping to the headers.
   * @param format    Target format: "csv" | "xlsx" | "json" | "pdf".
   * @param sheetName Custom Excel sheet name (defaults to "Report").
   */
  static export(
    headers: string[],
    rows: Record<string, any>[],
    format: "csv" | "xlsx" | "json" | "pdf",
    sheetName: string = "Report"
  ): { buffer: Buffer; contentType: string; filename: string } {
    // 1. Flatten rows matching header order
    const flatData = rows.map((row) => {
      const obj: Record<string, any> = {};
      headers.forEach((header) => {
        obj[header] = row[header] !== undefined ? row[header] : "";
      });
      return obj;
    });

    const timestamp = Date.now();
    const baseFilename = `export-${timestamp}`;

    // ── JSON Format ───────────────────────────────────────────

    if (format === "json") {
      const content = JSON.stringify(flatData, null, 2);
      return {
        buffer: Buffer.from(content, "utf-8"),
        contentType: "application/json",
        filename: `${baseFilename}.json`,
      };
    }

    // ── PDF Format (Placeholder interface) ────────────────────

    if (format === "pdf") {
      const placeholder = `%PDF-1.4 (PDF Placeholder Interface)\n\nReport generated: ${new Date().toISOString()}\nTotal records: ${rows.length}\nHeaders: ${headers.join(", ")}`;
      return {
        buffer: Buffer.from(placeholder, "utf-8"),
        contentType: "application/pdf",
        filename: `${baseFilename}.pdf`,
      };
    }

    // ── CSV and Excel (XLSX) Format using XLSX ────────────────

    const worksheet = XLSX.utils.json_to_sheet(flatData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);

    if (format === "csv") {
      const csvContent = XLSX.utils.sheet_to_csv(worksheet);
      return {
        buffer: Buffer.from(csvContent, "utf-8"),
        contentType: "text/csv",
        filename: `${baseFilename}.csv`,
      };
    }

    // Default to Excel Binary Buffer (.xlsx)
    const buffer = XLSX.write(workbook, { type: "buffer", bookType: "xlsx" });
    return {
      buffer: buffer as Buffer,
      contentType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      filename: `${baseFilename}.xlsx`,
    };
  }
}
