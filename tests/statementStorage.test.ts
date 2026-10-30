import { test } from "node:test";
import assert from "node:assert/strict";
import {
  makeSaved,
  parseSaved,
  recoverSaved,
  serializeSaved,
  MAX_BACKUP_BYTES,
} from "../src/storage.ts";
import { emptyPlan } from "../src/tax.ts";
import { emptyStatementImports } from "../src/statementIdentity.ts";
test("receipt history survives backup while old schema defaults to no invented history", () => {
  const data = makeSaved(emptyPlan(), []);
  assert.equal(data.schemaVersion, 4);
  data.statementImports = {
    version: 1,
    receipts: [
      {
        fileDigest: "c".repeat(64),
        locatorVersion: 1,
        profileId: null,
        profileVersion: null,
        accepted: [{ locator: "s0:r1", transactionId: "deleted-row" }],
      },
    ],
  };
  const restored = parseSaved(serializeSaved(data));
  assert.deepEqual(restored.statementImports, data.statementImports);
  const old = { ...data, schemaVersion: 3, statementImports: undefined };
  assert.deepEqual(
    parseSaved(JSON.stringify(old)).statementImports,
    emptyStatementImports(),
  );
});
test("damaged receipt history requires recovery review and keeps the readable ledger", () => {
  const raw = JSON.stringify({
    ...makeSaved(emptyPlan(), []),
    statementImports: { version: 1, receipts: [{}] },
  });
  assert.throws(() => parseSaved(raw));
  const result = recoverSaved(raw);
  assert.ok(result.data);
  assert.ok(result.warnings.some((w) => w.includes("นำเข้า")));
});
test("saved serialization counts Thai UTF-8 bytes and rejects unrestorable oversized backups", () => {
  const data = makeSaved(emptyPlan(), []);
  const baseline = new TextEncoder().encode(JSON.stringify(data)).length;
  const count = Math.floor((MAX_BACKUP_BYTES - baseline) / 3);
  const large = { ...data, ruleVersion: data.ruleVersion + "ก".repeat(count) };
  assert.ok(
    new TextEncoder().encode(JSON.stringify(large)).length <= MAX_BACKUP_BYTES,
  );
  assert.doesNotThrow(() => serializeSaved(large));
  assert.throws(
    () => serializeSaved({ ...large, ruleVersion: large.ruleVersion + "ก" }),
    /5 MB/,
  );
});
