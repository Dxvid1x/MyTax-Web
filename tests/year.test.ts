import { test } from "node:test";
import assert from "node:assert/strict";
import { calculate, demoPlan, RULES_BY_YEAR, rulesFor } from "../src/tax.ts";
import { makeSaved, parseSaved, recoverSaved } from "../src/storage.ts";
import { createTransaction, today } from "../src/ledger.ts";
test("2569 normal M33 upper bound is 875 x 12, using paid input not inferred contributions", () => {
  assert.equal(RULES_BY_YEAR["2569"].socialCap, 10500);
  const p = { ...demoPlan(), taxYear: "2569" as const, social: "10500" };
  // 660000 -100000 -60000 -10500 -20000 -15000 -30000 =424500.
  // 150000*5% +124500*10% =19950.
  const result = calculate(p);
  assert.equal(result.taxable, 42450000);
  assert.equal(result.tax, 1995000);
  assert.equal(result.balance, -1205000);
  assert.equal(calculate({ ...p, social: "5000" }).deductions.social, 500000);
  assert.equal(calculate({ ...p, social: "99999" }).deductions.social, 1050000);
  assert.equal(calculate({ ...p, taxYear: "2568" }).deductions.social, 900000);
});
test("a legacy plan missing year stays 2568, preserving ledger and known old rules", () => {
  const taxPlan = { ...demoPlan() };
  delete taxPlan.taxYear;
  const base = {
    schemaVersion: 1,
    ruleVersion: "2568-basic-1.0",
    savedAt: "2026-01-01",
    taxPlan,
    transactions: [createTransaction("income", "1", today(), "เงินเดือน", "")],
  };
  const data = parseSaved(JSON.stringify(base));
  assert.equal(data.taxPlan.taxYear, "2568");
  assert.equal(data.taxPlan.scope, true);
  assert.equal(data.transactions.length, 1);
  assert.equal(recoverSaved(JSON.stringify(base)).warnings.length, 0);
});
test("backups carry the rule version of their own year and future years cannot calculate", () => {
  const plan = { ...demoPlan(), taxYear: "2569" as const };
  const data = makeSaved(plan, []);
  assert.equal(data.ruleVersion, rulesFor(plan).version);
  assert.equal(parseSaved(JSON.stringify(data)).taxPlan.scope, true);
  assert.throws(() => calculate({ ...plan, taxYear: "2570" as "2569" }));
});
