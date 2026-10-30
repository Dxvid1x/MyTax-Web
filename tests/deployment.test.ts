import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { parseRoute, routePath } from "../src/navigation.ts";
test("Vercel serves every named client route including Plus through the app entry", () => {
  const config = JSON.parse(
    readFileSync(new URL("../vercel.json", import.meta.url), "utf8"),
  );
  for (const path of [
    "/tax",
    "/ledger",
    "/reduce",
    "/tax-law",
    "/demo",
    "/showcase",
    "/about",
    "/money-plan",
  ]) {
    assert.equal(routePath(parseRoute(path)), path);
    assert.ok(
      config.rewrites.some(
        (r: { source: string; destination: string }) =>
          r.source === path && r.destination === "/index.html",
      ),
      path,
    );
  }
  assert.equal(config.framework, "vite");
  assert.equal(config.outputDirectory, "dist");
});
