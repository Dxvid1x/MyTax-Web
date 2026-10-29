import { money } from "./tax.ts";
// The tax engine stays strict; normalise human-entered amounts at the UI boundary.
export function canonicalMoneyInput(raw: string): string {
  const text = raw.replace(/\s/g, "");
  if (!/^(?:\d+|\d{1,3}(?:,\d{3})+)(?:\.\d{0,2})?$/.test(text))
    throw new Error("ใส่จำนวนเงิน เช่น 600,000 หรือ 12.50");
  const [baht, fraction] = text.replace(/,/g, "").split(".");
  const value =
    baht.replace(/^0+(?=\d)/, "") + (fraction ? "." + fraction : "");
  money(value);
  return value;
}
export function inputMoney(raw: string): number {
  return money(canonicalMoneyInput(raw));
}
export function moneyDisplay(raw: string): string {
  try {
    return new Intl.NumberFormat("th-TH", { maximumFractionDigits: 2 }).format(
      inputMoney(raw) / 100,
    );
  } catch {
    return raw;
  }
}
export function annualFromMonthly(raw: string, months: number): string {
  if (!Number.isInteger(months) || months < 1 || months > 12)
    throw new Error("เลือกจำนวนเดือน 1–12");
  const total = inputMoney(raw) * months;
  if (total > 100000000000) throw new Error("ยอดทั้งปีเกินขอบเขต");
  return (total / 100).toFixed(2);
}
