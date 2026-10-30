import {
  previewStatement,
  type StatementMapping,
  type StatementSheet,
} from "./statement.ts";
import { acceptedStatementOrigins } from "./statementIdentity.ts";
import type {
  StatementDocument,
  StatementEdit,
  StatementImportState,
  StatementReviewRow,
  StatementTable,
} from "./statementTypes.ts";
import type { Transaction } from "./ledger.ts";
export function selectionAfterReview(
  rows: StatementReviewRow[],
  previous: StatementReviewRow[],
  selected: Set<number>,
) {
  const old = new Map(previous.map((row) => [row.origin.locator, row]));
  return new Set(
    rows
      .filter((row) => {
        if (row.error || row.duplicate || row.alreadyImported) return false;
        const before = old.get(row.origin.locator);
        return !before || !!before.error || selected.has(before.row);
      })
      .map((row) => row.row),
  );
}
export function statementDocument(
  fileDigest: string,
  format: StatementDocument["format"],
  sheets: StatementSheet[],
): StatementDocument {
  return {
    fileDigest,
    format,
    profileId: null,
    profileVersion: null,
    locatorVersion: 1,
    candidates: [],
    warnings: [],
    incomplete: false,
    tables: sheets.map((sheet, index) => ({
      ...sheet,
      origins:
        (sheet as StatementTable).origins ||
        sheet.rows.map((_, row) => ({
          locator: `s${index}:r${row}`,
          sheet: index,
          row: row + 1,
        })),
    })),
  };
}
export function reviewStatement(
  document: StatementDocument,
  sheetIndex: number,
  mapping: StatementMapping,
  edits: Record<string, StatementEdit>,
  existing: Transaction[],
  imports: StatementImportState,
): StatementReviewRow[] {
  const table = document.tables[sheetIndex];
  if (!table) throw new Error("เลือกแผ่นงานก่อน");
  const accepted = acceptedStatementOrigins(document, imports);
  const original = previewStatement(table.rows, mapping, existing);
  const rows = original.map((row) => {
    const origin = table.origins[row.row - 1];
    if (!origin) throw new Error("ไม่พบแหล่งที่มาของรายการ");
    const edit = edits[origin.locator];
    if (!edit)
      return { ...row, origin, alreadyImported: accepted.has(origin.locator) };
    const fixed = previewStatement(
      [
        ["date", "note", "amount", "type"],
        [edit.date, edit.note, edit.amount, edit.type],
      ],
      {
        header: 0,
        date: 0,
        note: 1,
        amount: 2,
        type: 3,
        credit: -1,
        debit: -1,
        mode: "type",
        dateFormat: /^\d{4}-/.test(edit.date) ? "iso" : mapping.dateFormat,
      },
      existing,
    )[0];
    return {
      ...fixed,
      row: row.row,
      origin,
      alreadyImported: accepted.has(origin.locator),
    };
  });
  const seen = new Set<string>();
  return rows.map((row) => {
    const key = JSON.stringify([
      row.date,
      row.type,
      row.amount,
      row.note.trim().toLocaleLowerCase("th"),
    ]);
    const duplicate = row.duplicate || seen.has(key);
    if (!row.error) seen.add(key);
    return { ...row, duplicate };
  });
}
