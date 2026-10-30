# Trust presentation preview — 2026-10-30

Local review iteration only. User explicitly requested no commit or push, and authorized the temporary public team label “ทีมพัฒนา MyTax”. No individual identity, credentials, reviewer or contact details have been invented.

- Homepage links to calculation method and scope, with an independent-tool/estimate note.
- About retains its original route, h1, seven FAQs, source references and data-management integration. New introductory calculation sheet uses the existing 2025 demo and calculation engine, explicitly separate from personal figures.
- Source-year browsing has local state only and does not change the user's plan. Date/version come from existing rule records; no fresh legal-review date is claimed.
- Independent status, supported/excluded scope, local unencrypted storage/backup tradeoffs and external-review status are displayed plainly. Official RD link opens the actual government website.
- Contact fallback states that the public channel is being prepared. Set the real public identity/contact in siteContent.ts when supplied by the owner. Review wording can change only when an actual expert review has been completed and documented.
- Result mascot copy now uses neutral planning/review language instead of debt-collector or escape jokes. Tax calculation files are unchanged.

Verification: unit suite; lint and TypeScript; build; format check; targeted browser coverage for source switching, unchanged tax year, data modal, light/dark mobile accessibility and original result/storage/navigation flows. Screenshot artifacts under ignored output/.

This UI work does not constitute expert tax review, certification, production network audit or a user study. Show the local preview before deciding further changes.

## Compact disclosure revision

User requested substantially less visible text. The About page now starts with a short scope/non-affiliation note and six closed topic headers. One topic expands at a time, using a 240ms height transition and rotating chevron; reduced motion disables transitions. The calculation sheet is inside its own topic rather than occupying the opening screen. Sources/review status are grouped; existing seven FAQs remain available inside their topic.

Research: [NN/g accordions on desktop](https://www.nngroup.com/articles/accordions-on-desktop/) supports selective disclosure for optional content, while [W3C accordion pattern](https://www.w3.org/WAI/ARIA/apg/patterns/accordion/) specifies keyboard and ARIA behavior. Important estimate/non-filing/independence context stays visible. Source browsing and personal-plan isolation are unchanged.

New checks cover initial collapsed state, one open topic, Enter/Space toggling, hidden-panel inert state, retained source functionality, data controls, mobile fit, reduced motion and axe scans of open and closed panels in both themes. This revision remains uncommitted and unpushed.

## Mascot and visual revision

User approved combining approachable illustrated presentation with bold finance-brand typography. New original transparent asset `public/images/mytax-about-guide-v1.png` was generated with the built-in image tool, using the project's pointing and money mouse illustrations as character references. Original assets are retained. New pose welcomes the visitor with a notebook; no badges, borrowed brand characters or invented credentials.

Evergreen/lime hero, short Thai headline and one action lead into the same six-topic accordion. Action opens/focuses scope without changing financial data. Local/reduced-motion behavior remains; mouse art is decorative presentation with descriptive alt text, and important independent/non-filing context is visible outside the hero. No new tax rules, accounts or external service integration were introduced.
