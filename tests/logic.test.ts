import { test } from "node:test";
import assert from "node:assert/strict";
import {
  calculate,
  emptyPlan,
  demoPlan,
  money,
  progressiveTax,
  scenario,
  RULES,
} from "../src/tax.ts";
import {
  periodRange,
  shiftPeriod,
  summarize,
  csv,
  createTransaction,
  today,
  type Transaction,
} from "../src/ledger.ts";
import { parseSaved } from "../src/storage.ts";

const p = (values = {}) => ({
  ...emptyPlan(),
  salary: "600000",
  scope: true,
  ...values,
});
test("published tax band upper boundaries and neighbouring satang", () => {
  const fixtures = [
    [150000, 0],
    [300000, 7500],
    [500000, 27500],
    [750000, 65000],
    [1000000, 115000],
    [2000000, 365000],
    [5000000, 1265000],
  ];
  for (const [net, tax] of fixtures) {
    assert.equal(progressiveTax(net * 100).tax, tax * 100);
    assert.equal(progressiveTax(net * 100 - 1).tax, tax * 100);
    assert.equal(progressiveTax(net * 100 + 1).tax, tax * 100);
  }
  assert.equal(progressiveTax(5100000 * 100).tax, 1300000 * 100);
  assert.equal(progressiveTax(0).tax, 0);
  assert.throws(() => progressiveTax(-1));
});
test("independently calculated salary+bonus fixture and refund", () => {
  // 660,000 - 100,000 - (60,000+9,000+20,000+15,000+30,000)
  // = 426,000. Tax: 150,000*5% + 126,000*10% = 20,100.
  const r = calculate(demoPlan());
  assert.equal(r.taxable, 42600000);
  assert.equal(r.tax, 2010000);
  assert.equal(r.balance, -1190000);
  // 600,000 - 100,000 - 60,000 = 440,000; tax 21,500 - withheld 1,000.
  assert.equal(calculate(p({ withholding: "1000" })).balance, 2050000);
});
test("small income expense cap and zero tax", () => {
  assert.equal(calculate(p({ salary: "100000" })).expense, 5000000);
  assert.equal(calculate(p({ salary: "0" })).taxable, 0);
  assert.equal(calculate(p({ salary: "0" })).tax, 0);
});
test("insurance combined cap and health cap are independent", () => {
  const r = calculate(
    p({
      life: "90000",
      health: "50000",
      lifeEligible: true,
      healthEligible: true,
    }),
  );
  assert.equal(r.deductions.life, 9000000);
  assert.equal(r.deductions.health, 1000000);
  const capped = calculate(
    p({
      life: "150000",
      health: "25000",
      lifeEligible: true,
      healthEligible: true,
      social: "10000",
    }),
  );
  assert.equal(capped.deductions.life, 10000000);
  assert.equal(capped.deductions.health, 0);
  assert.equal(capped.deductions.social, 900000);
});
test("RMF respects income percentage and absolute cap", () => {
  assert.equal(
    calculate(p({ rmf: "500000", rmfEligible: true })).deductions.rmf,
    18000000,
  );
  assert.equal(
    calculate(p({ salary: "3000000", rmf: "700000", rmfEligible: true }))
      .deductions.rmf,
    50000000,
  );
});
test("what-if savings recompute across a bracket and use replacement", () => {
  const compare = scenario(
    p({ salary: "700000", rmf: "0", rmfEligible: true }),
    "60000",
  );
  assert.equal(compare.before.tax, 3350000);
  assert.equal(compare.after.tax, 2550000);
  assert.equal(compare.saving, 800000);
  assert.equal(compare.committed, 6000000);
  assert.equal(
    scenario(p({ salary: "700000", rmf: "30000", rmfEligible: true }), "60000")
      .after.deductions.rmf,
    6000000,
  );
});
test("scope and product eligibility are required, no silent claims", () => {
  assert.throws(() => calculate({ ...demoPlan(), scope: false }));
  assert.throws(() => calculate(p({ life: "1" })));
  assert.throws(() => calculate(p({ health: "1" })));
  assert.throws(() => calculate(p({ rmf: "1" })));
  assert.throws(() => calculate(p({ salary: "" })));
});
test("money is integer satang, malformed or large amounts rejected", () => {
  assert.equal(money("0.29"), 29);
  assert.equal(money("12.3"), 1230);
  assert.equal(money("1000000000"), 100000000000);
  for (const invalid of [
    "",
    "-1",
    "1e5",
    "NaN",
    "1.001",
    "1,000",
    "1000000001",
    "00",
    "Infinity",
  ])
    assert.throws(() => money(invalid));
});
test("week boundaries are Monday to Sunday across a year", () => {
  assert.deepEqual(periodRange("2026-01-01", "week"), {
    start: "2025-12-29",
    end: "2026-01-04",
  });
  assert.deepEqual(periodRange("2026-01-04", "week"), {
    start: "2025-12-29",
    end: "2026-01-04",
  });
  assert.deepEqual(periodRange("2026-01-05", "week"), {
    start: "2026-01-05",
    end: "2026-01-11",
  });
});
test("calendar months and shifts handle leap days", () => {
  assert.deepEqual(periodRange("2024-02-29", "month"), {
    start: "2024-02-01",
    end: "2024-02-29",
  });
  assert.deepEqual(periodRange("2025-02-28", "month"), {
    start: "2025-02-01",
    end: "2025-02-28",
  });
  assert.equal(shiftPeriod("2026-01-31", "month", 1), "2026-02-01");
  assert.equal(shiftPeriod("2026-01-01", "week", -1), "2025-12-22");
  assert.throws(() => periodRange("2025-02-29", "month"));
});
const tx = (
  id: string,
  date: string,
  type: "income" | "expense",
  amount: number,
  note = "",
): Transaction => ({
  id,
  date,
  type,
  amount,
  category: type === "income" ? "เงินเดือน" : "อาหาร",
  note,
  createdAt: "2026-01-01T00:00:00Z",
  updatedAt: "2026-01-01T00:00:00Z",
});
test("summary filters period, recomputes edits/deletes, uses no opening balance", () => {
  const rows = [
    tx("1", "2025-12-31", "income", 100000),
    tx("2", "2026-01-01", "income", 1000),
    tx("3", "2026-01-04", "expense", 329),
  ];
  const range = { start: "2026-01-01", end: "2026-01-04" };
  assert.equal(summarize(rows, range).net, 671);
  assert.equal(
    summarize(
      rows.map((t) => (t.id === "3" ? { ...t, amount: 500 } : t)),
      range,
    ).net,
    500,
  );
  assert.equal(
    summarize(
      rows.filter((t) => t.id !== "3"),
      range,
    ).net,
    1000,
  );
  assert.equal(summarize([], range).net, 0);
});
test("CSV handles formulas, quoted notes and Thai BOM", () => {
  const data = csv([
    tx("1", "2026-01-01", "income", 1234, ' =HYPERLINK("x")'),
    tx("2", "2026-01-01", "expense", 329, 'อาหาร, "กลางวัน"'),
  ]);
  assert.ok(data.startsWith("\ufeff"));
  assert.ok(data.includes('"\' =HYPERLINK(""x"")"'));
  assert.ok(data.includes('"อาหาร, ""กลางวัน"""'));
  assert.ok(data.includes('"12.34"'));
});
test("transaction validation dates, future, category, zero and duplicates shape", () => {
  const t = createTransaction("expense", "12.34", today(), "อาหาร", "");
  assert.equal(t.amount, 1234);
  assert.throws(() =>
    createTransaction("income", "0", today(), "เงินเดือน", ""),
  );
  assert.throws(() =>
    createTransaction("expense", "1", "2099-01-01", "อาหาร", ""),
  );
  assert.throws(() =>
    createTransaction("expense", "1", "2025-02-29", "อาหาร", ""),
  );
  assert.throws(() =>
    createTransaction("expense", "1", today(), "เงินเดือน", ""),
  );
});
test("saved data restore allows drafts, rejects corrupt and duplicate entries", () => {
  const base = {
    schemaVersion: 1,
    ruleVersion: RULES.version,
    savedAt: "2026-01-01",
    taxPlan: p(),
    transactions: [tx("1", "2026-01-01", "income", 1000)],
  };
  assert.equal(parseSaved(JSON.stringify(base)).transactions.length, 1);
  assert.equal(
    parseSaved(JSON.stringify({ ...base, taxPlan: p({ salary: "0." }) }))
      .taxPlan.salary,
    "0.",
  );
  assert.throws(() =>
    parseSaved(JSON.stringify({ ...base, schemaVersion: 2 })),
  );
  assert.throws(() =>
    parseSaved(
      JSON.stringify({
        ...base,
        transactions: [base.transactions[0], base.transactions[0]],
      }),
    ),
  );
  assert.throws(() =>
    parseSaved(
      JSON.stringify({
        ...base,
        transactions: [{ ...base.transactions[0], amount: -1 }],
      }),
    ),
  );
  assert.throws(() => parseSaved("{bad}"));
});
