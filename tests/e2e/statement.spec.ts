import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { statementWorkbook } from "../statementFixture.ts";
import { makeSaved, STORAGE_KEY } from "../../src/storage.ts";
import { emptyPlan } from "../../src/tax.ts";
import { today, createTransaction } from "../../src/ledger.ts";

const sample = (duplicate = false) =>
  `วันที่,รายละเอียด,เงินเข้า,เงินออก\n${today()},รายรับทดสอบ,1000.50,\n${today()},ค่าอาหารทดสอบ,,80.25${duplicate ? `\n${today()},ค่าอาหารทดสอบ,,80.25` : ""}`;
test("local saving moved into settings, account banner/login removed and no account requests occur", async ({
  page,
}) => {
  const calls: string[] = [];
  page.on("request", (request) => {
    if (request.url().includes("/api/ledger")) calls.push(request.url());
  });
  await page.goto("/ledger");
  await expect(page.getByText("เลือกวิธีเก็บสมุดเงิน")).toHaveCount(0);
  await expect(
    page.getByRole("button", { name: "ใช้ข้ามเครื่อง" }),
  ).toHaveCount(0);
  await page.getByRole("button", { name: "ตั้งค่า", exact: true }).click();
  await page.locator(".settings-save").click();
  await expect(
    page.getByRole("dialog", { name: "ข้อมูลของฉัน" }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "เปิดบันทึกในเครื่อง", exact: true })
    .click();
  await page.getByRole("button", { name: "ยืนยันเปิดบันทึก" }).click();
  await page.getByRole("button", { name: "จดเงินออก" }).click();
  await page.getByLabel("จำนวนเงิน").fill("80");
  await page.locator("#transaction-note").fill("ค่าข้าวที่บันทึก");
  await page.getByRole("button", { name: "เพิ่มรายการ", exact: true }).click();
  await expect
    .poll(() =>
      page.evaluate(
        (key) => JSON.parse(localStorage.getItem(key)!).transactions.length,
        STORAGE_KEY,
      ),
    )
    .toBe(1);
  await page.reload();
  await expect(page.locator(".transaction")).toContainText("ค่าข้าวที่บันทึก");
  expect(calls).toEqual([]);
});
test("CSV preview uploads nothing, confirms selected satang totals, preserves tax and existing ledger, and flags reimport", async ({
  page,
}) => {
  const plan = emptyPlan();
  plan.salary = "60000";
  const saved = makeSaved(
    plan,
    [createTransaction("expense", "20", today(), "อาหาร", "เดิม")],
    true,
  );
  await page.addInitScript(({ key, raw }) => localStorage.setItem(key, raw), {
    key: STORAGE_KEY,
    raw: JSON.stringify(saved),
  });
  await page.goto("/ledger");
  const uploads: string[] = [];
  page.on("request", (req) => {
    if (req.method() !== "GET") uploads.push(req.url());
  });
  await page
    .getByRole("button", { name: "นำเข้า Statement", exact: true })
    .click();
  await page.locator('.statement-file input[type="file"]').setInputFiles({
    name: "bank.csv",
    mimeType: "text/csv",
    buffer: Buffer.from(sample(true)),
  });
  await expect(page.locator(".statement-row")).toHaveCount(3);
  await expect(page.getByLabel("นำเข้าแถว 4")).not.toBeChecked();
  await expect(
    page.getByRole("button", { name: "ยืนยันนำเข้า 2 รายการ" }),
  ).toBeDisabled();
  expect(
    await page.evaluate(
      (key) => JSON.parse(localStorage.getItem(key)!).transactions.length,
      STORAGE_KEY,
    ),
  ).toBe(1);
  await page
    .getByLabel("ตรวจวันที่ เงินเข้า และเงินออกกับไฟล์ต้นฉบับแล้ว")
    .check();
  await page.getByRole("button", { name: "ยืนยันนำเข้า 2 รายการ" }).click();
  await expect(page.locator(".transaction")).toHaveCount(3);
  await expect
    .poll(() =>
      page.evaluate(
        (key) => JSON.parse(localStorage.getItem(key)!).transactions.length,
        STORAGE_KEY,
      ),
    )
    .toBe(3);
  const after = await page.evaluate(
    (key) => JSON.parse(localStorage.getItem(key)!),
    STORAGE_KEY,
  );
  expect(after.taxPlan.salary).toBe("60000");
  expect(after.transactions.map((r: { amount: number }) => r.amount)).toEqual([
    2000, 100050, 8025,
  ]);
  await page
    .getByRole("button", { name: "นำเข้า Statement", exact: true })
    .click();
  await page.locator('.statement-file input[type="file"]').setInputFiles({
    name: "bank.csv",
    mimeType: "text/csv",
    buffer: Buffer.from(sample()),
  });
  await expect(page.getByLabel("นำเข้าแถว 2")).not.toBeChecked();
  await expect(page.getByLabel("นำเข้าแถว 3")).not.toBeChecked();
  await page.getByLabel("นำเข้าแถว 2").check();
  await page
    .getByLabel("ตรวจวันที่ เงินเข้า และเงินออกกับไฟล์ต้นฉบับแล้ว")
    .check();
  await expect(
    page.getByRole("button", { name: "ยืนยันนำเข้า 1 รายการ" }),
  ).toBeDisabled();
  await page.keyboard.press("Escape");
  await expect(page.locator(".transaction")).toHaveCount(3);
  expect(uploads).toEqual([]);
});
test("XLSX imports date cells and exact amounts, with no formula or macro execution", async ({
  page,
}) => {
  await page.goto("/ledger");
  await page
    .getByRole("button", { name: "นำเข้า Statement", exact: true })
    .click();
  await page.locator('.statement-file input[type="file"]').setInputFiles({
    name: "example.xlsx",
    mimeType:
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    buffer: Buffer.from(statementWorkbook()),
  });
  await expect(page.locator(".statement-row")).toHaveCount(2);
  await expect(page.locator(".statement-totals")).toContainText("875.5");
  await expect(page.locator(".statement-totals")).toContainText("10.25");
  await page
    .getByLabel("ตรวจวันที่ เงินเข้า และเงินออกกับไฟล์ต้นฉบับแล้ว")
    .check();
  await page.getByRole("button", { name: "ยืนยันนำเข้า 2 รายการ" }).click();
  await page.getByRole("button", { name: "ปี", exact: true }).click();
  await expect(page.locator(".transaction")).toHaveCount(2);
});
test("invalid rows stay excluded, column mapping handles Buddhist dates, and cancellation preserves entries", async ({
  page,
}) => {
  await page.goto("/ledger");
  await page
    .getByRole("button", { name: "นำเข้า Statement", exact: true })
    .click();
  const file =
    "วัน;ข้อความ;รับ;จ่าย\n10/01/2569;ถูกต้อง;100;\n31/02/2569;วันที่ผิด;50;\n10/01/2569;กำกวม;20;10";
  await page.locator('.statement-file input[type="file"]').setInputFiles({
    name: "map.csv",
    mimeType: "text/csv",
    buffer: Buffer.from(file),
  });
  await expect(page.getByRole("alert")).toContainText("เลือกคอลัมน์");
  await page.getByLabel("รูปแบบจำนวนเงิน").selectOption("separate");
  await page
    .getByRole("combobox", { name: "วันที่", exact: true })
    .selectOption("0");
  await page.getByLabel("รายละเอียด (ไม่บังคับ)").selectOption("1");
  await page.getByLabel("เงินเข้า / ฝาก").selectOption("2");
  await page.getByLabel("เงินออก / ถอน").selectOption("3");
  await expect(page.locator(".statement-row")).toHaveCount(3);
  await expect(page.getByLabel("นำเข้าแถว 3")).toBeDisabled();
  await expect(page.getByLabel("นำเข้าแถว 4")).toBeDisabled();
  await page.keyboard.press("Escape");
  await expect(page.locator(".transaction")).toHaveCount(0);
});
test("production offline statement reader loads Excel without an account or external connection", async ({
  page,
  context,
}) => {
  await page.goto("http://127.0.0.1:5175/ledger");
  await page.waitForFunction(() => !!navigator.serviceWorker.controller);
  await context.setOffline(true);
  try {
    await page.reload();
    await page
      .getByRole("button", { name: "นำเข้า Statement", exact: true })
      .click();
    await page.locator('.statement-file input[type="file"]').setInputFiles({
      name: "offline.xlsx",
      mimeType:
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      buffer: Buffer.from(statementWorkbook()),
    });
    await expect(page.locator(".statement-row")).toHaveCount(2);
    await page
      .getByLabel("ตรวจวันที่ เงินเข้า และเงินออกกับไฟล์ต้นฉบับแล้ว")
      .check();
    await page.getByRole("button", { name: "ยืนยันนำเข้า 2 รายการ" }).click();
    await page.getByRole("button", { name: "ปี", exact: true }).click();
    await expect(page.locator(".transaction")).toHaveCount(2);
  } finally {
    await context.setOffline(false);
  }
});
test("statement and saving settings fit mobile/tablet/desktop and remain accessible in both themes", async ({
  page,
}) => {
  for (const theme of ["light", "dark"]) {
    await page.addInitScript(
      (value) => localStorage.setItem("mytax.theme", value),
      theme,
    );
    for (const width of [390, 768, 1280]) {
      await page.setViewportSize({ width, height: 900 });
      await page.goto("/ledger");
      await page.getByRole("button", { name: "ตั้งค่า", exact: true }).click();
      await expect(page.locator(".settings-save")).toBeVisible();
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
      ).toBe(true);
      await page.locator(".settings-save").focus();
      await page.keyboard.press("Enter");
      expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
      await page.keyboard.press("Escape");
      await page
        .getByRole("button", { name: "นำเข้า Statement", exact: true })
        .click();
      await page.locator('.statement-file input[type="file"]').setInputFiles({
        name: "sample.csv",
        mimeType: "text/csv",
        buffer: Buffer.from(sample()),
      });
      await expect(page.locator(".statement-row")).toHaveCount(2);
      expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
      ).toBe(true);
      await page.screenshot({
        path: `output/playwright/statement-${theme}-${width}.png`,
      });
      await page.keyboard.press("Escape");
    }
  }
});
