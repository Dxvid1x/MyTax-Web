import { test, expect, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { makeSaved, STORAGE_KEY } from "../../src/storage.ts";
import { demoPlan, emptyPlan } from "../../src/tax.ts";
import { createTransaction, today } from "../../src/ledger.ts";
import { emptyLedgerSettings } from "../../src/ledgerExtras.ts";
async function seed(page: Page, data: unknown, path = "/ledger") {
  await page.goto("/");
  await page.evaluate(({ key, raw }) => localStorage.setItem(key, raw), {
    key: STORAGE_KEY,
    raw: JSON.stringify(data),
  });
  await page.reload();
  await page.goto(path);
}
test("scope review is deferred, unknown is explicit and changing answers resets confirmation", async ({
  page,
}) => {
  await page.goto("/tax");
  await expect(page.locator(".scope-check")).toHaveCount(0);
  await page.locator("#monthly").fill("50000");
  await page.getByRole("button", { name: "ต่อไป", exact: true }).click();
  await expect(page).toHaveURL(/\/tax\/2$/);
  await page.locator(".scope-helper summary").click();
  await page
    .getByRole("group", { name: "มีคู่สมรส บุตร หรือดูแลพ่อแม่?" })
    .getByRole("button", { name: "ยังไม่แน่ใจ" })
    .click();
  await page.getByRole("button", { name: "ต่อไป", exact: true }).click();
  const income = page.getByRole("group", {
    name: "มีรายได้อื่นหรือรายได้ต่างประเทศ?",
  });
  await income.getByRole("button", { name: "มี", exact: true }).click();
  await expect(page.locator(".scope-warning").first()).toContainText(
    "ไม่ใช่ภาษีทั้งหมด",
  );
  await page.locator("#scope").check();
  await income.getByRole("button", { name: "ยังไม่แน่ใจ" }).click();
  await expect(page.locator("#scope")).not.toBeChecked();
  await page.getByRole("button", { name: "ดูผลของฉัน" }).click();
  await expect(page.locator("#scope")).toBeFocused();
  await expect(page).toHaveURL(/\/tax\/3$/);
  await page.locator("#scope").check();
  await page.getByRole("button", { name: "ดูผลของฉัน" }).click();
  await expect(page.locator(".results .scope-warning")).toBeVisible();
  await expect(page.locator(".result-next")).toContainText("เหลือเช็กยอด");
  await expect(page.locator(".marginal-card")).not.toBeVisible();
  await page.getByText("ดูรายละเอียดการคำนวณ", { exact: true }).click();
  await page.getByText("ดูวิธีคำนวณ", { exact: true }).click();
  await expect(page.locator(".marginal-card")).toBeVisible();
});
test("extended eligibility error opens the right card and family result has independently calculated tax", async ({
  page,
}) => {
  const plan = {
    ...emptyPlan("2569"),
    salary: "900000",
    scope: true,
    extra: {
      spouseNoIncome: true,
      biologicalLiving: "2",
      children: "2",
      childBonus: "1",
      adoptedChildren: "1",
      parentOwn: "2",
      parentSpouse: "1",
      familyEligible: true,
      mortgage: "140000",
      mortgageEligible: false,
    },
  };
  await seed(page, makeSaved(plan, []), "/tax/2");
  await page.getByRole("button", { name: "ต่อไป", exact: true }).click();
  await expect(page.locator("#mortgageEligible")).toBeFocused();
  await page.locator("#mortgageEligible").check();
  await page.getByRole("button", { name: "ต่อไป", exact: true }).click();
  await page.getByRole("button", { name: "ดูผลของฉัน" }).click();
  await expect(page.locator(".result-summary")).toContainText("14,500");
  await page.getByText("ดูรายละเอียดการคำนวณ", { exact: true }).click();
  await page.getByText("ดูวิธีคำนวณ", { exact: true }).click();
  await expect(page.locator(".marginal-card")).toContainText("10%");
});
test("salary import is explicit, year/category filtered, and updates the annual input", async ({
  page,
}) => {
  const rows = [
    createTransaction("income", "20000", "2026-01-01", "เงินเดือน", ""),
    createTransaction("income", "30000", "2026-02-01", "เงินเดือน", ""),
    createTransaction("income", "10000", "2025-01-01", "เงินเดือน", ""),
    createTransaction("income", "9000", "2026-02-01", "งานเสริม", ""),
  ];
  await seed(
    page,
    makeSaved({ ...emptyPlan("2569"), bonus: "1234" }, rows),
    "/tax",
  );
  await page.getByRole("button", { name: /นำเงินเดือนจากสมุดเงิน/ }).click();
  await expect(page.getByRole("dialog")).toContainText("50,000");
  await expect(page.getByRole("dialog")).toContainText("ก่อนหัก");
  await page.getByRole("button", { name: "แทนยอดเงินเดือนทั้งปี" }).click();
  await expect(page.locator("#salary")).toHaveValue("50,000");
  await expect(page.locator("#bonus")).toHaveValue("1,234");
});
test("ledger supports custom category, recurring confirmation, yearly filters and undo", async ({
  page,
}) => {
  await seed(page, makeSaved(demoPlan(), []));
  await page
    .getByRole("button", { name: "จดเงินออก", exact: false })
    .first()
    .click();
  await page.locator("#transaction-amount").fill("555.55");
  await page.getByText("เพิ่มหมวดของฉัน", { exact: true }).click();
  await page.locator("#custom-category").fill("แมว");
  await page.getByRole("button", { name: "เพิ่มหมวดนี้" }).click();
  await page.getByRole("checkbox", { name: "เป็นรายการประจำ" }).check();
  await page.getByRole("button", { name: "เพิ่มรายการ", exact: true }).click();
  await expect(page.locator(".transaction-amount")).toHaveText("−555.55");
  await page.getByRole("button", { name: /ลบรายการ แมว/ }).click();
  await page.getByRole("button", { name: "ยืนยันลบรายการ" }).click();
  await expect(page.locator(".transaction")).toHaveCount(0);
  await page.getByRole("button", { name: "คืนรายการที่ลบ" }).click();
  await expect(page.locator(".transaction")).toHaveCount(1);
  await page.getByRole("button", { name: "ปี", exact: true }).click();
  await page.locator(".ledger-filter-panel summary").click();
  await page.locator("#ledger-search").fill("แมว");
  await expect(page.locator(".transaction")).toHaveCount(1);
  await page.locator("#ledger-search").fill("ไม่พบ");
  await expect(page.locator(".transaction")).toHaveCount(0);
  await page.getByRole("button", { name: "ล้างตัวกรอง" }).click();
  await expect(page.locator(".transaction")).toHaveCount(1);
  // Saved writes now take a cross-tab Web Lock; unload cannot await it.
  await expect
    .poll(() =>
      page.evaluate(
        (key) => JSON.parse(localStorage.getItem(key)!).transactions.length,
        STORAGE_KEY,
      ),
    )
    .toBe(1);
  await page.reload();
  await expect(page.locator(".transaction")).toHaveCount(1);
  await page.locator(".recurring-panel summary").click();
  await expect(page.locator(".recurring-row")).toContainText("แมว");
  await page.getByRole("button", { name: "ตรวจรายการที่ถึงกำหนด" }).click();
  await expect(page.locator(".toast")).toContainText("ยังไม่มี");
});
test("past recurring rounds add only after confirmation and do not duplicate on reload", async ({
  page,
}) => {
  const settings = emptyLedgerSettings();
  settings.recurring = [
    {
      id: "food",
      type: "expense",
      amount: 123450,
      category: "อาหาร",
      note: "repeat",
      startDate: "2026-01-31",
      nextDate: "2026-02-28",
      frequency: "month",
    },
  ];
  await seed(page, makeSaved(demoPlan(), [], true, settings));
  await page.locator(".recurring-panel summary").click();
  await page.getByRole("button", { name: "ตรวจรายการที่ถึงกำหนด" }).click();
  await expect(page.getByRole("dialog")).toContainText("28 ก.พ.");
  await expect(page.locator(".transaction")).toHaveCount(0);
  await page.getByRole("button", { name: "ยืนยันเพิ่มรายการประจำ" }).click();
  await page.getByRole("button", { name: "ปี", exact: true }).click();
  const count = await page.locator(".transaction").count();
  expect(count).toBeGreaterThan(0);
  await expect
    .poll(() =>
      page.evaluate(
        (key) => JSON.parse(localStorage.getItem(key)!).transactions.length,
        STORAGE_KEY,
      ),
    )
    .toBe(count);
  await page.reload();
  await page.getByRole("button", { name: "ปี", exact: true }).click();
  await expect(page.locator(".transaction")).toHaveCount(count);
  await page.locator(".recurring-panel summary").click();
  await page.getByRole("button", { name: "ตรวจรายการที่ถึงกำหนด" }).click();
  await expect(page.locator(".toast")).toContainText("ยังไม่มี");
});
test("Thai ESG guide replaces contribution using the real plan; SSF has no new-year deduction", async ({
  page,
}) => {
  await seed(
    page,
    makeSaved({ ...demoPlan(), taxYear: "2569" }, []),
    "/reduce",
  );
  await expect(page.locator(".guide-trial")).toHaveCount(0);
  await expect(page.locator(".guide-option-detail")).toHaveCount(0);
  await page.getByRole("button", { name: /ลดหย่อนภาษี ใช้สิทธิ์/ }).click();
  await page.getByRole("button", { name: /ลองวางแผนเพิ่ม/ }).click();
  await page
    .getByRole("button", { name: /Thai ESG/ })
    .first()
    .click();
  await page.locator("#guide-thaiEsg").fill("50000");
  await page.locator(".guide-trial input[type=checkbox]").check();
  await expect(page.locator(".trial-comparison")).toContainText("15,100");
  await page.getByRole("button", { name: /ใช้ยอดนี้ แล้วดูผลภาษี/ }).click();
  await expect(page).toHaveURL(/\/tax\/4$/);
  await expect(page.locator(".result-summary")).toContainText("15,100");
  await page
    .getByRole("navigation", { name: "เมนูหลัก" })
    .getByRole("button", { name: "วางแผนภาษี", exact: true })
    .click();
  await page.getByRole("button", { name: /ลดหย่อนภาษี ใช้สิทธิ์/ }).click();
  await page
    .getByRole("button", { name: /เช็กสิทธิ์จากสิ่งที่มีอยู่แล้ว/ })
    .click();
  await page.locator(".planning-legacy summary").click();
  await page.getByRole("button", { name: /SSF/ }).first().click();
  await expect(page.locator(".guide-info-only")).toContainText(
    "ซื้อใหม่ใช้ลดหย่อนปีนี้ไม่ได้",
  );
  await expect(page.locator("#guide-ssf")).toHaveCount(0);
});
test("dark preference persists, system preference responds and mobile layouts fit", async ({
  page,
}) => {
  await page.emulateMedia({ colorScheme: "dark", reducedMotion: "reduce" });
  await seed(
    page,
    makeSaved(demoPlan(), [
      createTransaction("expense", "1234.50", today(), "อาหาร", ""),
    ]),
    "/tax/2",
  );
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  await page.getByRole("button", { name: "ตั้งค่า", exact: true }).click();
  await page.getByRole("button", { name: "สว่าง", exact: true }).click();
  await page.reload();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
  await page.getByRole("button", { name: "ตั้งค่า", exact: true }).click();
  await page.getByRole("button", { name: "มืด", exact: true }).click();
  await page.getByRole("button", { name: "ตั้งค่า", exact: true }).click();
  await page.setViewportSize({ width: 390, height: 844 });
  for (const path of ["/tax", "/tax/2", "/tax/4", "/ledger", "/reduce"]) {
    await page.goto(path);
    await expect(page.locator("main :is(h1,h2):visible").first()).toBeVisible();
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
  }
  await page.goto("/tax/2");
  await page
    .locator(".extended-deductions summary")
    .filter({ hasText: "ครอบครัว" })
    .click();
  await page.evaluate(() => document.fonts.ready);
  await page.screenshot({
    path: "output/playwright/extended-mobile-dark.png",
    fullPage: true,
  });
});
for (const theme of ["light", "dark"] as const)
  test(`accessibility labels and contrast: ${theme} tax steps, ledger and guide`, async ({
    page,
  }) => {
    test.setTimeout(60000);
    await page.emulateMedia({ reducedMotion: "reduce" });
    await seed(
      page,
      makeSaved({ ...demoPlan(), taxYear: "2569" }, [
        createTransaction("expense", "12.34", today(), "อาหาร", ""),
      ]),
      "/tax",
    );
    await page.getByRole("button", { name: "ตั้งค่า", exact: true }).click();
    await page
      .getByRole("group", { name: "ธีมหน้าจอ" })
      .getByRole("button", {
        name: theme === "light" ? "สว่าง" : "มืด",
        exact: true,
      })
      .click();
    for (const path of [
      "/tax",
      "/tax/2",
      "/tax/3",
      "/tax/4",
      "/ledger",
      "/reduce",
    ]) {
      await page.goto(path);
      await expect(
        page.locator("main :is(h1,h2):visible").first(),
      ).toBeVisible();
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
        path,
      ).toEqual([]);
      if (path === "/reduce") {
        await page
          .getByRole("button", { name: /ลดหย่อนภาษี ใช้สิทธิ์/ })
          .click();
        for (const intent of [
          /เช็กสิทธิ์จากสิ่งที่มีอยู่แล้ว/,
          /ลองวางแผนเพิ่ม/,
        ]) {
          await page.getByRole("button", { name: intent }).click();
          await expect(page.locator(".guide-trial")).toHaveCount(0);
          await page.getByRole("button", { name: /ประกันสุขภาพ/ }).click();
          await expect(page.locator(".guide-option-detail")).toBeVisible();
          const planning = await new AxeBuilder({ page })
            .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
            .analyze();
          expect(
            planning.violations.map((v) => ({
              id: v.id,
              nodes: v.nodes.map((n) => ({
                target: n.target,
                summary: n.failureSummary,
              })),
            })),
          ).toEqual([]);
          await page
            .getByRole("button", { name: "เปลี่ยนทางเลือก", exact: true })
            .click();
        }
      }
    }
  });
