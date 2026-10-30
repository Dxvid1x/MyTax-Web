import test from "node:test";
import assert from "node:assert/strict";
import { parseFollowup } from "../src/followupStorage.ts";
test("followup backup validates bounded values, payday, reviews and version before restoration", () => {
  const draft = {
    version: 1,
    month: "2026-10",
    values: ["12000", "4000", "3000", "30000", "18000", "3000", "28"],
    reviews: [{ date: "2026-10-07", available: 500000, note: "ทบทวน" }],
    savedAt: "2026-10-07T12:00:00Z",
  };
  assert.deepEqual(parseFollowup(JSON.stringify(draft)), draft);
  for (const invalid of [
    { ...draft, version: 2 },
    { ...draft, values: ["-1", ...draft.values.slice(1)] },
    { ...draft, values: [...draft.values.slice(0, 6), "32"] },
    { ...draft, reviews: [{ ...draft.reviews[0], available: 0.5 }] },
    { ...draft, reviews: Array(13).fill(draft.reviews[0]) },
  ])
    assert.equal(parseFollowup(JSON.stringify(invalid)), null);
  assert.equal(parseFollowup("broken"), null);
});
