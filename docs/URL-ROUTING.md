# MyTax — clean page URLs

Updated 2026-10-03. Website origin is unchanged: https://mytax-indol.vercel.app.

| Page | Path |
| --- | --- |
| Home | / |
| Income / first tax step | /tax |
| Deductions | /tax/2 |
| Prepaid tax and scope review | /tax/3 |
| Personal result | /tax/4 |
| Ledger | /ledger |
| Tax reduction guide | /reduce |
| Illegal tax evasion education | /tax-law |
| About / FAQ | /about |
| Example result | /demo |

Navigation uses browser history paths. Direct links and refresh are supported by explicit Vercel rewrites to the application shell. Assets, environment and metadata paths are not included in these rewrites. Vercel trailingSlash: false redirects trailing-slash variants to the clean path before matching rewrites. The first-step alias /tax/1 and home alias /home are normalized to /tax and /.

Old bookmarks such as /#ledger and /#tax/2 migrate in the browser with replaceState, avoiding an extra history entry. Query strings are preserved. The skip-to-content control focuses main without adding a fragment. Personal results still require valid input and confirmation; opening /tax/4 with an incomplete plan goes to /tax.

PWA start_url is /. Existing localStorage data stays on the same origin and keys. The production worker already returns the cached application shell for offline page navigation; the browser regression now checks offline reloads on /ledger and /reduce.

Routing logic: src/navigation.ts and src/main.tsx. Deployment rewrites: vercel.json. Existing route/history, accessibility, data, calculation and offline regression checks use clean paths; tests also cover migration of every old page bookmark. Release evidence: VALIDATION.md.
