import { categories, today, validDate, type Transaction } from "./ledger.ts";
export type Recurring = {
  id: string;
  type: "income" | "expense";
  amount: number;
  category: string;
  note: string;
  startDate: string;
  nextDate: string;
  frequency: "month" | "week";
};
export type LedgerSettings = {
  customCategories: { income: string[]; expense: string[] };
  recurring: Recurring[];
};
export const emptyLedgerSettings = (): LedgerSettings => ({
  customCategories: { income: [], expense: [] },
  recurring: [],
});
export function categoryList(
  settings: LedgerSettings,
  type: Transaction["type"],
) {
  return [...categories[type], ...settings.customCategories[type]];
}
export function nextOccurrence(
  start: string,
  current: string,
  frequency: "week" | "month",
) {
  if (!validDate(start) || !validDate(current))
    throw new Error("วันที่รายการประจำไม่ถูกต้อง");
  const date = new Date(current + "T12:00:00Z");
  if (frequency === "week") date.setUTCDate(date.getUTCDate() + 7);
  else {
    const day = Number(start.slice(8));
    date.setUTCDate(1);
    date.setUTCMonth(date.getUTCMonth() + 1);
    const last = new Date(
      Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + 1, 0),
    ).getUTCDate();
    date.setUTCDate(Math.min(day, last));
  }
  return date.toISOString().slice(0, 10);
}
export function dueEntries(
  settings: LedgerSettings,
  transactions: Transaction[],
  until = today(),
) {
  if (!validDate(until)) throw new Error("วันที่สิ้นสุดไม่ถูกต้อง");
  const ids = new Set(transactions.map((t) => t.id));
  const rows: Transaction[] = [];
  const recurring = settings.recurring.map((rule) => {
    let date = rule.nextDate;
    let count = 0;
    while (date <= until && count < 120) {
      const id = `repeat:${rule.id}:${date}`;
      if (!ids.has(id))
        rows.push({
          id,
          type: rule.type,
          amount: rule.amount,
          date,
          category: rule.category,
          note: rule.note,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
      ids.add(id);
      date = nextOccurrence(rule.startDate, date, rule.frequency);
      count++;
    }
    return { ...rule, nextDate: date };
  });
  if (rows.length + transactions.length > 10000)
    throw new Error("สมุดเงินเกิน 10,000 รายการ สำรองและแยกปีข้อมูลก่อน");
  return { rows, settings: { ...settings, recurring } };
}
export function decodeLedgerSettings(input: unknown): LedgerSettings {
  if (input === undefined) return emptyLedgerSettings();
  if (!input || typeof input !== "object")
    throw new Error("การตั้งค่าสมุดเงินไม่ถูกต้อง");
  const v = input as LedgerSettings;
  if (
    !v.customCategories ||
    !Array.isArray(v.recurring) ||
    v.recurring.length > 100
  )
    throw new Error("รายการประจำไม่ถูกต้อง");
  for (const type of ["income", "expense"] as const) {
    const list = v.customCategories[type];
    if (
      !Array.isArray(list) ||
      list.length > 32 ||
      new Set(list).size !== list.length ||
      list.some(
        (c) =>
          typeof c !== "string" ||
          !c.trim() ||
          c.length > 40 ||
          categories[type].includes(c),
      )
    )
      throw new Error("หมวดที่กำหนดเองไม่ถูกต้อง");
  }
  const seen = new Set<string>();
  for (const r of v.recurring) {
    if (
      !r ||
      typeof r.id !== "string" ||
      !r.id ||
      r.id.length > 128 ||
      seen.has(r.id) ||
      !["income", "expense"].includes(r.type) ||
      !Number.isSafeInteger(r.amount) ||
      r.amount <= 0 ||
      r.amount > 100000000000 ||
      !categoryList(v, r.type).includes(r.category) ||
      typeof r.note !== "string" ||
      r.note.length > 250 ||
      !validDate(r.startDate) ||
      !validDate(r.nextDate) ||
      r.startDate < "1900-01-01" ||
      r.nextDate < r.startDate ||
      !["month", "week"].includes(r.frequency)
    )
      throw new Error("รายการประจำในไฟล์ไม่ถูกต้อง");
    seen.add(r.id);
  }
  return {
    customCategories: {
      income: [...v.customCategories.income],
      expense: [...v.customCategories.expense],
    },
    recurring: v.recurring.map((r) => ({
      id: r.id,
      type: r.type,
      amount: r.amount,
      category: r.category,
      note: r.note,
      startDate: r.startDate,
      nextDate: r.nextDate,
      frequency: r.frequency,
    })),
  };
}
