# Navigation feedback and page changes — 2026-10-03

- Main menu buttons respond to hover with a thin green inset ring, green text and a quiet tinted background, without changing dimensions. Brand/save controls, settings and secondary navigation groups also have pointer feedback. Keyboard focus remains visible; the current page has aria-current.
- Page changes use same-document View Transitions when available: outgoing content fades over 160ms; incoming content fades and moves 6px over 260ms. The navigation has its own layer, so it remains continuous. Browsers without the API use a 240ms entrance. Reduced motion skips these effects.
- The latest request wins when multiple menus are clicked quickly. URL, route state and scroll reset commit together. The deduction guide's module is loaded before taking the new-page snapshot. Editing inputs and changing calculator steps do not start full-page transitions.
- The header is sticky only on the homepage, including its scroll story and closing section. It stays 12px from the top on desktop and 8px on mobile. Calculator, ledger, guide and example pages retain a normal header.
- ResizeObserver measures the header. The scroll story uses the remaining viewport height and adjusts its progress/jump calculations for the header. Compact mobile card spacing preserves the animated scene at 390x844. Shorter viewports use the complete static sequence; chapter jumps start below the header.
- Update 2026-10-04: scroll progress still selects/crossfades scenes and chapter buttons still move the page. Amounts and the RMF slider now run on an independent once-per-scene clock; waiting never advances the selected chapter. Completed scenes survive tool navigation and reset on refresh. No playback controls were added; see SCROLL-STORY.md.
- Removed the body's forced 320px minimum so a 320px window with a non-overlay scrollbar does not scroll horizontally. Existing green income/red expenditure meanings remain.

Validation: see VALIDATION.md. Screenshots: output/playwright/nav-*.png. No tax-rule or stored-data schema changes.
