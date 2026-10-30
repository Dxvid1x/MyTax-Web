import type { StatementMapping } from "./statement.ts";
import type { StatementEdit, StatementReviewRow } from "./statementTypes.ts";
export function initialStatementEdit(
  row: StatementReviewRow,
  source: string[],
  mapping: StatementMapping,
): StatementEdit {
  const debit = mapping.debit >= 0 ? (source[mapping.debit] || "").trim() : "";
  const hasDebit =
    mapping.mode === "separate" &&
    /^(?:\d+|\d{1,3}(?:,\d{3})+)(?:\.\d{1,2})?$/.test(debit) &&
    Number(debit.replaceAll(",", "")) > 0;
  const credit =
    mapping.credit >= 0 ? (source[mapping.credit] || "").trim() : "";
  const hasCredit =
    mapping.mode === "separate" &&
    /^(?:\d+|\d{1,3}(?:,\d{3})+)(?:\.\d{1,2})?$/.test(credit) &&
    Number(credit.replaceAll(",", "")) > 0;
  const debitNeedsReview =
    mapping.mode === "separate" &&
    debit !== "" &&
    !/^(?:0(?:\.0{1,2})?|-)$/.test(debit);
  const rawAmount =
    source[
      mapping.mode === "separate"
        ? debitNeedsReview
          ? mapping.debit
          : mapping.credit
        : mapping.amount
    ] || "";
  return {
    date: source[mapping.date] || "",
    note: row.note,
    amount:
      hasCredit && hasDebit
        ? ""
        : row.amount
          ? `${Math.floor(row.amount / 100)}.${(row.amount % 100).toString().padStart(2, "0")}`
          : rawAmount.replace(/^[+-]/, ""),
    type: !row.error ? row.type : debitNeedsReview ? "expense" : row.type,
  };
}
