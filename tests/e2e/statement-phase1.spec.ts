import { test, expect } from "@playwright/test";
import { PDFDocument, StandardFonts } from "pdf-lib";
import { readFileSync } from "node:fs";
import AxeBuilder from "@axe-core/playwright";
async function pdfFixture() {
  const pdf = await PDFDocument.create();
  const font = await pdf.embedFont(StandardFonts.Helvetica);
  for (let i = 0; i < 2; i++) {
    const page = pdf.addPage([600, 800]);
    const line = (y: number, cells: string[]) =>
      cells.forEach((text, index) => {
        if (text)
          page.drawText(text, {
            x: [20, 140, 300, 400, 500][index],
            y,
            size: 10,
            font,
          });
      });
    line(750, ["Date", "Description", "Credit", "Debit", "Balance"]);
    line(
      720,
      i === 0
        ? ["2026-01-10", "Salary", "1000.50", "", "2000"]
        : ["2026-01-11", "Food", "", "80.25", "1919.75"],
    );
  }
  return Buffer.from(await pdf.save());
}
test("production PDF worker imports a multi-page table, works offline, and locks exact-file reimport", async ({
  page,
  context,
}) => {
  const policy = JSON.parse(
    readFileSync(new URL("../../vercel.json", import.meta.url), "utf8"),
  ).headers[0].headers.find(
    (entry: { key: string }) => entry.key === "Content-Security-Policy",
  ).value;
  await context.route("http://127.0.0.1:5175/**", async (route) => {
    const response = await route.fetch();
    await route.fulfill({
      response,
      headers: { ...response.headers(), "Content-Security-Policy": policy },
    });
  });
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  const calls: string[] = [];
  page.on("request", (request) => {
    if (
      request.method() !== "GET" ||
      !request.url().startsWith("http://127.0.0.1:5175")
    )
      calls.push(request.url());
  });
  const initial = await page.goto("http://127.0.0.1:5175/ledger");
  expect(initial!.headers()["content-security-policy"]).toBe(policy);
  await page.evaluate(async () => {
    await navigator.serviceWorker.ready;
  });
  await page.reload();
  await context.setOffline(true);
  await page
    .getByRole("button", { name: "นำเข้า Statement", exact: true })
    .click();
  const data = await pdfFixture();
  await page.getByLabel("ไฟล์ Statement").setInputFiles({
    name: "synthetic.pdf",
    mimeType: "application/pdf",
    buffer: data,
  });
  await expect(page.locator(".statement-row")).toHaveCount(2);
  await expect(page.locator(".statement-income")).toContainText("1,000.5");
  await page.locator(".statement-rows").scrollIntoViewIfNeeded();
  await page.screenshot({ path: "output/playwright/phase1-pdf-desktop.png" });
  await page
    .getByLabel("ตรวจวันที่ เงินเข้า และเงินออกกับไฟล์ต้นฉบับแล้ว")
    .check();
  await page.getByRole("button", { name: "ยืนยันนำเข้า 2 รายการ" }).click();
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await page
    .getByRole("button", { name: "นำเข้า Statement", exact: true })
    .click();
  await page.getByLabel("ไฟล์ Statement").setInputFiles({
    name: "renamed.pdf",
    mimeType: "application/pdf",
    buffer: data,
  });
  await expect(page.locator(".statement-row")).toHaveCount(2);
  await expect(page.getByLabel("นำเข้าแถว 2")).toBeDisabled();
  await expect(page.getByLabel("นำเข้าแถว 3")).toBeDisabled();
  expect(errors).toEqual([]);
  expect(calls).toEqual([]);
});
test("row correction and saved receipt backup survive reload without changing tax", async ({
  page,
}) => {
  await page.setViewportSize({ width: 375, height: 844 });
  await page.goto("/ledger");
  await page.getByRole("button", { name: "ตั้งค่า", exact: true }).click();
  await page.locator(".settings-save").click();
  await page
    .getByRole("button", { name: "เปิดบันทึกในเครื่อง", exact: true })
    .click();
  await page.getByRole("button", { name: "ยืนยันเปิดบันทึก" }).click();
  const data = Buffer.from(
    "วันที่,รายละเอียด,เงินเข้า,เงินออก\n31/02/2569,bad,,1.234\n10/01/2569,valid,,80.25",
  );
  await page
    .getByRole("button", { name: "นำเข้า Statement", exact: true })
    .click();
  await page
    .getByLabel("ไฟล์ Statement")
    .setInputFiles({ name: "fix.csv", mimeType: "text/csv", buffer: data });
  await expect(page.locator(".statement-row")).toHaveCount(2);
  await page.getByRole("button", { name: "แก้รายการแถว 2" }).click();
  const editBox = await page
    .getByLabel("วันที่แถว 2", { exact: true })
    .boundingBox();
  expect(editBox!.width).toBeGreaterThanOrEqual(150);
  expect(editBox!.height).toBeGreaterThanOrEqual(44);
  await page.locator(".statement-edit").scrollIntoViewIfNeeded();
  await page.screenshot({
    path: "output/playwright/phase1-row-editor-375.png",
  });
  await page.getByLabel("วันที่แถว 2", { exact: true }).fill("2026-01-10");
  await page.getByLabel("จำนวนเงิน (บาท)แถว 2", { exact: true }).fill("25.50");
  await page.getByRole("button", { name: "เสร็จสิ้นการแก้รายการ" }).click();
  await expect(page.locator(".statement-expense")).toContainText("105.75");
  await page
    .getByLabel("ตรวจวันที่ เงินเข้า และเงินออกกับไฟล์ต้นฉบับแล้ว")
    .check();
  await page.getByRole("button", { name: "ยืนยันนำเข้า 2 รายการ" }).click();
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await page.reload();
  const saved = await page.evaluate(() =>
    JSON.parse(localStorage.getItem("mytax.local.v2")!),
  );
  expect(saved.statementImports.receipts).toHaveLength(1);
  expect(saved.transactions).toHaveLength(2);
  expect(saved.taxPlan.salary).toBe("");
  await page
    .getByRole("button", { name: "นำเข้า Statement", exact: true })
    .click();
  await page
    .getByLabel("ไฟล์ Statement")
    .setInputFiles({ name: "fix.csv", mimeType: "text/csv", buffer: data });
  await expect(page.locator(".statement-row")).toHaveCount(2);
  await expect(page.getByLabel("นำเข้าแถว 2")).toBeDisabled();
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
  expect(
    await page.evaluate(() => document.documentElement.scrollWidth),
  ).toBeLessThanOrEqual(375);
  await page.screenshot({
    path: "output/playwright/phase1-corrected-repeat-375.png",
  });
});
