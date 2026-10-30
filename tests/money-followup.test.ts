import test from "node:test";
import assert from "node:assert/strict";
import { followupNumbers } from "../src/moneyFollowup.ts";
test("followup deducts bills and protected money, retains a shortfall and never invents a spendable budget", () => {
  assert.deepEqual(followupNumbers(1200000, 400000, 300000, 28, "2026-10-07"), {
    available: 500000,
    days: 21,
    daily: 23809,
    shortfall: 0,
    payday: "2026-10-28",
  });
  const short = followupNumbers(10000, 20000, 30000, 28, "2026-10-21");
  assert.equal(short.available, -40000);
  assert.equal(short.daily, 0);
  assert.equal(short.shortfall, 40000);
});
test("payday clamps to month end and a past payday advances to next month", () => {
  assert.equal(followupNumbers(0, 0, 0, 31, "2026-02-27").payday, "2026-02-28");
  assert.equal(followupNumbers(0, 0, 0, 28, "2026-10-28").payday, "2026-11-28");
  assert.throws(() => followupNumbers(0, -1, 0, 28, "2026-10-21"));
  assert.throws(() => followupNumbers(0, 0, 0, 32, "2026-10-21"));
});
