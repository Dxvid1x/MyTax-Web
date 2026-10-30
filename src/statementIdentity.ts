import {
  createTransaction,
  validDate,
  today,
  type Transaction,
} from "./ledger.ts";
import type {
  StatementImportState,
  StatementImportIntent,
  StatementImportCommit,
  StatementDocument,
} from "./statementTypes.ts";
export const emptyStatementImports = (): StatementImportState => ({
  version: 1,
  receipts: [],
});
const digestValid = (value: unknown): value is string =>
  typeof value === "string" && /^[a-f0-9]{64}$/.test(value);
const textValid = (value: unknown, max = 128): value is string =>
  typeof value === "string" && value.length > 0 && value.length <= max;
export async function hashStatementFile(bytes: ArrayBuffer): Promise<string> {
  return Array.from(
    new Uint8Array(await crypto.subtle.digest("SHA-256", bytes)),
    (b) => b.toString(16).padStart(2, "0"),
  ).join("");
}
export function decodeStatementImports(input: unknown): StatementImportState {
  const invalid = () => {
    throw new Error(
      "ประวัตินำเข้าไม่สมบูรณ์ กรุณากู้คืนข้อมูลก่อนนำเข้าไฟล์เพิ่ม",
    );
  };
  if (!input || typeof input !== "object") return invalid();
  const state = input as StatementImportState;
  if (
    state.version !== 1 ||
    !Array.isArray(state.receipts) ||
    state.receipts.length > 1000
  )
    return invalid();
  const digests = new Set<string>();
  let total = 0;
  return {
    version: 1,
    receipts: state.receipts.map((receipt) => {
      if (
        !receipt ||
        !digestValid(receipt.fileDigest) ||
        digests.has(receipt.fileDigest) ||
        !Number.isSafeInteger(receipt.locatorVersion) ||
        receipt.locatorVersion < 1 ||
        !(receipt.profileId === null || textValid(receipt.profileId)) ||
        !(
          receipt.profileVersion === null ||
          (Number.isSafeInteger(receipt.profileVersion) &&
            receipt.profileVersion > 0)
        ) ||
        !Array.isArray(receipt.accepted) ||
        !receipt.accepted.length
      )
        return invalid();
      digests.add(receipt.fileDigest);
      const locators = new Set<string>();
      total += receipt.accepted.length;
      if (total > 20000) return invalid();
      return {
        fileDigest: receipt.fileDigest,
        profileId: receipt.profileId,
        profileVersion: receipt.profileVersion,
        locatorVersion: receipt.locatorVersion,
        accepted: receipt.accepted.map((item) => {
          if (
            !item ||
            !textValid(item.locator, 256) ||
            !textValid(item.transactionId) ||
            locators.has(item.locator)
          )
            return invalid();
          locators.add(item.locator);
          return { locator: item.locator, transactionId: item.transactionId };
        }),
      };
    }),
  };
}
export function acceptedStatementOrigins(
  document: StatementDocument,
  state: StatementImportState,
) {
  const receipt = state.receipts.find(
    (r) => r.fileDigest === document.fileDigest,
  );
  if (
    receipt &&
    (receipt.locatorVersion !== document.locatorVersion ||
      receipt.profileId !== document.profileId ||
      receipt.profileVersion !== document.profileVersion)
  )
    throw new Error(
      "ไฟล์นี้เคยนำเข้าด้วยตัวอ่านคนละรุ่น ยังนำเข้าซ้ำไม่ได้ กรุณาตรวจประวัติก่อน",
    );
  return new Set(receipt?.accepted.map((item) => item.locator) || []);
}
export function applyStatementImport(
  intent: StatementImportIntent,
  transactions: Transaction[],
  imports: StatementImportState,
): StatementImportCommit {
  const state = decodeStatementImports(imports),
    document = intent.document;
  if (
    !digestValid(document.fileDigest) ||
    !Number.isSafeInteger(document.locatorVersion) ||
    document.locatorVersion < 1
  )
    throw new Error("รหัสไฟล์ไม่ถูกต้อง");
  const accepted = acceptedStatementOrigins(document, state),
    seen = new Set<string>();
  const sourceOrigins = new Set([
    ...document.tables.flatMap((table) =>
      table.origins.map((origin) => origin.locator),
    ),
    ...document.candidates.map((row) => row.origin.locator),
  ]);
  const added: Transaction[] = [],
    pairs: { locator: string; transactionId: string }[] = [];
  for (const row of intent.selected) {
    const locator = row.origin?.locator;
    if (
      !textValid(locator, 256) ||
      seen.has(locator) ||
      !sourceOrigins.has(locator) ||
      row.error ||
      !["income", "expense"].includes(row.type) ||
      !Number.isSafeInteger(row.amount) ||
      row.amount <= 0 ||
      row.amount > 100000000000 ||
      !validDate(row.date) ||
      row.date < "1900-01-01" ||
      row.date > today() ||
      typeof row.note !== "string" ||
      row.note.length > 250
    )
      throw new Error("ยังมีรายการที่ตรวจไม่ผ่าน");
    seen.add(locator);
    if (accepted.has(locator)) continue;
    const transaction = createTransaction(
      row.type,
      `${Math.floor(row.amount / 100)}.${(row.amount % 100).toString().padStart(2, "0")}`,
      row.date,
      "อื่น ๆ",
      row.note,
    );
    added.push(transaction);
    pairs.push({ locator, transactionId: transaction.id });
  }
  if (transactions.length + added.length > 10000)
    throw new Error("สมุดเงินต้องมีไม่เกิน 10,000 รายการ");
  if (!added.length) return { transactions, statementImports: state, added: 0 };
  const receipt = state.receipts.find(
    (r) => r.fileDigest === document.fileDigest,
  );
  if (receipt) receipt.accepted.push(...pairs);
  else
    state.receipts.push({
      fileDigest: document.fileDigest,
      locatorVersion: document.locatorVersion,
      profileId: document.profileId,
      profileVersion: document.profileVersion,
      accepted: pairs,
    });
  return {
    transactions: [...transactions, ...added],
    statementImports: decodeStatementImports(state),
    added: added.length,
  };
}
