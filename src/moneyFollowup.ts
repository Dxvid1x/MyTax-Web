import { validDate } from "./ledger.ts";
export function followupNumbers(
  cash: number,
  bills: number,
  reserve: number,
  payday: number,
  asOf: string,
) {
  if (
    ![cash, bills, reserve].every(Number.isSafeInteger) ||
    bills < 0 ||
    reserve < 0 ||
    !Number.isInteger(payday) ||
    payday < 1 ||
    payday > 31 ||
    !validDate(asOf)
  )
    throw new Error("ข้อมูลรอบเงินไม่ถูกต้อง");
  const d = new Date(asOf + "T12:00:00Z");
  const candidate = (offset: number) => {
    const month = d.getUTCMonth() + offset;
    const last = new Date(
      Date.UTC(d.getUTCFullYear(), month + 1, 0),
    ).getUTCDate();
    return new Date(
      Date.UTC(d.getUTCFullYear(), month, Math.min(payday, last), 12),
    );
  };
  let next = candidate(0);
  if (next <= d) next = candidate(1);
  const days = Math.max(
    1,
    Math.round((next.getTime() - d.getTime()) / 86400000),
  );
  const available = cash - bills - reserve;
  return {
    available,
    days,
    daily: Math.floor(Math.max(0, available) / days),
    shortfall: Math.max(0, -available),
    payday: next.toISOString().slice(0, 10),
  };
}
