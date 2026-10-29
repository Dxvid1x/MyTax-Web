# Homepage opening and closing — 2026-10-03

The homepage leads with a centered headline, two small native SVG illustrations (money and a ledger), quiet curved background lines and a short invitation to scroll. The original wallet Hero is preserved at the end, with both calculator and ledger entry buttons.

Order: opening → three-part scroll story → “ง่ายแบบนี้… ต้องเลือก MyTax” → original Hero and tool buttons → scope note/footer. The opening has the page's only h1; the preserved Hero now uses an h2 with the same visual style.

The opening spans the full available viewport width. A separate `.home-content` column preserves the original width of the story and closing tools. The scene no longer clips illustrations at the inner content gutters; money, ledger and coins are inset to stay inside the scene during the enlarged entrance.

The opening plays a 2.6-second pullback with a brief hold, a faster landing and a small settling overshoot. Desktop camera starts at scale1.18, artwork at scale1.48 and title at scale1.16; smaller screens use lower scales. Money and ledger approach with opposing rotations. A faint expanding ring marks the landing, the curved line draws, and two baht coins add foreground depth. Each headline line moves as a complete line, without clipping masks, so letters remain fully visible. Controls stay enabled throughout; keyboard focus stops text/button motion.

The sequence runs once per homepage mount. Mouse movement still shifts the art layers by small opposite offsets; touch input does not drive parallax. Reduced motion and printing disable all camera/shape/text/path animations. The opening's button scrolls to the story without changing the URL.

Each story chapter has a subtitle and another short explanation: gross salary/bonus becomes annual income; expenses and eligible deductions affect taxable income; a deduction trial compares both tax savings and additional expenditure. Illustrations still use explicitly labelled sample data for 2568, calculated by the existing engine.

The story uses a static sequence when the available viewport height after the sticky-header allowance is at most 560px (650px on mobile widths up to 650px). This avoids copy/card/navigation collisions on short phones. Reduced-motion users also see the complete static sequence. Normal portrait phones and desktops retain the long pinned track: scrolling selects the scene, while each scene's amounts play independently once and hold their final values. See SCROLL-STORY.md for the 2026-10-04 update.

No new dependency, downloaded asset, tax-rule, data-storage or route change. Validation evidence is in VALIDATION.md. Current screenshots are under output/playwright/full-opening-*.png.
