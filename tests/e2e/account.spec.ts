import { test, expect } from "@playwright/test";
test("intro crossfades into the running hero without a skip button, once per tab; honours Escape and reduced motion", async ({
  page,
}) => {
  await page.goto("/");
  const intro = page.getByRole("dialog", { name: "ภาพเปิด MyTax" });
  await expect(intro).toBeVisible();
  await expect(intro.getByRole("button")).toHaveCount(0);
  await expect(intro).toHaveAttribute("data-phase", "leaving");
  await expect
    .poll(() => intro.evaluate((el) => Number(getComputedStyle(el).opacity)))
    .toBeLessThan(0.95);
  expect(
    await intro.evaluate(
      (el) => getComputedStyle(el, "::backdrop").backgroundColor,
    ),
  ).toBe("rgba(0, 0, 0, 0)");
  expect(
    await page
      .locator(".opening-camera")
      .evaluate((el) => getComputedStyle(el).animationPlayState),
  ).toBe("running");
  await expect(intro).toHaveCount(0);
  await page.reload();
  await expect(intro).toHaveCount(0);
  await page.evaluate(() => sessionStorage.removeItem("mytax.intro.seen"));
  await page.reload();
  await expect(intro).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(intro).toHaveCount(0);
  await page.evaluate(() => sessionStorage.removeItem("mytax.intro.seen"));
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.reload();
  await expect(intro).toHaveCount(0);
  await expect(
    page.getByRole("button", { name: "คำนวณภาษีของฉัน", exact: true }).first(),
  ).toBeVisible();
});
test("intro artwork fills both edges and keeps three bouncing coins clear of the logo across screen sizes", async ({
  page,
}) => {
  // Hold the opening timers while inspecting the same visual frame at each size.
  await page.clock.install();
  await page.clock.pauseAt(new Date(Date.now() + 1000));
  for (const width of [390, 1280, 1920]) {
    await page.setViewportSize({ width, height: 900 });
    for (const colorScheme of ["light", "dark"] as const) {
      await page.emulateMedia({ colorScheme });
      await page.goto("/");
      const intro = page.getByRole("dialog", { name: "ภาพเปิด MyTax" });
      await expect(intro).toBeVisible();
      await expect(intro.locator(".intro-bouncing-coin")).toHaveCount(3);
      await expect(intro.locator(".intro-chart-rise")).toHaveCount(2);
      await expect(intro.locator(".intro-chart-fall")).toHaveCount(2);
      await page.evaluate(async () => {
        await document.fonts.ready;
        for (const animation of document.getAnimations()) {
          if (animation.effect?.getTiming().iterations === Infinity) continue;
          animation.pause();
          animation.currentTime = 1600;
        }
      });
      const layout = await intro.evaluate((el) => {
        const rect = el.getBoundingClientRect();
        const brand = el
          .querySelector(".intro-brand-scene")!
          .getBoundingClientRect();
        const charts = [...el.querySelectorAll(".intro-chart")].map((chart) =>
          chart.getBoundingClientRect(),
        );
        const coins = [...el.querySelectorAll(".intro-bouncing-coin")].map(
          (coin) => coin.getBoundingClientRect(),
        );
        return {
          fullWidth: rect.left === 0 && rect.right === innerWidth,
          edgeCharts: charts[0].left === 0 && charts[1].right === innerWidth,
          noOverflow: document.documentElement.scrollWidth <= innerWidth,
          clearLogo: coins.every(
            (coin) =>
              coin.right <= brand.left ||
              coin.left >= brand.right ||
              coin.bottom <= brand.top ||
              coin.top >= brand.bottom,
          ),
        };
      });
      expect(layout).toEqual({
        fullWidth: true,
        edgeCharts: true,
        noOverflow: true,
        clearLogo: true,
      });
      await expect(intro.locator(".intro-chart-rise").first()).toHaveCSS(
        "stroke",
        "rgb(99, 223, 152)",
      );
      await expect(intro.locator(".intro-chart-fall").first()).toHaveCSS(
        "stroke",
        "rgb(255, 103, 135)",
      );
      await page.screenshot({
        path: `output/playwright/intro-artwork-${colorScheme}-${width}.png`,
      });
      await page.evaluate(() => sessionStorage.removeItem("mytax.intro.seen"));
    }
  }
});
