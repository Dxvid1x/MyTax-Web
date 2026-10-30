import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { today } from "../../src/ledger.ts";
test("bandit runs away, reveals followup link, replays, and reduced motion skips the run", async ({
  page,
}) => {
  await page.goto("/tax-law");
  const button = page.getByRole("button", { name: "แตะหนูให้วิ่งหนี" });
  await button.scrollIntoViewIfNeeded();
  await button.click();
  await expect(page.locator(".bandit-interaction")).toHaveAttribute(
    "data-state",
    "running",
  );
  await expect(
    page.getByRole("heading", { name: "แต่ภาระภาษีไม่ได้หายไป" }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "แต่ภาระภาษีไม่ได้หายไป" }),
  ).toBeFocused();
  await page.getByRole("button", { name: "เรียกหนูกลับมา" }).click();
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.getByRole("button", { name: "แตะหนูให้วิ่งหนี" }).focus();
  await page.keyboard.press("Enter");
  await expect(page.locator(".bandit-interaction")).toHaveAttribute(
    "data-state",
    "gone",
  );
  await page.getByRole("button", { name: "ลองติดตามแผนเงิน" }).click();
  await expect(page).toHaveURL(/money-plan$/);
});
test("personal plan persists only after explicit save, restores reviews and protects against another tab", async ({
  page,
}) => {
  await page.goto("/money-plan");
  await page
    .getByRole("button", { name: "ลองกับเงินของฉัน", exact: true })
    .click();
  await page.getByLabel("เงินใช้ได้ต้นเดือน", { exact: true }).fill("12000");
  await page
    .getByLabel("บิลที่ยังไม่จ่ายก่อนวันเงินเข้า", { exact: true })
    .fill("4000");
  await page.getByRole("button", { name: "ทบทวนรอบนี้แล้ว" }).click();
  expect(
    await page.evaluate(() => localStorage.getItem("mytax.followup.v1")),
  ).toBeNull();
  await page.getByRole("button", { name: "บันทึกแผน Plus ในเครื่อง" }).click();
  const saved = await page.evaluate(() =>
    localStorage.getItem("mytax.followup.v1"),
  );
  expect(saved).toBeTruthy();
  await page.reload();
  await expect(
    page.getByRole("button", { name: "ใช้รายการของฉัน" }),
  ).toHaveAttribute("aria-pressed", "true");
  await expect(
    page.getByLabel("เงินใช้ได้ต้นเดือน", { exact: true }),
  ).toHaveValue("12000");
  await expect(page.locator(".followup-review li")).toHaveCount(1);
  await page.evaluate(() => {
    const d = JSON.parse(localStorage.getItem("mytax.followup.v1")!);
    d.values[0] = "15000";
    localStorage.setItem("mytax.followup.v1", JSON.stringify(d));
  });
  await page.getByRole("button", { name: "บันทึกแผน Plus ในเครื่อง" }).click();
  await expect(page.getByRole("status")).toContainText("อีกแท็บ");
  expect(
    await page.evaluate(
      () => JSON.parse(localStorage.getItem("mytax.followup.v1")!).values[0],
    ),
  ).toBe("15000");
  await page.reload();
  await page.screenshot({
    path: "output/followup-improved-desktop.png",
    fullPage: true,
  });
  await page.setViewportSize({ width: 390, height: 844 });
  expect(
    await page.evaluate(() => document.documentElement.scrollWidth),
  ).toBeLessThanOrEqual(390);
  expect(
    (
      await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
        .analyze()
    ).violations,
  ).toEqual([]);
});
test("old month does not silently reuse opening cash and clear-all removes the separate plan", async ({
  page,
}) => {
  const month = today().slice(0, 7) === "2026-01" ? "2025-12" : "2026-01";
  await page.addInitScript(
    (month) =>
      localStorage.setItem(
        "mytax.followup.v1",
        JSON.stringify({
          version: 1,
          month,
          values: ["12000", "0", "0", "0", "0", "0", "28"],
          reviews: [],
          savedAt: "2026-01-01T12:00:00Z",
        }),
      ),
    month,
  );
  await page.goto("/money-plan");
  await expect(page.getByRole("alert")).toContainText("เดือนใหม่");
  await expect(page.locator(".followup-runway")).toHaveCount(0);
  await page
    .getByRole("button", { name: "เริ่มรอบเดือนนี้และยืนยันยอดใหม่" })
    .click();
  await expect(
    page.getByLabel("เงินใช้ได้ต้นเดือน", { exact: true }),
  ).toHaveValue("0");
  await page.getByRole("button", { name: "บันทึกแผน Plus ในเครื่อง" }).click();
  await page.getByRole("button", { name: "จัดการข้อมูล", exact: true }).click();
  await page
    .getByRole("button", { name: "ล้างข้อมูลทั้งหมด…", exact: true })
    .click();
  await page
    .getByRole("button", { name: "ยืนยันล้างข้อมูล", exact: true })
    .click();
  expect(
    await page.evaluate(() => localStorage.getItem("mytax.followup.v1")),
  ).toBeNull();
});
