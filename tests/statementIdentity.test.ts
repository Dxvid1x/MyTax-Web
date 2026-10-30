import { test } from "node:test";
import assert from "node:assert/strict";
import {
  applyStatementImport,
  emptyStatementImports,
  decodeStatementImports,
  hashStatementFile,
} from "../src/statementIdentity.ts";
import type { StatementImportIntent } from "../src/statementTypes.ts";
const intent = (): StatementImportIntent => ({
  document: {
    fileDigest: "a".repeat(64),
    format: "csv",
    profileId: null,
    profileVersion: null,
    locatorVersion: 1,
    tables: [
      {
        name: "CSV",
        rows: [],
        origins: [1, 2].map((row) => ({
          locator: `s0:r${row}`,
          sheet: 0,
          row,
        })),
      },
    ],
    candidates: [],
    warnings: [],
    incomplete: false,
  },
  selected: [1, 2].map((row) => ({
    row,
    origin: { locator: `s0:r${row}`, sheet: 0, row },
    date: "2026-01-10",
    note: "same payment",
    type: "expense",
    amount: 8025,
    duplicate: false,
    alreadyImported: false,
    error: "",
  })),
});
test("accepted source rows cannot be imported twice, even with corrected notes or a deleted transaction", () => {
  const input = intent();
  const first = applyStatementImport(input, [], emptyStatementImports());
  assert.equal(first.added, 2);
  assert.equal(first.transactions[0].amount, 8025);
  assert.equal(first.transactions[1].amount, 8025);
  input.selected[0].note = "edited";
  const again = applyStatementImport(input, [], first.statementImports);
  assert.equal(again.added, 0);
  assert.equal(again.transactions.length, 0);
});
test("partial acceptance leaves other origins eligible and version changes fail closed", () => {
  const input = intent();
  const first = applyStatementImport(
    { ...input, selected: [input.selected[0]] },
    [],
    emptyStatementImports(),
  );
  const second = applyStatementImport(
    input,
    first.transactions,
    first.statementImports,
  );
  assert.equal(second.added, 1);
  assert.equal(second.transactions.length, 2);
  assert.throws(
    () =>
      applyStatementImport(
        { ...input, document: { ...input.document, locatorVersion: 2 } },
        second.transactions,
        second.statementImports,
      ),
    /รุ่น/,
  );
});
test("commit revalidates direction, satang, dates and locator uniqueness rather than trusting UI flags", () => {
  for (const patch of [
    { amount: 0 },
    { amount: 1.5 },
    { date: "2026-02-31" },
    { type: "other" },
    { error: "invalid" },
  ]) {
    const input = intent();
    Object.assign(input.selected[0], patch);
    assert.throws(() =>
      applyStatementImport(input, [], emptyStatementImports()),
    );
  }
  const input = intent();
  input.selected[1].origin = input.selected[0].origin;
  assert.throws(() => applyStatementImport(input, [], emptyStatementImports()));
});
test("receipts validate strictly while retaining legitimate deletion tombstones", () => {
  const result = applyStatementImport(intent(), [], emptyStatementImports());
  assert.deepEqual(
    decodeStatementImports(result.statementImports),
    result.statementImports,
  );
  assert.throws(() =>
    decodeStatementImports({
      version: 1,
      receipts: [{ fileDigest: "not a digest" }],
    }),
  );
  const bad = structuredClone(result.statementImports);
  bad.receipts[0].accepted.push(bad.receipts[0].accepted[0]);
  assert.throws(() => decodeStatementImports(bad));
});
test("file identity is based on bytes, not filename or mapping", async () => {
  const bytes = new TextEncoder().encode("abc").buffer;
  assert.equal(
    await hashStatementFile(bytes),
    "ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad",
  );
});
