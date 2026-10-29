import { test } from "node:test";
import assert from "node:assert/strict";
import { createTransaction, today } from "../src/ledger.ts";
import {
  decodeCloudDocument,
  emptyCloudDocument,
  mergeCloudDocument,
} from "../src/ledgerCloudData.ts";
import { createLedgerHandler } from "../server/ledgerApi.ts";

const alice = "11111111-1111-4111-8111-111111111111",
  bob = "22222222-2222-4222-8222-222222222222";
const env = {
  SUPABASE_URL: "https://example.supabase.co",
  SUPABASE_ANON_KEY: "test-public-key",
  MYTAX_CLOUD_ENABLED: "true",
  MYTAX_APP_ORIGIN: "https://mytax.example",
};
async function invoke(
  body: unknown,
  fetchImpl: typeof fetch,
  overrides: Record<string, unknown> = {},
  configured = env,
) {
  const headers: Record<string, unknown> = {};
  let result = { status: 0, body: {} as Record<string, unknown>, headers };
  const res = {
    statusCode: 0,
    setHeader: (key: string, value: unknown) => {
      headers[key] = value;
    },
    end: (raw: string) => {
      result = { status: res.statusCode, body: JSON.parse(raw), headers };
    },
  };
  const req = {
    method: "POST",
    headers: {
      origin: env.MYTAX_APP_ORIGIN,
      host: "mytax.example",
      "x-forwarded-proto": "https",
      "content-type": "application/json",
      cookie: "mytax_access=alice-token",
    },
    body,
    ...overrides,
  };
  await createLedgerHandler({ env: configured, fetchImpl })(req, res);
  return result;
}
const reply = (value: unknown, status = 200) =>
  new Response(JSON.stringify(value), { status });

test("cloud validation strips tax fields, rejects duplicate IDs and invalid settings", () => {
  const row = createTransaction(
    "expense",
    "80",
    today(),
    "อาหาร",
    "มื้อเที่ยง",
  );
  const doc = {
    ...emptyCloudDocument(),
    transactions: [row],
    taxPlan: { salary: "private" },
    secret: "not-forwarded",
  };
  assert.deepEqual(Object.keys(decodeCloudDocument(doc)).sort(), [
    "schemaVersion",
    "settings",
    "transactions",
  ]);
  assert.throws(() =>
    decodeCloudDocument({ ...doc, transactions: [row, row] }),
  );
  assert.throws(() => decodeCloudDocument({ ...doc, settings: undefined }));
  assert.throws(() =>
    decodeCloudDocument({ ...doc, transactions: [{ ...row, amount: -1 }] }),
  );
});
test("migration deduplicates matching IDs, preserves recurring/categories and refuses changed IDs", () => {
  const row = createTransaction("expense", "80", today(), "อาหาร", "");
  const remote = { ...emptyCloudDocument(), transactions: [row] };
  const local = {
    ...emptyCloudDocument(),
    transactions: [row, { ...row, id: "second-real-meal" }],
  };
  local.settings.customCategories.expense = ["สัตว์เลี้ยง"];
  const merged = mergeCloudDocument(remote, local);
  assert.equal(merged.added, 1);
  assert.equal(merged.skipped, 1);
  assert.equal(merged.possibleDuplicates, 1);
  assert.deepEqual(merged.document.settings.customCategories.expense, [
    "สัตว์เลี้ยง",
  ]);
  assert.throws(() =>
    mergeCloudDocument(remote, {
      ...local,
      transactions: [{ ...row, amount: 9000 }],
    }),
  );
});
test("disabled cloud fails closed without contacting providers", async () => {
  let calls = 0;
  const result = await invoke(
    { action: "send-code", email: "a@example.com", consent: true },
    (async () => {
      calls++;
      return reply({});
    }) as typeof fetch,
    {},
    { ...env, MYTAX_CLOUD_ENABLED: "false" },
  );
  assert.equal(result.status, 503);
  assert.equal(calls, 0);
});
test("API rejects cross-origin posts, wrong content type and invalid bodies", async () => {
  const fetchImpl = (async () => {
    throw new Error("must not reach provider");
  }) as typeof fetch;
  assert.equal(
    (
      await invoke({}, fetchImpl, {
        headers: {
          origin: "https://attacker.example",
          "content-type": "application/json",
        },
      })
    ).status,
    403,
  );
  assert.equal(
    (
      await invoke({}, fetchImpl, {
        headers: { origin: env.MYTAX_APP_ORIGIN, "content-type": "text/plain" },
      })
    ).status,
    415,
  );
  assert.equal((await invoke("{invalid", fetchImpl)).status, 400);
  assert.equal((await invoke([], fetchImpl)).status, 400);
});
test("OTP consent is required and verified secrets are HttpOnly Secure cookies, never JSON", async () => {
  const fetchImpl = (async (url: string | URL | Request) => {
    assert.match(String(url), /\/verify$/);
    return reply({
      access_token: "private-access",
      refresh_token: "private-refresh",
      expires_in: 3600,
      user: { id: alice, email: "a@example.com" },
    });
  }) as typeof fetch;
  assert.equal(
    (await invoke({ action: "send-code", email: "a@example.com" }, fetchImpl))
      .status,
    400,
  );
  const result = await invoke(
    { action: "verify-code", email: "a@example.com", code: "123456" },
    fetchImpl,
  );
  assert.equal(result.status, 200);
  assert.doesNotMatch(
    JSON.stringify(result.body),
    /private-access|private-refresh/,
  );
  for (const cookie of result.headers["Set-Cookie"] as string[])
    assert.match(cookie, /HttpOnly; SameSite=Strict; Max-Age=\d+; Secure$/);
  assert.match(result.headers["Cache-Control"] as string, /no-store/);
});
test("ownership is verified by Auth; client cannot save to a different account", async () => {
  let calls = 0;
  const fetchImpl = (async () => {
    calls++;
    return reply({ id: alice, email: "a@example.com" });
  }) as typeof fetch;
  const result = await invoke(
    {
      action: "save",
      userId: bob,
      revision: 0,
      document: emptyCloudDocument(),
    },
    fetchImpl,
  );
  assert.equal(result.status, 409);
  assert.equal(calls, 1);
});
test("atomic revision update returns conflict instead of overwriting a newer device", async () => {
  const fetchImpl = (async (url: string | URL | Request, init: RequestInit) => {
    if (String(url).endsWith("/user")) return reply({ id: alice });
    assert.match(String(url), new RegExp(`user_id=eq.${alice}.*revision=eq.4`));
    assert.equal(init.method, "PATCH");
    assert.equal(
      (init.headers as Record<string, string>).Authorization,
      "Bearer alice-token",
    );
    const saved = JSON.parse(init.body as string);
    assert.deepEqual(Object.keys(saved), ["document"]);
    return reply([]);
  }) as typeof fetch;
  const result = await invoke(
    {
      action: "save",
      userId: alice,
      revision: 4,
      document: emptyCloudDocument(),
    },
    fetchImpl,
  );
  assert.equal(result.status, 409);
});
test("expired access refreshes via cookie and queries only the verified owner's record", async () => {
  const calls: string[] = [];
  const fetchImpl = (async (url: string | URL | Request, init: RequestInit) => {
    calls.push(String(url));
    if (String(url).includes("grant_type=refresh_token")) {
      assert.match(init.body as string, /test-refresh/);
      return reply({
        access_token: "renewed",
        refresh_token: "renewed-refresh",
        expires_in: 3600,
      });
    }
    if (String(url).endsWith("/user"))
      return (init.headers as Record<string, string>).Authorization ===
        "Bearer renewed"
        ? reply({ id: alice })
        : reply({}, 401);
    assert.match(String(url), new RegExp(`user_id=eq.${alice}`));
    return reply([{ document: emptyCloudDocument(), revision: 2 }]);
  }) as typeof fetch;
  const result = await invoke({ action: "load", userId: bob }, fetchImpl, {
    headers: {
      origin: env.MYTAX_APP_ORIGIN,
      host: "mytax.example",
      "content-type": "application/json",
      cookie: "mytax_access=expired; mytax_refresh=test-refresh",
    },
  });
  assert.equal(result.status, 200);
  assert.equal(result.body.userId, alice);
  assert.equal(calls.length, 4);
});

test("logout revokes the provider session before clearing both cookies; provider failure retains the session", async () => {
  const paths: string[] = [];
  const provider = (async (url: string | URL | Request, init: RequestInit) => {
    paths.push(String(url));
    if (String(url).endsWith("/user")) return reply({ id: alice });
    assert.match(String(url), /\/logout\?scope=local$/);
    assert.equal(init.method, "POST");
    return new Response(null, { status: 204 });
  }) as typeof fetch;
  const result = await invoke({ action: "logout" }, provider);
  assert.equal(result.status, 200);
  assert.equal(paths.length, 2);
  for (const cookie of result.headers["Set-Cookie"] as string[])
    assert.match(cookie, /Max-Age=0; Secure$/);
  const unavailable = (async (url: string | URL | Request) =>
    String(url).endsWith("/user")
      ? reply({ id: alice })
      : reply({}, 503)) as typeof fetch;
  const failed = await invoke({ action: "logout" }, unavailable);
  assert.equal(failed.status, 503);
  assert.equal(failed.headers["Set-Cookie"], undefined);
});
