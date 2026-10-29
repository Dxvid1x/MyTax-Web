import type { Transaction } from "./ledger.ts";
import {
  decodeLedgerSettings,
  emptyLedgerSettings,
  type LedgerSettings,
} from "./ledgerExtras.ts";
import { validTransaction } from "./storage.ts";

export const MAX_CLOUD_BYTES = 3 * 1024 * 1024;
export type CloudDocument = {
  schemaVersion: 1;
  transactions: Transaction[];
  settings: LedgerSettings;
};
export const emptyCloudDocument = (): CloudDocument => ({
  schemaVersion: 1,
  transactions: [],
  settings: emptyLedgerSettings(),
});
// The cloud document deliberately contains no tax plan, consent flags or login secrets.
export function decodeCloudDocument(input: unknown): CloudDocument {
  if (!input || typeof input !== "object")
    throw new Error("รูปแบบสมุดเงินไม่ถูกต้อง");
  const value = input as CloudDocument;
  if (
    value.schemaVersion !== 1 ||
    !value.settings ||
    !Array.isArray(value.transactions) ||
    value.transactions.length > 10000
  )
    throw new Error("รุ่นข้อมูลหรือจำนวนรายการไม่รองรับ");
  if (new TextEncoder().encode(JSON.stringify(input)).length > MAX_CLOUD_BYTES)
    throw new Error(
      "ไฟล์สำรองสมุดเงินต้องไม่เกิน 3 MB โปรดสำรองและแยกข้อมูลก่อน",
    );
  const settings = decodeLedgerSettings(value.settings);
  const ids = new Set<string>();
  const transactions = value.transactions.map((row) => {
    if (!validTransaction(row, settings) || ids.has(row.id))
      throw new Error("รายการเงินไม่ถูกต้องหรือมีรหัสซ้ำ");
    ids.add(row.id);
    return {
      id: row.id,
      type: row.type,
      amount: row.amount,
      date: row.date,
      category: row.category,
      note: row.note,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    };
  });
  return { schemaVersion: 1, settings, transactions };
}
export function cloudSignature(document: CloudDocument) {
  return JSON.stringify(document);
}
export function mergeCloudDocument(
  remote: CloudDocument,
  local: CloudDocument,
) {
  remote = decodeCloudDocument(remote);
  local = decodeCloudDocument(local);
  const transactions = [...remote.transactions];
  let skipped = 0;
  for (const row of local.transactions) {
    const existing = transactions.find((item) => item.id === row.id);
    if (existing) {
      if (JSON.stringify(existing) !== JSON.stringify(row))
        throw new Error(
          "รายการรหัสเดียวกันมีข้อมูลต่างกัน โปรดตรวจสำเนาทั้งสองก่อนรวม",
        );
      skipped++;
    } else transactions.push(row);
  }
  const recurring = [...remote.settings.recurring];
  for (const rule of local.settings.recurring) {
    const existing = recurring.find((item) => item.id === rule.id);
    if (existing && JSON.stringify(existing) !== JSON.stringify(rule))
      throw new Error("รายการประจำรหัสเดียวกันต่างกัน โปรดตรวจสำเนาก่อนรวม");
    if (!existing) recurring.push(rule);
  }
  const settings = {
    recurring,
    customCategories: {
      income: [
        ...new Set([
          ...remote.settings.customCategories.income,
          ...local.settings.customCategories.income,
        ]),
      ],
      expense: [
        ...new Set([
          ...remote.settings.customCategories.expense,
          ...local.settings.customCategories.expense,
        ]),
      ],
    },
  };
  const fingerprint = (t: Transaction) =>
    JSON.stringify([t.type, t.date, t.amount, t.category, t.note]);
  const old = new Set(remote.transactions.map(fingerprint));
  const possibleDuplicates = local.transactions.filter(
    (t) =>
      !remote.transactions.some((r) => r.id === t.id) &&
      old.has(fingerprint(t)),
  ).length;
  return {
    document: decodeCloudDocument({ schemaVersion: 1, transactions, settings }),
    added: transactions.length - remote.transactions.length,
    skipped,
    possibleDuplicates,
  };
}
