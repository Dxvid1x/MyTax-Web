import { calculate, money, type TaxPlan } from "./tax.ts";

export type SupportedDeduction =
  "rmf" | "life" | "health" | "social" | "thaiEsg" | "mortgage" | "donation";
export const eligibilityKey = {
  rmf: "rmfEligible",
  life: "lifeEligible",
  health: "healthEligible",
} as const;

export const extendedScenarioKeys = [
  "thaiEsg",
  "mortgage",
  "donation",
] as const;
export function deductionValue(plan: TaxPlan, key: SupportedDeduction) {
  return extendedScenarioKeys.includes(
    key as (typeof extendedScenarioKeys)[number],
  )
    ? (plan.extra?.[key as "thaiEsg" | "mortgage" | "donation"] ?? "0")
    : plan[key as "rmf" | "life" | "health" | "social"];
}
export function deductionEligible(plan: TaxPlan, key: SupportedDeduction) {
  if (key === "social") return true;
  if (
    extendedScenarioKeys.includes(key as (typeof extendedScenarioKeys)[number])
  )
    return !!plan.extra?.[
      `${key}Eligible` as
        "thaiEsgEligible" | "mortgageEligible" | "donationEligible"
    ];
  return plan[eligibilityKey[key as "rmf" | "life" | "health"]];
}
// A replacement total: never add the existing contribution twice.
export function deductionScenario(
  plan: TaxPlan,
  key: SupportedDeduction,
  total: string,
  eligible: boolean,
) {
  const before = calculate(plan);
  const candidate: TaxPlan = { ...plan, [key]: total };
  if (
    extendedScenarioKeys.includes(key as (typeof extendedScenarioKeys)[number])
  ) {
    delete (candidate as unknown as Record<string, unknown>)[key];
    candidate.extra = {
      ...plan.extra,
      [key]: total,
      [`${key}Eligible`]: eligible,
    };
  } else if (key !== "social")
    candidate[eligibilityKey[key as "rmf" | "life" | "health"]] = eligible;
  const after = calculate(candidate);
  return {
    candidate,
    before,
    after,
    saving: before.tax - after.tax,
    paidDifference: money(total) - money(deductionValue(plan, key)),
    allowedDifference:
      (after.deductions[key] ?? 0) - (before.deductions[key] ?? 0),
  };
}
