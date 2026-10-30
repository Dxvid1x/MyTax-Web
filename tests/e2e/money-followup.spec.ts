import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
for (const theme of ["light", "dark"])
  test(`followup explains and reverses changes without modifying the ledger: ${theme}`, async ({
    page,
  }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.addInitScript(
      (theme) => localStorage.setItem("mytax.theme", theme),
      theme,
    );
    await page.goto("/money-plan");
    await page
      .getByRole("button", { name: "ดูตัวอย่างติดตาม 4 สัปดาห์", exact: true })
      .click();
    const before = await page.evaluate(() =>
      localStorage.getItem("mytax.local.v2"),
    );
    await expect(
      page.getByRole("heading", { name: "เงินเปลี่ยน แผนก็ต้องตามทัน" }),
    ).toBeVisible();
    await expect(page.locator(".followup-runway > strong")).toContainText(
      "5,000",
    );
    await page.getByRole("button", { name: "ทบทวนรอบนี้แล้ว" }).click();
    await page.getByRole("button", { name: "ทดลองสัปดาห์ถัดไป" }).click();
    await expect(page.locator(".followup-runway > strong")).toContainText(
      "3,200",
    );
    await page.getByRole("button", { name: "ใช้ทางเลือกนี้" }).click();
    await expect(page.locator(".followup-runway > strong")).toContainText(
      "3,700",
    );
    await expect(page.locator(".followup-goal-progress > span")).toContainText(
      "30,000",
    );
    await page.getByRole("button", { name: "คืนแผนเดิม" }).click();
    await expect(page.locator(".followup-runway > strong")).toContainText(
      "3,200",
    );
    await page.getByRole("button", { name: "ทบทวนรอบนี้แล้ว" }).click();
    await expect(page.locator(".followup-review li")).toHaveCount(2);
    await page.screenshot({
      path: `output/followup-${theme}-desktop.png`,
      fullPage: true,
    });
    await page.setViewportSize({ width: 390, height: 844 });
    await expect(
      page.getByRole("button", { name: "ทดลองสัปดาห์ถัดไป" }),
    ).toBeVisible();
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth),
    ).toBeLessThanOrEqual(390);
    await expect(
      new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
        .analyze()
        .then((r) => r.violations),
    ).resolves.toEqual([]);
    await page.screenshot({
      path: `output/followup-${theme}-mobile.png`,
      fullPage: true,
    });
    await page.getByRole("button", { name: "ใช้รายการของฉัน" }).click();
    await expect(page.locator(".followup-runway > strong")).toContainText("0");
    await page.getByLabel("เงินใช้ได้ต้นเดือน", { exact: true }).fill("-1");
    await expect(page.getByRole("alert")).toBeVisible();
    expect(
      await page.evaluate(() => localStorage.getItem("mytax.local.v2")),
    ).toBe(before);
  });
