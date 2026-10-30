import { test } from "node:test";
import assert from "node:assert/strict";
import {
  makeSaved,
  parseSaved,
  recoverSaved,
  writeSaved,
  readLocal,
  STORAGE_KEY,
  StorageConflict,
} from "../src/storage.ts";
import { emptyPlan, demoPlan } from "../src/tax.ts";
import { createTransaction, today } from "../src/ledger.ts";
import {
  canonicalMoneyInput,
  inputMoney,
  annualFromMonthly,
} from "../src/moneyInput.ts";
import { parseRoute, routePath } from "../src/navigation.ts";
import { validateTaxStep, validResult } from "../src/validation.ts";
const row = () =>
  createTransaction("expense", "12.34", today(), "อาหาร", "อาหาร");
test("income and deductions can proceed before scope confirmation, final result cannot", () => {
  const draft = { ...demoPlan(), scope: false };
  assert.equal(validateTaxStep(draft, 1), null);
  assert.equal(validateTaxStep(draft, 2), null);
  assert.equal(validateTaxStep(draft, 3)?.id, "scope");
  assert.equal(validResult(draft), false);
});
test("unknown scope answers round-trip backups distinctly from no and malformed answers fail", () => {
  const draft = {
    ...demoPlan(),
    scopeAnswers: {
      family: "unknown" as const,
      otherIncome: false,
      special: true,
    },
  };
  const backup = makeSaved(draft, [row()]);
  assert.deepEqual(
    parseSaved(JSON.stringify(backup)).taxPlan.scopeAnswers,
    draft.scopeAnswers,
  );
  assert.equal(parseSaved(JSON.stringify(backup)).transactions.length, 1);
  assert.throws(() =>
    parseSaved(
      JSON.stringify({
        ...backup,
        taxPlan: { ...draft, scopeAnswers: { family: "maybe" } },
      }),
    ),
  );
});
class FakeStore {
  entries = new Map<string, string>();
  getItem(key: string) {
    return this.entries.get(key) ?? null;
  }
  setItem(key: string, value: string) {
    this.entries.set(key, value);
  }
  removeItem(key: string) {
    this.entries.delete(key);
  }
}
test("rule changes keep ledger and draft numbers, requiring eligibility review", () => {
  const base = {
    ...makeSaved(demoPlan(), [row()]),
    ruleVersion: "older-rules",
  };
  const restored = recoverSaved(JSON.stringify(base));
  assert.equal(restored.data?.transactions.length, 1);
  assert.equal(restored.data?.taxPlan.salary, "600000");
  assert.equal(restored.data?.taxPlan.scope, false);
  assert.equal(restored.data?.taxPlan.rmfEligible, false);
  assert.equal(restored.rejected, 0);
  assert.ok(restored.warnings.length);
});
test("salvage good rows, report invalid and duplicate count; imports remain strict", () => {
  const good = row();
  const raw = JSON.stringify({
    ...makeSaved(demoPlan(), []),
    transactions: [good, { ...row(), amount: -1 }, good],
  });
  assert.throws(() => parseSaved(raw));
  const state = recoverSaved(raw);
  assert.equal(state.rejected, 2);
  assert.equal(state.data?.transactions.length, 1);
});
test("invalid tax plan does not discard an independent ledger", () => {
  const raw = JSON.stringify({
    ...makeSaved(demoPlan(), [row()]),
    taxPlan: { salary: 123 },
  });
  const state = recoverSaved(raw);
  assert.deepEqual(state.data?.taxPlan, emptyPlan());
  assert.equal(state.data?.transactions.length, 1);
});
test("unknown schema is blocked without mutating the original store", () => {
  const store = new FakeStore(),
    raw = JSON.stringify({
      ...makeSaved(demoPlan(), [row()]),
      schemaVersion: 99,
    });
  store.setItem(STORAGE_KEY, raw);
  assert.equal(readLocal(store).data, null);
  assert.equal(store.getItem(STORAGE_KEY), raw);
});
test("legacy keys and schema migrate while paused autosave survives reload", () => {
  const store = new FakeStore();
  const saved = makeSaved(demoPlan(), [row()], false);
  store.setItem(STORAGE_KEY, JSON.stringify(saved));
  assert.equal(readLocal(store).data?.autoSave, false);
  store.removeItem(STORAGE_KEY);
  store.setItem(
    "bahtwise.local.v1",
    JSON.stringify({ ...saved, schemaVersion: 1 }),
  );
  const old = readLocal(store);
  assert.equal(old.key, "bahtwise.local.v1");
  assert.equal(old.data?.schemaVersion, 4);
  assert.equal(old.data?.autoSave, true);
  writeSaved(store, old.data!, null);
  assert.equal(readLocal(store).data?.transactions.length, 1);
});
test("backup is written before replacement; backup failure leaves main untouched", () => {
  const store = new FakeStore(),
    original = "{unreadable}";
  store.setItem(STORAGE_KEY, original);
  const raw = writeSaved(
    store,
    makeSaved(demoPlan(), [row()]),
    original,
    original,
  );
  assert.equal(store.getItem(STORAGE_KEY), raw);
  assert.ok(
    [...store.entries].some(
      ([key, value]) => key.startsWith("mytax.recovery.") && value === original,
    ),
  );
  const failing = new FakeStore();
  failing.setItem(STORAGE_KEY, original);
  failing.setItem = (key, value) => {
    if (key.startsWith("mytax.recovery.")) throw new Error("quota");
    failing.entries.set(key, value);
  };
  assert.throws(() =>
    writeSaved(failing, makeSaved(emptyPlan(), []), original, original),
  );
  assert.equal(failing.getItem(STORAGE_KEY), original);
});
test("compare-and-set blocks a stale tab without overwriting another tab", () => {
  const store = new FakeStore();
  const first = writeSaved(store, makeSaved(emptyPlan(), []), null);
  const second = writeSaved(store, makeSaved(demoPlan(), [row()]), first);
  assert.throws(
    () => writeSaved(store, makeSaved(emptyPlan(), []), first),
    StorageConflict,
  );
  assert.equal(store.getItem(STORAGE_KEY), second);
});
test("human money entry accepts comma, spaces and pending decimals without float drift", () => {
  assert.equal(inputMoney(" 1,234.50 "), 123450);
  assert.equal(canonicalMoneyInput("00012."), "12");
  assert.equal(inputMoney("0.29"), 29);
  assert.equal(annualFromMonthly("12,345.67", 12), "148148.04");
  for (const text of [
    "1,23",
    "1e3",
    "-1",
    "1.234",
    "1000000000.01",
    "<script>",
  ])
    assert.throws(() => inputMoney(text));
});
test("clean routes retain tax steps and migrate legacy bookmarks without treating anchors as routes", () => {
  assert.deepEqual(parseRoute("/tax/3"), { view: "tax", step: 3 });
  assert.equal(routePath(parseRoute("/tax/4")), "/tax/4");
  assert.deepEqual(parseRoute("/tax/99"), { view: "tax", step: 1 });
  assert.equal(routePath(parseRoute("/tax/1")), "/tax");
  assert.equal(routePath(parseRoute("/home")), "/");
  assert.equal(parseRoute("/ledger", "#main").view, "ledger");
  assert.equal(parseRoute("/unknown").view, "home");
  assert.equal(parseRoute("/tax/2/extra").view, "home");
  for (const path of [
    "/",
    "/tax",
    "/tax/2",
    "/tax/3",
    "/tax/4",
    "/ledger",
    "/reduce",
    "/tax-law",
    "/demo",
  ])
    assert.equal(routePath(parseRoute(path)), path);
  for (const legacy of [
    "home",
    "tax/1",
    "tax/2",
    "tax/3",
    "tax/4",
    "ledger",
    "reduce",
    "tax-law",
    "demo",
  ])
    assert.deepEqual(parseRoute("/", "#" + legacy), parseRoute("/" + legacy));
});
test("wizard validation points to hidden eligibility and distinguishes unknown withholding", () => {
  assert.equal(
    validateTaxStep({ ...demoPlan(), lifeEligible: false }, 2)?.id,
    "lifeEligible",
  );
  assert.equal(
    validateTaxStep({ ...demoPlan(), rmfEligible: false }, 2)?.id,
    "rmfEligible",
  );
  assert.equal(
    validateTaxStep({ ...demoPlan(), withholding: "" }, 3, "yes")?.id,
    "withholding",
  );
  assert.equal(
    validateTaxStep({ ...demoPlan(), withholding: "" }, 3, "unknown"),
    null,
  );
  assert.equal(validResult(emptyPlan()), false);
  assert.equal(validResult(demoPlan()), true);
});
