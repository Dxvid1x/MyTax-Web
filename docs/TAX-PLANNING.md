# Optional tax planning — 2026-10-04

The former tax-reduction entrance showed an animated lesson, three categories, a sidebar, an automatically selected subject and a trial at once. The new entrance asks one question and shows two choices. Menu/result/demo links use the name “วางแผนภาษี”; the existing `/reduce` URL and bookmarks are preserved.

## Flow

- Check existing rights: choose a subject, read the existing conditions/evidence, then enter it in deduction step2 when a calculation exists. Without income, start the calculator. This lane does not show a spending trial.
- Try additional planning: choose RMF, Thai ESG, life/health insurance or ordinary donations. Only that subject's trial is mounted. It compares additional spending with tax changes and uses the unchanged scenario engine. Applying remains explicit; simply choosing/typing never changes the financial plan.
- Initial entrance mounts no option detail or trial. Subjects open one at a time. Changing subject/purpose returns focus to the appropriate heading and discards only the un-applied trial draft.
- Skip is always available, returning to the existing result or starting the calculator if none exists. Page copy explicitly says this step is optional and does not require buying anything.
- SSF remains an educational disclosure in the existing-rights lane, with no input or new-purchase deduction. Past-year2568 warnings remain visible, including in an additional-planning detail.
- Animated introductory lesson, fund policy charts and long conditions are available through disclosures. Preliminary-result, eligibility, risk and annual-source notes remain. No engine, tax rules, storage, or route changes.

## Design

Uses the existing MyTax green/neutral light theme and black/grey dark theme, existing typefaces, readable15–16px explanatory copy and44px or larger actions. Two purpose choices on desktop stack on mobile. Subject icons form a grid only after a purpose is chosen. Mobile trials use labelled rows so amounts do not split across lines at320px. Motion is confined to restrained hover and focus scrolling, with reduced-motion support.

Validation: `docs/VALIDATION.md`; reviewed images under `output/playwright/planning-*.png`.
