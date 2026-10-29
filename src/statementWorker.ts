import readExcelFile from "read-excel-file/web-worker";
import {
  checkStatementRows,
  checkStatementXlsx,
  csvStatementSheet,
  decodeStatementText,
  STATEMENT_MAX_BYTES,
} from "./statement.ts";

self.onmessage = async (
  event: MessageEvent<{ buffer: ArrayBuffer; excel: boolean }>,
) => {
  try {
    const { buffer, excel } = event.data;
    if (buffer.byteLength > STATEMENT_MAX_BYTES)
      throw new Error("ไฟล์ต้องไม่เกิน 5 MB");
    if (!excel) {
      self.postMessage({
        sheets: [csvStatementSheet(decodeStatementText(buffer))],
      });
      return;
    }
    checkStatementXlsx(buffer);
    const parsed = await readExcelFile(buffer, {
      parseNumber: (value) => value,
    });
    if (parsed.length > 10)
      throw new Error("รองรับไม่เกิน 10 แผ่นงาน กรุณาแบ่งไฟล์");
    const sheets = parsed
      .filter((sheet) => sheet.data.length)
      .map((sheet) => ({
        name: sheet.sheet,
        rows: checkStatementRows(
          sheet.data.map((row) =>
            row.map((cell) =>
              cell instanceof Date
                ? cell.toISOString().slice(0, 10)
                : cell == null
                  ? ""
                  : String(cell),
            ),
          ),
        ),
      }));
    if (!sheets.length) throw new Error("ไฟล์ Excel ไม่มีรายการ");
    self.postMessage({ sheets });
  } catch (error) {
    self.postMessage({
      error: error instanceof Error ? error.message : "อ่านไฟล์ไม่ได้",
    });
  }
};
