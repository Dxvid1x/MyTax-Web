import {
  extendedDefaults,
  extendedLabels,
  extensionIssue,
  count,
  type ExtendedTax,
} from "./extendedTax.ts";
export const RULES = {
  year: 2568,
  version: "2568-expanded-2.0",
  checked: "2026-10-03",
  from: "2025-01-01",
  to: "2025-12-31",
  personal: 60000,
  expenseRate: 0.5,
  expenseCap: 100000,
  socialCap: 9000,
  lifeCap: 100000,
  healthCap: 25000,
  insuranceSharedCap: 100000,
  rmfRate: 0.3,
  retirementCap: 500000,
  sources: [
    {
      title: "คู่มือ ภ.ง.ด.91 ปีภาษี 2568",
      url: "https://www.rd.go.th/fileadmin/tax_pdf/pit/2568/Ins91_241268.pdf",
    },
    {
      title: "ความหมายภาษีเงินได้หัก ณ ที่จ่าย",
      url: "https://www.rd.go.th/14929.html",
    },
  ],
} as const;
export type TaxYear = "2568" | "2569";
export const CURRENT_YEAR: TaxYear = "2569";
export const RULES_BY_YEAR = {
  "2568": RULES,
  "2569": {
    ...RULES,
    year: 2569,
    version: "2569-expanded-2.0",
    from: "2026-01-01",
    to: "2026-12-31",
    socialCap: 10500,
    sources: [
      {
        title: "ประมวลรัษฎากร: ค่าใช้จ่ายและค่าลดหย่อน",
        url: "https://www.rd.go.th/5937.html",
      },
      {
        title: "กฎกระทรวง 126: ประกันชีวิต สุขภาพ และ RMF",
        url: "https://www.rd.go.th/2502.html",
      },
      {
        title: "เงินสมทบประกันสังคมหักตามที่จ่ายจริง",
        url: "https://www.rd.go.th/60061.html",
      },
      {
        title: "ราชกิจจานุเบกษา: ฐานค่าจ้าง ม.33 ตั้งแต่ปี 2569",
        url: "https://ratchakitcha.soc.go.th/documents/98728.pdf",
      },
      {
        title: "กรมประชาสัมพันธ์: เงินสมทบ ม.33 สูงสุด 875 บาท/เดือน",
        url: "https://songkhla.prd.go.th/th/content/category/detail/id/33/iid/477946",
      },
      {
        title: "อัตราภาษีเงินได้บุคคลธรรมดา",
        url: "https://www.rd.go.th/555.html",
      },
    ],
  },
} as const;
export function rulesFor(plan: Pick<TaxPlan, "taxYear">) {
  const year = plan.taxYear ?? "2568";
  if (!(year in RULES_BY_YEAR)) throw new Error("เลือกปีภาษีที่รองรับ");
  return RULES_BY_YEAR[year];
}
export const BAND_LIMITS = [
  150000,
  300000,
  500000,
  750000,
  1000000,
  2000000,
  5000000,
  Infinity,
];
export const BAND_RATES = [0, 5, 10, 15, 20, 25, 30, 35];
export type ScopeAnswer = boolean | "unknown";
export type TaxPlan = {
  taxYear?: TaxYear;
  extra?: Partial<ExtendedTax>;
  scopeAnswers?: Record<string, ScopeAnswer>;
  salary: string;
  bonus: string;
  withholding: string;
  social: string;
  life: string;
  health: string;
  rmf: string;
  scope: boolean;
  lifeEligible: boolean;
  healthEligible: boolean;
  rmfEligible: boolean;
};
export const emptyPlan = (taxYear: TaxYear = "2568"): TaxPlan => ({
  taxYear,
  salary: "",
  bonus: "0",
  withholding: "",
  social: "0",
  life: "0",
  health: "0",
  rmf: "0",
  scope: false,
  lifeEligible: false,
  healthEligible: false,
  rmfEligible: false,
});
export const demoPlan = (): TaxPlan => ({
  ...emptyPlan(),
  salary: "600000",
  bonus: "60000",
  withholding: "32000",
  social: "9000",
  life: "20000",
  health: "15000",
  rmf: "30000",
  scope: true,
  lifeEligible: true,
  healthEligible: true,
  rmfEligible: true,
});
export function money(value: string): number {
  if (
    !/^(?:0|[1-9]\d*)(?:\.\d{1,2})?$/.test(value) ||
    Number(value) > 1000000000
  )
    throw new Error("กรอกจำนวน 0–1,000,000,000 บาท ทศนิยมไม่เกิน 2 ตำแหน่ง");
  const [baht, satang = ""] = value.split(".");
  return Number(baht) * 100 + Number(satang.padEnd(2, "0"));
}
export function progressiveTax(taxableSatang: number) {
  if (!Number.isSafeInteger(taxableSatang) || taxableSatang < 0)
    throw new Error("Invalid taxable income");
  let start = 0;
  const bands = BAND_LIMITS.map((limit, i) => {
    const portion = Math.max(0, Math.min(taxableSatang, limit * 100) - start);
    const tax = (portion * BAND_RATES[i]) / 100;
    const row = {
      from: start / 100,
      to: limit,
      rate: BAND_RATES[i],
      portion,
      tax,
    };
    start = limit * 100;
    return row;
  });
  return {
    bands,
    tax: Math.round(bands.reduce((total, row) => total + row.tax, 0)),
  };
}
export function calculate(plan: TaxPlan) {
  const rules = rulesFor(plan);
  if (!plan.scope)
    throw new Error("ยืนยันว่ากรณีของคุณอยู่ในขอบเขตที่รองรับก่อน");
  const values = Object.fromEntries(
    ["salary", "bonus", "withholding", "social", "life", "health", "rmf"].map(
      (k) => [
        k,
        k === "withholding" && plan.withholding === ""
          ? 0
          : money(plan[k as keyof TaxPlan] as string),
      ],
    ),
  ) as Record<string, number>;
  if (values.life > 0 && !plan.lifeEligible)
    throw new Error("ตรวจและยืนยันสิทธิ์ประกันชีวิตก่อน");
  if (values.health > 0 && !plan.healthEligible)
    throw new Error("ตรวจและยืนยันสิทธิ์ประกันสุขภาพก่อน");
  if (values.rmf > 0 && !plan.rmfEligible)
    throw new Error("ตรวจและยืนยันเงื่อนไข RMF ก่อน");
  const x = { ...extendedDefaults, ...plan.extra };
  const issue = extensionIssue(plan.extra, money);
  if (issue) throw new Error(issue.message);
  const gross = values.salary + values.bonus;
  const pvd = Math.min(
    money(x.pvd),
    Math.floor((money(x.pvdWage) * 15) / 100),
    rules.retirementCap * 100,
  );
  const gpf = Math.min(
    money(x.gpf),
    Math.max(0, rules.retirementCap * 100 - pvd),
  );
  const pvdDeduction = Math.min(pvd, 10000 * 100);
  const exemptions = pvd - pvdDeduction + gpf;
  if (exemptions > gross)
    throw new Error(
      "เงินสะสมเกษียณต้องไม่เกินรายได้ทั้งปี ตรวจฐานค่าจ้างและยอดสะสม",
    );
  const assessable = gross - exemptions;
  const expense = Math.min(Math.floor(assessable / 2), rules.expenseCap * 100);
  const deductions = {
    personal: rules.personal * 100,
    social: Math.min(values.social, rules.socialCap * 100),
    life: Math.min(values.life, rules.lifeCap * 100),
    health: 0,
    rmf: Math.min(
      values.rmf,
      Math.floor((assessable * 30) / 100),
      Math.max(0, rules.retirementCap * 100 - pvd - gpf),
    ),
  };
  deductions.health = Math.min(
    values.health,
    rules.healthCap * 100,
    rules.insuranceSharedCap * 100 - deductions.life,
  );
  const familyChildren =
    count(x.children) +
    Math.min(
      count(x.adoptedChildren, 3),
      Math.max(0, 3 - count(x.biologicalLiving)),
    );
  const extraDeductions = {
    spouse: x.spouseNoIncome ? 60000 * 100 : 0,
    children: (familyChildren + count(x.childBonus)) * 30000 * 100,
    parents: (count(x.parentOwn, 2) + count(x.parentSpouse, 2)) * 30000 * 100,
    mortgage: Math.min(money(x.mortgage), 100000 * 100),
    pvd,
    gpf,
    thaiEsg: Math.min(
      money(x.thaiEsg),
      Math.floor((assessable * 30) / 100),
      300000 * 100,
    ),
    hospitalDonation: 0,
    donation: 0,
  };
  const beforeDonation = Math.max(
    0,
    gross -
      expense -
      Object.values(deductions).reduce((a, b) => a + b, 0) -
      Object.values(extraDeductions).reduce((a, b) => a + b, 0),
  );
  extraDeductions.hospitalDonation = Math.min(
    money(x.hospitalDonation) * 2,
    Math.floor(beforeDonation / 10),
  );
  extraDeductions.donation = Math.min(
    money(x.donation),
    Math.floor((beforeDonation - extraDeductions.hospitalDonation) / 10),
  );
  // Keep the original five-key shape for unchanged legacy plans and fixtures.
  const allDeductions: Record<string, number> = { ...deductions };
  for (const [k, v] of Object.entries(extraDeductions))
    if (v > 0 || (k in x && money(x[k as keyof typeof x] as string) > 0))
      allDeductions[k] = v;
  const totalDeductions = Object.values(allDeductions).reduce(
    (a, b) => a + b,
    0,
  );
  Object.assign(values, {
    spouse: extraDeductions.spouse,
    children: extraDeductions.children,
    parents: extraDeductions.parents,
    mortgage: money(x.mortgage),
    pvd: money(x.pvd),
    gpf: money(x.gpf),
    thaiEsg: money(x.thaiEsg),
    hospitalDonation: money(x.hospitalDonation) * 2,
    donation: money(x.donation),
  });
  const taxable = Math.max(0, gross - expense - totalDeductions);
  const { tax, bands } = progressiveTax(taxable);
  return {
    gross,
    assessable,
    exemptions,
    pvdDeduction,
    marginalRate:
      BAND_RATES[BAND_LIMITS.findIndex((limit) => taxable < limit * 100)],
    deductionLabels: extendedLabels,
    expense,
    deductions: allDeductions,
    totalDeductions,
    taxable,
    tax,
    bands,
    withholding: values.withholding,
    balance: plan.withholding.trim() === "" ? null : tax - values.withholding,
    values,
  };
}
export function scenario(plan: TaxPlan, targetRmf: string) {
  const before = calculate(plan);
  const after = calculate({ ...plan, rmf: targetRmf });
  return {
    before,
    after,
    saving: before.tax - after.tax,
    committed: money(targetRmf) - money(plan.rmf),
  };
}
