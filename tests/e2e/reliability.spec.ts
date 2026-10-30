import { test, expect, type Page } from "@playwright/test";
import { readFile } from "node:fs/promises";
import { makeSaved, STORAGE_KEY } from "../../src/storage.ts";
import { demoPlan } from "../../src/tax.ts";
import { createTransaction, today } from "../../src/ledger.ts";

function fixture(year: "2568" | "2569" = "2568") {
  return makeSaved(
    {
      ...demoPlan(),
      taxYear: year,
      social: year === "2569" ? "10500" : "9000",
    },
    [createTransaction("expense", "1234.50", today(), "อาหาร", "E2E original")],
  );
}
async function seed(page: Page, data: unknown, path = "/ledger") {
  await page.goto("/");
  await page.evaluate(({ key, raw }) => localStorage.setItem(key, raw), {
    key: STORAGE_KEY,
    raw: typeof data === "string" ? data : JSON.stringify(data),
  });
  await page.reload();
  await page.goto(path);
}
async function manage(page: Page) {
  await page.locator(".save-status").click();
  await expect(page.getByRole("dialog")).toBeVisible();
}
async function backup(page: Page) {
  await manage(page);
  const downloaded = page.waitForEvent("download");
  await page
    .getByRole("button", { name: "สำรองข้อมูลในเครื่อง (JSON)" })
    .click();
  const file = await downloaded;
  return {
    data: JSON.parse(await readFile((await file.path())!, "utf8")),
    file,
  };
}
test("empty result route redirects, skip link keeps route and wizard supports Back/Forward", async ({
  page,
}) => {
  await page.goto("/tax/4");
  await expect(page).toHaveURL(/\/tax$/);
  await expect(
    page
      .getByRole("group", { name: "ใช้รายได้ปีไหน?" })
      .getByRole("button", { name: "2569 / 2026 วางแผนปีนี้" }),
  ).toHaveAttribute("aria-pressed", "true");
  await page.getByRole("link", { name: "ข้ามไปเนื้อหา" }).focus();
  await page.keyboard.press("Enter");
  await expect(page.locator("main")).toBeFocused();
  await expect(page).toHaveURL(/\/tax$/);
  await page.locator("#monthly").fill("50,000");
  await expect(page.locator("#scope")).toHaveCount(0);
  await page.getByRole("button", { name: "ต่อไป", exact: true }).click();
  await expect(page).toHaveURL(/\/tax\/2$/);
  await page.goBack();
  await expect(page).toHaveURL(/\/tax$/);
  await page.goForward();
  await expect(page).toHaveURL(/\/tax\/2$/);
  await expect(
    page.getByRole("heading", { name: "มีอะไรช่วยลดภาษีบ้าง?" }),
  ).toBeFocused();
});
test("every clean route opens and reloads, and old bookmarks migrate without losing saved data", async ({
  page,
}) => {
  test.setTimeout(60000);
  await page.emulateMedia({ reducedMotion: "reduce" });
  await seed(page, fixture());
  const origin = new URL(page.url()).origin;
  for (const path of [
    "/",
    "/tax",
    "/tax/2",
    "/tax/3",
    "/tax/4",
    "/ledger",
    "/reduce",
    "/tax-law",
    "/demo",
  ]) {
    await page.goto(path);
    await expect(page).toHaveURL(origin + path);
    await expect(page.locator("main :is(h1,h2):visible").first()).toBeVisible();
    await page.reload();
    await expect(page).toHaveURL(origin + path);
    await expect(page.locator("main :is(h1,h2):visible").first()).toBeVisible();
  }
  for (const legacy of [
    "home",
    "tax",
    "tax/1",
    "tax/2",
    "tax/3",
    "tax/4",
    "ledger",
    "reduce",
    "tax-law",
    "demo",
  ]) {
    const path =
      legacy === "home" ? "/" : legacy === "tax/1" ? "/tax" : "/" + legacy;
    await page.goto("/#" + legacy);
    await expect(page).toHaveURL(origin + path);
    await expect(page.locator("main :is(h1,h2):visible").first()).toBeVisible();
  }
  await page.goto("/home?from=bookmark");
  await expect(page).toHaveURL(origin + "/?from=bookmark");
  await page
    .getByRole("button", { name: "สมุดเงิน", exact: true })
    .first()
    .click();
  await expect(page).toHaveURL(origin + "/ledger?from=bookmark");
  await expect(page.locator(".transaction-amount")).toHaveText("−1,234.50");
  await page.goBack();
  await expect(page).toHaveURL(origin + "/?from=bookmark");
  await page.goForward();
  await expect(page).toHaveURL(origin + "/ledger?from=bookmark");
});

test("monthly view and blur preserve annual satang; comma and pending decimal entry work", async ({
  page,
}) => {
  await seed(page, fixture(), "/tax");
  await page.locator("#salary").fill("600,000.01");
  await page.locator("#bonus").fill("60,000.");
  await page.getByRole("button", { name: "รู้เงินเดือนต่อเดือน" }).click();
  await page.locator("#monthly").focus();
  await page.locator("#bonus").focus();
  await page.getByRole("button", { name: "รู้ยอดทั้งปี" }).click();
  await expect(page.locator("#salary")).toHaveValue("600,000.01");
  const { data } = await backup(page);
  expect(data.taxPlan.salary).toBe("600000.01");
  expect(data.taxPlan.bonus).toBe("60000");
});
test("hidden eligibility error reveals and focuses checkbox; 2568 result matches independent fixture", async ({
  page,
}) => {
  const saved = fixture();
  saved.taxPlan.lifeEligible = false;
  await seed(page, saved, "/tax/2");
  await page.getByRole("button", { name: "ต่อไป", exact: true }).click();
  await expect(page.locator("#lifeEligible")).toBeVisible();
  await expect(page.locator("#lifeEligible")).toBeFocused();
  await page.locator("#lifeEligible").check();
  await page.getByRole("button", { name: "ต่อไป", exact: true }).click();
  await page.getByRole("button", { name: "ดูผลของฉัน" }).click();
  await expect(page.locator("#tax-result-heading")).toBeFocused();
  await expect(page.locator(".result-summary")).toContainText("20,100");
  await expect(page.locator(".result-summary")).toContainText("11,900");
});
test("2569 planning uses selected rules and actual social contribution", async ({
  page,
}) => {
  await seed(page, fixture("2569"), "/tax/4");
  await expect(page.locator(".result-summary")).toContainText("19,950");
  await expect(page.locator(".result-summary")).toContainText("12,050");
  await expect(page.locator(".result-year")).toContainText("2569");
  await page.evaluate(() => document.fonts.ready);
  await page.screenshot({
    path: "output/playwright/tax-2569.png",
    fullPage: true,
  });
});
test("ledger edits preserve satang, CSV downloads, delete requires confirmation", async ({
  page,
}) => {
  await seed(page, fixture());
  await expect(page.locator(".transaction-amount")).toHaveText("−1,234.50");
  await page.getByRole("button", { name: /^แก้รายการ/ }).click();
  await page.locator("#transaction-amount").fill("2,345.67");
  await page.getByRole("button", { name: "บันทึกการแก้ไข" }).click();
  await expect(page.locator(".transaction-amount")).toHaveText("−2,345.67");
  const downloading = page.waitForEvent("download");
  await page
    .getByRole("button", { name: "ดาวน์โหลดตาราง (CSV)", exact: true })
    .click();
  const csv = await readFile((await (await downloading).path())!, "utf8");
  expect(csv).toContain(today());
  expect(csv).toContain("2345.67");
  expect(csv).toContain("วันที่ (ค.ศ. YYYY-MM-DD)");
  await page.getByRole("button", { name: /^ลบรายการ/ }).click();
  await expect(page.locator(".transaction")).toHaveCount(1);
  await page.getByRole("button", { name: "ยืนยันลบรายการ" }).click();
  await expect(page.locator(".transaction")).toHaveCount(0);
});
test("manage is harmless, pause retains saved ledger on reload", async ({
  page,
}) => {
  await seed(page, fixture());
  const initial = await page.evaluate(
    (key) => localStorage.getItem(key),
    STORAGE_KEY,
  );
  await manage(page);
  expect(
    await page.evaluate((key) => localStorage.getItem(key), STORAGE_KEY),
  ).toBe(initial);
  await page
    .getByRole("button", { name: "พักการบันทึกอัตโนมัติ", exact: true })
    .click();
  await page.getByRole("button", { name: "ยืนยันพักการบันทึก" }).click();
  await page.reload();
  await expect(page.locator(".transaction-amount")).toHaveText("−1,234.50");
  await expect(
    page.getByRole("button", { name: "เปิดบันทึก", exact: true }),
  ).toBeVisible();
});
test("JSON download round trip restores exact data; malformed import leaves ledger intact", async ({
  page,
}) => {
  await seed(page, fixture("2569"));
  const { data, file } = await backup(page);
  expect(data.schemaVersion).toBe(4);
  expect(data.transactions[0].amount).toBe(123450);
  await page.locator("input[type=file]").setInputFiles({
    name: "bad.json",
    mimeType: "application/json",
    buffer: Buffer.from("{broken"),
  });
  await expect(
    page.getByRole("dialog").getByRole("alert").first(),
  ).toBeVisible();
  await expect(page.locator(".transaction")).toHaveCount(1);
  await page.locator("input[type=file]").setInputFiles((await file.path())!);
  await expect(
    page.getByRole("heading", { name: "นำเข้าข้อมูลสำรอง?" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "ยืนยันนำเข้า" }).click();
  await expect(page.locator(".transaction-amount")).toHaveText("−1,234.50");
  await expect
    .poll(
      async () =>
        JSON.parse(
          (await page.evaluate(
            (key) => localStorage.getItem(key),
            STORAGE_KEY,
          ))!,
        ).taxPlan.taxYear,
    )
    .toBe("2569");
});
test("rule change and damaged row recover ledger without automatic overwrite, keeping original backup", async ({
  page,
}) => {
  const saved = fixture();
  const original = JSON.stringify({
    ...saved,
    ruleVersion: "old-rules",
    transactions: [
      ...saved.transactions,
      { ...saved.transactions[0], id: "broken", amount: -1 },
    ],
  });
  await seed(page, original);
  await expect(page.locator(".transaction")).toHaveCount(1);
  await expect(
    page.getByRole("button", { name: "ดาวน์โหลดต้นฉบับ" }),
  ).toBeVisible();
  expect(
    await page.evaluate((key) => localStorage.getItem(key), STORAGE_KEY),
  ).toBe(original);
  await page.getByRole("button", { name: "ตรวจแล้ว เปิดบันทึก" }).click();
  await page.getByRole("button", { name: "ยืนยันเปิดบันทึก" }).click();
  const state = await page.evaluate(
    (key) => ({
      saved: JSON.parse(localStorage.getItem(key)!),
      copies: Object.keys(localStorage)
        .filter((k) => k.startsWith("mytax.recovery."))
        .map((k) => localStorage.getItem(k)),
    }),
    STORAGE_KEY,
  );
  expect(state.saved.taxPlan.scope).toBe(false);
  expect(state.saved.transactions).toHaveLength(1);
  expect(state.copies).toContain(original);
});
test("unknown schema is kept untouched and available for download", async ({
  page,
}) => {
  const original = JSON.stringify({ ...fixture(), schemaVersion: 99 });
  await seed(page, original);
  await expect(
    page.getByRole("button", { name: "ดาวน์โหลดต้นฉบับ" }),
  ).toBeVisible();
  expect(
    await page.evaluate((key) => localStorage.getItem(key), STORAGE_KEY),
  ).toBe(original);
});
test("two tabs pause stale writes, preserve local copy and reload newest data", async ({
  page,
  context,
}) => {
  await seed(page, fixture(), "/tax");
  const other = await context.newPage();
  await other.goto("/tax");
  await page.locator("#bonus").fill("62,000");
  await expect
    .poll(
      async () =>
        JSON.parse(
          (await page.evaluate(
            (key) => localStorage.getItem(key),
            STORAGE_KEY,
          ))!,
        ).taxPlan.bonus,
    )
    .toBe("62000");
  await expect(
    other.getByRole("button", { name: "โหลดข้อมูลล่าสุด", exact: true }),
  ).toBeVisible();
  await other.locator("#bonus").fill("63,000");
  await expect
    .poll(
      async () =>
        JSON.parse(
          (await page.evaluate(
            (key) => localStorage.getItem(key),
            STORAGE_KEY,
          ))!,
        ).taxPlan.bonus,
    )
    .toBe("62000");
  await other
    .getByRole("button", { name: "โหลดข้อมูลล่าสุด", exact: true })
    .click();
  await other
    .getByRole("dialog")
    .getByRole("button", { name: "โหลดข้อมูลล่าสุด", exact: true })
    .click();
  await expect(other.locator("#bonus")).toHaveValue("62,000");
  const copies = await other.evaluate(() =>
    Object.keys(localStorage)
      .filter((k) => k.startsWith("mytax.recovery."))
      .map((k) => JSON.parse(localStorage.getItem(k)!)),
  );
  expect(copies.some((c) => c.taxPlan.bonus === "63000")).toBe(true);
});
test("mobile ledger and data dialogs fit screen; app makes no external network calls", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  const external: string[] = [];
  page.on("request", (r) => {
    if (
      r.url().startsWith("http") &&
      !r.url().startsWith("http://127.0.0.1:5174")
    )
      external.push(r.url());
  });
  await seed(page, fixture("2569"));
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  await manage(page);
  const box = await page.getByRole("dialog").boundingBox();
  expect(box!.x).toBeGreaterThanOrEqual(0);
  expect(box!.x + box!.width).toBeLessThanOrEqual(390);
  await page.keyboard.press("Escape");
  await page
    .getByRole("navigation", { name: "เมนูหลัก" })
    .getByRole("button", { name: "วางแผนภาษี", exact: true })
    .click();
  await expect(page).toHaveURL(/\/reduce$/);
  await expect(page.locator("main h1")).toBeVisible();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  expect(external).toEqual([]);
  await page.screenshot({
    path: "output/playwright/mobile-reduce.png",
    fullPage: true,
  });
});

test("reload from another tab resets the withholding choice and focused draft", async ({
  page,
  context,
}) => {
  await seed(page, fixture(), "/tax/3");
  const other = await context.newPage();
  await other.goto("/tax/3");
  await page.getByRole("button", { name: "ยังไม่รู้ยอด", exact: true }).click();
  await expect
    .poll(
      async () =>
        JSON.parse(
          (await page.evaluate(
            (key) => localStorage.getItem(key),
            STORAGE_KEY,
          ))!,
        ).taxPlan.withholding,
    )
    .toBe("");
  await other.locator("#withholding").focus();
  await other
    .getByRole("button", { name: "โหลดข้อมูลล่าสุด", exact: true })
    .click();
  await other
    .getByRole("dialog")
    .getByRole("button", { name: "โหลดข้อมูลล่าสุด", exact: true })
    .click();
  await expect(
    other.getByRole("button", { name: "ยังไม่รู้ยอด", exact: true }),
  ).toHaveAttribute("aria-pressed", "true");
  await expect(other.locator("#withholding")).toHaveCount(0);
  await other.getByRole("button", { name: "ดูผลของฉัน" }).click();
  await expect(other.locator(".unknown-balance")).toHaveText("รอเช็กยอด");
});
test("first ledger entry offers saving and warns before unsaved reload", async ({
  page,
}) => {
  await page.goto("/ledger");
  await page
    .getByRole("button", { name: /จดเงินออก/ })
    .first()
    .click();
  await page.locator("#transaction-amount").fill("88.50");
  await page.getByRole("button", { name: "เพิ่มรายการ", exact: true }).click();
  await expect(
    page.getByRole("button", { name: "เปิดบันทึก", exact: true }),
  ).toBeVisible();
  const warning = page.waitForEvent("dialog");
  const reload = page.reload({ timeout: 1500 }).catch(() => undefined);
  const dialog = await warning;
  expect(dialog.type()).toBe("beforeunload");
  await dialog.dismiss();
  await reload;
  await expect(page.locator(".transaction-amount")).toHaveText("−88.50");
  await page.getByRole("button", { name: "เปิดบันทึก", exact: true }).click();
  await page.getByRole("button", { name: "ยืนยันเปิดบันทึก" }).click();
  await page.reload();
  await expect(page.locator(".transaction-amount")).toHaveText("−88.50");
});
test("direct home and result routes load their own styles before visiting guide", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  await expect(page.locator(".story-pin")).toHaveCSS("position", "relative");
  await expect(page.locator(".scroll-story")).toHaveAttribute(
    "data-reduced",
    "true",
  );
  await expect(page.locator(".demo-studio")).toHaveCount(0);
  await seed(page, fixture(), "/tax/4");
  await expect(page.locator(".result-summary")).toHaveCSS(
    "border-top-width",
    "1px",
  );
  await expect(page.locator(".result-amount")).toHaveCSS("display", "flex");
});

test("result shows one answer for paid, refund, settled and unknown; details print without changing disclosure state", async ({
  page,
}) => {
  for (const [withholding, kind, amount, headline] of [
    ["0", "payable", "20,100", "คุณต้องจ่ายภาษีเพิ่มโดยประมาณ"],
    ["32000", "refund", "11,900", "คุณอาจขอคืนภาษีได้ประมาณ"],
    ["20100", "settled", "0", "ไม่มีภาษีต้องจ่ายเพิ่ม"],
    ["", "unknown", "20,100", "ภาษีทั้งปีโดยประมาณ"],
  ]) {
    await seed(page, makeSaved({ ...demoPlan(), withholding }, []), "/tax/4");
    await expect(page.locator(".result-summary")).toHaveAttribute(
      "data-kind",
      kind,
    );
    await expect(page.locator(".result-amount strong")).toHaveText(amount);
    await expect(page.locator("#result-answer")).toHaveText(headline);
    if (kind === "unknown") {
      await expect(page.locator(".result-mascot")).toHaveCount(0);
    } else {
      await expect(page.locator(".result-mascot")).toHaveAttribute(
        "data-mood",
        kind === "payable" ? "collect" : "celebrate",
      );
      await expect(page.locator(".result-mascot-bubble strong")).toHaveText(
        kind === "payable" ? "บิดตามถึงบ้านนะ" : "รอดไปนะ",
      );
      await expect(page.locator(".result-mascot img")).toHaveJSProperty(
        "naturalWidth",
        480,
      );
      const valueBox = (await page.locator(".result-value").boundingBox())!;
      const mascotBox = (await page.locator(".result-mascot").boundingBox())!;
      expect(mascotBox.y).toBeGreaterThanOrEqual(valueBox.y + valueBox.height);
    }
    expect(
      await page
        .locator(".result-amount strong")
        .evaluate((el) => getComputedStyle(el).color),
    ).toBe(
      await page.locator(".result-summary").evaluate((el, kind) => {
        const swatch = document.createElement("i");
        swatch.style.color = `var(${kind === "refund" ? "--positive" : "--negative"})`;
        el.append(swatch);
        const color = getComputedStyle(swatch).color;
        swatch.remove();
        return color;
      }, kind),
    );
    await expect(page.locator(".result-details")).not.toHaveAttribute("open");
    await expect(page.locator(".tax-picture")).not.toBeVisible();
    if (kind === "unknown") {
      await expect(page.locator(".result-equation")).toHaveCount(0);
      await page.getByRole("button", { name: "ใส่ยอดที่จ่ายไว้" }).click();
      await expect(page).toHaveURL(/\/tax\/3$/);
    } else {
      await expect(page.locator(".result-equation")).toContainText("20,100");
    }
  }
  await seed(page, fixture(), "/tax/4");
  const original = await page.evaluate(
    (key) => localStorage.getItem(key),
    STORAGE_KEY,
  );
  await page.locator(".result-details > summary").focus();
  await page.keyboard.press("Enter");
  await expect(page.locator(".result-details")).toHaveAttribute("open");
  const before = await page
    .locator(".results details")
    .evaluateAll((items) =>
      items.map((item) => (item as HTMLDetailsElement).open),
    );
  await page.evaluate(() => window.dispatchEvent(new Event("beforeprint")));
  expect(
    await page
      .locator(".results details")
      .evaluateAll((items) =>
        items.every((item) => (item as HTMLDetailsElement).open),
      ),
  ).toBe(true);
  await page.evaluate(() => window.dispatchEvent(new Event("afterprint")));
  expect(
    await page
      .locator(".results details")
      .evaluateAll((items) =>
        items.map((item) => (item as HTMLDetailsElement).open),
      ),
  ).toEqual(before);
  expect(
    await page.evaluate((key) => localStorage.getItem(key), STORAGE_KEY),
  ).toBe(original);
  await page
    .locator(".result-actions")
    .getByRole("button", { name: "วางแผนภาษี", exact: true })
    .click();
  await expect(page).toHaveURL(/\/reduce$/);
});
