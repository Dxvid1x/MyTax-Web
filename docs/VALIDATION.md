# MyTax — validation record

## Four UI refinements — 2026-10-04

- 71 unit tests and 54 full Chrome browser tests passed. Lint, client/server type checks, format check and production/PWA build passed. Eight directly affected browser cases also passed after correcting mobile header spacing and dialog focus return.
- New cases check all five navigation items at 390/1280 in both themes, About keyboard/history access and active state, Statement primary action/56px target/dialog focus return, red live estimates across steps 1–3, and a loaded crying/bar-gripping mascot with no extra overlaid bars. Existing axe and 390/768/1280 overflow checks all passed.
- Reviewed light/dark screenshots including `output/playwright/polish-dark-1280-law.png`, `polish-light-390-ledger.png`, `polish-dark-390-tax.png`, `ux-dark-390-about.png`. The new WebP keeps transparency and is 94,710 bytes; its source and final imagegen prompt are retained in UI-FOUR-POINTS-2026-10-04.md.
- `tax.ts`, `extendedTax.ts` and `vercel.json` SHA-256 unchanged. Local data, Statement preview/confirmation and legal text unchanged. No added external calls, tracking or banking connection.
- READY release `dpl_6DytQAKkPKm8EwZw3miTaEPXBfwj`, immutable `https://mytax-5xzieanf3-aaaa1-03d3.vercel.app`, alias `https://mytax-indol.vercel.app`. Public ledger200 serves `index-DJ7L-Qsk.js` / `index-DuNaQ5VD.css`, with the unchanged CSP. Live isolated Chrome checks confirmed the crying-bars WebP loaded at 800px, green Statement target at 56px, Escape returning focus, About aria-current, and estimated tax 21,500 displaying the correct light/dark red tokens. No page errors or overflow. Screenshots: `output/playwright/four-ui-live-{light-390,dark-1280}-{law,ledger,about,tax}.png`.

## Local saving / Statement replacement — 2026-10-04

- 71 unit tests and 50 full Chrome browser tests passed. Lint, strict client/server type checks, format check, production/PWA build and production dependency audit passed (0 reported vulnerabilities). Eight new unit cases cover CSV dialects/quotes/encoding, Buddhist/explicit dates, strict amounts/directions, duplicates/limits, safe exported notes and Excel date/decimal/ZIP validation.
- Browser replacements cover settings saving/reload, removal of account calls, CSV preview/confirmation/cancellation, retained tax/local rows, duplicate consent, Excel date cells, malformed rows/manual mapping and offline Excel after production worker precache. Six accessible light/dark layouts captured at 390/768/1280; no axe violations or page overflow reported. Proof: `output/playwright/statement-{light,dark}-{390,768,1280}.png`.
- Five obsolete account UI browser cases were replaced to match the authorized feature removal; their original text is preserved in `retired/account.spec.ts.txt`. Security unit fixtures for the historical unserved server remain. Current build has no cloud hook, account UI or `/api/ledger` entry point; no provider resources/environment secrets were changed.
- SHA-256 of `tax.ts`, `extendedTax.ts` and `vercel.json` unchanged. All Statement fixtures are synthetic; no personal bank file used. Generic CSV/XLSX support is not a bank-by-bank export certification.
- READY `dpl_6ZP6tJiygxHsbtcin6j62CG3MkYj`, immutable `https://mytax-8ne7d8zfy-aaaa1-03d3.vercel.app`, alias `https://mytax-indol.vercel.app`. Public ledger200 serves `index-Chu6ASIG.js`/`index-mXWQaCOF.css`; removed API returns404; original CSP confirmed. Live isolated Chrome verified settings → บันทึก, two-row CSV append, Excel date/decimal preview under production CSP, cancellation retaining entries, no account/POST/external requests, no page errors or mobile overflow. Evidence: `output/playwright/statement-live-settings-dark-1280.png`, `statement-live-ledger-dark-1280.png`, `statement-live-preview-light-390.png`.

## Edge-to-edge opening artwork — 2026-10-04

- Three decorative baht coins bounce with staggered timing; two edge-anchored charts draw green rising and red falling paths. The orbit SVG fills the viewport without aspect-ratio gutters. No market-data feed, added assets, external calls or formula changes.
- 63 unit and 49 full browser cases passed. Both intro cases re-passed after replacing resolution-dependent SVG dashes with a clip reveal to avoid broken lines on wide screens. Lint, formatting and production/PWA build passed.
- Opening screenshots reviewed at 390/1280/1920 in both themes: `output/playwright/intro-artwork-{light,dark}-{390,1280,1920}.png`. Browser assertions cover full-width dialog/chart edges, exactly three coins, green/red strokes, no horizontal overflow and no coin/logo overlap. Existing handoff, no visible skip button, once-per-tab replay, Escape and reduced-motion checks remain.
- SHA-256 of `tax.ts`, `extendedTax.ts` and `vercel.json` unchanged from the prior release.
- READY release `dpl_Fh5Y2A5TjLRdDqK6idmHf3UynZXA`, immutable `https://mytax-nlxjl1yz8-aaaa1-03d3.vercel.app`, public alias `https://mytax-indol.vercel.app`. Public HTML200 serves `index-DnKItoKZ.js` and `index-BJ5TgsL3.css`. Isolated live Chrome checks at 1920-dark and 390-light verified three coins, both chart edges, continuous orbit strokes, no horizontal overflow and automatic handoff to the hero. Proof: `output/playwright/intro-artwork-live-dark-1920.png` and `intro-artwork-live-light-390.png`.

## Current reading / account / opening validation — 2026-10-04

Opening follow-up: removed the visible skip button and replaced immediate removal with a 1.1-second transparent-backed dissolve. Hero animation resumes at the start of the reveal, and identity/caption fade sooner to reduce overlapping text. Escape and reduced motion retained. 63 unit/48 full browser cases passed; dedicated intro case re-passed after final CSS content-fade refinement, with format/build passing. Inspected mobile/desktop transition frames in both themes.

Follow-up READY release: `dpl_5SkGVyhZA3c3jSnvFdCCMSQE6g7V`, immutable `https://mytax-k7qraeyct-aaaa1-03d3.vercel.app`, public alias unchanged. Public HTML200 contains `index-BXLUl-S3.js` and `index-BaGqVx3c.css`; ledger API remains200/configuredfalse. Live mobile-light/desktop-dark checks captured actual intermediate opacity, completed auto-reveal, absence of the skip button and no horizontal overflow. Proof: `output/playwright/intro-live-handoff-dark-1280.png` and `intro-live-handoff-light-390.png`. Tax and CSP hashes unchanged.

63 unit tests and 48 full browser tests passed, plus six affected browser cases after the server packaging repair. Lint, client/server type checks, formatting and production/PWA build passed. Current READY release: `dpl_EPBoqSdNEMBkFV4T2UZQH1Bd99Nb`. Public API now fails closed as intended. SMTP and live RLS verification remain pending; online login/sync is disabled. Detailed evidence is in the reading/account/opening section below and `LEDGER-ACCOUNT.md`.

## Earlier language / UX revision — 2026-10-04

Canonical workspace: `C:/Users/User/OneDrive/Documents/ChatGPT/MyTax`. The older path and counts below describe historical releases.

- Unit tests 54/54; full Chromium suite 38/38; final screenshot matrix 6/6 rerun after stabilizing animation captures. Lint, format check and production build passed.
- Every route captured at 390/768/1280 in light/dark; each of the three story scenes captured at 390/1280 in both themes. Reviewed Thai combining marks, fixed mobile actions and absence of horizontal overflow. Existing self-hosted fonts and licenses retained without new font files.
- Tax formulas unchanged by SHA-256 comparison. Only `/about` added to hosting rewrites; existing CSP retained and verified on all 12 public routes/assets checked.
- Production READY `dpl_GmwL3JzJmBXUUfGHuJdvmn4vzSGV`; alias https://mytax-indol.vercel.app; new OG 1200x630 and static/noscript fallback verified. Live about route reload: one header, seven FAQs, zero page errors.
- Complete item-by-item report: `UX-REVIEW-2026-10-04.md`. Creator and feedback address remain explicit owner-supplied TODOs in `siteContent.ts`.

Date: 2026-10-03. Canonical project: `C:/Users/User/OneDrive/Desktop/Hamster Project`.
All browser fixtures are synthetic in isolated Chromium profiles. No user financial records were used.

## Completed local checks

| Check | Result |
|---|---|
| `npm test` | 47 passed, including all original 19 cases |
| `npm run lint` | Passed ESLint and TypeScript strict/unused checks |
| `npm run build` | Passed; Vite production build plus worker precache generation, 21 static assets |
| `npm run format:check` | Passed |
| `npm run test:e2e` | 26 passed in Chromium in 43.9s |
| `npm audit --omit=dev` | 0 reported vulnerabilities |

Unit fixtures independently calculate base 2568/2569 tax, family/adoption/parent allowances, mortgage ceiling, pre-expense PVD/GPF treatment, retirement sharing, Thai ESG percentage ceiling, donation order and marginal boundaries. Original money/band/CSV/date tests remain. Added schema 2→3/settings recovery/JSON roundtrip and monthly/weekly/year calendar/deduplication tests.

## Browser verification

- Complete four-step 2568 fixture: tax 20,100 / estimated refund 11,900. 2569 with actual M33 10,500: 19,950 / 12,050.
- Empty result guard, skip-link route preservation, Back/Forward step history, focus on steps/results/hidden eligibility, comma and pending decimal entry, annual/monthly view non-mutation.
- Manage/pause/reload, confirmed clear/delete, actual JSON/CSV downloads, strict malformed import, salvage without silent overwrite, unknown future schema untouched, original recovery before replacement, other-tab CAS conflict, first-entry saving offer and cancelled unsaved reload.
- Extended family fixture net 370,000 → tax 14,500; mortgage confirmation error reveals/focuses correct card. Unsupported scope answers show warnings. Explicit salary import includes only selected-year salary entries and warns about net/gross.
- Custom category creation, recurring template persistence, due preview with explicit confirmation, no duplicate rounds on reload, deletion undo, search/type/category/year views.
- Real-plan Thai ESG guide replacement trial and result; SSF educational with no fabricated new-year allowance.
- Theme follows system, explicit choice survives reload. 390×844 tax/ledger/guide fit without horizontal overflow; dark family card visually inspected.
- Axe WCAG A/AA automated scans have no reported violations on homepage, all four tax steps, ledger, guide, each expanded deduction card and ledger entry dialog, in both light/dark themes. Keyboard/history/focus checks are separate. This is not a full WCAG or human screen-reader certification.
- Production preview worker installation/cache verified. Network disabled, then full page reload succeeds; saved ledger, tax input, and previously unvisited lazy guide all work offline. No TTF in precache; no external-origin requests in this flow. Earlier privacy E2E also verifies app pages make no external requests. No finance data enters the static cache.

## Artifacts

- `output/playwright/home-light.png`, `home-dark.png`: homepage and demo, visual review completed.
- `output/playwright/extended-mobile-dark.png`: expanded family card on mobile.
- `output/playwright/offline-production.png`: full reload with network disabled.
- `output/playwright/tax-2569.png`: independent 2569 result.
- Playwright failures retain traces/report for diagnosis. Test artifacts are excluded from deployment.

## Scope and release limits

Tax scope and source verification are in `TAX-RULES.md`; current product limits are in `PROGRESS.md`. No ZIP was changed or created. Runtime `.env*` values were not read or included. CI is configured, but no remote CI run is claimed.

## Production verification

Release ID, public HTTP/security checks, and live smoke evidence are appended after deployment. Existing alias: https://mytax-indol.vercel.app.


Published 2026-10-03: `dpl_9VhgWpugyUbEkGZis7CUKL7xCPY3`, READY, production alias assigned to https://mytax-indol.vercel.app.
Immutable deployment: https://mytax-owgnj2gsk-aaaa1-03d3.vercel.app.

Anonymous HTTP verified 200 for homepage, current `index-jtL-JtJZ.js` / `index-Ca2z2RHz.css`, manifest, worker, social image, all three icons and regular body WOFF2. Assets are immutable; worker is must-revalidate. CSP, nosniff, DENY, referrer and permissions headers present. `/.env.local` and `/.vercel/project.json` return 404.

An isolated browser on the live public alias confirmed default year 2569, 7 scope questions, dark mode, Thai ESG trial, ledger search/year controls and a controlling production service worker. No page errors and no external-origin requests were reported. Live proof screenshot: `C:/Users/User/OneDrive/Desktop/GPT/2026-10-02/thai-tax-investment-rules-skill/outputs/MyTax-release-live.png`.

## Beginner UX release — 2026-10-03

Canonical source is now C:/Users/User/OneDrive/Documents/ChatGPT/MyTax. The previous project was copied without environment/token files.

- 49 unit tests passed, including final-only scope confirmation and unknown/no backup distinction. Existing tax fixtures still pass.
- 26 browser tests passed in 48.4s after correcting dark-mode demo-choice contrast. Adapted selectors follow the new settings/filter panels and friendly export names. Scope test now traverses income → deductions → final review → result and verifies unknown state, reset confirmation, blocked unconfirmed result, warning, next action, and hidden marginal rate.
- Lint/TypeScript, production build, and final format check passed. Vercel npm ci reports zero vulnerabilities.
- CLI visual inspection: mobile income hints, simulated payslip, empty ledger, short/full demo. Images: mobile-income-hints.png, mobile-ledger-empty.png, mobile-salary-slip.png under output/playwright/.
- Human testing with 3–5 newcomers has not happened. Automated checks do not establish that all beginners understand the product.

Deployment dpl_Hw8nXvYRBH5WUSYmwJi3h19dTvQm READY. Public alias https://mytax-indol.vercel.app. Anonymous HTTP 200 for index-BPil6Mn_.js / index-BxEhg0Ez.css, manifest and worker; CSP/nosniff/frame headers present. Environment and Vercel metadata URLs return 404. HTTP evidence: output/playwright/live-ux-http.json.

Live isolated browser confirmed the deployed demo banner and short/full choices, income without scope questions, empty ledger actions before collapsed filters, existing-rights category selected and social contribution displayed first. Browser console error check completed.

## Green/red theme release — 2026-10-03

- 49 unit tests passed; tax and storage logic were unchanged.
- 26 browser tests passed in 51.8s, including light/dark contrast checks, mobile, offline, ledger and tax flows.
- Removed obsolete positional expense-colour rules found during visual inspection. Follow-up accessibility tests passed (4 tests, 25.6s); final demo balance colours and direct-route styles passed (3 tests, 18.9s).
- Formatting and ESLint/TypeScript passed; browser suite production build/PWA generation passed.
- CLI inspected synthetic income/expense entries on desktop and 390px mobile in both themes. Dark body computed rgb(0, 0, 0); income rgb(99, 223, 152), expense rgb(255, 113, 137). Light income rgb(24, 115, 68), expense rgb(193, 43, 69).
- Colours apply to amounts, signed cash-flow net, entry controls, bars, category graph, refund/payable balances and guide/demo comparisons. Labels/signs remain. See COLOUR-THEME.md and output/playwright/colour-ledger-*.png.

Deployment dpl_8f4TR3AoUyEzxpeUj3CQ8Mc1qq76 READY; alias https://mytax-indol.vercel.app. Immutable https://mytax-pz6yf4gf0-aaaa1-03d3.vercel.app. Anonymous HTTP 200 for root, current index-BzIcyjhZ.js / index-BbzKitz1.css, manifest and worker. CSP, DENY, nosniff and cache headers present; environment and Vercel metadata paths return 404. Evidence: output/playwright/live-colour-http.json. Vercel npm ci reports zero vulnerabilities.

Live isolated browser verified dark body rgb(0, 0, 0), neutral panel rgb(18, 18, 18), income green, expense red and active production worker. Synthetic result showed 11,900 refund in green, then 20,100 additional tax payable in red after setting withheld amount to zero. A negative cash-flow scenario was checked separately. Console reported zero errors/warnings. Screenshot: output/playwright/colour-live-dark-mobile.png. No data was sent to an external backend.

## Clean page URLs — 2026-10-03

- Replaced fragment navigation with history paths: /, /tax, /tax/2, /tax/3, /tax/4, /ledger, /reduce and /demo. Old fragment bookmarks and aliases normalize using replaceState; query strings remain. Result validation still redirects incomplete plans to /tax.
- Vercel has explicit rewrites for page paths; asset and sensitive metadata paths are excluded. PWA start_url is / and its existing offline navigation shell fallback is retained.
- 49 unit tests passed. The route test covers canonical paths, aliases, invalid steps, ignored anchors and legacy bookmarks.
- 27 browser tests passed in 59.0s. All clean paths open and reload, every old bookmark migrates, query strings survive navigation/history, saved ledger survives, and offline ledger/guide reload works. Existing calculation, storage, mobile and light/dark accessibility regressions passed.
- ESLint/TypeScript, formatting, production build and PWA generation passed. CLI confirmed legacy /#ledger becomes /ledger, navigation to /reduce and refresh keep the route without a hash.
- Route mapping and implementation notes: URL-ROUTING.md.

Final deployment dpl_4QkadZfnxhR7LSoaWyVyxFFvfkMm READY, immutable https://mytax-dceu00s9o-aaaa1-03d3.vercel.app, alias https://mytax-indol.vercel.app. Live checks caught a trailing-slash 404; setting trailingSlash: false corrected this without changing app logic. Final anonymous HTTP check passed for every page/alias and its trailing-slash variant, each loading the same current shell. /tax/2/ returns 308 to /tax/2, then 200. Entry assets, manifest and worker return 200; manifest start_url is /. Metadata and missing asset paths still return 404, security headers present. Evidence: output/playwright/live-path-http.json. Build npm ci reports zero vulnerabilities.

CLI live browser confirmed /#reduce becomes /reduce and reloads correctly, /ledger opens/reloads directly, /tax/2/ redirects to /tax/2 and reloads on the deductions page, with an empty URL hash. Console check reported zero errors/warnings.

## Entrance animation — 2026-10-03

Added CSS-only fade/up entrance to selected heading, action and primary surface elements. Sequence completes within 500ms of mounting, moves 8px and runs once. No dependency, data, calculation or routing changes. Reduced-motion media and print skip the new effects.

Formatting, lint/TypeScript and build/PWA passed. Seven relevant existing browser tests passed in 32.5s: light/dark home and expanded-form accessibility, tax/ledger/guide accessibility, mobile/theme persistence, wizard history, and first ledger entry/saving. The unchanged 49-unit/27-browser baseline is from the preceding routing release; the full suite was not repeated for this CSS change.

CLI saw an actual running heading animation at 110ms (opacity 0.91894); final state was opacity 1 with no active entrance animation. Duration/offsets and iteration count 1 were verified. Switching to reduced motion gave animationName none and opacity 1. Mobile screenshot reviewed: output/playwright/entrance-home-mobile.png.

Deployment dpl_5tg6h2C2Ga4gSjK7vyNGYKC3zuJS READY; alias https://mytax-indol.vercel.app; immutable https://mytax-ky17czeys-aaaa1-03d3.vercel.app. Anonymous HTTP 200 for all main pages, manifest, worker and index-G0rP2M0d.js / index-DmNK8A0O.css, with the entrance keyframes present. Evidence: output/playwright/live-entrance-http.json. Live browser saw mytax-arrive running on the home heading (380ms, one iteration); console had zero errors/warnings. Vercel npm ci reports zero vulnerabilities.

## Layered financial hero — 2026-10-03

- Added a native SVG/HTML wallet scene with income, deduction and tax-receipt layers, a one-shot 2.65s introduction, replay/pause controls and small mouse parallax. Existing calculator/ledger buttons remain immediately usable. No character asset, animation dependency or rule change.
- The illustration uses the existing calculated 2568 demo plan and has a sample label and screen-reader description. Reduced-motion mode shows the static scene; offscreen/document visibility pauses the introduction.
- 27 existing browser tests passed in 1.4m, including light/dark axe checks, calculations, persistence, direct routes and production offline behavior. Three follow-up home accessibility/mobile tests passed in 24.9s after spacing adjustments. The prior 49 unit-test baseline was not repeated because calculation/storage logic did not change.
- CLI caught overlapping mobile deduction amounts and temporary horizontal overflow during an incoming animation. Larger mobile spacing and stage clipping corrected these. Subsequent 320px inspection confirmed no horizontal overflow while animated.
- CLI pause preserved animation time at 316.638ms, resume completed, offscreen state was paused, replay worked, and reduced-motion yielded animationName none/opacity 1. Desktop mouse offsets were x 4.2px / y -1.5px, with the receipt moving 1.8x those offsets. Evidence images: output/playwright/layered-desktop-light.png, layered-mobile-dark-detail.png and layered-mobile-320.png.
- Formatting, lint/TypeScript and production build passed. Deployment evidence follows after publication.

Final deployment dpl_GhtKsM57gUypVD5vS11MYUaBsxKt READY; immutable https://mytax-ftt1ep39u-aaaa1-03d3.vercel.app; public alias https://mytax-indol.vercel.app. The first deploy attempt returned Not authorized; explicitly selecting the existing aaaa1-03d3 scope succeeded without re-login or changing the project. Vercel npm ci reported zero vulnerabilities.

Anonymous live HTTP returned 200 for root, tax, deductions, ledger, guide, demo, manifest, worker and index-B9G6vh8w.js / index-BzmSZK46.css; the new hero keyframes are present. Evidence: output/playwright/live-layered-hero-http.json. An isolated public browser confirmed the hero, sample amounts, replay control, and navigation to the monthly salary form at /tax. Console reported zero errors/warnings. Screenshot: output/playwright/layered-live-desktop.png.

## Smooth theme drawer — 2026-10-03

Replaced the settings details/native select with a compact hover drawer and explicit system/light/dark buttons. Desktop opens leftward, mobile opens below and remains inside the viewport. Click toggles/pins, Escape and outside click dismiss, and hidden controls are inert. Existing local preference and installation/update logic remain. See SETTINGS-DRAWER.md.

Five existing browser checks passed in 49.9s: home/expanded/entry accessibility in both themes, theme persistence/mobile fit, and accessibility of the calculator/ledger/guide in both themes. Two follow-up light/dark checks passed in 31.5s with the expanded theme drawer included in axe scans. Formatting, ESLint/TypeScript and production build passed. No calculation/storage changes; unit suite was not repeated.

CLI confirmed hover-open and gap crossing keep aria-expanded true, Escape/outside click set it false, theme selection updates the root and the mobile drawer fits. Install help opens separately. Dark selected text is rgb(99,223,152) over rgb(18,18,18). Screenshots are output/playwright/settings-*.png. Deployment evidence follows after publication.

Keyboard verification waited for the drawer to become visible: Enter opened it, Tab reached “ตามเครื่อง”, Enter selected it, and changing simulated OS preference updated the root from light to dark. At 320px the panel was inside x 85–300, no horizontal overflow; reduced-motion transition duration was 0s.

Deployment dpl_HtigHvWk1zuAePBVMCycxnAPSGVd READY; public alias https://mytax-indol.vercel.app; immutable https://mytax-lvw3zakw8-aaaa1-03d3.vercel.app. Vercel build/npm ci passed with zero reported vulnerabilities. Anonymous HTTP checks returned 200 for main pages, manifest, worker and index-CMRIWuFF.js / index-CnHZmCVv.css, with drawer styles present. Evidence: output/playwright/live-settings-http.json. Live isolated browser confirmed hover-open, light selection/root theme, no native theme dropdown, and Escape dismissal. Screenshot: output/playwright/settings-live-desktop.png.

## Scroll story homepage — 2026-10-03

- Preserved the existing Hero and settings. Replaced the large homepage DemoStudio with a scroll-controlled, pinned three-part story and final CTA. Details: SCROLL-STORY.md. The original interactive demo is no longer in the production bundles; /demo remains a static example result.
- Graphics show existing sample calculations, not editable user fields. The RMF scene states both tax savings and extra expenditure. No calculation, storage or routing code was changed.
- The 27-browser suite initially passed 24 tests in 51.1s. Two homepage axe checks identified a half-opacity cursor label with low contrast; removing the opacity corrected it. The PWA test needed to select the main-navigation ledger button explicitly because the preserved Hero also has a ledger button. Those three tests passed on rerun in 19.4s, including complete production offline reload.
- CLI desktop/390px/320px inspection confirmed the pinned stage top 0, all chapter transitions, reverse scrolling, exact sample amounts 20,100 → 17,100, extra cost 30,000, and no horizontal overflow at small widths. Reduced-motion mode exposes all three scenes with position relative/opacity 1, and live preference changes work. The CTA navigates to /tax and shows the monthly salary form.
- Formatting, lint/TypeScript and build/PWA passed. Prior 49-unit baseline remains; the unit suite was not repeated for this presentation change. Evidence: output/playwright/story-desktop-*.png, story-mobile-*.png and story-finish-mobile.png. Publication evidence follows below.

Deployment dpl_KJWiUoRJj8bqLsKzRN1JbePnLNye READY; immutable https://mytax-j4ugkc13f-aaaa1-03d3.vercel.app; alias https://mytax-indol.vercel.app. Vercel npm ci reported zero vulnerabilities. Anonymous HTTP returned 200 for main page routes, manifest, worker and index-BTO9j-un.js / index-DiLFCMBZ.css, with story CSS present. The old DemoStudio is absent from the worker cache list. Evidence: output/playwright/live-scroll-story-http.json.

Live isolated browser verified the preserved Hero, chapter 0, wheel scrolling to chapter 1, RMF comparison 20,100 → 17,100 at chapter 2, and the final CTA opening /tax. Screenshot: output/playwright/story-live-trial.png. No console errors/warnings reported.


## Homepage opening and closing — 2026-10-03

- Moved the preserved wallet Hero and calculator/ledger entry buttons below the scroll story. Added a centered opening with money/ledger SVG illustrations, faint background lines and restrained entrance/mouse movement. Each story chapter has a short explanatory paragraph. See HOMEPAGE-OPENING.md.
- Four relevant existing browser checks passed in 20.0s: homepage/expanded accessibility in light and dark themes, mobile layouts/theme persistence, and production PWA offline reload. Final formatting, ESLint/TypeScript and production build passed. Calculation/storage logic is unchanged; unit tests were not repeated for this presentation change.
- Manual CLI checks: one h1; opening/story/closing DOM order; opening invitation scrolls to story top; closing buttons navigate to /tax and /ledger. At 375x667 a static sequence avoids collisions; at 320x740 the animated comparison card ends at y653 before chapter buttons at y684, with no horizontal overflow. 390x844 screenshots were reviewed for opening and preserved closing.
- Desktop mouse offsets observed x3.60px/y-0.56px. Live reduced-motion switching resets x to 0px, removes entrance animation and sets artwork transition to 0s. Screenshots: opening-desktop-dark.png, opening-mobile-dark.png, opening-story-desktop.png, opening-short-mobile.png, opening-story-320.png and opening-closing-mobile.png under output/playwright.


Deployment dpl_7pZ7FxBSJhQy3juBF6duK2sjGMok READY; immutable https://mytax-muqi9usky-aaaa1-03d3.vercel.app; public alias https://mytax-indol.vercel.app. Vercel npm ci reported zero vulnerabilities. Anonymous HTTP returned 200 for root, tax, ledger, reduce, manifest, worker and index-BZBQkw3x.js / index-DEbNuS_V.css, with opening styles present. Evidence: output/playwright/live-opening-http.json.

Live isolated browser verified the new h1, opening → story → original Hero order, invitation scroll, chapter 3 explanation and closing calculator navigation to /tax. Screenshot: output/playwright/opening-live-desktop.png.
Live production console reported zero errors and zero warnings.


## Navigation feedback, page transitions and home sticky header — 2026-10-03

- Added green menu hover feedback, progressive page transitions and a homepage-only sticky header. Story height/progress/chapter jumps account for the measured header. Details: NAVIGATION-MOTION.md.
- Five initial relevant browser checks passed in 18.6s. The subsequent full 27-case run passed 26 in 59.9s and caught the deduction-trial result navigation racing a plan update. Moving the URL update into the same commit as route state fixed it; the failing guide case plus Back/Forward, all direct/legacy paths and production offline checks passed on rerun (four cases in 19.1s). No test expectations were weakened.
- CLI observed native page-enter/page-leave animations at 260/160ms, a stable independently animated menu layer, and no loading placeholder in the first deduction-guide transition. Rapid consecutive menu clicks ended on the latest requested page. Back/Forward returned to the same calculator step and the entered 600,000 annual salary remained.
- Reduced motion showed no View Transition animations; simulating API absence produced a 240ms fallback. Header position was sticky on home and relative on ledger. Desktop stage starts at y92 below the header ending at y80. Mobile 390x844 copy and comparison remain below the header and above chapter buttons; 320x740 uses static scenes with copy starting below the header. Actual document scrollWidth/clientWidth at 320px were both 305 after accounting for the scrollbar.
- Screenshots: nav-hover-desktop.png, nav-hover-dark.png, nav-story-desktop.png, nav-story-mobile.png and nav-story-320.png. Publication evidence follows after deployment.
Follow-up: first live guide opening still briefly showed the lazy fallback. A stable guide wrapper now uses the preloaded component on navigated visits and preserves the lazy component choice for direct visits, avoiding state resets. Four guide/accessibility/offline checks passed in 18.6s after this change; CLI at transition.ready confirmed guide=true and loading=false. Formatting and lint/TypeScript passed.


Final deployment dpl_Cdr1J5daJBbEake4iUsLf3jFr77W READY; immutable https://mytax-bey3rb2id-aaaa1-03d3.vercel.app; alias https://mytax-indol.vercel.app. Vercel npm ci reported zero vulnerabilities. Anonymous HTTP 200 for main routes, manifest, worker and index-BOGebjgS.js / index-BOoRBkTD.css, with sticky-header and page-enter styles present. Evidence: output/playwright/live-navigation-http.json.

An isolated production browser confirmed green hover ring/text, homepage sticky top12px, 260ms page-enter, guide=true/loading=false at transition.ready, and a relative header on the guide. Console reported zero errors and zero warnings. Screenshot: output/playwright/nav-live-story.png.


## Slower layered opening entrance — 2026-10-03

- Extended the opening from 650–1,000ms to a 2.4s staggered sequence. Headline lines enter separately; money and ledger enter from opposite sides with a small rotation/scale; background details reveal gradually. The button remains fully visible and enabled. Reduced motion and printing disable all opening animation.
- Four existing relevant browser checks passed in 20.9s: home/expanded light and dark accessibility, mobile/theme behavior and production offline reload. Formatting, lint/TypeScript and the PWA build passed. No navigation, calculation or storage implementation changed.
- CLI verified one iteration per animation, 1.4s headline with 220ms stagger, 1.8s artwork with 300/600ms delays, and 2.4s background. At 320px clientWidth and scrollWidth are both 305. Reduced motion gave zero opening animations and opacity1 for the title/art; the invitation still scrolls to the story. Midpoint and settled desktop/mobile screenshots: output/playwright/entrance-paced-*.png.


Deployment dpl_DAGnJDPAD51bJrCiBYE2w9v7KavP READY; immutable https://mytax-e17ijhl5x-aaaa1-03d3.vercel.app; alias https://mytax-indol.vercel.app. Vercel npm ci reported zero vulnerabilities. Anonymous HTTP 200 for main pages, worker and index-DlAV2d2N.js / index-Cqrz-zvm.css. The CSS uses minified 2.4s rather than 2400ms; the evidence check accepts both. Evidence: output/playwright/live-paced-entrance-http.json.

Live isolated browser confirmed 1.8s ledger entrance with 0.6s delay, 2.4s background reveal, final opacity1 and zero running opening animations after completion. No console errors/warnings. Screenshot: output/playwright/entrance-paced-live.png.


## Cinematic opening pullback — 2026-10-03

- Replaced the staggered fade/slide with a close-up resolving into the final composition over 3s. A separate artwork-camera layer, oversized money/book rotations, two native baht coins, a curved-line draw and masked headline reveals provide depth. Existing final layout, navigation and tool entry buttons remain. No asset download or animation dependency. See HOMEPAGE-OPENING.md.
- Four existing relevant browser cases passed in 17.9s: light/dark homepage/expanded accessibility, mobile/theme behavior and production PWA offline reload. Lint/TypeScript, formatting and production build passed. No calculation, persistence or routing logic changed.
- CLI verified single iterations: 3000ms camera/background; 2600ms book/money with 400/200ms delays; 2000ms headline reveals with 400/650ms delays. At 320px actual clientWidth and scrollWidth are both 305. Early/mid/final desktop and mobile screenshots were captured under output/playwright/cinematic-opening-*.png.
Follow-up CLI after a normal reload: at 3.3s the camera and title transforms are identity and no opening animations are running. Reduced motion produces zero animations with transform none. Focusing the invitation during the sequence reveals the title immediately, the button remains enabled, and its action scrolls to the story below the header. Settled mobile/light and mobile/dark screenshots were reviewed.


Deployment dpl_AkH5ncVjVd5aodArHh9NS5ezp28v READY; immutable https://mytax-41mcj47lq-aaaa1-03d3.vercel.app; alias https://mytax-indol.vercel.app. Vercel npm ci reported zero vulnerabilities. Anonymous HTTP 200 for main pages, worker and index-ROUX1Kq-.js / index-D77yzlTl.css, with camera/headline keyframes present. Evidence: output/playwright/live-cinematic-opening-http.json.

Live isolated browser confirmed the 3s single-iteration camera, settled identity transform, two coins, no running opening animation after completion, viewport fit and invitation scroll. Console had zero errors/warnings. Screenshot: output/playwright/cinematic-opening-live.png.


## Full-width opening and stronger landing — 2026-10-03

- Removed the content-column crop by making the opening naturally viewport-wide and wrapping the story/closing tools in their original 1180px column. Removed headline reveal masks. Added a brief close-up hold, faster pullback, small settling overshoot and faint expanding ring. Existing tool/navigation/data behavior is unchanged.
- Four relevant existing browser checks passed in 18.8s: light/dark home and expanded accessibility, mobile/theme behavior and production offline reload. Lint/TypeScript passed. Final small coin inset changes were verified manually at 320, 768 and 1280px.
- CLI verified opening left0/right=clientWidth, no horizontal overflow at 320/390/768/1280/1704px, one h1, 2600ms camera and zero running opening animations at 3s. Reduced motion gives zero opening animations; invitation still scrolls to the story. Coins remain within the scene from the first frame at 320x740, 768x844 and 1280x800. Early/mid/settled screenshots reviewed: output/playwright/full-opening-*.png.

Deployment dpl_BVemvtRK1xLdQmogSm8tJaeG6cVJ READY; immutable https://mytax-libjs8o31-aaaa1-03d3.vercel.app; alias https://mytax-indol.vercel.app. Vercel npm ci reported zero vulnerabilities. Anonymous HTTP 200 for main routes, worker and index-B3xuCRdQ.js / index-ocZbxrTg.css. Evidence: output/playwright/live-full-opening-http.json.

An isolated live browser confirmed the opening spans x0 to clientWidth1689 on a 1704px viewport, scrollWidth=clientWidth, no headline masks, 2.6s camera and zero running animation after 3s. Console had zero errors/warnings. Reviewed screenshot: output/playwright/full-opening-live.png.


## Scroll-selected scenes with independent amount playback — 2026-10-04

- Kept the original long pinned track and scroll-based scene crossfades. Income/tax/trial amounts now animate on entry for 1400/1400/1600ms, then hold. Waiting never changes the chapter. No playback controls. Returning to a completed or fast-skipped started scene shows its final values; tool navigation preserves completion for this page load, refresh resets it.
- Five existing browser checks passed in 20.0s: light/dark homepage/expanded accessibility, mobile/theme behavior, direct home/result styling and production PWA offline reload. Lint/TypeScript, formatting and the PWA build passed.
- Isolated CLI verified income 3,316→50,000 with no additional scrolling, chapter0/scroll839 unchanged while waiting, tax 3,304→20,100, and trial savings3,000. Backward navigation immediately restored50,000; tool navigation retained it. Refresh reset typed progress to0 and the next entrance showed3,038 before completing. A mid-animation fast scroll returned with the completed50,000. No story playback controls were present.
- 390x844 played normally and had no horizontal overflow; reduced motion displayed all three scenes at opacity1. Desktop and mobile final screenshots reviewed: output/playwright/once-story-*.png. Earlier headed QA was repeated in an isolated headless CLI browser because background windows suppressed animation frames. Publication evidence follows.

Short-screen follow-up at320x740 after the resize commit: data-reduced=true, all scenes relative/opacity1, and no horizontal overflow.

Deployment dpl_AHfb6CuXphSAVmtpUB7wnzyrTCN1 READY; immutable https://mytax-8sln7buw4-aaaa1-03d3.vercel.app; alias https://mytax-indol.vercel.app. Vercel npm ci reported zero vulnerabilities. Anonymous HTTP200 for main routes, worker and index-zc47vGhj.js / index-ocZbxrTg.css; original310svh/300svh track retained. Evidence: output/playwright/live-once-story-http.json.

Live isolated CLI confirmed income3,316→50,000 while stationary, tax20,100 in chapter1 at scroll1830 unchanged after waiting, backward return showing50,000 and no playback controls. Console had zero errors/warnings. Screenshot reviewed: output/playwright/once-story-live.png.


## Themed tax-year choices — 2026-10-04

- Replaced the native tax-year select with two explicit Settings-style rounded choices, selected green outline/tint, current/year-review purposes, and neutral theme surfaces. Year change preserves amount fields and resets eligibility confirmations as before; re-selecting the same year does not reset them. Other dropdowns are unchanged.
- Six relevant existing browser cases passed in23.8s: light/dark homepage/expanded accessibility (now also tax step1), mobile/theme layout, production offline reload, default year and wizard Back/Forward, and2569 planning result. The existing default-year assertion checks aria-pressed on the selected year rather than a removed select; no behavior expectation was weakened. Lint/TypeScript, formatting and PWA build passed.
- CLI verified Space selects2568, Enter selects2569, year tag updates, and entered monthly50,000 remains. At768/390/320px scrollWidth=clientWidth; each choice is at least63px high. Reduced motion gives0s transition and there is no native year select. Light/dark desktop and mobile screenshots reviewed under output/playwright/year-choice-*.png. Publication evidence follows.

Deployment dpl_2yLCnHi8K56U6EsnJZoLDS2P55BA READY; immutable https://mytax-l6asynhtz-aaaa1-03d3.vercel.app; alias https://mytax-indol.vercel.app. Vercel npm ci reported zero vulnerabilities. Anonymous HTTP200 for main pages, worker and index-AmfkslRf.js / index-BpHrxbx3.css with year-options styles present. Evidence: output/playwright/live-year-choice-http.json.

An isolated live browser confirmed two year buttons, selection updating the year tag to2568 then2569 via keyboard, no native year select, and zero console errors/warnings. Screenshot reviewed: output/playwright/year-choice-live-dark.png.

## Clear result summary — 2026-10-04

- One headline amount replaces the two metric cards. Green refund/red payable/neutral settled or unknown states are labelled in words. Known balances show annual tax minus prepaid tax; unknown withholding displays annual tax only and links to step3. Calculation details are initially closed; warnings/disclaimer remain visible.
- Original full browser suite:26 passed; one direct-styling assertion still referenced the removed reduce banner. Updated that assertion to check the new summary's border and amount layout, retaining its direct-route CSS-loading purpose. Existing financial assertions now target the new summary, without changing expected amounts. Added four-state, keyboard-disclosure, print-state and storage-preservation coverage in the existing reliability spec; extended light/dark axe checks to collapsed and expanded results.
- Targeted four tests passed in23.9s (both-theme accessibility, direct styling, four result states). Formatting and ESLint/TypeScript passed. Final print/PWA follow-up is recorded below.
- Isolated headless browser reviewed desktop light/dark,390px light and320px dark screenshots. No horizontal overflow at390 or320px, including699,433,099.99 at the supported input ceiling. Unknown prepaid tax, zero,20,100 payable and11,900 refund are independently expected from the existing fixture.
- PDF generated after the page was ready:3 pages with annual20,100/refund11,900, calculation/deduction/band/source details and scope warning. Dark-screen print colors were corrected to dark ink; print disclosures return to their prior state. PDF render reviewed. Screenshots/PDF: output/playwright/result-summary-*.png and result-summary.pdf. No console errors or warnings in isolated local QA; only development React informational entries.

Final five relevant cases passed in26.6s, including production PWA offline reload and both-theme accessibility. Final print warning verified as rgb(17,17,17) on rgb(255,255,255), display:block. An intermediate CLI PDF used explicitly emulated screen media; discarded and regenerated with media:null. The final live dark-theme PDF has3 pages, complete calculation tables/sources and restored closed disclosures; render reviewed.

Deployment dpl_ADWGcv79huzms6sm8KuVR112kCcv READY; immutable https://mytax-fq698frsy-aaaa1-03d3.vercel.app; alias https://mytax-indol.vercel.app. Build/npm ci completed with zero reported vulnerabilities. Anonymous HTTP200 for /, /tax, /demo, /ledger, /reduce, worker and index-BCyeC6OC.js / index-CE-tc7V0.css; result CSS present. Evidence: output/playwright/live-result-summary-http.json. Live isolated browser confirmed11,900 refund, initially hidden chart, chart visible after disclosure, and button navigating to /reduce, with zero page errors. Light/dark live screenshots reviewed.

## Secondary income and deductions — 2026-10-04

- Added visible annual income and usable deductions under the prominent answer. Fixture shows660,000 income and134,000 deductions; values come from the unchanged calculation result. No new charts or cards.
- Three existing browser cases passed in23.0s: both-theme result accessibility (collapsed/expanded) and all four answer states with print/disclosure/data preservation. Formatting, ESLint/TypeScript and production PWA build passed.
- Isolated CLI confirmed96px tax vs22px secondary amounts on desktop, and320px layout with scrollWidth=clientWidth. Desktop light/mobile dark screenshots reviewed: output/playwright/result-context-*.png. Publication evidence follows.

Deployment dpl_BtiNNpY4biVhtsUqAWWfZX1kzipR READY; immutable https://mytax-8dijnjyk6-aaaa1-03d3.vercel.app; alias https://mytax-indol.vercel.app. Anonymous HTTP200 for /demo, /tax, worker and index-6VSpRI13.js / index-4lWiD7fJ.css, with result-context styles. Isolated live browser confirmed annual660,000/deductions134,000, headline refund11,900 and zero page errors. Evidence: output/playwright/live-result-context-http.json and result-context-live.png.

## Optional planning entrance — 2026-10-04

- Replaced the crowded auto-selected guide with two purposes, then subject selection, then one detail. Existing-rights lane leads to deduction step2; extra-planning lane keeps the explicit scenario trial. Intro lesson/fund policy are collapsed, SSF remains educational, and skip/optional messaging is visible. Menu/result/demo labels are consistent; /reduce stays unchanged.
- Initial full28 browser run:25 passed;3 failures referred to the removed sidebar or an unscoped button name now shared by navigation/result. Updated those selectors to the purpose entrance and their intended navigation/main region, retaining all financial expectations. Offline coverage now also opens an RMF trial after reload. Added both-lane detail axe scans in the existing accessibility cases.
- Six targeted browser cases passed in30.6s: Thai ESG applying15,100, SSF without input, mobile/theme layouts, light/dark accessibility including each planning lane, PWA offline guide/trial and result states/print preservation. Formatting and ESLint/TypeScript passed; production PWA build passed.
- Isolated headless CLI verified entry has2 choices,0 details,0 trials; existing family detail has no trial; keyboard Space and heading focus work. Existing-rights CTA reached /tax/2 without changing saved data. RMF trial30,000→60,000 showed extra spending30,000 and tax saving3,000, with storage unchanged until apply. Changing purpose removes the un-applied trial; skip returns /tax/4.
- Desktop light and mobile dark screenshots reviewed. At320/390px document width equals viewport width. Mobile comparison was adjusted to labelled rows after visual QA caught a split amount; both20,100 and17,100 now occupy a single29px-high line. A capture taken during lazy loading was replaced with one taken after the purpose entrance appeared. Screenshots: output/playwright/planning-*.png. Local console contained only React development information.

Deployment dpl_8aPK7URCrZoxER5U5MhJgeYxqAKL READY; immutable https://mytax-8ocdi35xc-aaaa1-03d3.vercel.app; alias https://mytax-indol.vercel.app. Production/npm ci passed with zero reported vulnerabilities. Anonymous HTTP200 for main routes, worker, index-Dl_FtlI4.js / index-4lWiD7fJ.css and lazy TaxGuide-ACFnwuwH.js / TaxGuide-kXUyIzBE.css, with planning styles present. Live isolated browser verified2 entrance choices,0 initial trials,0 existing-right trials, labelled sample RMF trial and zero page errors. Live screenshot reviewed: output/playwright/planning-live-entry.png. HTTP evidence: output/playwright/live-planning-http.json.

## Friendly mascot — 2026-10-04

- Built-in imagegen edited the supplied mouse to a green collar/tie and welcoming palm gesture, with true transparent alpha. Original PNG preserved in docs/assets; optimized deployed WebP640×767 is73,892bytes. Prompt and placement: MASCOT.md.
- Formatting, ESLint/TypeScript passed. Seven existing relevant browser cases passed in36.6s: both-theme homepage/expanded accessibility, both-theme guide/tax/ledger accessibility, mobile/theme behavior, Thai ESG explicit apply and production PWA offline features. No tax-rule or storage logic changed; no new unit tests were needed.
- Isolated headless CLI checked1440/390/320px in both themes: loaded image, no horizontal overflow, readable unobstructed title/actions. Reduced-motion animation is none; actual opening finishes at identity transform with one iteration. Planning character count becomes0 after choosing a purpose. Screenshots: output/playwright/mascot-*.png.
- Production deployment dpl_Ggm5f1KS9hQtJTUSEmp241AiSpXw READY; immutable https://mytax-hxkn6xif7-aaaa1-03d3.vercel.app; alias https://mytax-indol.vercel.app. npm ci/production PWA build passed with zero reported vulnerabilities. Anonymous HTTP200 for /, /reduce, /tax, /ledger, worker, new image and main/lazy assets. Image type is image/webp and size73,892bytes. Evidence: output/playwright/live-mascot-http.json.
- Live isolated browser confirms image naturalWidth640 in both placements, hidden after choosing a planning purpose, and zero page errors. Live screenshots reviewed: mascot-live-home.png and mascot-live-planning.png.

## Move mascot to scrollytelling — 2026-10-04

- Restored the original opening money SVG recovered from the earlier source change. Opening parallax/pullback remain. Built-in imagegen edited the preserved mouse into a gentle pointing pose; source PNG preserved, deployed WebP480×576 is46,972bytes with alpha. Prompt and assets: MASCOT.md.
- Pointing mouse beside each chapter title,112px desktop/68px mobile; no cover over the demo card or amounts. Existing planning welcome unchanged. No tax/storage/playback logic changes.
- Formatting and ESLint/TypeScript passed. Three relevant existing browser cases passed in24.3s: light/dark homepage/expanded accessibility and theme/mobile layouts. Preview and Vercel production/PWA builds passed.
- Isolated CLI reviewed both themes at1440/800/390/320px; no horizontal overflow/title-mascot overlap, all pointing assets loaded. Actual animated1440/390px scenes independently completed at660,000 income,20,100 tax and17,100 after RMF trial, with3,000 saving and30,000 extra spending. Returning to the first scene retained660,000 without replay. Screenshots: output/playwright/story-mouse-*.png.
- Production dpl_FC8czETdJr7etoP2oqKQ1pmLiL9v READY; immutable https://mytax-f976nc4sf-aaaa1-03d3.vercel.app; alias https://mytax-indol.vercel.app. Anonymous HTTP200 for /, /reduce, new pointing image, worker and index-D8QegWvl.js / index-BgeSa1MT.css. Production npm ci reported0 vulnerabilities. Evidence: output/playwright/live-story-mouse-http.json.
- Live isolated browser verified1 original money SVG and0 opening mice,3 loaded pointing mice in story, and0 page errors. Live opening/story screenshots reviewed. A screenshot that retained prior scroll position was replaced with an explicit top-of-page capture.

## ภาษาและการนำเสนอ — 2026-10-04

- Changed the three chapter labels, supplied descriptions, opening summary and screen-reader story to กรอกรายได้ / เข้าใจภาษี / ง่ายแค่นี้เอง. Retained sample year and estimate/eligibility wording. Historical unused DemoStudio source uses ดูผลประมาณการ instead of เห็นผลทันที. Reduced heading size/tracking and increased line-height to fit longer Thai labels beside the mouse.
- npm test49/49, lint, format:check, build and E2E28/28 all passed. No test edits/deletions. Production PWA contains21 static assets. SHA256 baseline confirms tax.ts, extendedTax.ts and vercel.json unchanged. Existing E2E no-external-network, keyboard/focus, reduced-motion, storage, routing and offline checks passed.
- Both-theme screenshot review at1440/800/390/320px: no horizontal overflow or heading/mascot overlap. Animated390px chapters complete at the original final amounts. CLI screenshots: output/playwright/language-*.png. Initial local5178 connection failed; using an accessible test server5179 completed visual checks.
- First deployment attempt returned Not authorized. Read-only whoami/team/project checks confirmed access to the same linked project; retry succeeded without changing credentials, project or security settings.
- Deployment dpl_HDaU4k2Pv55xjA6VMr8fnSqyHi6p READY; immutable https://mytax-hpiy9nafc-aaaa1-03d3.vercel.app; alias https://mytax-indol.vercel.app. Anonymous HTTP200 for /, /tax, /ledger, /reduce, worker and index-DT5rhIG1.js / index-BMJiaGVC.css. Evidence: output/playwright/live-language-http.json.
- Live isolated browser confirmed exact supplied descriptions, all3 new headings/chapter buttons, no old ใส่ปุ๊บ/รู้ปั๊บ, and0 page errors. Screenshot language-live.png reviewed. No tax-rule, storage, route or animation-playback behavior changed.

## UI polish — 2026-10-04

- Shared background only across routes; distinct social/life icons; common hover/press/focus with reduced-motion support; accessible liquid progress tube; red tax amounts and balance-based celebration/collection mice. Unknown withholding retains the pending state. Refunds remain green. Details/assets/prompts: INTERFACE-POLISH-2026-10-04.md.
- 54/54 unit, 41/41 E2E, lint, format and production/PWA build passed. Both themes at390/768/1280, axe, offline/privacy, print and four result cases verified. Tax formulas and storage match pre-change SHA256.
- READY dpl_6psUYMTkP4ZaDtpsqEYcUteUwcvR; alias https://mytax-indol.vercel.app. Public HTTP200 for13 routes/assets; unchanged CSP and live mobile/desktop controls verified. Screenshots: output/playwright/polish-live-*.png.

## Result and hover touchup — 2026-10-04

- Moved both result mice below the amount; preserved balance logic and refund/unknown states. Background orbit strokes increased slightly with restrained edge lighting. Default control radii do not override existing button shapes; disclosure headers share custom radius tokens, avoiding details-slot inherit resolving to0px.
- Saved theme is applied before mounting via shared theme.ts, preserving subsequent settings/system changes. This fixes a transient load contrast failure; existing axe criterion retained. Unit54/54, lint, format, full E2E41/41 and production/PWA build passed. Targeted control/about cases passed3repeats (6/6). Tax/storage hashes unchanged.
- READY dpl_CLW5fWRYa5SZJKaM6eJcJra8Cjia, public https://mytax-indol.vercel.app, immutable https://mytax-6ccvoiorm-aaaa1-03d3.vercel.app. HTTP200/CSP verified on8routes/assets. Live390/1280 both-theme result placement, rounded hover and zero page errors verified. Details: RESULT-TOUCHUP-2026-10-04.md.

## Scope feedback — 2026-10-04

- Green yes / red no / yellow unknown for hover, focus and selected in both scope stages. Labels/checkmarks/aria retained. Scope disclosure padded and wraps; mobile choice group accounts for its30px left margin so final option stays inside its row.
- Unit54/54, lint, format, full browser42/42 and production/PWA build passed. New regression covers semantic colour, selected state, inset text, mobile button bounds and expanded-content axe in both themes. Tax/storage hashes unchanged; CSP unchanged.
- READY dpl_JAT7AMFbhcMfXbs4HPW3kuNfU1uT; public https://mytax-indol.vercel.app. Live390/1280 both-theme colours and19px left text inset verified; HTTP200/CSP verified4routes/assets. Details: SCOPE-FEEDBACK-2026-10-04.md.
## Reading, optional account and opening — 2026-10-04

- 63/63 unit tests passed. ESLint and TypeScript check both the client and server. Formatting and production/PWA build passed; npm installation reported zero vulnerabilities.
- Full browser suite: 48/48 passed in 3.2 minutes, using isolated installed Chrome. Sandbox Chrome initially canceled download paths even for a minimal data-URL test; the same minimal test outside that restriction succeeded. Existing download/round-trip tests were retained and passed in the isolated browser.
- Covered 390/768/1280, both themes, Thai chapter headings, keyboard/focus, axe, mobile first action, backups, local storage, PWA, and simulated cloud accounts on two separate device contexts. SMTP and real database RLS remain unverified; no financial account data or actual OTP emails were sent.
- Fixed one new duplicate settings class and reclaimed mobile heading spacing to keep the income field above the fixed next button. Font size/readability improvements retained. Inspected mobile tax, story and account screenshots.
- Initial deployment exposed a missing TypeScript module in the function bundle. Fixed the function/handler as TypeScript entries, enabled relative extension rewriting and added a server type-check configuration. Re-ran 63 unit tests, lint, formatting/build and all six affected browser cases (6/6 in 27.5 seconds). Client bundle did not change during that packaging repair.
- Final READY production release: `dpl_EPBoqSdNEMBkFV4T2UZQH1Bd99Nb`; immutable `https://mytax-hj4w6vc1y-aaaa1-03d3.vercel.app`; public `https://mytax-indol.vercel.app`.
- Anonymous public route checks: HTTP200 for home/ledger/tax/about with the new client bundle. API GET200 `{configured:false}`, same-origin session503 with the intended disabled-service message, foreign-origin POST403. API no-store/private; CSP unchanged. Evidence: `output/playwright/account-live-api.json`.
- Live isolated browser verified the opening finishes, and mobile ledger shows local use plus an explicit disabled online-service dialog. Screenshots: `opening-live-1280.png`, `account-live-ledger-390.png`, `account-live-modal-390.png` under `output/playwright/`.
- SHA256 unchanged for `tax.ts`, `extendedTax.ts` and `vercel.json`; no banking integration. Activation prerequisites and privacy boundaries: `LEDGER-ACCOUNT.md`. Temporary redacted environment pull removed; existing environment files preserved.

