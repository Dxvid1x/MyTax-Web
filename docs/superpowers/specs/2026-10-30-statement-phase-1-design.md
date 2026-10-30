# MyTax Phase 1 — statement import design

Status: proposed, for owner review before implementation. No product code or deployed site changed by this document.

## Intent and boundaries

Extend the existing importer so a salaried person can review transactions from a supported bank export, correct parsing mistakes, and add selected entries without duplicating a previously imported source row. Keep all financial files and processing on the device. A statement deposit remains a ledger deposit, not taxable gross salary or an automatically claimed deduction.

The owner's 2026-10-30 brief requests Phase 1 first, with a current-state summary and concrete plan BEFORE code. Phases 2–7 are not part of this implementation. Its statement that PVD is unsupported is outdated: `src/extendedTax.ts`, `src/scope.ts` and existing tests already include PVD/GPF support. No tax formula, eligibility rule, legal copy, creator identity or feedback address is to change here.

## Verified current state

- Read `src/statement.ts`, `src/statementWorker.ts`, all of `src/StatementImport.tsx`, `tests/statement.test.ts` and `tests/statementFixture.ts`, plus the ledger/store integration and import documentation.
- CSV/XLSX parsing already runs in a bundled worker; review and duplicate comparison run in React. CSV decoding supports UTF-8, BOM UTF-16 and Windows-874. Mapping supports separate credit/debit, signed amount, or amount with a direction column. Money is integer satang; dates can be explicit ISO/DMY/MDY with four-digit Buddhist/Gregorian years.
- Limits: 5 MB file, 10,000 ledger rows, bounded Excel ZIP metadata and 12-second reader timeout. No PDF library or bank-specific fixtures/adapters exist.
- Users can change mapping and exclude bad rows, but cannot edit an individual extracted row in the preview. Every accepted row becomes category “อื่น ๆ”.
- Duplicate detection compares date/direction/amount/trimmed note. Existing matches are unchecked by default but can be explicitly imported again; `importStatementRows` creates new random IDs and does not enforce source identity.
- `Saved.schemaVersion` is 3. `Transaction` has no import provenance; `copyRow` retains only its fixed fields. A backup/read cycle would discard undeclared row metadata. Provenance must be deliberately integrated with persistence and recovery.
- `npm test` rerun on 2026-10-30: 71 passed, 0 failed. Full browser/build checks were not rerun for this planning-only work.
- Working tree initially contains an owner change to `.gitignore` excluding `docs/MASTER-PROMPT.md`; leave it intact.

## Proposed experience

Choose CSV/XLSX/PDF → identify format or use manual mapping → review source page/row and correct individual fields → inspect incoming/outgoing totals and any missing-page warnings → confirm → append selected entries and their import receipt together.

Separate “นำเข้าแล้ว” (already accepted from this exact file, locked) from “อาจซ้ำ” (a content match needing review). Never hide a legitimate repeated payment solely because date, amount and description match. No file content, extracted account number, filename or PDF text is persisted; only reviewed transaction fields and minimal source fingerprints/locators are retained. Do not add an account-management feature in Phase 1: cross-file matches remain review-only across accounts. No identity or financial data is added to logs.

## Coverage and evidence

Targets: KBank, SCB, Krungthai, Krungsri, TTB, GSB and Bangkok Bank; format coverage is per export variant, not per bank logo. A bank/profile enters verified status only after its layout has been observed in a properly anonymised file or authoritative published sample and a corresponding synthetic fixture passes. A made-up fixture cannot establish bank compatibility.

Record bank, export channel, CSV/PDF variant, observed layout, evidence origin and test status in `docs/STATEMENT-FORMATS.md`. Preserve layout/date/direction/reference conventions in synthetic fixtures, never real personal identifiers. Unknown CSV/XLSX retains manual mapping. Unknown PDF does not guess money direction or derive it solely from balance; present an unsupported-layout explanation or require explicit row correction. Coverage of all seven banks remains an acceptance dependency until evidence exists.

## PDF proposal

Use Mozilla PDF.js text extraction with an explicitly bundled same-origin worker and local required assets; no viewer, OCR, remote API, CDN, embedded JavaScript actions or CSP relaxation. `getTextContent` provides text items, not an already validated bank transaction table. Bank adapters must reconstruct columns and wrapped descriptions from page coordinates.

Builder's proposed initial boundaries: text-layer PDF only; reject password-protected documents with a plain explanation and do not request bank passwords; scan/image OCR deferred to Phase 3. This password restriction needs owner confirmation because the brief does not specify protected PDFs. Limits proposed for validation: 5 MB input, 50 pages, 2,000,000 extracted characters, 200,000 text items and 20-second PDF deadline; keep existing CSV/XLSX limits/deadline. Verify on 375px and desktop before accepting these limits. Empty text, an unreadable page or structural failure must be surfaced; never present a partial extraction as a complete statement. Allow an explicitly reviewed subset only when the document is readable enough to list its omissions reliably.

References consulted 2026-10-30: [PDF.js document/worker options](https://mozilla.github.io/pdf.js/api/draft/module-pdfjsLib.html), [PDFPageProxy.getTextContent](https://mozilla.github.io/pdf.js/api/draft/module-pdfjsLib-PDFPageProxy.html). Dependency version and license are to be checked and pinned at implementation time, after a production-CSP worker proof. Do not weaken CSP to make the reader work.

## Identity and persistence proposal

- Preserve `Transaction` fields. Add a versioned `statementImports` sidecar to the saved state and advance the saved schema to 4, retaining the existing storage key and migrations from schemas 1–3. Older files default to an empty sidecar. Do not silently discard malformed new provenance: preserve the original and require recovery review.
- Hash exact input bytes with SHA-256 locally. Within a file, each draft row retains its original source locator: CSV/XLSX sheet + source row, PDF page + source text-item span. Correction changes parsed fields, never the source locator. Profile implementations must keep these locators deterministic.
- Receipts group accepted locators by file digest and retain profile version, locator-contract version and generated transaction IDs. File rename does not change identity; cancellation or an unselected/invalid row does not consume a locator. A repeated exact file cannot override accepted locators, even after the ledger description/category is edited or its row is deleted. Undo remains the way to restore an intentionally deleted ledger entry. An incompatible locator/profile version for an already-receipted digest blocks reimport rather than guessing a correspondence; a future explicit compatibility migration must be independently tested.
- Different files/overlapping periods use reference IDs only where proven stable and otherwise remain possible-duplicate review. Matching date/amount/note alone is never sufficient to silently discard a payment, including across different accounts.
- One store-level operation checks the latest ledger, receipt state, cross-tab conflict and size limits, and publishes transactions plus receipts together. Existing `writeSaved` check/set is not atomic compare-and-swap across tabs. Route every persisted save/restore/recovery/reset through a shared Web Lock, reread/check the expected state inside it, and save the paired payload before publishing success when autosave is on. If locks are unavailable, retain session-only importing and block persistent Statement acceptance with a clear explanation. Do not claim an async lock will complete on page unload; preserve the dirty-state warning. Backups, restores, dirty checks, reload-from-other-tab and clear-all must carry/reset both together. Existing tax plan is byte-for-byte unchanged by import.
- Keep transient raw sheet cells and source origins in the draft so existing sheet selection/manual column mapping still works. Persist none of these raw draft tables. Use a single compact JSON serialization/byte-limit policy for saved data and exported backups; current export pretty-printing otherwise risks a valid near-limit save producing an oversized, unrestorable backup.
- Bounded proposal: at most 1,000 file receipts and 20,000 accepted source locators, with the existing 5 MB total backup cap checked before acceptance. Stop with a clear capacity message rather than pruning history silently. These are implementation guardrails, not new product claims.
- Idempotence survives reload only if the user saves locally or restores a backup carrying receipts. Unsaved mode retains receipts only for the current in-memory session. Clearing all data or restoring an older backup resets the guarantee to that dataset; say so plainly.

## Acceptance

Supported evidence-backed CSV and text-PDF fixtures import end-to-end; current XLSX remains working; wrong rows can be fixed and revalidated; known source rows cannot be imported twice; genuine identical payments from distinct source locations remain reviewable; cancelled/failed/stale-tab imports change nothing. Multi-page omissions are visible. All old data/backup/recovery flows retain their behaviour. No financial uploads, external calls, tax changes or bank credentials. Touch targets >= 44px, Thai UI, WCAG 2.1 AA, clean browser console at 375px and desktop in both themes. Full format, lint/types, unit, build and e2e checks pass before declaring Phase 1 complete. Do not label all seven banks supported while evidence/profile tests are missing.
