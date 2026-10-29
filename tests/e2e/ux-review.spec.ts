import { test, expect, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { makeSaved, STORAGE_KEY } from "../../src/storage.ts";
import { demoPlan, emptyPlan } from "../../src/tax.ts";
import { createTransaction, today } from "../../src/ledger.ts";
async function seed(page: Page, plan = demoPlan(), path = "/tax/4") {
  await page.goto("/");
  await page.evaluate(({ key, raw }) => localStorage.setItem(key, raw), {
    key: STORAGE_KEY,
    raw: JSON.stringify(
      makeSaved(plan, [
        createTransaction("expense", "80", today(), "อาหาร", ""),
      ]),
    ),
  });
  await page.goto(path);
}
test("mobile first screens expose the main action; blank preview is not zero", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  const start = page
    .getByRole("button", { name: "คำนวณภาษีของฉัน", exact: true })
    .first();
  await expect(start).toBeInViewport();
  await start.click();
  await expect(page.locator(".live-tax-pending")).toBeVisible();
  await expect(page.locator(".live-tax-amount")).toHaveCount(0);
  await expect(page.locator("#monthly")).toHaveValue("");
  await expect(
    page.getByRole("progressbar", { name: "ความคืบหน้าการคำนวณภาษี" }),
  ).toHaveAttribute("aria-valuenow", "1");
  await page.waitForTimeout(600);
  const field = (await page.locator("#monthly").boundingBox())!;
  const actions = (await page.locator(".form-actions").boundingBox())!;
  expect(field.y + field.height).toBeLessThan(actions.y);
  expect(actions.y + actions.height).toBeLessThanOrEqual(845);
  await page.locator("#monthly").fill("50000");
  await expect(page.locator(".live-tax-amount")).toContainText("21,500");
  await page.getByRole("button", { name: "ต่อไป", exact: true }).click();
  await expect(page.getByRole("progressbar")).toHaveAttribute(
    "aria-valuenow",
    "2",
  );
  await expect(
    page.getByRole("button", { name: /ขั้น 3.*ยังไม่ถึง/ }),
  ).toBeDisabled();
  await page.getByRole("button", { name: /ขั้น 1.*กลับไปแก้ไข/ }).click();
  await expect(page).toHaveURL(/\/tax$/);
  await expect(page.getByRole("progressbar")).toHaveAttribute(
    "aria-valuenow",
    "1",
  );
  await expect(page.locator("#monthly")).toHaveValue("50,000");
  // Check final colours after the panel entrance, rather than a fading frame.
  await expect
    .poll(() =>
      page
        .locator(".question-panel")
        .evaluate((panel) => getComputedStyle(panel).opacity),
    )
    .toBe("1");
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
});
test("closed year offers a safe switch, keeps amounts and ledger, and blocks new-purchase planning", async ({
  page,
}) => {
  await seed(page, demoPlan(), "/reduce");
  await page.getByRole("button", { name: /ลดหย่อนภาษี ใช้สิทธิ์/ }).click();
  await expect(
    page.getByRole("button", { name: /ลองวางแผนเพิ่ม/ }),
  ).toHaveCount(0);
  await page.getByRole("button", { name: "สลับไปวางแผนปี 2569" }).click();
  await expect(page.locator(".tax-countdown")).toContainText(
    /เหลืออีก \d+ วัน/,
  );
  await expect(page.locator(".year-review")).toContainText(
    "จำนวนเงินยังเป็นของปี 2568",
  );
  await expect(
    page.getByRole("button", { name: /ลองวางแผนเพิ่ม/ }),
  ).toBeVisible();
  await page.getByRole("button", { name: "คำนวณภาษี", exact: true }).click();
  await expect(page.locator("#salary")).toHaveValue("600,000");
  await expect(page.locator("#bonus")).toHaveValue("60,000");
  await page
    .getByRole("button", { name: "สมุดเงิน", exact: true })
    .first()
    .click();
  await expect(page.locator(".transaction-amount")).toHaveText("−80.00");
});
test("results expose correct marginal rate, average basis and unknown withholding without payable claim", async ({
  page,
}) => {
  for (const [salary, rate] of [
    ["100000", "0%"],
    ["310000", "5%"],
    ["460000", "10%"],
    ["5160000", "35%"],
  ]) {
    await seed(page, { ...emptyPlan("2569"), salary, scope: true });
    await expect(page.getByTestId("marginal-rate")).toHaveText(rate);
    await expect(page.locator(".result-rates")).toContainText(
      "ภาษีทั้งปี ÷ รายได้รวม",
    );
    await expect(page.locator(".result-next")).toContainText("รอเช็กยอด");
    await expect(page.locator(".result-summary")).not.toContainText(
      "ต้องจ่ายเพิ่ม",
    );
    await expect(page.locator(".result-actions .primary")).toHaveText(
      /วางแผนภาษี/,
    );
  }
});
test("about opens from footer and main navigation, supports keyboard, and passes axe in both themes", async ({
  page,
}) => {
  await page.goto("/");
  await page
    .locator("footer")
    .getByRole("button", { name: "เกี่ยวกับ / คำถามที่พบบ่อย" })
    .click();
  await expect(page).toHaveURL(/\/about$/);
  await expect(
    page.getByRole("heading", { name: "ข้อมูลอยู่ที่ไหน?" }),
  ).toBeVisible();
  await expect(page.locator(".about-page details")).toHaveCount(7);
  for (const theme of ["light", "dark"]) {
    await page.evaluate((value) => {
      localStorage.setItem("mytax.theme", value);
    }, theme);
    await page.reload();
    expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
  }
  await page.getByRole("button", { name: "MyTax หน้าแรก" }).click();
  await expect(page).toHaveURL(/\/$/);
  const about = page
    .getByRole("navigation", { name: "เมนูหลัก" })
    .getByRole("button", { name: "เกี่ยวกับ", exact: true });
  await about.focus();
  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(/\/about$/);
  await expect(about).toHaveAttribute("aria-current", "page");
  await expect(page.locator(".settings-about")).toHaveCount(0);
});
