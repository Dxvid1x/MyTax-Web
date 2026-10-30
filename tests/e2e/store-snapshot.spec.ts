import { test, expect } from "@playwright/test";
import { emptyPlan } from "../../src/tax.ts";
import { makeSaved, STORAGE_KEY } from "../../src/storage.ts";
test("queued backup replacement preserves the latest in-memory draft for recovery", async ({
  page,
}) => {
  await page.goto("/about");
  await page.evaluate(({ key, raw }) => localStorage.setItem(key, raw), {
    key: STORAGE_KEY,
    raw: JSON.stringify(makeSaved(emptyPlan(), [], false)),
  });
  await page.reload();
  await page.evaluate(async () => {
    // Exercise the real store hook, independently of modal UI blocking background edits.
    const React = (await import("/node_modules/.vite/deps/react.js")).default;
    const { createRoot } = (
      await import("/node_modules/.vite/deps/react-dom_client.js")
    ).default;
    const { useLocalStore } = await import("/src/useLocalStore.ts");
    const target = document.createElement("div");
    document.body.append(target);
    const state = globalThis as unknown as {
      snapshotHook: ReturnType<typeof useLocalStore>;
    };
    createRoot(target).render(
      React.createElement(function StoreHarness() {
        state.snapshotHook = useLocalStore();
        return null;
      }),
    );
  });
  await expect
    .poll(() =>
      page.evaluate(
        () =>
          !!(globalThis as unknown as { snapshotHook: unknown }).snapshotHook,
      ),
    )
    .toBe(true);
  const replacement = makeSaved(emptyPlan(), [], false);
  await page.evaluate((replacement) => {
    const state = globalThis as unknown as {
      snapshotHook: {
        importBackup: (data: unknown) => Promise<boolean>;
        setPlan: (data: unknown) => void;
        plan: Record<string, unknown>;
      };
      releaseSnapshotLock?: () => void;
      lockReady?: boolean;
      backupResult?: boolean;
    };
    void navigator.locks.request(
      "mytax.local.v2",
      () =>
        new Promise<void>((resolve) => {
          state.releaseSnapshotLock = resolve;
          state.lockReady = true;
        }),
    );
    state.backupResult = undefined;
    (globalThis as unknown as { replacement: unknown }).replacement =
      replacement;
  }, replacement);
  await expect
    .poll(() =>
      page.evaluate(
        () => (globalThis as unknown as { lockReady: boolean }).lockReady,
      ),
    )
    .toBe(true);
  await page.evaluate(() => {
    const state = globalThis as unknown as {
      snapshotHook: {
        importBackup: (data: unknown) => Promise<boolean>;
        setPlan: (data: unknown) => void;
        plan: Record<string, unknown>;
      };
      replacement: unknown;
      backupResult?: boolean;
    };
    void state.snapshotHook
      .importBackup(state.replacement)
      .then((result) => (state.backupResult = result));
    state.snapshotHook.setPlan({
      ...state.snapshotHook.plan,
      salary: "123456",
    });
  });
  await expect
    .poll(() =>
      page.evaluate(
        () =>
          (
            globalThis as unknown as {
              snapshotHook: { plan: { salary: string } };
            }
          ).snapshotHook.plan.salary,
      ),
    )
    .toBe("123456");
  await page.evaluate(() =>
    (
      globalThis as unknown as { releaseSnapshotLock: () => void }
    ).releaseSnapshotLock(),
  );
  await expect
    .poll(() =>
      page.evaluate(
        () =>
          (globalThis as unknown as { backupResult?: boolean }).backupResult,
      ),
    )
    .toBe(true);
  const recovery = await page.evaluate(() =>
    Object.keys(localStorage)
      .filter((key) => key.startsWith("mytax.recovery."))
      .map((key) => JSON.parse(localStorage.getItem(key)!)),
  );
  expect(recovery.some((data) => data.taxPlan.salary === "123456")).toBe(true);
});
