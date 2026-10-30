# Phase 1 common-format core — 2026-10-30

## Delivered scope

The owner has no privacy-cleared bank export samples. Implemented the independently testable common-format core and a truthful bank-coverage register, not guessed parsers or seven-bank certification. All seven bank-specific variants remain pending in STATEMENT-FORMATS.md. No production deployment is part of this push; the work is on `codex/statement-phase-1` for review in GitHub/GitHub Desktop.

- Existing CSV/XLSX flow retained, including original mapping and worksheet choice.
- Generic selectable-text PDF table reading with repeated headers and multi-page source locations, via real same-origin nested worker port. Unknown layouts, scans and protected PDFs fail instead of fabricating records. Money-column spans crossing boundaries are rejected.
- Inline row corrections with exact-satang revalidation, source identity preserved and confirmation reset. Valid income with a zero/dash debit stays income; ambiguous dual amounts require explicit correction. Mobile edit controls are at least 44px high and selection labels have 44px hit areas.
- Exact-byte file digest + accepted source locator receipts prevent reaccepting a renamed/repeated exact file, including after partial acceptance, transaction editing or deletion, local save/reload and receipt-bearing backup restore. Existing different-file content matches remain reviewable, not silently removed.
- Schema 4 sidecar with migrations from 1–3, strict recovery and matching compact-JSON UTF-8 size policy for local save/export. No raw file, filename, raw table or account number persisted.
- Shared Web Locks and save-before-publish import keep transaction/receipt writes paired. Quota failure, cancelled queued imports and stale tabs cannot consume source rows. A generation guard invalidates queued saves after clear/pause/reload/restore. Recovery snapshots read the latest in-memory state while holding the lock.
- Tax functions/inputs and CSP unchanged; no bank credentials, cloud sync, new financial uploads or analytics. Automatic salary/deduction filling and OCR are later phases.

## Files

Reader/review/identity: `src/statement{Types,Profiles,Review,Edit,Identity,Pdf,PdfWorker,Worker}.ts`, existing `src/statement.ts` validation reused unchanged. UI: `src/StatementImport.tsx`, `src/statement.css`, `src/Ledger.tsx`. Persistence/integration: `src/storage.ts`, `src/useLocalStore.ts`, `src/main.tsx`. Unit and browser regressions under `tests/statement*.test.ts` and `tests/e2e/statement*.spec.ts`, `store-snapshot.spec.ts`, plus schema/reload expectation updates in existing tests. Exact pinned PDF.js 6.4.299; dev-only PDF fixture generator pdf-lib 1.17.1; Vite security patch 8.3.5. PDF.js Apache license included in `public/licenses/pdfjs-dist.txt`.

## Decisions and tradeoffs

1. Work in the owner's current checkout on a separate feature branch, staging only explicit paths; the existing owner `.gitignore` edit remains uncommitted.
2. Lack of bank samples narrows this delivery to generic supported column layouts; wrong scope labels would otherwise promise compatibility we cannot prove. The seven-bank Phase 1 roadmap is not complete.
3. PDF.js 6's automatic worker setup assumes `window`; use an explicit real Worker port inside the outer worker and a local type bridge for its generated null-only port declaration. Version 6 removed `isEvalSupported`; keep the production CSP unchanged rather than relax it or enable fake-worker fallback. Scope cost: unknown font/layout variants are not certified.
4. Async writes cannot be awaited reliably on unload; dirty-state warning remains and reload tests now wait for a proven saved record. Save status must be checked before closing.
5. Update pre-existing Vite 8.3.2 to non-major security patch 8.3.5 after audit findings. All dependencies are checked again with the changed bundle.
6. PDF header-start column bands replace nearest-midpoint guessing; ambiguous monetary geometry is rejected. This trades broad PDF acceptance for avoiding income/expense reversal.

## Validation

See VALIDATION.md for final checked commands/counts. Regression evidence includes wrong-direction pure tests (observed RED→GREEN), browser clear recreating autoSave=true before the generation fix (RED→GREEN), queued backup recovery omitting a newer salary before the snapshot fix (RED→GREEN), quota/cancel failures and actual offline PDF worker extraction. No real financial file used. Screenshot evidence: `output/playwright/phase1-row-editor-375.png` and `phase1-pdf-desktop.png`.

## Known gaps / next step

- All seven per-bank adapter certifications need layout evidence and anonymised fixtures; two-digit-year/combined-amount bank variants, scans, arbitrary PDF layouts and passwords are not supported by the common reader.
- Unsaved receipt history lasts only in the current tab. Clearing data or restoring an older backup resets the protection to that dataset. Legacy ledger-only replacement explicitly warns about this.
- Minor deferred review item: after correcting an earlier equal source row, another content match can retain a conservative “อาจซ้ำ” flag. It remains manually reviewable/selectable; exact-source idempotence is unaffected.
- Some requirements are deliberately not delivered: categorisation, deduction finder, payslip/50-tawi OCR, dashboard and encrypted sync. Do not describe this core as completing the entire roadmap.

Next: admit the first bank-specific variant only after an authoritative/privacy-cleared layout is available and its synthetic tests plus browser flow pass.
