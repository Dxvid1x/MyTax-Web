import { extensionIssue } from "./extendedTax.ts";
import { calculate, money, type TaxPlan } from "./tax.ts";
export type Issue = { id: string; message: string };
export function validateTaxStep(
  plan: TaxPlan,
  step: number,
  paidChoice = "unknown",
): Issue | null {
  const fields =
    step === 1
      ? ["salary", "bonus"]
      : ["salary", "bonus", "social", "life", "health", "rmf"];
  for (const key of fields) {
    try {
      money(plan[key as keyof TaxPlan] as string);
    } catch {
      return {
        id: key,
        message:
          key === "salary" && !plan.salary
            ? "ใส่เงินเดือนก่อน หรือใส่ 0 ถ้าไม่มี"
            : "ตรวจยอดเงินให้เป็นตัวเลข ทศนิยมไม่เกิน 2 ตำแหน่ง",
      };
    }
  }
  if (step === 3 && !plan.scope)
    return { id: "scope", message: "อ่านและยืนยันขอบเขตก่อนดูผล" };
  if (step > 1) {
    for (const [key, label] of [
      ["life", "ประกันชีวิต"],
      ["health", "ประกันสุขภาพ"],
      ["rmf", "RMF"],
    ] as const) {
      if (money(plan[key]) > 0 && !plan[`${key}Eligible`])
        return {
          id: `${key}Eligible`,
          message: `ตรวจและยืนยันสิทธิ์${label}ก่อน`,
        };
    }
  }
  if (step > 1) {
    const issue = extensionIssue(plan.extra, money);
    if (issue) return issue;
  }
  if (step === 3 && paidChoice === "yes" && !plan.withholding)
    return {
      id: "withholding",
      message: "ใส่ยอดภาษีที่บริษัทหักทั้งปี หรือเลือกยังไม่รู้ยอด",
    };
  if (step === 3 && plan.withholding) {
    try {
      money(plan.withholding);
    } catch {
      return { id: "withholding", message: "ตรวจยอดภาษีที่บริษัทหักไว้" };
    }
  }
  return null;
}
export function validResult(plan: TaxPlan): boolean {
  try {
    calculate(plan);
    return true;
  } catch {
    return false;
  }
}
