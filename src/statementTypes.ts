import type { StatementRow, StatementSheet } from "./statement.ts";
import type { Transaction } from "./ledger.ts";
export type StatementOrigin = {
  locator: string;
  page?: number;
  sheet?: number;
  row?: number;
};
export type PdfTextItem = {
  text: string;
  x: number;
  y: number;
  width: number;
  height: number;
  itemIndex: number;
};
export type PdfTextPage = { page: number; items: PdfTextItem[] };
export type StatementTable = StatementSheet & { origins: StatementOrigin[] };
export type StatementCandidate = {
  origin: StatementOrigin;
  dateText: string;
  note: string;
  creditText: string;
  debitText: string;
  amountText: string;
  directionText: string;
};
export type StatementDocument = {
  fileDigest: string;
  format: "csv" | "xlsx" | "pdf";
  profileId: string | null;
  profileVersion: number | null;
  locatorVersion: number;
  tables: StatementTable[];
  candidates: StatementCandidate[];
  warnings: string[];
  incomplete: boolean;
};
export type StatementReceipt = {
  fileDigest: string;
  profileId: string | null;
  profileVersion: number | null;
  locatorVersion: number;
  accepted: { locator: string; transactionId: string }[];
};
export type StatementImportState = { version: 1; receipts: StatementReceipt[] };
export type StatementReviewRow = StatementRow & {
  origin: StatementOrigin;
  alreadyImported: boolean;
};
export type StatementImportIntent = {
  document: StatementDocument;
  selected: StatementReviewRow[];
};
export type StatementImportCommit = {
  transactions: Transaction[];
  statementImports: StatementImportState;
  added: number;
};
export type StatementEdit = {
  date: string;
  note: string;
  amount: string;
  type: "income" | "expense";
};
