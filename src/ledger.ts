import { money } from "./tax.ts";
export type Transaction = {
  id: string;
  type: "income" | "expense";
  amount: number;
  date: string;
  category: string;
  note: string;
  createdAt: string;
  updatedAt: string;
};
export const categories = {
  income: ["เงินเดือน", "งานเสริม", "อื่น ๆ"],
  expense: ["อาหาร", "เดินทาง", "ที่พัก", "ช้อปปิ้ง", "สุขภาพ", "อื่น ๆ"],
};
export function today() {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Bangkok",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}
export function validDate(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const d = new Date(value + "T12:00:00Z");
  return Number.isFinite(d.getTime()) && d.toISOString().slice(0, 10) === value;
}
export function periodRange(anchor: string, kind: "week" | "month" | "year") {
  if (!validDate(anchor)) throw new Error("Invalid date");
  const d = new Date(anchor + "T12:00:00Z");
  const start = new Date(d),
    end = new Date(d);
  if (kind === "year") {
    start.setUTCMonth(0, 1);
    end.setUTCMonth(11, 31);
  } else if (kind === "month") {
    start.setUTCDate(1);
    end.setUTCMonth(end.getUTCMonth() + 1, 0);
  } else {
    const delta = (d.getUTCDay() + 6) % 7;
    start.setUTCDate(d.getUTCDate() - delta);
    end.setTime(start.getTime());
    end.setUTCDate(start.getUTCDate() + 6);
  }
  return {
    start: start.toISOString().slice(0, 10),
    end: end.toISOString().slice(0, 10),
  };
}
export function shiftPeriod(
  anchor: string,
  kind: "week" | "month" | "year",
  direction: number,
) {
  const { start } = periodRange(anchor, kind);
  const d = new Date(start + "T12:00:00Z");
  if (kind === "week") d.setUTCDate(d.getUTCDate() + direction * 7);
  else if (kind === "year") d.setUTCFullYear(d.getUTCFullYear() + direction);
  else d.setUTCMonth(d.getUTCMonth() + direction);
  return d.toISOString().slice(0, 10);
}
export function summarize(
  transactions: Transaction[],
  range: { start: string; end: string },
) {
  const rows = transactions
    .filter((t) => t.date >= range.start && t.date <= range.end)
    .sort(
      (a, b) =>
        b.date.localeCompare(a.date) || b.createdAt.localeCompare(a.createdAt),
    );
  const income = rows
    .filter((t) => t.type === "income")
    .reduce((a, t) => a + t.amount, 0);
  const expense = rows
    .filter((t) => t.type === "expense")
    .reduce((a, t) => a + t.amount, 0);
  return { rows, income, expense, net: income - expense };
}
export function createTransaction(
  type: "income" | "expense",
  amountText: string,
  date: string,
  category: string,
  note: string,
  customCategories: string[] = [],
): Transaction {
  const amount = money(amountText);
  if (amount <= 0) throw new Error("จำนวนต้องมากกว่า 0 บาท");
  if (!validDate(date) || date > today() || date < "1900-01-01")
    throw new Error("เลือกวันที่จริงตั้งแต่ปี 1900 ถึงวันนี้");
  if (![...categories[type], ...customCategories].includes(category))
    throw new Error("เลือกหมวดให้ตรงกับประเภท");
  if (note.length > 250) throw new Error("หมายเหตุไม่เกิน 250 ตัวอักษร");
  return {
    id: crypto.randomUUID(),
    type,
    amount,
    date,
    category,
    note,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}
export function csv(transactions: Transaction[]) {
  const cell = (s: string) =>
    '"' + (/^[\s]*[=+\-@\t\r]/.test(s) ? "'" + s : s).replace(/"/g, '""') + '"';
  const rows = transactions.map((t) =>
    [
      t.date,
      t.type === "income" ? "รายรับ" : "รายจ่าย",
      t.category,
      (t.amount / 100).toFixed(2),
      t.note,
    ]
      .map(cell)
      .join(","),
  );
  return (
    "\ufeffวันที่ (ค.ศ. YYYY-MM-DD),ประเภท,หมวด,จำนวนบาท,หมายเหตุ\r\n" +
    rows.join("\r\n")
  );
}
