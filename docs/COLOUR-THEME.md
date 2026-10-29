# MyTax — green / red theme

Updated 2026-10-03. Theme definitions: `src/colour.css`.

| Role | Light | Dark | Examples |
| --- | --- | --- | --- |
| Positive | #187344 | #63df98 | Income, positive net cash flow, estimated refund, tax savings |
| Negative | #c12b45 | #ff7189 | Expenses, negative net cash flow, additional tax payable, additional spending |
| Neutral | #202020 | #f5f5f5 | Zero, unknown amounts, explanatory content |
| Page | #fafafa | #000000 | Dark mode has a black page, no green grid |
| Panels | #ffffff | #121212 | Neutral dark cards and dialogs |
| Raised surface | #f5f5f5 | #202020 | Controls and nested surfaces |

Transaction signs, labels and directional icons remain visible alongside colour. Dark mode uses brighter green/red for contrast, rather than colouring all panels green. Demo result surfaces use brighter money colours because they are dark in both modes.

Ledger income/expense amounts, entry actions, selected entry type, form amount/submit, summary bars, cash ring, category expenses and signed net total share these roles. Calculator refund/payable balances, guide tax savings/additional spending and demo comparisons follow the same meaning. Zero and unknown values retain neutral presentation.

Verified with 49 unit tests, 26 browser tests, targeted follow-up accessibility checks, lint/TypeScript, formatting and production build. Browser inspections covered populated light/dark ledgers at desktop and 390px mobile width. Synthetic data was created only in the isolated test browser. Actual dark body computed as rgb(0, 0, 0).

Evidence under `output/playwright/`: `colour-ledger-dark-desktop.png`, `colour-ledger-dark-mobile.png`, `colour-ledger-light-mobile.png`. Screenshots captured during review; release details are in `MYTAX-DEPLOYMENT.md` and `VALIDATION.md`.
