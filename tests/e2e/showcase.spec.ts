import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { makeSaved, STORAGE_KEY } from "../../src/storage.ts";
import { demoPlan } from "../../src/tax.ts";

test("presentation demo compares real calculations without changing saved data", async ({
  page,
}) => {
  await page.goto("/");
  await page.evaluate(({ key, raw }) => localStorage.setItem(key, raw), {
    key: STORAGE_KEY,
    raw: JSON.stringify(
      makeSaved({ ...demoPlan(), salary: "720000" }, [], true),
    ),
  });
  await page.reload();
  const saved = await page.evaluate(() => JSON.stringify({ ...localStorage }));
  await page.getByRole("button", { name: "ลองเดโม · TH / EN" }).click();
  await expect(page).toHaveURL(/\/showcase$/);
  await expect(
    page.getByRole("heading", {
      name: "Understand the decision. Not just the tax.",
    }),
  ).toBeVisible();
  await page.getByRole("button", { name: "See the calculation" }).click();
  await expect(page.getByTestId("baseline-tax")).toContainText("20,100");
  await page.getByRole("button", { name: "Compare a scenario" }).click();
  await expect(page.getByTestId("scenario-tax")).toContainText("17,100");
  await expect(page.getByTestId("scenario-saving")).toContainText("3,000");
  await expect(page.getByTestId("scenario-outlay")).toContainText("27,000");
  await page.screenshot({
    path: "output/showcase-desktop.png",
    fullPage: true,
  });
  await page.getByRole("slider").fill("0");
  await expect(page.getByTestId("scenario-saving")).toContainText("0");
  await page.getByRole("button", { name: "ไทย", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "เข้าใจการตัดสินใจ มากกว่าตัวเลขภาษี" }),
  ).toBeVisible();
  expect(await page.evaluate(() => JSON.stringify({ ...localStorage }))).toBe(
    saved,
  );
  await page.reload();
  await expect(page.locator(".showcase")).toBeVisible();
  await page.getByRole("button", { name: "Open the Thai calculator" }).click();
  await expect(page.locator("#salary")).toHaveValue("720,000");
});

test("showcase fits a small screen and has no detected WCAG AA violations", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/showcase");
  await page.getByRole("button", { name: "Compare", exact: true }).click();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  const audit = await new AxeBuilder({ page })
    .include(".showcase")
    .withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"])
    .analyze();
  expect(audit.violations).toEqual([]);
  await page.screenshot({ path: "output/showcase-mobile.png", fullPage: true });
});

test("demo supports keyboard comparison, Thai, dark mode and a 320px screen", async ({
  page,
}) => {
  await page.setViewportSize({ width: 320, height: 800 });
  await page.addInitScript(() => localStorage.setItem("mytax.theme", "dark"));
  await page.goto("/showcase");
  await page.getByRole("button", { name: "Compare", exact: true }).click();
  const slider = page.getByRole("slider");
  await slider.focus();
  await page.keyboard.press("Home");
  await expect(page.getByTestId("scenario-saving")).toContainText("0");
  await page.keyboard.press("ArrowRight");
  await expect(slider).toHaveValue("5000");
  await expect(page.getByTestId("scenario-saving")).toContainText("500");
  await page.getByRole("button", { name: "ไทย", exact: true }).click();
  await expect(slider).toHaveValue("5000");
  await expect(
    page.getByRole("button", { name: "ไทย", exact: true }),
  ).toHaveCSS("color", "rgb(6, 20, 12)");
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  expect(
    (
      await new AxeBuilder({ page })
        .include(".showcase")
        .withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"])
        .analyze()
    ).violations,
  ).toEqual([]);
  await page.getByRole("button", { name: "เริ่มเดโมใหม่" }).click();
  await page.getByRole("button", { name: "เปรียบเทียบ", exact: true }).click();
  await expect(slider).toHaveValue("30000");
});
