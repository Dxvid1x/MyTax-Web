import { test } from "node:test";
import assert from "node:assert/strict";
import { calculate, emptyPlan, type TaxPlan } from "../src/tax.ts";
import { extendedDefaults } from "../src/extendedTax.ts";
import { deductionScenario } from "../src/deductionScenario.ts";
import { createTransaction, periodRange, shiftPeriod } from "../src/ledger.ts";
import {
  dueEntries,
  nextOccurrence,
  emptyLedgerSettings,
  decodeLedgerSettings,
} from "../src/ledgerExtras.ts";
import { makeSaved, parseSaved, recoverSaved } from "../src/storage.ts";
const base = (extra: TaxPlan["extra"] = {}): TaxPlan => ({
  ...emptyPlan("2569"),
  salary: "900000",
  scope: true,
  extra: { ...extendedDefaults, ...extra },
});
test("family, joint-borrower allocated mortgage, and tax match independent arithmetic", () => {
  const result = calculate(
    base({
      spouseNoIncome: true,
      biologicalLiving: "2",
      children: "2",
      childBonus: "1",
      adoptedChildren: "1",
      parentOwn: "2",
      parentSpouse: "1",
      familyEligible: true,
      mortgage: "140000",
      mortgageEligible: true,
    }),
  );
  assert.equal(result.deductions.children, 12000000);
  assert.equal(result.deductions.parents, 9000000);
  assert.equal(result.deductions.mortgage, 10000000);
  assert.equal(result.taxable, 37000000);
  assert.equal(result.tax, 1450000);
  assert.equal(result.marginalRate, 10);
});
test("adoption slots use all living biological children, including those not eligible", () => {
  const result = calculate(
    base({
      biologicalLiving: "3",
      children: "1",
      adoptedChildren: "3",
      familyEligible: true,
    }),
  );
  assert.equal(result.deductions.children, 3000000);
  const second = calculate(
    base({
      biologicalLiving: "2",
      children: "1",
      adoptedChildren: "3",
      familyEligible: true,
    }),
  );
  assert.equal(second.deductions.children, 6000000);
});
test("family counts, spouse parents, and every additional positive amount need explicit eligibility", () => {
  for (const extra of [
    { children: "1", biologicalLiving: "1" },
    { parentSpouse: "1", familyEligible: true },
    { children: "1", biologicalLiving: "0", familyEligible: true },
    {
      children: "1",
      childBonus: "2",
      biologicalLiving: "1",
      familyEligible: true,
    },
  ])
    assert.throws(() => calculate(base(extra)));
  for (const key of [
    "mortgage",
    "pvd",
    "gpf",
    "thaiEsg",
    "donation",
    "hospitalDonation",
  ] as const)
    assert.throws(() => calculate(base({ [key]: "1000" })));
});
test("PVD exemption is deducted before 50% salary expenses, first 10k after expenses", () => {
  const result = calculate({
    ...base({ pvd: "27000", pvdWage: "180000", pvdEligible: true }),
    salary: "180000",
  });
  assert.equal(result.pvdDeduction, 1000000);
  assert.equal(result.exemptions, 1700000);
  assert.equal(result.assessable, 16300000);
  assert.equal(result.expense, 8150000);
  assert.equal(result.taxable, 1150000);
  const capped = calculate({
    ...base({ pvd: "30000", pvdWage: "180000", pvdEligible: true }),
    salary: "180000",
  });
  assert.equal(capped.deductions.pvd, 2700000);
});
test("GPF is exempt before expenses and retirement amounts cannot exceed gross", () => {
  const result = calculate({
    ...base({ gpf: "20000", gpfEligible: true }),
    salary: "180000",
  });
  assert.equal(result.expense, 8000000);
  assert.equal(result.taxable, 2000000);
  assert.throws(() =>
    calculate({
      ...base({ gpf: "200000", gpfEligible: true }),
      salary: "100000",
    }),
  );
});
test("PVD/GPF/RMF share 500k, Thai ESG remains separate; independent high-income tax", () => {
  const result = calculate({
    ...base({
      pvd: "200000",
      pvdWage: "2000000",
      pvdEligible: true,
      gpf: "100000",
      gpfEligible: true,
      thaiEsg: "500000",
      thaiEsgEligible: true,
    }),
    salary: "2000000",
    rmf: "500000",
    rmfEligible: true,
  });
  assert.equal(result.deductions.rmf, 20000000);
  assert.equal(result.deductions.thaiEsg, 30000000);
  assert.equal(result.taxable, 104000000);
  assert.equal(result.tax, 12500000);
});
test("percentage caps use income subject to tax after pre-expense exemptions", () => {
  const result = calculate({
    ...base({
      gpf: "100000",
      gpfEligible: true,
      thaiEsg: "300000",
      thaiEsgEligible: true,
    }),
    salary: "600000",
    rmf: "300000",
    rmfEligible: true,
  });
  assert.equal(result.deductions.rmf, 15000000);
  assert.equal(result.deductions.thaiEsg, 15000000);
});
test("2x government-hospital cap precedes general donations; no deduction can make negative income", () => {
  const result = calculate(
    base({
      hospitalDonation: "40000",
      hospitalDonationEligible: true,
      donation: "100000",
      donationEligible: true,
    }),
  );
  assert.equal(result.deductions.hospitalDonation, 7400000);
  assert.equal(result.deductions.donation, 6660000);
  assert.equal(result.taxable, 59940000);
  assert.equal(result.tax, 4241000);
  const zero = calculate({
    ...base({
      hospitalDonation: "40000",
      hospitalDonationEligible: true,
      donation: "100000",
      donationEligible: true,
    }),
    salary: "100000",
  });
  assert.equal(zero.taxable, 0);
  assert.equal(zero.tax, 0);
});
test("marginal rates describe next baht at each boundary", () => {
  for (const [income, rate] of [
    [310000, 5],
    [460000, 10],
    [660000, 15],
    [910000, 20],
    [1160000, 25],
    [2160000, 30],
    [5160000, 35],
  ])
    assert.equal(
      calculate({ ...base(), salary: String(income) }).marginalRate,
      rate,
    );
});
test("extended what-if replaces totals, retains other allowances, never mutates original", () => {
  const plan = base({ mortgage: "30000", mortgageEligible: true });
  const original = JSON.stringify(plan);
  const result = deductionScenario(plan, "thaiEsg", "50000", true);
  assert.equal(result.after.deductions.mortgage, 3000000);
  assert.equal(result.after.taxable, result.before.taxable - 5000000);
  assert.equal(JSON.stringify(plan), original);
  assert.throws(() => deductionScenario(plan, "thaiEsg", "50000", false));
});
test("schema 2 upgrades with numbers and ledger intact; expanded rules require review when incompatible", () => {
  const row = createTransaction("expense", "12.34", "2026-01-01", "อาหาร", "");
  const old = {
    ...makeSaved({ ...emptyPlan("2569"), salary: "600000", scope: true }, [
      row,
    ]),
    schemaVersion: 2,
    ruleVersion: "2569-basic-1.0",
  };
  delete (old as Record<string, unknown>).ledgerSettings;
  const restored = parseSaved(JSON.stringify(old));
  assert.equal(restored.schemaVersion, 4);
  assert.equal(restored.taxPlan.scope, true);
  assert.equal(restored.transactions[0].amount, 1234);
  const changed = recoverSaved(
    JSON.stringify({
      ...makeSaved(base({ mortgage: "10000", mortgageEligible: true }), [row]),
      ruleVersion: "future",
    }),
  );
  assert.equal(changed.data?.taxPlan.extra?.mortgage, "10000");
  assert.equal(changed.data?.taxPlan.extra?.mortgageEligible, false);
  assert.equal(changed.data?.transactions.length, 1);
});
test("custom categories and recurring settings round-trip JSON; malformed settings do not discard built-in ledger rows", () => {
  const settings = emptyLedgerSettings();
  settings.customCategories.expense = ["แมว"];
  const row = createTransaction("expense", "22.22", "2026-01-01", "แมว", "", [
    "แมว",
  ]);
  assert.deepEqual(
    parseSaved(JSON.stringify(makeSaved(base(), [row], true, settings)))
      .ledgerSettings,
    settings,
  );
  assert.throws(() =>
    decodeLedgerSettings({
      ...settings,
      customCategories: { income: [], expense: ["แมว", "แมว"] },
    }),
  );
  const original = createTransaction(
    "expense",
    "12",
    "2026-01-01",
    "อาหาร",
    "",
  );
  const recovered = recoverSaved(
    JSON.stringify({
      ...makeSaved(base(), [original]),
      ledgerSettings: { bad: true },
    }),
  );
  assert.equal(recovered.data?.transactions.length, 1);
  assert.ok(recovered.warnings.length);
});
test("monthly recurring anchor survives February including leap years; weekly uses calendar days", () => {
  assert.equal(
    nextOccurrence("2026-01-31", "2026-01-31", "month"),
    "2026-02-28",
  );
  assert.equal(
    nextOccurrence("2026-01-31", "2026-02-28", "month"),
    "2026-03-31",
  );
  assert.equal(
    nextOccurrence("2024-01-31", "2024-01-31", "month"),
    "2024-02-29",
  );
  assert.equal(
    nextOccurrence("2026-12-29", "2026-12-29", "week"),
    "2027-01-05",
  );
});
test("recurring previews are deterministic, never duplicated and advance only returned settings", () => {
  const settings = emptyLedgerSettings();
  settings.recurring = [
    {
      id: "rent",
      type: "expense",
      amount: 1200000,
      category: "ที่พัก",
      note: "",
      startDate: "2026-01-31",
      nextDate: "2026-02-28",
      frequency: "month",
    },
  ];
  // Use a built-in category without coupling the recurrence calendar test to display labels.
  settings.recurring[0].category = "อาหาร";
  const first = dueEntries(settings, [], "2026-04-30");
  assert.deepEqual(
    first.rows.map((r) => r.date),
    ["2026-02-28", "2026-03-31", "2026-04-30"],
  );
  assert.equal(settings.recurring[0].nextDate, "2026-02-28");
  assert.equal(dueEntries(settings, first.rows, "2026-04-30").rows.length, 0);
  assert.equal(
    dueEntries(first.settings, first.rows, "2026-04-30").rows.length,
    0,
  );
  assert.throws(() => dueEntries(settings, [], "bad"));
});
test("year summary boundaries and navigation are full calendar years", () => {
  assert.deepEqual(periodRange("2024-02-29", "year"), {
    start: "2024-01-01",
    end: "2024-12-31",
  });
  assert.equal(shiftPeriod("2024-02-29", "year", 1).slice(0, 4), "2025");
});
