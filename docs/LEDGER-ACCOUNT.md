# MyTax: reading, opening and optional ledger account — 2026-10-04

> Historical implementation record. The owner subsequently replaced cross-device accounts with local Statement imports. The account UI/hook and `api/ledger.ts` entry point have been removed. Do not use the activation instructions below for the current product. Unserved server code/security unit fixtures remain for historical coverage; old UI browser cases are preserved in `retired/account.spec.ts.txt` and replaced by local saving/import tests. Current workflow: `STATEMENT-IMPORT.md`.

## Available in this change

- More readable supporting text, spacing and mobile wizard layout. Green income/refunds and modest red expense accents remain; dark canvas stays black.
- Opening with money converging into the MyTax identity, edge-to-edge orbit lines, three bouncing coins and decorative green/red charts, followed by a 1.1-second crossfade into the running homepage hero (about 2.9 seconds total). No visible skip button; Escape remains available. Once per tab session, no fake loading percentage, no sound. Reduced-motion preference skips it. Direct calculator/ledger links skip it too.
- Explicit local/online choices. Guest tax calculation and local ledger remain available. Offline local saving, existing backups and tax formulas are preserved.
- Optional email-code login, secure server-side cookies, account-only ledger documents, backup/import, explicit migration, logout and confirmed online clearing are implemented.
- Sync sends ledger rows, categories and recurring settings only. Tax plans stay local. Local rows never upload just because someone signs in.
- Saves use atomic version checks. A newer device's document cannot be silently overwritten; the user backs up their current draft before reloading. Unsaved changes retain their draft and warn before leaving.

## Deployment gate: online service is not yet enabled

The linked Vercel project already has Supabase environment variables. A signed-in dashboard review found the project `supabase-tax001` and no custom SMTP. Vercel's environment pull returned redacted placeholders, not usable server credentials. No real authentication email was sent, database migration applied, or financial document uploaded during development.

The API fails closed unless `MYTAX_CLOUD_ENABLED=true`, and the UI says the service is not open. Public OTP delivery needs custom SMTP; the default Supabase sender is restricted to team addresses and is unsuitable for public production use. See the [official SMTP guide](https://supabase.com/docs/guides/auth/auth-smtp).

### Remaining activation work

1. Confirm the Supabase project matches the integration attached to MyTax. Apply `supabase/migrations/202610040001_ledger_documents.sql` once to that project after reviewing the new table/policy. It creates only a ledger document table, owner RLS and a revision trigger; it does not migrate existing local records.
2. Configure custom SMTP and an authorized sender/domain in the Supabase dashboard. Set the email-code template to include `{{ .Token }}`. Keep verification enabled. Configure email and per-IP rate limits for public use. Do not paste SMTP passwords or keys into chat.
3. Set server-only Vercel production variables: `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `MYTAX_APP_ORIGIN=https://mytax-indol.vercel.app`. Do not expose them as `VITE_*`. Runtime needs no service-role key or database password.
4. Verify real OTP delivery to a controlled test address and two independent test accounts. Verify direct database RLS rejects reading/writing the other account, anonymous access is denied, and concurrent writes conflict. The automated mocks are not a substitute for these live checks.
5. Enable `MYTAX_CLOUD_ENABLED=true` and redeploy only after those checks. Roll back the flag to disable online calls without deleting account data if setup fails.

## Boundaries and privacy

- No banking/import integration, account requirement for tax calculation, advertising, analytics or new third-party browser scripts.
- Browser calls only same-origin `/api/ledger`. The server verifies Supabase Auth identity and uses the user's token, not an administrator token. HttpOnly/Secure/SameSite cookies carry session secrets; tokens never enter browser storage or response JSON. CSP is unchanged.
- Online requests/responses are no-store. The service worker precaches only static app assets. Cookies may remain until expiry/logout; use logout on shared devices.
- A cloud draft stays in memory while offline. Reloading offline cannot restore an online ledger; save/download a backup before leaving with pending changes. Local mode continues to work offline after a complete app load.
- “Clear online ledger” clears that ledger document only. It does not delete the Supabase account, local copies or downloaded backups. Account deletion/export requests need an owner-operated support process before public launch.
- This is basic ledger sync, not a guarantee against every loss or a security certification. Production still needs operational backups, monitoring, provider policies and a published privacy notice for the actual account service.

## Checks

- Unit tests cover validation, explicit migration, auth/cookies, cross-origin rejection, ownership, refresh, logout and stale versions.
- Browser tests cover guest use, simulated OTP, two isolated device contexts, local isolation, recurring writes, conflict handling, failed saves, themes, keyboard and accessibility.
- Real SMTP and database RLS checks remain pending activation. No tax constants/formulas or Vercel CSP changes.
