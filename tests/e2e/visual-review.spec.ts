import { test, expect } from "@playwright/test";
import { makeSaved, STORAGE_KEY } from "../../src/storage.ts";
import { demoPlan } from "../../src/tax.ts";
import { createTransaction, today } from "../../src/ledger.ts";
for (const theme of ["light", "dark"] as const)
  for (const width of [390, 768, 1280]) {
    test(`layout and Thai headings ${theme} ${width}`, async ({ page }) => {
      test.setTimeout(90000);
      await page.setViewportSize({ width, height: width === 390 ? 844 : 900 });
      await page.goto("/");
      await page.evaluate(
        ({ theme, key, raw }) => {
          localStorage.setItem("mytax.theme", theme);
          localStorage.setItem(key, raw);
        },
        {
          theme,
          key: STORAGE_KEY,
          raw: JSON.stringify(
            makeSaved(
              {
                ...demoPlan(),
                taxYear: "2569",
                scopeAnswers: {
                  otherIncome: false,
                  otherRetirement: false,
                  special: false,
                },
              },
              [
                createTransaction("income", "30000", today(), "เงินเดือน", ""),
                createTransaction("expense", "80", today(), "อาหาร", ""),
              ],
            ),
          ),
        },
      );
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
        "/about",
      ]) {
        await page.goto(path);
        await expect(
          page.locator("main :is(h1,h2):visible").first(),
        ).toBeVisible();
        await page.evaluate(() => document.fonts.ready);
        await expect(page.locator(".site-backdrop")).toHaveCount(1);
        await expect(page.locator(".site-backdrop")).toHaveCSS(
          "pointer-events",
          "none",
        );
        await expect(page.locator(".site-backdrop")).toHaveCSS(
          "position",
          "fixed",
        );
        await expect(page.locator(".site-backdrop :is(img,text)")).toHaveCount(
          0,
        );
        await page.waitForTimeout(path === "/" ? 2800 : 550);
        if (/^\/tax(?:\/[1-3])?$/.test(path))
          await expect(page.locator(".question-panel")).toHaveCSS(
            "opacity",
            "1",
          );
        expect(
          await page.evaluate(() => document.documentElement.scrollWidth),
          `${path} horizontal overflow`,
        ).toBeLessThanOrEqual(width);
        await page.screenshot({
          animations: "disabled",
          path: `output/playwright/ux-${theme}-${width}-${path === "/" ? "home" : path.slice(1).replaceAll("/", "-")}.png`,
          fullPage: path !== "/",
        });
        if (path === "/") {
          const start = page.locator(".opening-calculate");
          await expect(start).toBeInViewport();
          if (width !== 768)
            for (let chapter = 0; chapter < 3; chapter++) {
              await page.evaluate((chapter) => {
                const root = document.querySelector(".scroll-story")!;
                if (root.getAttribute("data-reduced") === "true") {
                  root
                    .querySelector(`#story-scene-${chapter}`)
                    ?.scrollIntoView({ block: "start", behavior: "instant" });
                } else {
                  const offset =
                    document.querySelector(".topbar")!.getBoundingClientRect()
                      .height + 32;
                  const box = root.getBoundingClientRect();
                  window.scrollTo({
                    behavior: "instant",
                    top:
                      scrollY +
                      box.top +
                      (box.height - innerHeight + offset) *
                        [0.18, 0.5, 0.95][chapter] -
                      offset,
                  });
                }
              }, chapter);
              await page.waitForTimeout(1900);
              const heading = page.locator(`#story-scene-${chapter} h3`);
              await expect(heading).toHaveCSS("font-family", /MyTaxBody/);
              await page.screenshot({
                path: `output/playwright/ux-${theme}-${width}-scene-${chapter + 1}.png`,
              });
            }
          await page.locator("#home-start").scrollIntoViewIfNeeded();
          await page.waitForTimeout(2200);
          await page.screenshot({
            path: `output/playwright/ux-${theme}-${width}-closing.png`,
          });
        }
      }
    });
  }
