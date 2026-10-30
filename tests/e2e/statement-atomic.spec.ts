import { test, expect, type Page } from "@playwright/test";
import { makeSaved, STORAGE_KEY } from "../../src/storage.ts";
import { emptyPlan } from "../../src/tax.ts";
const buffer = Buffer.from(
  "วันที่,รายละเอียด,เงินเข้า,เงินออก\n2026-01-10,synthetic,100,",
);
async function savedLedger(page: Page) {
  await page.goto("/ledger");
  const raw = JSON.stringify(makeSaved(emptyPlan(), []));
  await page.evaluate(({ key, raw }) => localStorage.setItem(key, raw), {
    key: STORAGE_KEY,
    raw,
  });
  await page.reload();
  return raw;
}
async function readyImport(page: Page) {
  await page
    .getByRole("button", { name: "นำเข้า Statement", exact: true })
    .click();
  await page
    .getByLabel("ไฟล์ Statement")
    .setInputFiles({ name: "atomic.csv", mimeType: "text/csv", buffer });
  await expect(page.locator(".statement-row")).toHaveCount(1);
  await page
    .getByLabel("ตรวจวันที่ เงินเข้า และเงินออกกับไฟล์ต้นฉบับแล้ว")
    .check();
}
test("storage failure consumes neither transaction nor receipt, allowing a safe retry", async ({
  page,
}) => {
  const before = await savedLedger(page);
  await readyImport(page);
  await page.evaluate(() => {
    const original = Storage.prototype.setItem;
    Storage.prototype.setItem = function (key, value) {
      if (key === "mytax.local.v2")
        throw new DOMException("synthetic quota failure", "QuotaExceededError");
      original.call(this, key, value);
    };
  });
  await page.getByRole("button", { name: "ยืนยันนำเข้า 1 รายการ" }).click();
  await expect(page.locator(".inline-error")).toContainText(
    "synthetic quota failure",
  );
  expect(
    await page.evaluate((key) => localStorage.getItem(key), STORAGE_KEY),
  ).toBe(before);
  await page.reload();
  await readyImport(page);
  await expect(page.getByLabel("นำเข้าแถว 2")).toBeChecked();
  await page.getByRole("button", { name: "ยืนยันนำเข้า 1 รายการ" }).click();
  await expect(page.getByRole("dialog")).toHaveCount(0);
  const stored = await page.evaluate(
    (key) => JSON.parse(localStorage.getItem(key)!),
    STORAGE_KEY,
  );
  expect(stored.transactions).toHaveLength(1);
  expect(stored.statementImports.receipts[0].accepted).toHaveLength(1);
});
test("cancelling an import queued behind a write lock never changes the saved pair", async ({
  page,
}) => {
  const before = await savedLedger(page);
  await readyImport(page);
  await page.evaluate(() => {
    const state = globalThis as unknown as {
      releaseStatementLock?: () => void;
      statementLockHeld?: boolean;
    };
    void navigator.locks.request(
      "mytax.local.v2",
      () =>
        new Promise<void>((resolve) => {
          state.releaseStatementLock = resolve;
          state.statementLockHeld = true;
        }),
    );
  });
  await expect
    .poll(() =>
      page.evaluate(
        () =>
          (globalThis as unknown as { statementLockHeld: boolean })
            .statementLockHeld,
      ),
    )
    .toBe(true);
  await page.getByRole("button", { name: "ยืนยันนำเข้า 1 รายการ" }).click();
  await page.keyboard.press("Escape");
  await page.evaluate(() => {
    (
      globalThis as unknown as { releaseStatementLock: () => void }
    ).releaseStatementLock();
  });
  // A following lock acts as a barrier after the queued cancelled operation.
  await page.evaluate(async () => {
    await navigator.locks.request("mytax.local.v2", () => {});
  });
  expect(
    await page.evaluate((key) => localStorage.getItem(key), STORAGE_KEY),
  ).toBe(before);
  await expect(page.getByRole("dialog")).toHaveCount(0);
});
test("clear invalidates an autosave queued before or during the reset", async ({
  page,
}) => {
  await savedLedger(page);
  await page.evaluate(() => {
    const state = globalThis as unknown as {
      releaseResetLock?: () => void;
      resetLockHeld?: boolean;
    };
    void navigator.locks.request(
      "mytax.local.v2",
      () =>
        new Promise<void>((resolve) => {
          state.releaseResetLock = resolve;
          state.resetLockHeld = true;
        }),
    );
  });
  await expect
    .poll(() =>
      page.evaluate(
        () =>
          (globalThis as unknown as { resetLockHeld: boolean }).resetLockHeld,
      ),
    )
    .toBe(true);
  await page.locator(".expense-entry").click();
  await page.getByLabel("จำนวนเงิน").fill("80");
  await page.getByRole("button", { name: "เพิ่มรายการ", exact: true }).click();
  await expect
    .poll(() =>
      page.evaluate(async () => (await navigator.locks.query()).pending.length),
    )
    .toBeGreaterThan(0);
  await page.getByRole("button", { name: "ตั้งค่า", exact: true }).click();
  await page.locator(".settings-save").click();
  await page.getByRole("button", { name: /ล้างข้อมูลทั้งหมด/ }).click();
  await page.getByRole("button", { name: "ยืนยันล้างข้อมูล" }).click();
  await page.evaluate(() => {
    Object.defineProperty(document, "hidden", {
      configurable: true,
      value: true,
    });
    document.dispatchEvent(new Event("visibilitychange"));
    (
      globalThis as unknown as { releaseResetLock: () => void }
    ).releaseResetLock();
  });
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await page.evaluate(async () => {
    await navigator.locks.request("mytax.local.v2", () => {});
  });
  expect(
    await page.evaluate((key) => localStorage.getItem(key), STORAGE_KEY),
  ).toBeNull();
});
