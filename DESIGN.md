# MyTax UI direction

Audience: Thai salary/bonus earners estimating supported tax cases. Public information pages explain scope and evidence; they do not file returns or claim government affiliation.

Preserve the existing MyTax identity: MyTaxDisplay headings, MyTaxBody text, green `--positive` (#187344), ink `--ink` (#202020), muted `--muted` (#5d6260), white `--surface`, pale green `--positive-soft` (#edf8f1). Dark variants come from colour.css; no hard-coded light-only panels.

Trust page signature: a compact six-topic accordion with all sections initially closed, one open at a time. Keep only the salary-estimate scope and independent/non-filing note visible. Reveal examples, sources, data handling, FAQs and operator information on demand. No repeated hero, principle cards or always-open calculation sheet. Confidence comes from inspectable information and honest review status, not certification badges, invented reviewers or social-proof counts.

Visual revision approved by user: add one expressive hero above those disclosures. Use the existing mouse identity in a newly generated welcoming notebook pose, deep evergreen #0c3d2e, fresh lime #caf59a, pale mint #c4e8c1 and warm white #f5faef. Broad inspiration: Headspace's approachable illustration and Wise's bold brand typography, composed into an original MyTax scene. Preserve sparse copy and collapsed details. Main hero action opens/focuses the supported-scope topic. Decorative art animates once by transform only; no perpetual motion. Below 360px, reduce art so the primary action stays clear.

Disclosure owner: business-scoped TrustSection in About.tsx, with heading/button, aria-expanded, aria-controls and labelled region. Closed panels use inert and aria-hidden to remove hidden controls from navigation. Animate grid height and chevron only; honor prefers-reduced-motion. Keep panel content mounted so source-year and FAQ selections survive closing. Existing FAQ uses native details. Topic controls need Enter/Space and Tab behavior.

Canonical owners: navigation in main.tsx/navigation.ts; tax years/sources/check dates in tax.ts/scope.ts; amount and date formatting in taxDisplay.tsx; primary/secondary buttons and theme tokens in existing global styles; data-management modal owned by App and called through onManage. Trust-page year selection changes source browsing only, never the user's tax plan. Sources open in a new tab with noreferrer/noopener.

Behavior: preserve entered data, keep the real calculator in Thai, retain the existing seven FAQs and existing source disclosure. Use factual neutral result copy; no pressure, debt-collector jokes, guaranteed refunds or fake accreditation. Missing owner/contact are disclosed plainly until supplied by the owner. Financial inputs and local backups are not described as encrypted.

Verification: mobile reflow, light/dark contrast, keyboard operation, year/source switching without plan mutation, data-management modal, existing result and home flows, TypeScript/lint/build. No commit or push for this review iteration.

## Ledger direction — 2026-10-30
Use a neutral working register, not the illustrated About-page treatment. Hide decorative backdrop only on ledger; retain green/red on money and directional icons, not full action-card fills. Compact entry actions and flat neutral panels keep transactions readable. Preserve all storage, imports, filters and arithmetic.
References reviewed: Mercury https://mercury.com/ and transaction help https://support.mercury.com/hc/en-us/articles/38790547830036-Viewing-cashflow-and-transactions-data-on-your-Transactions-page ; Actual https://actualbudget.org/ ; YNAB https://www.ynab.com/ ; Monarch https://www.monarch.com/ ; Copilot https://www.copilot.money/ ; Lunch Money https://lunchmoney.app/features . Product pages and help reviewed, not authenticated application audits.

## Prototype and review workflow
For substantial visual revisions, follow docs/CLIP-AUDIT-2026-10-30.md: explore three lightweight directions with synthetic data before replacing existing production components. Current local comparison: output/ledger-directions.html (ignored, not a production route). Keep action styles scoped to their owning section: ledger period controls must not override the transaction dialog's income/expense segment.

## Selected ledger A — implemented
Owner selected A on 2026-10-30. Production ledger uses a three-column balance strip with an explicit period-only difference disclaimer, neutral income/expense controls, compact command bar, full-width register with date/category/amount/actions on desktop and stacked mobile rows. Category analysis follows the register. All figures still use the existing filtered summarize result and integer-satang transactions; no synthetic entries are added to users' data. New scope selectors stop period styling from affecting transaction dialogs.
