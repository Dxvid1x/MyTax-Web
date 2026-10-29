import { test, expect } from "@playwright/test";
import { makeSaved, STORAGE_KEY } from "../../src/storage.ts";
import { demoPlan } from "../../src/tax.ts";

for (const theme of ["light", "dark"] as const)
  for (const width of [390, 1280]) {
    test(`navigation, statement action and live tax colours ${theme} ${width}`, async ({
      page,
    }) => {
      await page.setViewportSize({ width, height: 900 });
      await page.addInitScript(
        ({ key, raw, theme }) => {
          localStorage.setItem(key, raw);
          localStorage.setItem("mytax.theme", theme);
        },
        {
          key: STORAGE_KEY,
          raw: JSON.stringify(makeSaved(demoPlan(), [])),
          theme,
        },
      );

      for (const path of ["/tax", "/tax/2", "/tax/3"]) {
        await page.goto(path);
        const amount = page.locator(".live-tax-amount strong");
        await expect(amount).toContainText("20,100");
        await expect(amount).toHaveCSS(
          "color",
          theme === "dark" ? "rgb(255, 113, 137)" : "rgb(193, 43, 69)",
        );
        await expect(page.locator(".question-panel")).toHaveCSS("opacity", "1");
        if (path === "/tax")
          await page.screenshot({
            path: `output/playwright/polish-${theme}-${width}-tax.png`,
            fullPage: true,
          });
      }

      await page.goto("/ledger");
      const action = page.getByRole("button", {
        name: "นำเข้า Statement",
        exact: true,
      });
      await expect(action).toBeInViewport();
      expect((await action.boundingBox())!.height).toBeGreaterThanOrEqual(56);
      await expect(action).toHaveCSS(
        "background-color",
        theme === "dark" ? "rgb(99, 223, 152)" : "rgb(24, 115, 68)",
      );
      await page.screenshot({
        path: `output/playwright/polish-${theme}-${width}-ledger.png`,
      });
      await action.focus();
      await page.keyboard.press("Enter");
      await expect(
        page.getByRole("dialog", { name: "นำเข้า Statement" }),
      ).toBeVisible();
      await page.keyboard.press("Escape");
      await expect(action).toBeFocused();

      const navigation = page.getByRole("navigation", { name: "เมนูหลัก" });
      await expect(navigation.getByRole("button")).toHaveCount(5);
      for (const button of await navigation.getByRole("button").all())
        await expect(button).toBeInViewport();
      const about = navigation.getByRole("button", {
        name: "เกี่ยวกับ",
        exact: true,
      });
      await about.focus();
      await page.keyboard.press("Enter");
      await expect(page).toHaveURL(/\/about$/);
      await expect(about).toHaveAttribute("aria-current", "page");
      await page.screenshot({
        path: `output/playwright/polish-${theme}-${width}-about.png`,
      });
      await page.goBack();
      await expect(page).toHaveURL(/\/ledger$/);

      await page.goto("/tax-law");
      const mascot = page.locator(".law-cell img");
      await expect(mascot).toHaveAttribute(
        "src",
        "/images/mytax-mascot-crying-bars.webp",
      );
      await expect(mascot).toHaveJSProperty("naturalWidth", 800);
      // The new illustration includes the bars being held; do not overlay bars on its face.
      await expect(page.locator(".law-bars")).toHaveCount(0);
      await page.screenshot({
        path: `output/playwright/polish-${theme}-${width}-law.png`,
        fullPage: true,
      });
      expect(
        await page.evaluate(() => document.documentElement.scrollWidth),
      ).toBeLessThanOrEqual(width);
    });
  }
