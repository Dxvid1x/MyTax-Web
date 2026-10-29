import { calculate, CURRENT_YEAR, type TaxPlan, type TaxYear } from "./tax.ts";
import { today } from "./ledger.ts";

export function yearIsOpen(year: TaxYear, date = today()) {
  return (
    Number(year) === Number(date.slice(0, 4)) + 543 && year === CURRENT_YEAR
  );
}
export function daysToYearEnd(year: TaxYear, date = today()) {
  const end = Date.UTC(Number(year) - 543, 11, 31);
  return Math.max(
    0,
    Math.round((end - Date.parse(date + "T00:00:00Z")) / 86400000),
  );
}
export function switchTaxYear(plan: TaxPlan, taxYear: TaxYear): TaxPlan {
  return {
    ...plan,
    taxYear,
    scope: false,
    lifeEligible: false,
    healthEligible: false,
    rmfEligible: false,
    extra: plan.extra
      ? {
          ...plan.extra,
          familyEligible: false,
          mortgageEligible: false,
          pvdEligible: false,
          gpfEligible: false,
          thaiEsgEligible: false,
          donationEligible: false,
          hospitalDonationEligible: false,
        }
      : undefined,
  };
}
export function liveEstimate(plan: TaxPlan) {
  if (!plan.salary.trim())
    return { result: null, reason: "กรอกเงินเดือนก่อน จึงจะประมาณภาษีได้" };
  if (
    ["otherIncome", "otherRetirement", "special"].some(
      (key) =>
        plan.scopeAnswers?.[key] === true ||
        plan.scopeAnswers?.[key] === "unknown",
    )
  )
    return {
      result: null,
      reason: "ยังประมาณไม่ได้ มีรายการนอกขอบเขตหรือยังไม่แน่ใจ",
    };
  try {
    // Preview only the supported draft. Do not mutate scope or invent eligible deductions.
    return {
      result: calculate({ ...plan, scope: true }),
      reason: plan.scope
        ? "ประมาณการจากรายการที่กรอก"
        : "เฉพาะส่วนที่กรอก ยังต้องตรวจขอบเขตและสิทธิ์ก่อนดูผล",
    };
  } catch {
    return {
      result: null,
      reason: "ยังประมาณไม่ได้ ตรวจยอดเงินและยืนยันสิทธิ์ลดหย่อน",
    };
  }
}
export function rateSummary(result: ReturnType<typeof calculate>) {
  return {
    marginal: result.marginalRate,
    average: result.gross > 0 ? (result.tax / result.gross) * 100 : 0,
    perThousand: result.marginalRate * 10,
  };
}
