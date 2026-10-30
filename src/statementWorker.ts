import readExcelFile from "read-excel-file/web-worker";
import { hashStatementFile } from "./statementIdentity.ts";
import { reviewStatement, statementDocument } from "./statementReview.ts";
import type { StatementMapping } from "./statement.ts";
import type {
  StatementDocument,
  StatementEdit,
  StatementImportState,
} from "./statementTypes.ts";
import type { Transaction } from "./ledger.ts";
import {
  checkStatementRows,
  checkStatementXlsx,
  csvStatementSheet,
  decodeStatementText,
  STATEMENT_MAX_BYTES,
} from "./statement.ts";

self.onmessage = async (
  event: MessageEvent<
    | { buffer: ArrayBuffer; excel: boolean }
    | {
        kind: "review";
        document: StatementDocument;
        sheetIndex: number;
        mapping: StatementMapping;
        edits: Record<string, StatementEdit>;
        existing: Transaction[];
        imports: StatementImportState;
      }
  >,
) => {
  try {
    if ("kind" in event.data && event.data.kind === "review") {
      const { document, sheetIndex, mapping, edits, existing, imports } =
        event.data;
      self.postMessage({
        rows: reviewStatement(
          document,
          sheetIndex,
          mapping,
          edits,
          existing,
          imports,
        ),
      });
      return;
    }
    if (!("buffer" in event.data)) return;
    const { buffer, excel } = event.data;
    const digest = await hashStatementFile(buffer);
    if (buffer.byteLength > STATEMENT_MAX_BYTES)
      throw new Error("ไฟล์ต้องไม่เกิน 5 MB");
    if (!excel) {
      const document = statementDocument(digest, "csv", [
        csvStatementSheet(decodeStatementText(buffer)),
      ]);
      self.postMessage({ sheets: document.tables, document });
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
    const document = statementDocument(digest, "xlsx", sheets);
    self.postMessage({ sheets: document.tables, document });
  } catch (error) {
    self.postMessage({
      error: error instanceof Error ? error.message : "อ่านไฟล์ไม่ได้",
    });
  }
};
