export type Theme = "system" | "light" | "dark";

export function readTheme(): Theme {
  try {
    const saved = localStorage.getItem("mytax.theme");
    return saved === "dark" || saved === "light" ? saved : "system";
  } catch {
    return "system";
  }
}

export function applyTheme(theme: Theme) {
  const dark =
    theme === "dark" ||
    (theme === "system" && matchMedia("(prefers-color-scheme: dark)").matches);
  document.documentElement.dataset.theme = dark ? "dark" : "light";
  document.documentElement.style.colorScheme = dark ? "dark" : "light";
}
