import { test } from "node:test";
import assert from "node:assert/strict";
import { demoPlan } from "../src/tax.ts";
import { deductionScenario } from "../src/deductionScenario.ts";

test("guide replaces RMF and health totals and preserves the untouched plan", () => {
  const plan = demoPlan(),
    original = JSON.stringify(plan);
  const rmf = deductionScenario(plan, "rmf", "60000", true);
  assert.equal(rmf.before.tax, 2010000);
  assert.equal(rmf.after.tax, 1710000);
  assert.equal(rmf.saving, 300000);
  assert.equal(rmf.paidDifference, 3000000);
  assert.equal(rmf.after.deductions.rmf, 6000000);
  assert.equal(rmf.candidate.salary, plan.salary);
  assert.equal(rmf.candidate.health, plan.health);
  const health = deductionScenario(plan, "health", "25000", true);
  assert.equal(health.after.tax, 1910000);
  assert.equal(health.saving, 100000);
  assert.equal(JSON.stringify(plan), original);
});

test("guide honours shared insurance caps rather than equating spending and deductions", () => {
  const life = deductionScenario(demoPlan(), "life", "90000", true);
  assert.equal(life.after.deductions.health, 1000000);
  assert.equal(life.after.tax, 1360000);
  assert.equal(life.saving, 650000);
  assert.equal(life.paidDifference, 7000000);
  const social = deductionScenario(demoPlan(), "social", "12000", false);
  assert.equal(social.saving, 0);
  assert.equal(social.allowedDifference, 0);
});

test("guide requires eligible products and keeps an unknown prepaid balance unknown", () => {
  const plan = { ...demoPlan(), withholding: "" };
  assert.equal(
    deductionScenario(plan, "rmf", "60000", true).after.balance,
    null,
  );
  for (const key of ["rmf", "life", "health"] as const)
    assert.throws(() => deductionScenario(plan, key, "1000", false));
  for (const amount of ["-1", "1e3", "1.001", ""])
    assert.throws(() => deductionScenario(plan, "rmf", amount, true));
});
