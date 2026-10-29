# Result summary — 2026-10-04

The result screen answers one question first: how much additional tax is payable, how much could be refunded, or the annual estimate when prepaid tax is unknown. It uses one prominent amount instead of two competing totals.

- Positive balance: red additional tax estimate. Negative balance: green estimated refund. Zero balance: neutral, no additional payment. Unknown withholding: neutral annual estimate, with an explicit request to check the amount already paid; it never assumes zero.
- Known withholding shows the smaller annual tax minus prepaid tax line. Main actions are reduce tax and edit; the unknown state instead leads to withholding step3.
- The existing money breakdown, marginal rate, deduction caps, bands and sources are behind “ดูรายละเอียดการคำนวณ”. No extra chart or large animation was added.
- Scope warnings and the preliminary-estimate disclaimer remain visible. Tax engines, eligibility rules, storage schema and saved financial values are unchanged.
- Print/PDF automatically opens all calculation disclosures and restores their previous states afterwards. Printed text uses dark ink on white surfaces, including when the screen theme is dark. The warning remains printed.
- Layout reviewed at1280,390 and320px in light/dark themes. Long formatted amounts including satang use smaller type to fit narrow screens. Native details supports keyboard opening. Existing accessibility checks cover collapsed/expanded result in both themes.

Evidence: `docs/VALIDATION.md`, `output/playwright/result-summary-*.png`, `output/playwright/result-summary.pdf`.

Follow-up: visible secondary amounts show annual gross income and usable total deductions below the main tax/refund amount. Plain body typography (22px desktop/18px mobile versus96px/48px headline), neutral colors and two columns retain the tax-first hierarchy. Deductions use the engine's accepted/capped total, consistent with the existing detailed breakdown; salary expense deduction remains separate in the details.
