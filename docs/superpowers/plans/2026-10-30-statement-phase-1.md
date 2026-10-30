# MyTax Smarter Statement Import Implementation Plan

Execution status 2026-10-30: common-format core implemented and verified; seven bank-specific certifications remain pending because no privacy-cleared layouts are available. This original full-phase checklist is not a claim of seven-bank completion. See `docs/PHASE-1-CORE-REPORT.md` for delivered scope, decisions, regression evidence and the deferred minor review item.

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Extend the existing local statement importer with evidence-backed bank layouts, text-PDF reading, editable review rows and durable exact-file idempotence.

**Architecture:** Retain the existing CSV/XLSX validation and ledger model. Bank adapters and a separate PDF extraction worker produce source-addressed drafts; a pure review/commit layer validates edits and filters previously accepted source rows. A versioned saved-state sidecar records receipts alongside the ledger, never the original financial file.

**Tech Stack:** Existing React 19, TypeScript, Vite/PWA, node:test and Playwright; retain read-excel-file. Proposed Mozilla pdfjs-dist, exact version/worker integration verified before installation into the implementation branch.

**Spec:** `docs/superpowers/specs/2026-10-30-statement-phase-1-design.md`. Owner brief: `C:/Users/User/.codex/attachments/2e3a2511-137e-4992-8f8c-6d8e21720771/ข้อความที่วาง.txt`.

## Global Constraints

- Phase 1 only. “Do NOT start a new project and do not rewrite working code.”
- “No new network calls carrying financial data.” Keep CSP `connect-src 'self'`; do not relax other directives.
- “Parsing, OCR and categorisation run in the browser (Web Worker).” No OCR in this phase; move new bank parsing and duplicate/review processing into workers, preserving the old tested pure functions.
- “Every auto-detected deduction is a suggestion the user confirms; never silently change a tax result.” This phase adds no deduction detection and changes no tax inputs/formulas.
- “Thai-first UX”, “tap targets >= 44px”, “WCAG 2.1 AA”. Preserve existing themes, keyboard/focus and reduced-motion behaviour.
- “One phase per branch/PR.” Proposed branch `codex/statement-phase-1`; use an isolated worktree at execution time where available. Never include the owner's existing `.gitignore` change. Do not commit/push/deploy in the planning stage.
- Preserve CSV/XLSX, 5 MB file/backup cap and 10,000 ledger-row cap; PDF-only limits and receipt caps are the explicitly proposed values in the spec. No silent truncation.
- No new auth/sync, bank links, analytics, payslip OCR or invented identity/contact details.

## Review Focus

1. Same file reimported after renaming, row correction, ledger edit/deletion, partial acceptance, reload or backup restore: accepted source locators remain locked; unaccepted rows remain eligible. Task 3 tests.
2. Two identical genuine transactions or two accounts with matching amounts: source identity and possible content matches must not be conflated. Tasks 1 and 3 tests.
3. Missing PDF text, repeated headers, wrapped descriptions or a corrupt middle page: omissions must not disappear behind a successful-looking total. Tasks 2 and 4 tests.
4. Another tab writes while review is open; user cancels or local storage is full: no half-applied ledger/receipt state or overwritten original. Tasks 3 and 4 tests.
5. New provenance is dropped by backup/recovery paths or old data migration: exact-file guarantees must not silently disappear. Task 3 tests.

## Files and interfaces

Existing seams: `src/statement.ts` validation, `src/statementWorker.ts` file reader, `src/StatementImport.tsx` review UI, `src/Ledger.tsx` append callback, `src/storage.ts` schema/backup, `src/useLocalStore.ts` autosave/conflict, `src/main.tsx` data export/restore wiring. Keep `src/ledger.ts` transaction shape unchanged.

New focused modules: `src/statementTypes.ts`, `src/statementProfiles.ts`, `src/statementBanks/{bank}.ts` only for evidence-backed variants, `src/statementPdf.ts`, `src/statementPdfWorker.ts`, `src/statementReview.ts`, `src/statementIdentity.ts`.

Shared proposed types in `src/statementTypes.ts`:

- `BankId = 'kbank' | 'scb' | 'krungthai' | 'krungsri' | 'ttb' | 'gsb' | 'bangkok'`.
- `StatementOrigin = { locator: string; page?: number; sheet?: number; row?: number }`; locator is deterministic and independent of corrections.
- `PdfTextItem = { text: string; x: number; y: number; width: number; height: number; itemIndex: number }`; `PdfTextPage = { page: number; items: PdfTextItem[] }`. Define these in Task 1's shared types so the profile registry compiles before the PDF reader exists.
- `StatementTable = StatementSheet & { origins: StatementOrigin[] }`; source origin at each row index stays associated with the raw cells through manual remapping and worksheet selection. Tables are transient only.
- `StatementProfileInput = { format: 'csv' | 'xlsx' | 'pdf'; rows?: string[][]; pages?: PdfTextPage[] }`.
- `StatementCandidate = { origin: StatementOrigin; dateText: string; note: string; creditText: string; debitText: string; amountText: string; directionText: string }`.
- `StatementDocument = { fileDigest: string; format: 'csv' | 'xlsx' | 'pdf'; profileId: string | null; profileVersion: number | null; locatorVersion: number; tables: StatementTable[]; candidates: StatementCandidate[]; warnings: string[]; incomplete: boolean }`.
- `StatementReceipt = { fileDigest: string; profileId: string | null; profileVersion: number | null; locatorVersion: number; accepted: { locator: string; transactionId: string }[] }`.
- `StatementImportState = { version: 1; receipts: StatementReceipt[] }`.
- `StatementReviewRow = StatementRow & { origin: StatementOrigin; alreadyImported: boolean }`, with `StatementRow` retaining its existing fields. `duplicate` remains a possible content match, not the locked status.
- `StatementImportIntent = { document: StatementDocument; selected: StatementReviewRow[] }`; `StatementImportCommit = { transactions: Transaction[]; statementImports: StatementImportState; added: number }`.

### Task 1: Establish format evidence and source-addressed adapters

**Files:** create `docs/STATEMENT-FORMATS.md`, `src/statementTypes.ts`, `src/statementProfiles.ts`, evidence-backed files under `src/statementBanks/`, `tests/statementBanks.test.ts`, `tests/fixtures/statements/README.md` and synthetic bank fixtures; modify `src/statement.ts`, `src/statementWorker.ts`, `tests/statementFixture.ts` only at their integration seams.

**Interfaces:** `detectStatementProfile(input: StatementProfileInput): { profileId: string; profileVersion: number; bank: BankId } | null`. Registry matches structural signatures, never filenames alone. Each profile exposes `parse(input: StatementProfileInput): StatementCandidate[]`; concrete variant signatures come from observed evidence. Define the shared PDF text types here even when no PDF reader has been installed.

- [ ] Catalogue all seven requested banks and channels. Record evidence/status independently for each variant. Obtain anonymised layout evidence or authoritative samples; if none exists, mark pending and do not invent a compatible bank parser.
- [ ] Add failing `bank profiles require structural evidence; unknown/ambiguous layout stays unknown`, `repeated header/opening balance is not a transaction`, and `equal-value transactions at distinct source rows remain distinct` tests. Assert explicit credit/debit direction and exact satang on every admitted fixture, including Buddhist years, grouping separators, multiline notes and footer rows.
- [ ] Run `node --test tests/statementBanks.test.ts`; verify the intended new-interface failures.
- [ ] Implement the registry/adapters around existing CSV/XLSX reader/validation functions. Retain generic manual mapping and do not derive cash direction from balance alone. Keep source locators before removing headers or combining note lines.
- [ ] Rerun `node --test tests/statement*.test.ts`; existing tests and admitted-format tests must pass. Commit only this task's files on the Phase 1 branch when Git is writable.

**Deliverable:** format registry with honest verified/pending coverage and no regression in generic CSV/XLSX imports. Completion of all seven bank targets depends on missing evidence, not guessed regexes.

### Task 2: Add local text-PDF extraction under the production CSP

**Files:** create `src/statementPdf.ts`, `src/statementPdfWorker.ts`, `tests/statementPdf.test.ts`, synthetic `tests/fixtures/statements/*.pdf`, extend `tests/statementFixture.ts` for deterministic PDF fixtures if needed; modify `src/statementWorker.ts`, `package.json`, lockfile, and `scripts/build-pwa.mjs` only if existing automatic precache discovery needs a local-asset inclusion fix.

**Interfaces:** consume `PdfTextItem`/`PdfTextPage` from Task 1. Produce `extractStatementPdf(buffer: ArrayBuffer): Promise<{ pages: PdfTextPage[]; warnings: string[]; incomplete: boolean }>` and `readStatementDocument(buffer: ArrayBuffer, format: StatementDocument['format']): Promise<StatementDocument>`. Preserve CSV/XLSX raw tables and origins in the returned transient document. Workers transfer buffers, return typed errors/drafts, and never post raw text to logs or remote endpoints.

- [ ] Write failing PDF extraction tests: two-page debit/credit fixture with repeated headers and wrapped descriptions; source spans preserved; Thai text with embedded font; scan/empty text; encrypted document; malformed/truncated middle page; 51 pages; excessive extracted text/items; wrong magic bytes.
- [ ] Verify failures with `node --test tests/statementPdf.test.ts`.
- [ ] Check maintained PDF.js release/license/security notes and pin a compatible exact version. Prove in a bounded browser integration harness that extraction executes in an actual worker, uses local assets and passes the unchanged production CSP. Do not accept a main-thread fake-worker fallback; if the setup fails, investigate rather than relax CSP. Exercise cancellation/deadline cleanup.
- [ ] Implement text-item extraction and adapter table reconstruction. Use binary data input, text extraction only, disable evaluation/Wasm where unnecessary, and invoke no PDF actions, annotations, scripts, forms or remote viewer resources. Fetch any required CMaps/fonts only as bundled same-origin static assets. Surface missing text/partial pages rather than inventing rows; apply the proposed limits in the spec.
- [ ] Run PDF/statement unit tests plus a production-preview offline-PDF worker browser case. Verify the same static workers/fonts are in the PWA precache. Commit task files after checks pass.

**Deliverable:** text-PDF documents produce reviewable source-addressed rows without financial uploads; unsupported/encrypted/scanned layouts report an honest limitation.

### Task 3: Enforce idempotence and migrate saved provenance safely

**Files:** create `src/statementIdentity.ts`, `tests/statementIdentity.test.ts`, `tests/statementStorage.test.ts`; modify `src/storage.ts`, `src/useLocalStore.ts`, `src/main.tsx`, `src/Ledger.tsx`, relevant `tests/hardening.test.ts` and `tests/e2e/reliability.spec.ts` backup checks. All callers of `makeSaved` and every backup/reset/recovery path must be audited.

**Interfaces:** `hashStatementFile(bytes: ArrayBuffer): Promise<string>` (worker SHA-256); `applyStatementImport(intent: StatementImportIntent, transactions: Transaction[], state: StatementImportState): StatementImportCommit` (pure, revalidates selected fields/origins, accepted locators and existing ledger limits); `serializeSaved(data: Saved): string` (one compact JSON encoding, <=5 MB UTF-8, reused for persistence AND backup export); `withLocalSavedWriteLock<T>(operation: () => T, requireLock?: boolean): Promise<T>` (same lock name `mytax.local.v2` across every writer; default false preserves legacy best-effort saves when locks are unavailable, true fails closed for persistent Statement acceptance); store `commitStatementImport(intent: StatementImportIntent, options?: { signal?: AbortSignal }): Promise<{ ok: true; added: number } | { ok: false; error: string }>`. Add the sidecar to schema 4 `Saved`, with empty defaults for schemas 1–3. `makeSaved` gains a final defaulted sidecar parameter so existing callers remain source-compatible while audited callers explicitly preserve current state; include it in `dataSignature`.

- [ ] Add failing tests: import a two-row file twice → second commit adds 0; rename does not change digest; accept one row then reimport → only the other is eligible; correction/ledger edit/delete does not unlock accepted origins; cancel does not create a receipt; equal payments at two origins survive; different files/accounts stay possible matches, not silently dropped; same digest with an incompatible locator/profile version blocks reimport, including partially accepted files.
- [ ] Add failing storage tests: schemas 1–3 migrate without losing tax/ledger/settings; schema 4 save/backup/restore/recovery carries receipts; malformed provenance preserves original for review; inconsistent/duplicate locators fail validation; receipt caps and 5 MB serialized total are enforced without pruning or partial writes. Include Thai text at the UTF-8 byte boundary and an exported backup that must parse again at that boundary; do not measure only JS character count or compact storage while exporting pretty JSON.
- [ ] Run `node --test tests/statementIdentity.test.ts tests/statementStorage.test.ts` and confirm the new behaviour fails first.
- [ ] Implement receipts grouped by file digest with original accepted locators. Keep profile and locator-contract versions and transaction references; fail closed for incompatible already-receipted documents. Ensure duplicate classification/review runs in a worker; final pure commit rechecks selected fields and latest state rather than trusting UI error flags. Do not silently enable autosave.
- [ ] Serialize every persisted write (normal autosave, explicit save, receipt import, restore/recovery/reset) through `withLocalSavedWriteLock`, rechecking expected raw state INSIDE the shared lock. Imports-only locking is insufficient. Keep the existing synchronous write helper inside the critical section; update hook/main action callers to await completion. For autosave, preflight `serializeSaved`, write the paired state successfully, then publish ledger/receipts/success; quota/security/conflict failure leaves the old pair unchanged. Session mode updates the pair only in memory and retains the unsaved warning. A queued import must check its AbortSignal before writing. When Web Locks is unavailable, allow session-only import but explicitly block persistent Statement acceptance; do not claim database-like CAS from the old localStorage check/set. An unload handler warns for pending/dirty state and never promises it can await a lock.
- [ ] Route all export/import/clear/reload paths through the new sidecar; strict recovery preserves the original and blocks Statement acceptance while receipt history is uncertain. Deleted ledger entries may legitimately leave tombstones: do not reject these as dangling invalid references. Audit every persistence/export caller to explicitly preserve the sidecar rather than accidentally use its empty default. Legacy ledger-only backups do not invent provenance; display the resulting guarantee limitation when restored. No changes to historical remote server/Supabase code.
- [ ] Rerun affected unit tests and browser backup/stale-tab cases, including two simultaneously started writes, lock unavailable, queued import cancellation and storage quota failure. Verify no lost write, no half-state, no import success after cancellation, and unchanged tax. Commit task files after checks pass.

**Deliverable:** exact-file idempotence with an explicit unsaved-mode limitation and provenance that survives the existing local-data lifecycle.

### Task 4: Editable preview with clear imported/possible-duplicate states

**Files:** create `src/statementReview.ts`, `tests/statementReview.test.ts`; modify `src/StatementImport.tsx`, `src/statementWorker.ts`, `src/statement.css`, `src/Ledger.tsx` callback from Task 3; extend `tests/e2e/statement.spec.ts`.

**Interfaces:** `reviewStatement(document: StatementDocument, mapping: StatementMapping | null, edits: Record<string, Partial<StatementCandidate>>, existing: Transaction[], state: StatementImportState): StatementReviewRow[]`. Keys are immutable source locators. Existing parser validators are reused; stale worker responses carry a monotonically increasing request ID and are ignored. Final import callback accepts `StatementImportIntent`, not an unvalidated transaction array.

- [ ] Write failing review tests: fixing an invalid date or amount makes exactly that row eligible; 1.234 baht remains invalid; both debit/credit entered stays invalid; totals track current valid selected rows; editing cannot remove already-imported status or change origin. Any edit resets confirmation and cannot revive stale worker results.
- [ ] Run review unit tests; confirm failures before implementation.
- [ ] Extend the existing dialog with detected format + evidence status, page/row source, an accessible per-row “แก้รายการ” control, explicit locked “นำเข้าแล้ว” vs reviewable “อาจซ้ำ”, and a separate incomplete-file acknowledgement when omissions are reliably known. Use an inline editor rather than nesting modal dialogs. Keep original raw tables/sheet selection and the column mapper for unknown CSV/XLSX. No new account alias/management feature; cross-file matches stay review-only and never silently discard payments from another account. No account numbers/login credentials stored.
- [ ] Use worker-backed validation/review and retain request-generation, timeout and cancel handling. Cancel must discard draft changes and abort an import still waiting for its write lock; selected valid rows only become ledger entries after final explicit confirmation through Task 3's awaited store callback. Display pending state and prevent editing/resubmitting during commit. Category remains “อื่น ๆ”; no auto salary or deduction filling in Phase 1.
- [ ] Add browser flows: CSV/XLSX regressions; text-PDF multi-page import; correct one row then import; repeat exact file after save/reload; partial import then remaining rows; duplicate locked despite note edit; possible duplicates require review; cancel, storage failure and cross-tab conflict; offline PDF; no POST/external financial calls. Update the former duplicate-override case to distinguish locked source identity from a legitimate possible match, never delete the case.
- [ ] Test keyboard, focus return, >=44px targets, axe, no horizontal overflow and clean console at 375px and 1280px in light/dark themes. Commit task files after checks pass.

**Deliverable:** a user can fix review rows, understand omissions and duplication, and confirm a safe append through the existing ledger flow.

### Task 5: Phase verification and truthful documentation

**Files:** update `docs/STATEMENT-IMPORT.md`, `docs/STATEMENT-FORMATS.md`, `docs/PROGRESS.md`, `docs/VALIDATION.md`, `docs/TAX-RULES.md` (only a note that Statement imports do not establish gross income/eligibility or change rules), and `START-HERE.md` only if its progress link is missing.

- [ ] Run `npm run format`, then `npm run format:check`, `npm run lint`, `npm test`, `npm run build`, `npm run test:e2e`. TypeScript is covered by lint/build. On this Windows/OneDrive checkout, a worker realpath EPERM warrants a permitted-environment rerun before changing code; report any unresolved check rather than claim a pass.
- [ ] Inspect real browser mobile/desktop screenshots and console; verify production CSP, offline precache, no financial payload in network/logs, save/reload and backup/reimport. Use only synthetic fixtures and an isolated browser profile.
- [ ] Check tax engine and CSP files unchanged. Confirm the working-tree diff excludes owner's `.gitignore` modification. Publish exact verified format coverage and pending bank samples; do not claim full Phase 1 completion with missing bank targets.
- [ ] Record changed files, test evidence/counts, PDF/receipt limits and unsupported formats, plus the need for user validation before later phases. Report the next concrete step; do not deploy or promote a partially verified bank import capability as supported.

## Owner review / evidence required

Before implementation: confirm this proposed PDF boundary (text-layer, no passwords/OCR in Phase 1) and how to obtain anonymised export evidence for the seven banks/channels. Names alone do not identify a format. The owner may supply privacy-cleared files or point to authoritative public samples. Do not request real account credentials or unredacted statements. These gaps do not prevent the summary/plan above, but they prevent a truthful claim that all seven bank adapters are implemented or validated.

Execution recommendation: implement the approved plan inline in the existing session, with targeted reviews at the risky parser/persistence boundaries; no parallel product implementations across shared store files.
