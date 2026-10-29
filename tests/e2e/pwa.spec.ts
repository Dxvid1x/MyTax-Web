import { test, expect } from "@playwright/test";
import { makeSaved, STORAGE_KEY } from "../../src/storage.ts";
import { demoPlan } from "../../src/tax.ts";
import { createTransaction, today } from "../../src/ledger.ts";
test("production PWA precaches every feature and reloads saved ledger completely offline", async ({
  page,
  context,
  request,
}) => {
  test.setTimeout(60000);
  const origin = "http://127.0.0.1:5175";
  const external: string[] = [];
  page.on("request", (r) => {
    if (new URL(r.url()).origin !== origin) external.push(r.url());
  });
  const manifest = await (
    await request.get(origin + "/manifest.webmanifest")
  ).json();
  expect(manifest.display).toBe("standalone");
  expect(manifest.start_url).toBe("/");
  expect(manifest.icons).toHaveLength(3);
  await page.goto(origin + "/");
  await page.evaluate(() => navigator.serviceWorker.ready);
  await page.waitForFunction(() => !!navigator.serviceWorker.controller);
  const saved = makeSaved({ ...demoPlan(), taxYear: "2569" }, [
    createTransaction("expense", "1234.50", today(), "อาหาร", "offline test"),
  ]);
  await page.evaluate(({ key, raw }) => localStorage.setItem(key, raw), {
    key: STORAGE_KEY,
    raw: JSON.stringify(saved),
  });
  const cached = await page.evaluate(async () => {
    const cache = await caches.open(
      (await caches.keys()).find((k) => k.startsWith("mytax-static-"))!,
    );
    return (await cache.keys()).map((r) => new URL(r.url).pathname);
  });
  expect(cached.some((p) => p.includes("TaxGuide") && p.endsWith(".js"))).toBe(
    true,
  );
  expect(cached.some((p) => p.includes("DemoStudio"))).toBe(false);
  await expect(page.locator(".scroll-story")).toBeAttached();
  expect(cached.some((p) => p.endsWith(".ttf"))).toBe(false);
  await context.setOffline(true);
  await page.reload();
  await expect(page.locator(".offline-status")).toBeVisible();
  await page
    .getByRole("navigation", { name: "เมนูหลัก" })
    .getByRole("button", { name: "สมุดเงิน", exact: true })
    .click();
  await expect(page.locator(".transaction-amount")).toHaveText("−1,234.50");
  await expect(page).toHaveURL(origin + "/ledger");
  await page.reload();
  await expect(page.locator(".transaction-amount")).toHaveText("−1,234.50");
  await page.getByRole("button", { name: "วางแผนภาษี", exact: true }).click();
  await expect(page.locator(".planning-goals")).toBeVisible();
  await page.reload();
  await expect(page.locator(".planning-goals")).toBeVisible();
  await page.getByRole("button", { name: /เลี่ยงภาษี ดูผล/ }).click();
  await expect(page).toHaveURL(origin + "/tax-law");
  await page.reload();
  await expect(page.locator(".law-cases article")).toHaveCount(3);
  await expect(page.locator(".law-cell img")).toBeVisible();
  await page.getByRole("button", { name: "กลับไปวางแผนภาษี" }).click();
  await page.getByRole("button", { name: /ลดหย่อนภาษี ใช้สิทธิ์/ }).click();
  await page.getByRole("button", { name: /ลองวางแผนเพิ่ม/ }).click();
  await page.getByRole("button", { name: /RMF/ }).click();
  await expect(page.locator(".guide-trial")).toBeVisible();
  await page.getByRole("button", { name: "คำนวณภาษี", exact: true }).click();
  await expect(page.locator("#salary")).toHaveValue("600,000");
  await page.screenshot({
    path: "output/playwright/offline-production.png",
    fullPage: true,
  });
  await page.goto(origin + "/about");
  await expect(
    page.getByRole("heading", { name: "เกี่ยวกับ MyTax" }),
  ).toBeVisible();
  await page.reload();
  await expect(
    page.getByRole("heading", { name: "ข้อมูลอยู่ที่ไหน?" }),
  ).toBeVisible();
  expect(external).toEqual([]);
});
