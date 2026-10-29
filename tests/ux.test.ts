import { test } from "node:test";
import assert from "node:assert/strict";
import { calculate, demoPlan, emptyPlan } from "../src/tax.ts";
import {
  daysToYearEnd,
  liveEstimate,
  rateSummary,
  switchTaxYear,
  yearIsOpen,
} from "../src/taxUx.ts";
import { parseRoute, routePath } from "../src/navigation.ts";
import { SITE } from "../src/siteContent.ts";
import { readFileSync } from "node:fs";

test("planning closes past years and countdown never becomes negative", () => {
  assert.equal(yearIsOpen("2568", "2026-01-01"), false);
  assert.equal(yearIsOpen("2569", "2026-12-31"), true);
  assert.equal(yearIsOpen("2569", "2027-01-01"), false);
  assert.equal(daysToYearEnd("2569", "2026-10-04"), 88);
  assert.equal(daysToYearEnd("2569", "2026-12-30"), 1);
  assert.equal(daysToYearEnd("2569", "2026-12-31"), 0);
  assert.equal(daysToYearEnd("2569", "2027-01-01"), 0);
});
test("switching year keeps financial amounts but requires fresh eligibility confirmations", () => {
  const plan = {
    ...demoPlan(),
    extra: {
      mortgage: "42000",
      mortgageEligible: true,
      thaiEsg: "25000",
      thaiEsgEligible: true,
    },
  };
  const before = structuredClone(plan);
  const switched = switchTaxYear(plan, "2569");
  assert.equal(switched.salary, plan.salary);
  assert.equal(switched.social, "9000");
  assert.equal(switched.extra?.mortgage, "42000");
  assert.equal(switched.extra?.thaiEsg, "25000");
  assert.equal(switched.extra?.mortgageEligible, false);
  assert.equal(switched.scope, false);
  assert.equal(switched.rmfEligible, false);
  assert.deepEqual(plan, before);
  assert.throws(() => calculate(switched));
});
test("live preview distinguishes missing and invalid inputs from a genuine zero tax", () => {
  assert.equal(liveEstimate(emptyPlan("2569")).result, null);
  assert.equal(liveEstimate({ ...demoPlan(), salary: "abc" }).result, null);
  assert.equal(
    liveEstimate({ ...demoPlan(), lifeEligible: false }).result,
    null,
  );
  assert.equal(
    liveEstimate({ ...demoPlan(), scopeAnswers: { otherIncome: "unknown" } })
      .result,
    null,
  );
  const draft = { ...emptyPlan("2569"), salary: "100000" };
  assert.equal(liveEstimate(draft).result?.tax, 0);
  assert.equal(draft.scope, false);
  assert.equal(liveEstimate(demoPlan()).result?.tax, calculate(demoPlan()).tax);
});
test("displayed marginal rates match calculation at zero, neighbouring satang and top band", () => {
  for (const [salary, expected] of [
    ["100000", 0],
    ["309999.99", 0],
    ["310000", 5],
    ["459999.99", 5],
    ["460000", 10],
    ["5159999.99", 30],
    ["5160000", 35],
  ] as const) {
    const result = calculate({ ...emptyPlan("2569"), salary, scope: true });
    const rates = rateSummary(result);
    assert.equal(rates.marginal, expected);
    assert.equal(rates.marginal, result.marginalRate);
    assert.equal(rates.average, (result.tax / result.gross) * 100);
    assert.equal(rates.perThousand, expected * 10);
  }
  assert.equal(
    rateSummary(calculate({ ...emptyPlan("2569"), salary: "0", scope: true }))
      .average,
    0,
  );
});
test("about route, static copy and social metadata remain consistent", () => {
  assert.equal(parseRoute("/about").view, "about");
  assert.equal(parseRoute("/", "#about").view, "about");
  assert.equal(routePath({ view: "about", step: 1 }), "/about");
  const html = readFileSync(new URL("../index.html", import.meta.url), "utf8");
  assert.match(html, /<noscript\b/);
  assert.ok(html.includes("startup-copy"));
  assert.ok(html.includes(SITE.slogan));
  assert.ok(
    html.includes(`name="twitter:title" content="${SITE.title}"`) ||
      html.includes(`content="${SITE.title}"`),
  );
  assert.ok(html.includes(SITE.description));
});
