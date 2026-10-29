import { test } from "node:test";
import assert from "node:assert/strict";
import { calculate, emptyPlan, demoPlan, scenario, RULES } from "../src/tax.ts";
import { parseSaved } from "../src/storage.ts";

test("unknown withheld tax still calculates annual tax without inventing a payable balance", () => {
  const plan = { ...demoPlan(), withholding: "" };
  const r = calculate(plan);
  assert.equal(r.tax, 2010000);
  assert.equal(r.balance, null);
  assert.equal(calculate({ ...plan, withholding: "0" }).balance, 2010000);
  assert.equal(calculate({ ...plan, withholding: "32000" }).balance, -1190000);
  assert.equal(scenario(plan, "60000").after.balance, null);
  assert.equal(emptyPlan().withholding, "");
  assert.throws(() => calculate({ ...plan, withholding: "-1" }));
  assert.throws(() => calculate({ ...plan, withholding: " " }));
});

test("saved drafts preserve unknown withholding while older known zero remains known", () => {
  const saved = (withholding: string) =>
    JSON.stringify({
      schemaVersion: 1,
      ruleVersion: RULES.version,
      savedAt: new Date().toISOString(),
      taxPlan: { ...demoPlan(), withholding },
      transactions: [],
    });
  assert.equal(calculate(parseSaved(saved("")).taxPlan).balance, null);
  assert.equal(calculate(parseSaved(saved("0")).taxPlan).balance, 2010000);
});
