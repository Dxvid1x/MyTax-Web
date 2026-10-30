import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
for (const theme of ["light", "dark"])
  test(`Plus offer demonstrates outcomes and opens the right workspace: ${theme}`, async ({
    page,
  }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.addInitScript(
      (theme) => localStorage.setItem("mytax.theme", theme),
      theme,
    );
    await page.goto("/money-plan");
    await expect(
      page.getByRole("heading", { name: /รู้ก่อนใช้/ }),
    ).toBeVisible();
    await expect(page.locator(".followup-workspace-body")).toBeHidden();
    const preview = page.locator(".plus-preview");
    await preview
      .getByRole("button", { name: "เล่นตัวอย่าง", exact: true })
      .click();
    await expect(
      preview.getByRole("button", { name: "หยุดตัวอย่าง", exact: true }),
    ).toBeVisible();
    await expect(preview.locator("strong")).toContainText("3,200");
    await preview
      .getByRole("button", { name: "หยุดตัวอย่าง", exact: true })
      .click();
    await expect(
      preview.getByRole("button", { name: "เล่นตัวอย่าง", exact: true }),
    ).toBeVisible();
    await preview.getByRole("button", { name: "ติดตาม", exact: true }).click();
    await expect(preview.locator("strong")).toContainText("3,200");
    await preview.getByRole("button", { name: "ลองปรับ", exact: true }).click();
    await expect(preview.locator("strong")).toContainText("3,700");
    await expect(preview).toContainText("ลดลง");
    await page
      .getByRole("button", { name: "ลองกับเงินของฉัน", exact: true })
      .click();
    await expect(
      page.getByRole("button", { name: "ใช้รายการของฉัน", exact: true }),
    ).toHaveAttribute("aria-pressed", "true");
    await expect(page.locator("#followup-workspace")).toBeFocused();
    await page
      .getByRole("button", { name: "ดูตัวอย่างติดตาม 4 สัปดาห์", exact: true })
      .click();
    await expect(
      page.getByRole("button", { name: "ลองข้อมูลตัวอย่าง", exact: true }),
    ).toHaveAttribute("aria-pressed", "true");
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
    await page.screenshot({
      path: `output/plus-offer-${theme}-mobile.png`,
      fullPage: true,
    });
    await page.setViewportSize({ width: 1280, height: 960 });
    await page.screenshot({
      path: `output/plus-offer-${theme}-desktop.png`,
      fullPage: true,
    });
  });
test("smoke is attached to the runner and reveal moves in from left", async ({
  page,
}) => {
  await page.goto("/tax-law");
  await page.getByRole("button", { name: "แตะหนูให้วิ่งหนี" }).click();
  await expect(
    page.locator(".bandit-escape-button .bandit-foot-smoke i"),
  ).toHaveCount(9);
  const smoke = await page.locator(".bandit-foot-smoke").evaluate((el) => ({
    position: getComputedStyle(el).position,
    parent: el.parentElement?.className,
  }));
  expect(smoke.position).toBe("absolute");
  expect(smoke.parent).toContain("bandit-escape-button");
  await expect(page.locator(".bandit-reveal")).toBeVisible();
  await expect(page.locator(".bandit-reveal")).toHaveCSS(
    "animation-name",
    "bandit-reveal-in",
  );
  await page.emulateMedia({ reducedMotion: "reduce" });
  await expect(page.locator(".bandit-reveal")).toHaveCSS(
    "animation-name",
    "none",
  );
});
