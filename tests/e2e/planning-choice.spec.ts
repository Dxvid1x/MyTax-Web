import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { makeSaved, STORAGE_KEY } from "../../src/storage.ts";
import { demoPlan } from "../../src/tax.ts";

for (const theme of ["light", "dark"] as const) {
  test(`planning choices and warning route remain accessible and preserve data: ${theme}`, async ({
    page,
  }) => {
    test.setTimeout(60000);
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/");
    const raw = JSON.stringify(
      makeSaved({ ...demoPlan(), taxYear: "2569" }, []),
    );
    await page.evaluate(
      ({ theme, raw, key }) => {
        localStorage.setItem("mytax.theme", theme);
        localStorage.setItem(key, raw);
      },
      { theme, raw, key: STORAGE_KEY },
    );
    await page.goto("/reduce");
    await expect(
      page.getByRole("heading", { name: "อยากจ่ายภาษีน้อยลงมั้ย" }),
    ).toBeVisible();
    const green = page.getByRole("button", { name: /ลดหย่อนภาษี ใช้สิทธิ์/ });
    const red = page.getByRole("button", { name: /เลี่ยงภาษี ดูผล/ });
    const greenBox = await green.boundingBox();
    const redBox = await red.boundingBox();
    expect(greenBox!.x).toBeLessThan(redBox!.x);
    expect(Math.abs(greenBox!.y - redBox!.y)).toBeLessThan(2);
    await expect(page.locator(".planning-mascot-stage img")).toHaveJSProperty(
      "naturalWidth",
      800,
    );
    expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
    await green.focus();
    await page.keyboard.press("Enter");
    await expect(
      page.getByRole("heading", { name: "ลดหย่อนภาษี เริ่มจากสิทธิ์ที่มี" }),
    ).toBeFocused();
    await expect(page.locator(".deduction-explainer")).toContainText(
      "ไม่ใช่ได้เงินคืนเท่ายอดที่จ่าย",
    );
    await expect(page.locator(".guide-trial")).toHaveCount(0);
    expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
    await page.getByRole("button", { name: "กลับไปเลือกทาง" }).click();
    await red.focus();
    await page.keyboard.press("Enter");
    await expect(page).toHaveURL(/\/tax-law$/);
    await expect(page.locator(".tax-law-shell")).toBeVisible();
    await expect(
      page.locator("[data-law-case=false-information]"),
    ).toContainText("จำคุก 3 เดือน–7 ปี");
    await expect(
      page.locator("[data-law-case=false-information]"),
    ).toContainText("และปรับ 2,000–200,000 บาท");
    await expect(
      page.locator("[data-law-case=intentional-non-filing]"),
    ).toContainText("หรือปรับไม่เกิน 200,000 บาท หรือทั้งจำทั้งปรับ");
    await expect(page.locator("[data-law-case=late-filing]")).toContainText(
      "เหตุสุดวิสัย",
    );
    await expect(page.locator(".law-meaning")).toContainText(
      "การใช้สิทธิ์ลดหย่อนที่เข้าเงื่อนไข",
    );
    expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
    await page.reload();
    await expect(page.locator(".law-cases article")).toHaveCount(3);
    await page.getByRole("button", { name: "กลับไปวางแผนภาษี" }).click();
    await expect(page).toHaveURL(/\/reduce$/);
    await expect(page.locator("html")).toHaveAttribute("data-theme", theme);
    expect(
      await page.evaluate((key) => localStorage.getItem(key), STORAGE_KEY),
    ).toBe(raw);
    expect(
      await page.evaluate(() => document.querySelector(".tax-law-shell")),
    ).toBeNull();
  });
}
