import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test("mascot responds to touch and keyboard and respects reduced motion", async ({
  page,
}) => {
  await page.goto("/about");
  const mascot = page.getByRole("button", {
    name: "ทักทายหนู MyTax",
    exact: true,
  });
  await mascot.click();
  await expect(mascot.locator(".trust-mascot-sprite")).toHaveAttribute(
    "data-happy",
    "true",
  );
  await expect(page.getByRole("status")).toContainText(
    "เย้! มาเรียนรู้ด้วยกันนะ",
  );
  await mascot.focus();
  await page.keyboard.press("Enter");
  await expect(page.getByRole("status")).toContainText(
    "อิอิ… ได้กลิ่นเงินออมแล้ว!",
  );
  await page.keyboard.press("Space");
  await expect(mascot.locator(".trust-mascot-sprite")).toHaveAttribute(
    "data-happy",
    "true",
  );
  await expect(page.getByRole("status")).toContainText(
    "แปะมือหน่อย! พร้อมช่วยเสมอ",
  );
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.setViewportSize({ width: 390, height: 844 });
  await mascot.click();
  await expect(page.getByRole("status")).toContainText(
    "อิอิ… ได้กลิ่นเงินออมแล้ว!",
  );
  await expect(mascot.locator(".trust-mascot-sprite")).toHaveAttribute(
    "data-money",
    "true",
  );
  expect(
    await mascot
      .locator(".trust-mascot-sprite")
      .evaluate(
        (el) =>
          el
            .getAnimations()
            .filter((animation) => animation.playState === "running").length,
      ),
  ).toBe(0);
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  await page.screenshot({
    path: "output/about-mascot-money-reaction.png",
    fullPage: true,
  });
  await expect(mascot.locator(".trust-mascot-sprite")).toHaveAttribute(
    "data-money",
    "false",
  );
});

test("about shows six topics and reveals only one section at a time", async ({
  page,
}) => {
  await page.goto("/about");
  const sections = page.locator(".trust-section-toggle");
  await expect(sections).toHaveCount(6);
  await expect(
    page.locator('.trust-section-toggle[aria-expanded="true"]'),
  ).toHaveCount(0);
  await page.getByRole("button", { name: "รู้จัก MyTax", exact: true }).click();
  await expect(
    page.getByRole("button", { name: "ขอบเขตการคำนวณ", exact: true }),
  ).toBeFocused();
  await page
    .getByRole("button", { name: "ขอบเขตการคำนวณ", exact: true })
    .click();
  await expect(
    page.getByText("ไม่ใช่เว็บไซต์ของกรมสรรพากร", { exact: true }),
  ).toBeVisible();
  const scope = page.getByRole("button", {
    name: "ขอบเขตการคำนวณ",
    exact: true,
  });
  await scope.focus();
  await page.keyboard.press("Enter");
  await expect(scope).toHaveAttribute("aria-expanded", "true");
  await expect(
    page.getByText("กรณีที่ยังไม่รองรับ", { exact: true }),
  ).toBeVisible();
  const sources = page.getByRole("button", {
    name: "กฎและแหล่งอ้างอิง",
    exact: true,
  });
  await sources.click();
  await expect(scope).toHaveAttribute("aria-expanded", "false");
  await expect(page.locator("#trust-panel-scope")).toHaveAttribute("inert", "");
  await expect(page.getByTestId("trust-rule-version")).toBeVisible();
  await sources.focus();
  await page.keyboard.press("Space");
  await expect(sources).toHaveAttribute("aria-expanded", "false");
  await expect(sources).toBeFocused();
  await expect(
    page.locator('.trust-section-toggle[aria-expanded="true"]'),
  ).toHaveCount(0);
});

test("sources and data controls remain useful without changing the plan", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  await page
    .getByRole("button", { name: "ดูวิธีคำนวณและขอบเขต", exact: true })
    .click();
  await expect(page).toHaveURL(/\/about$/);
  await expect(page.locator(".about-page")).not.toContainText("TODO");
  await page
    .getByRole("button", { name: "กฎและแหล่งอ้างอิง", exact: true })
    .click();
  await page.getByRole("button", { name: "2568 / 2025", exact: true }).click();
  await expect(page.getByTestId("trust-rule-version")).toContainText(
    "2568-expanded-2.0",
  );
  await expect(page.locator(".trust-sources a").first()).toHaveAttribute(
    "href",
    /Ins91_241268\.pdf$/,
  );
  await expect(
    page.getByText("ยังไม่มีการเผยแพร่ผลตรวจโดยผู้เชี่ยวชาญอิสระ", {
      exact: true,
    }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "ข้อมูลอยู่ที่ไหน?", exact: true })
    .click();
  await page
    .getByRole("button", { name: "จัดการข้อมูล", exact: true })
    .first()
    .click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await page.keyboard.press("Escape");
  await page
    .getByRole("button", { name: "ผู้จัดทำและการติดต่อ", exact: true })
    .click();
  await expect(page.getByText("ทีมพัฒนา MyTax", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: "คำนวณภาษี", exact: true }).click();
  await expect(
    page.getByRole("button", { name: /2569 \/ 2026 วางแผนปีนี้/ }),
  ).toHaveAttribute("aria-pressed", "true");
});

for (const theme of ["light", "dark"])
  test(`compact about is accessible with closed and open panels: ${theme}`, async ({
    page,
  }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.setViewportSize({ width: 390, height: 844 });
    await page.addInitScript(
      (theme) => localStorage.setItem("mytax.theme", theme),
      theme,
    );
    await page.goto("/about");
    await expect(page.locator(".trust-section-toggle")).toHaveCount(6);
    await expect(
      page.getByRole("img", { name: "มาสคอตหนู MyTax ถือสมุดและทักทาย" }),
    ).toBeVisible();
    await page.screenshot({
      path: `output/about-compact-${theme}-mobile.png`,
      fullPage: true,
    });
    const scan = async () =>
      expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
    await scan();
    for (const label of [
      "วิธีคำนวณและตัวอย่าง",
      "กฎและแหล่งอ้างอิง",
      "คำถามที่พบบ่อย",
    ]) {
      await page.getByRole("button", { name: label, exact: true }).click();
      if (label === "คำถามที่พบบ่อย")
        await page.getByText("ใช้กับฟรีแลนซ์ได้ไหม?", { exact: true }).click();
      await scan();
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
      ).toBe(true);
    }
    await page
      .getByRole("button", { name: "คำถามที่พบบ่อย", exact: true })
      .click();
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.screenshot({
      path: `output/about-compact-${theme}-desktop.png`,
    });
  });
