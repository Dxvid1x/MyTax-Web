import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
test("button feedback respects pointer, keyboard, disabled steps and reduced motion", async ({
  page,
}) => {
  await page.goto("/tax");
  const action = page.getByRole("button", { name: "รู้ยอดทั้งปี" });
  const restingRadius = await action.evaluate(
    (el) => getComputedStyle(el).borderRadius,
  );
  await action.hover();
  await expect(action).toHaveCSS("translate", "0px -1px");
  await expect(action).toHaveCSS("border-radius", restingRadius);
  const help = page.locator(".salary-slip-help > summary");
  await help.hover();
  expect(
    parseFloat(await help.evaluate((el) => getComputedStyle(el).borderRadius)),
  ).toBeGreaterThan(0);
  await page.mouse.move(0, 0);
  await action.focus();
  await expect(action).toHaveCSS("outline-width", "2px");
  const disabled = page.getByRole("button", { name: /ขั้น 3.*ยังไม่ถึง/ });
  await expect(disabled).toBeDisabled();
  await disabled.hover();
  await expect(disabled).toHaveCSS("translate", "none");
  await page.emulateMedia({ reducedMotion: "reduce" });
  await action.hover();
  await expect(action).toHaveCSS("translate", "none");
  await expect(action).toHaveCSS("transition-duration", "0s");
  await page.goto("/tax/2");
  const tile = page.locator(".deduction-tile > summary").first();
  const cardRadius = await tile.evaluate(
    (el) => getComputedStyle(el.parentElement!).borderRadius,
  );
  await expect(tile).toHaveCSS("border-radius", cardRadius);
  await tile.hover();
  await expect(tile).toHaveCSS("border-radius", cardRadius);
});

test("scope choices have distinct feedback and the scope disclosure stays inset", async ({
  page,
}) => {
  for (const theme of ["light", "dark"]) {
    await page.goto("/tax/3");
    await page.evaluate(
      (theme) => localStorage.setItem("mytax.theme", theme),
      theme,
    );
    await page.reload();
    const group = page.getByRole("group", {
      name: "มีรายได้อื่นหรือรายได้ต่างประเทศ?",
    });
    for (const [answer, name] of [
      ["yes", "มี"],
      ["no", "ไม่มี"],
      ["unknown", "ยังไม่แน่ใจ"],
    ]) {
      const choice = group.getByRole("button", { name, exact: true });
      await choice.hover();
      await page.waitForTimeout(220);
      const colour = await choice.evaluate((el) => getComputedStyle(el).color);
      const [red, green, blue] = colour.match(/\d+/g)!.map(Number);
      if (answer === "yes") expect(green).toBeGreaterThan(Math.max(red, blue));
      if (answer === "no") expect(red).toBeGreaterThan(Math.max(green, blue));
      if (answer === "unknown") {
        expect(red).toBeGreaterThan(green);
        expect(green).toBeGreaterThan(blue);
      }
      await choice.click();
      await page.mouse.move(0, 0);
      await expect(choice).toHaveAttribute("aria-pressed", "true");
      await expect(choice).toHaveCSS("color", colour);
    }
    for (const width of [390, 1280]) {
      await page.setViewportSize({ width, height: 900 });
      const answerBounds = await group.evaluate((el) => {
        const right = el.parentElement!.getBoundingClientRect().right;
        return [...el.querySelectorAll("button")].map(
          (button) => right - button.getBoundingClientRect().right,
        );
      });
      answerBounds.forEach((space) => expect(space).toBeGreaterThanOrEqual(0));
      const inset = await page
        .locator(".scope-detail > summary")
        .evaluate((el) => {
          const parent = el.parentElement!.getBoundingClientRect();
          const range = document.createRange();
          range.selectNodeContents(el);
          const text = range.getBoundingClientRect();
          return {
            left: text.left - parent.left,
            right: parent.right - text.right,
          };
        });
      expect(inset.left).toBeGreaterThanOrEqual(14);
      expect(inset.right).toBeGreaterThanOrEqual(14);
      await page.locator(".scope-detail > summary").click();
      expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
      await page.locator(".scope-detail > summary").click();
    }
  }
});
