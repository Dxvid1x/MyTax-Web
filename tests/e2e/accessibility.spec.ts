import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { makeSaved, STORAGE_KEY } from "../../src/storage.ts";
import { demoPlan } from "../../src/tax.ts";
for (const theme of ["light", "dark"] as const)
  test(`expanded cards, entry dialog and homepage accessibility: ${theme}`, async ({
    page,
  }) => {
    test.setTimeout(60000);
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/");
    await page.evaluate(({ key, raw }) => localStorage.setItem(key, raw), {
      key: STORAGE_KEY,
      raw: JSON.stringify(makeSaved(demoPlan(), [])),
    });
    await page.reload();
    await page.getByRole("button", { name: "ตั้งค่า", exact: true }).click();
    await page
      .getByRole("group", { name: "ธีมหน้าจอ" })
      .getByRole("button", {
        name: theme === "light" ? "สว่าง" : "มืด",
        exact: true,
      })
      .click();
    const scan = async (label: string) => {
      const results = await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
        .analyze();
      expect(
        results.violations.map((v) => ({
          id: v.id,
          nodes: v.nodes.map((n) => ({
            target: n.target,
            summary: n.failureSummary,
          })),
        })),
        label,
      ).toEqual([]);
    };
    await scan("home");
    await page.getByRole("button", { name: "ตั้งค่า", exact: true }).click();
    await page.screenshot({
      path: `output/playwright/home-${theme}.png`,
      fullPage: true,
    });
    await page.goto("/tax");
    await scan("year choice");
    await page.goto("/tax/4");
    await scan("simple result");
    await page.locator(".result-details > summary").click();
    await scan("expanded result");
    await page.goto("/tax/2");
    for (const name of [
      "ครอบครัว",
      "ดอกเบี้ยบ้าน",
      "PVD / กบข.",
      "Thai ESG",
      "เงินบริจาค",
    ]) {
      await page
        .locator(".extended-deductions summary")
        .filter({ hasText: name })
        .click();
      await scan(name);
    }
    await page.goto("/ledger");
    await page
      .getByRole("button", { name: "จดเงินออก", exact: false })
      .first()
      .click();
    await expect(page.getByRole("dialog")).toBeVisible();
    await page.locator(".custom-category summary").click();
    await page.getByRole("checkbox", { name: "เป็นรายการประจำ" }).check();
    await scan("entry dialog");
  });
