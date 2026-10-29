# MyTax presentation prototype — 2026-10-29

## Purpose

Make the existing salary-tax product easier to explain to an international audience. This is a reviewable first iteration, not a claim of global tax coverage or a full English translation.

## Included

- Homepage copy identifies salaried users in Thailand. A secondary “ลองเดโม · TH / EN” action opens `/showcase`; the story link remains available below it. The mascot speaks about understanding and planning money.
- Lazy-loaded presentation page with Thai/English switching and three manually controlled steps: meet a fictional profile, understand the calculation, compare an additional RMF contribution. Step navigation and the range input work with keyboard controls.
- Receipt-style comparison shows baseline tax, scenario tax, tax reduction, additional contribution and contribution minus tax reduction. The copy distinguishes tax reduction from an immediate refund, investment returns or investment losses.
- Uses the existing `demoPlan`, `rulesFor` and `deductionScenario` functions. No new tax rules or changes to tax formulas. All amounts use integer satang through the existing engine.
- Example is explicitly historical: tax year 2568 / 2025, monthly salary THB 50,000 for 12 months, annual bonus THB 60,000, existing RMF THB 30,000. Eligibility is assumed, not established for the visitor. Original rules review date is shown as recorded, not presented as a fresh legal review.
- Additional RMF starts at THB 30,000 and ranges from 0 to THB 90,000. Default annual tax changes from THB 20,100 to THB 17,100; estimated tax reduction is THB 3,000 against an additional THB 30,000 contribution. Cash-flow difference is THB 27,000. Buying today cannot reduce past-year tax.
- Demo state stays inside the component. It never invokes personal-plan setters, storage writes, account APIs or a purchase flow. Opening the real calculator retains the visitor's original plan.
- Compact year selector and step navigation leave more space for the first salary input on mobile.
- `/showcase` has an explicit Vercel SPA rewrite and its lazy bundles are included by the existing PWA precache build.
- Vite patched from 8.3.2 to 8.3.5 to resolve the installed dependency advisory report.

## Validation

Run `npm.cmd test`, `npm.cmd run lint`, `npm.cmd run format:check`, `npm.cmd run build`, and `npm.cmd run test:e2e`. For installed Chrome, set `MYTAX_TEST_BROWSER=chrome` before E2E.

New browser cases cover real calculation results, zero additional contribution, language switching, persistence isolation with a pre-existing saved plan, calculator handoff, reload, keyboard adjustment, restart, 390px light and 320px dark layouts, and automated WCAG A/AA checks scoped to the demo. Existing route checks include `/showcase` and its legacy hash form.

The existing scope-disclosure accessibility test now waits for the question panel's opacity to reach 1 before running axe. Inspection showed the settled text colours were correct; the scan had frozen a partially transparent entrance frame. This retains the full accessibility assertion.

Preview images are generated under ignored `output/` by the showcase browser tests. Automated accessibility checks do not replace a human screen-reader review or user research.

## Remaining before a public international presentation

- Validate the story with real users and measure completion and comprehension.
- Obtain qualified review of current-year tax content separately; this work does not revalidate tax legislation.
- Translate the complete app and navigation if the intended audience needs to use the actual calculator in English.
- Measure production field performance and rehearse a timed presentation on the target display.
- Repository changes are prepared for user review before any GitHub push or production deployment.
