export type View =
  | "home"
  | "tax"
  | "ledger"
  | "demo"
  | "money-plan"
  | "showcase"
  | "reduce"
  | "about"
  | "tax-law";
export type Route = { view: View; step: number };
export function parseRoute(pathname: string, hash = ""): Route {
  // Preserve bookmarks from the original hash router; other anchors are not routes.
  const legacy =
    /^#(?:home|tax|ledger|demo|showcase|reduce|about|tax-law)(?:\/.*)?$/.test(
      hash,
    );
  const source = legacy ? hash.slice(1) : pathname;
  const [name, step, extra] = source
    .replace(/^\//, "")
    .replace(/\/$/, "")
    .split("/");
  const view: View =
    [
      "home",
      "tax",
      "ledger",
      "demo",
      "showcase",
      "money-plan",
      "reduce",
      "about",
      "tax-law",
    ].includes(name) &&
    extra === undefined &&
    (name === "tax" || step === undefined)
      ? (name as View)
      : "home";
  return {
    view,
    step: view === "tax" && /^[1-4]$/.test(step || "") ? Number(step) : 1,
  };
}
export function routePath(route: Route): string {
  if (route.view === "home") return "/";
  return (
    "/" +
    route.view +
    (route.view === "tax" && route.step > 1 ? "/" + route.step : "")
  );
}
