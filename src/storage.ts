import {
  emptyLedgerSettings,
  decodeLedgerSettings,
  categoryList,
  type LedgerSettings,
} from "./ledgerExtras.ts";
import { extendedDefaults } from "./extendedTax.ts";
import { emptyPlan, type TaxPlan, rulesFor } from "./tax.ts";
import { validDate, today, type Transaction } from "./ledger.ts";

export const STORAGE_KEY = "mytax.local.v2";
export const LEGACY_KEYS = ["bahtwise.local.v1", "mytax.local.v1"];
export const MAX_BACKUP_BYTES = 5 * 1024 * 1024;
export type Saved = {
  schemaVersion: 3;
  ledgerSettings: LedgerSettings;
  ruleVersion: string;
  savedAt: string;
  revision: string;
  autoSave: boolean;
  taxPlan: TaxPlan;
  transactions: Transaction[];
};
export type Recovery = {
  data: Saved | null;
  warnings: string[];
  rejected: number;
};
export type Store = Pick<Storage, "getItem" | "setItem" | "removeItem">;
export class StorageConflict extends Error {
  constructor() {
    super(
      "ข้อมูลในเครื่องเปลี่ยนจากอีกแท็บแล้ว พักการบันทึกเพื่อไม่เขียนทับกัน",
    );
  }
}
export function makeSaved(
  taxPlan: TaxPlan,
  transactions: Transaction[],
  autoSave = true,
  ledgerSettings: LedgerSettings = emptyLedgerSettings(),
): Saved {
  return {
    schemaVersion: 3,
    ledgerSettings,
    ruleVersion: rulesFor(taxPlan).version,
    savedAt: new Date().toISOString(),
    revision: crypto.randomUUID(),
    autoSave,
    taxPlan,
    transactions,
  };
}
export function validTransaction(
  t: unknown,
  settings: LedgerSettings,
): t is Transaction {
  if (!t || typeof t !== "object") return false;
  const row = t as Transaction;
  return (
    typeof row.id === "string" &&
    row.id.length > 0 &&
    row.id.length <= 128 &&
    ["income", "expense"].includes(row.type) &&
    Number.isSafeInteger(row.amount) &&
    row.amount > 0 &&
    row.amount <= 100000000000 &&
    typeof row.date === "string" &&
    validDate(row.date) &&
    row.date <= today() &&
    row.date >= "1900-01-01" &&
    typeof row.category === "string" &&
    categoryList(settings, row.type).includes(row.category) &&
    typeof row.note === "string" &&
    row.note.length <= 250 &&
    typeof row.createdAt === "string" &&
    Number.isFinite(Date.parse(row.createdAt)) &&
    typeof row.updatedAt === "string" &&
    Number.isFinite(Date.parse(row.updatedAt))
  );
}
function copyRow(t: Transaction): Transaction {
  return {
    id: t.id,
    type: t.type,
    amount: t.amount,
    date: t.date,
    category: t.category,
    note: t.note,
    createdAt: t.createdAt,
    updatedAt: t.updatedAt,
  };
}
function decode(raw: string, recover: boolean): Recovery {
  if (new Blob([raw]).size > MAX_BACKUP_BYTES)
    throw new Error("ไฟล์ข้อมูลต้องไม่เกิน 5 MB");
  const data = JSON.parse(raw);
  if (
    !data ||
    ![1, 2, 3].includes(data.schemaVersion) ||
    typeof data.ruleVersion !== "string" ||
    data.ruleVersion.length > 100 ||
    typeof data.savedAt !== "string" ||
    !Number.isFinite(Date.parse(data.savedAt)) ||
    !Array.isArray(data.transactions) ||
    data.transactions.length > 10000 ||
    (data.schemaVersion >= 2 &&
      (typeof data.autoSave !== "boolean" ||
        typeof data.revision !== "string" ||
        data.revision.length > 128))
  )
    throw new Error("รูปแบบไฟล์ข้อมูลไม่รองรับ สำเนาเดิมยังอยู่");
  const warnings: string[] = [],
    defaults = emptyPlan();
  let plan = { ...defaults },
    broken = false;
  for (const [key, value] of Object.entries(defaults)) {
    const current =
      key === "taxYear" && data.taxPlan?.taxYear === undefined
        ? "2568"
        : data.taxPlan?.[key];
    if (
      typeof current !== typeof value ||
      (typeof current === "string" && current.length > 64)
    )
      broken = true;
    else Object.assign(plan, { [key]: current });
  }
  if (!["2568", "2569"].includes(plan.taxYear ?? "")) broken = true;
  if (data.taxPlan?.extra !== undefined) {
    if (
      !data.taxPlan.extra ||
      typeof data.taxPlan.extra !== "object" ||
      Array.isArray(data.taxPlan.extra)
    )
      broken = true;
    else {
      const extra = { ...extendedDefaults };
      for (const [k, v] of Object.entries(extendedDefaults)) {
        const input = data.taxPlan.extra[k];
        if (input === undefined) continue;
        if (
          typeof input !== typeof v ||
          (typeof input === "string" && input.length > 64)
        )
          broken = true;
        else Object.assign(extra, { [k]: input });
      }
      plan.extra = extra;
    }
  }
  if (data.taxPlan?.scopeAnswers !== undefined) {
    const answers = data.taxPlan.scopeAnswers;
    if (
      !answers ||
      typeof answers !== "object" ||
      Array.isArray(answers) ||
      Object.values(answers).some(
        (v) => typeof v !== "boolean" && v !== "unknown",
      ) ||
      Object.keys(answers).length > 10
    )
      broken = true;
    else plan.scopeAnswers = { ...answers };
  }
  const compatibleUpgrade =
    data.ruleVersion === `${plan.taxYear}-basic-1.0` && !data.taxPlan?.extra;

  if (broken) {
    if (!recover) throw new Error("แผนภาษีในไฟล์ไม่สมบูรณ์");
    plan = emptyPlan();
    warnings.push("แผนภาษีไม่สมบูรณ์ ให้กรอกใหม่; สมุดเงินที่อ่านได้ยังอยู่");
  }
  if (!compatibleUpgrade && data.ruleVersion !== rulesFor(plan).version) {
    plan = {
      ...plan,
      scope: false,
      lifeEligible: false,
      healthEligible: false,
      rmfEligible: false,
      ...(plan.extra
        ? {
            extra: Object.fromEntries(
              Object.entries(plan.extra).map(([k, v]) => [
                k,
                k.endsWith("Eligible") ? false : v,
              ]),
            ),
          }
        : {}),
    };
    warnings.push(
      "แผนมาจากกฎคนละรุ่น เก็บตัวเลขไว้ให้ตรวจและยืนยันใหม่; สมุดเงินใช้ต่อได้",
    );
  }
  let ledgerSettings = emptyLedgerSettings();
  try {
    ledgerSettings = decodeLedgerSettings(data.ledgerSettings);
  } catch (error) {
    if (!recover) throw error;
    warnings.push(
      "อ่านการตั้งค่าหมวด/รายการประจำไม่ได้ เก็บต้นฉบับไว้ให้กู้คืน",
    );
  }
  const ids = new Set<string>(),
    transactions: Transaction[] = [];
  let rejected = 0;
  for (const row of data.transactions) {
    if (!validTransaction(row, ledgerSettings) || ids.has(row.id)) {
      if (!recover) throw new Error("รายการเงินในไฟล์ไม่ถูกต้องหรือมีรหัสซ้ำ");
      rejected++;
      continue;
    }
    ids.add(row.id);
    transactions.push(copyRow(row));
  }
  if (rejected)
    warnings.push(
      `อ่านรายการเงินไม่ได้ ${rejected} รายการ เก็บต้นฉบับไว้และกู้รายการที่ถูกต้อง ${transactions.length} รายการ`,
    );
  return {
    data: {
      ...makeSaved(
        plan,
        transactions,
        data.schemaVersion === 1 ? true : data.autoSave,
        ledgerSettings,
      ),
      savedAt: data.savedAt,
      ruleVersion: compatibleUpgrade
        ? rulesFor(plan).version
        : data.ruleVersion,
    },
    warnings,
    rejected,
  };
}
// Backup imports are strict. Restore may salvage rows, with explicit review before writes.
export function parseSaved(raw: string): Saved {
  return decode(raw, false).data!;
}
export function recoverSaved(raw: string): Recovery {
  try {
    return decode(raw, true);
  } catch {
    return {
      data: null,
      warnings: [
        "อ่านสำเนาเดิมไม่ได้ ยังไม่เขียนทับ คุณดาวน์โหลดต้นฉบับเก็บไว้ได้",
      ],
      rejected: 0,
    };
  }
}
export function preserveRecovery(store: Store, raw: string): string {
  const key = `mytax.recovery.${Date.now()}.${crypto.randomUUID()}`;
  store.setItem(key, raw);
  return key;
}
export function writeSaved(
  store: Store,
  saved: Saved,
  expected: string | null,
  recoveryRaw?: string,
): string {
  if (store.getItem(STORAGE_KEY) !== expected) throw new StorageConflict();
  if (recoveryRaw) preserveRecovery(store, recoveryRaw);
  const raw = JSON.stringify(saved);
  store.setItem(STORAGE_KEY, raw);
  return raw;
}
export function readLocal(store: Store) {
  const primary = store.getItem(STORAGE_KEY);
  const key =
    primary !== null
      ? STORAGE_KEY
      : LEGACY_KEYS.find((k) => store.getItem(k) !== null);
  const raw = key ? store.getItem(key) : null;
  return {
    key,
    raw,
    primary,
    ...(raw !== null
      ? recoverSaved(raw)
      : { data: null, warnings: [], rejected: 0 }),
  };
}
export function dataSignature(
  plan: TaxPlan,
  transactions: Transaction[],
  settings: LedgerSettings = emptyLedgerSettings(),
): string {
  return JSON.stringify([plan, transactions, settings]);
}
