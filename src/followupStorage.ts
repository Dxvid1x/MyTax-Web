export const FOLLOWUP_KEY = "mytax.followup.v1";
export type FollowupReview = { date: string; available: number; note: string };
export type FollowupDraft = {
  version: 1;
  month: string;
  values: string[];
  reviews: FollowupReview[];
  savedAt: string;
};
export function parseFollowup(raw: string | null): FollowupDraft | null {
  if (!raw || raw.length > 50000) return null;
  try {
    const d = JSON.parse(raw);
    if (
      d?.version !== 1 ||
      !/^\d{4}-(0[1-9]|1[0-2])$/.test(d.month) ||
      !Array.isArray(d.values) ||
      d.values.length !== 7 ||
      !d.values.every(
        (v: unknown) =>
          typeof v === "string" && /^\d{1,9}(\.\d{1,2})?$/.test(v),
      ) ||
      !Number.isInteger(Number(d.values[6])) ||
      Number(d.values[6]) < 1 ||
      Number(d.values[6]) > 31 ||
      !Array.isArray(d.reviews) ||
      d.reviews.length > 12 ||
      typeof d.savedAt !== "string" ||
      !Number.isFinite(Date.parse(d.savedAt))
    )
      return null;
    const reviews: FollowupReview[] = [];
    for (const r of d.reviews) {
      if (
        !r ||
        typeof r.date !== "string" ||
        !/^\d{4}-\d{2}-\d{2}$/.test(r.date) ||
        !Number.isSafeInteger(r.available) ||
        typeof r.note !== "string" ||
        r.note.length > 200
      )
        return null;
      reviews.push({ date: r.date, available: r.available, note: r.note });
    }
    return {
      version: 1,
      month: d.month,
      values: [...d.values],
      reviews,
      savedAt: d.savedAt,
    };
  } catch {
    return null;
  }
}
export function loadFollowup() {
  try {
    return parseFollowup(localStorage.getItem(FOLLOWUP_KEY));
  } catch {
    return null;
  }
}
