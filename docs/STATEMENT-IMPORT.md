# Local saving and Statement imports — 2026-10-04

## Current workflow

- The ledger storage-choice banner and cross-device login/sync are removed. Settings → บันทึก shows the current local-save status and opens the existing data-management dialog. The local saving toggle, backups, recovery, stale-tab protection and tax data remain.
- สมุดเงิน → นำเข้า Statement accepts CSV or Excel `.xlsx` from the computer. Choose a file, review the detected date and credit/debit columns, select rows, verify the totals and confirm. Column settings are collapsed when detection produces valid rows; unknown layouts open the mapping controls.
- Import appends selected entries without replacing existing rows, assigning “อื่น ๆ” so the user can adjust categories. Imported net bank deposits never automatically become taxable gross salary. Own-account transfers and opening balances should be excluded during review.
- Dates must use a four-digit year: ISO, day/month/year or explicitly selected month/day/year. Buddhist years convert to Gregorian. Money uses the existing strict integer-satang validation; ambiguous debit+credit, future/invalid dates, zero amounts and descriptions over 250 characters remain excluded with a reason.
- Possible duplicates compare date, cash direction, exact amount and trimmed description, including earlier rows in the file and existing ledger entries. They are not automatically selected. Legitimate repeats can be explicitly selected with an extra confirmation; this is a review aid, not a guarantee that all overlaps are detected.

## Files and privacy

- File size up to 5 MB; up to 10,000 ledger rows in total. Excel ZIP metadata is checked before inflation: at most 200 parts and 15 MB declared uncompressed content, with a 12-second worker timeout and a maximum of 10 worksheets. Each sheet is capped before rendering. CSV supports UTF-8, BOM UTF-16 and legacy Thai Windows-874, comma/semicolon/tab separators, quotes and multiline cells.
- PDF, old `.xls` and password-protected files are not supported. Bank layouts differ, so no individual bank is advertised as certified without testing its redacted export. Excel uses saved cell values; verify totals against the original file. The reader does not execute spreadsheet formulas or macros.
- Parsing runs in a same-origin, bundled Web Worker. No bank links, credentials, analytics, file upload or account requests. Raw files/filenames are not persisted; only selected ledger fields enter the existing local store when saving is enabled. No tax formula or CSP changes.
- Excel reading uses the locally bundled MIT-licensed [read-excel-file worker API](https://github.com/catamphetamine/read-excel-file#worker), pinned by the lockfile. No third-party scripts/CDNs are loaded. The worker asset is included in the existing PWA precache, so imports work after the full app has loaded, including offline.
- The deployable ledger API entry point and account UI/hook were removed. Supabase settings or remote resources were not modified/deleted. Earlier account-security unit tests still exercise historical unserved server code; old account browser scenarios are archived in `retired/account.spec.ts.txt`. They are replaced by tests for local saving, no uploads, unchanged tax/ledger, duplicate confirmation, errors/cancellation, Excel reading, offline reading and accessible layouts.

## Verification

71 unit/50 full browser cases passed, with lint, strict type checks, format, production/PWA build and production dependency audit (0 reported vulnerabilities). Includes offline Excel import and accessible 390/768/1280 light/dark layouts. Production release is recorded in `VALIDATION.md`. All fixtures are synthetic and used in isolated browser profiles. No personal bank Statement was read.
