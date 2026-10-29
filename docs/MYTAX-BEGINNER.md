# MyTax — beginner flow and looping demo

Updated 2026-10-03.

- Demo loops through eleven scenes, including the simulated transition to the separate deduction guide while its output panel is at least 15% visible. It suspends outside the viewport or when the tab is hidden, resumes on re-entry, and unmounts when changing features. The circular pause/restart controls have been removed. Motion settings remain inside an expandable disclosure; editing demo amounts stops autoplay, and restarting restores the sample. Reduced-motion mode remains manual.
- Tax calculator: income → deductions → tax prepaid by employer → result. Questions are separate; annual income is shown as a visual equation. Existing deduction eligibility and supported tax-year rules remain.
- The prepaid-tax step explains the employer-to-bank / employer-to-Revenue-Department flow. Users choose known amount, no withholding, or unknown. A fictional comparison explains 10,000 annual tax − 8,000 prepaid = 2,000 additional payment.
- The expandable certificate illustration points to the total tax-withheld column of the 50 ทวิ certificate. It contains no invented certificate amounts.
- New plans default to unknown withholding (empty string). Only this field may be blank in a completed calculation. Annual tax still calculates; `balance` is null until a credit amount or explicit zero is known. Saved older explicit zero stays known. Storage schema/key remain compatible.
- Ledger: separate income/expense actions, category shortcuts, actual-period ring and comparison bars, weekly/monthly controls, editable transactions and CSV. Empty charts are neutral. Net is labelled as period difference, not bank balance. No automated tax linkage.
- Fonts and green theme remain local. Motion respects reduced-motion settings.

Source for prepaid-tax terminology: [Revenue Department withholding-tax introduction](https://www.rd.go.th/14929.html). Annual tax rules: [PND91 instructions, tax year 2568](https://www.rd.go.th/fileadmin/tax_pdf/pit/2568/Ins91_241268.pdf). Calculation scope remains in TAX-RULES.md.

Validation: 19 automated tests, including unknown-vs-zero withholding, preserved annual tax, RMF scenarios, saved drafts and older saved zero; production TypeScript/Vite build. Browser verification uses fictional entries with local saving off.

Separate deduction guide, latest feature scope and verification: MYTAX-DEDUCTION-GUIDE.md.
