# Layered homepage hero

Implemented 2026-10-03. A financial illustration made from SVG and HTML replaces the previous centered hero: green wallet, annual-income card, deduction card, foreground tax receipt and baht coin. No character or generated image is used.

The income and wallet arrive first, followed by deductions and the receipt. The introduction finishes in approximately 2.65 seconds and can be replayed. The primary calculator and ledger buttons remain available throughout. Small mouse-driven offsets give the layers depth; touch does not trigger parallax.

The introductory animations pause when less than 18% of the scene is visible, the document is hidden, or the user presses pause. Reduced-motion preferences disable the introduction and parallax and show the settled illustration. An accessible caption describes the sample calculation; the visual stage is decorative to screen readers.

The sample uses the existing demo plan and calculation function: year 2568, income 660,000, expense 100,000, deductions 134,000, taxable income 426,000 and annual tax 20,100 baht. The visible sample label and detailed demo below distinguish it from the user's plan. No tax, persistence or routing logic changed.

Source: src/HeroScene.tsx, src/hero.css and the Home composition in src/main.tsx. The stage clips incoming layers to prevent horizontal scrolling. Small-screen spacing keeps deduction amounts visible; 320px screens use a smaller coin.

Validation: 27 existing browser regressions passed, plus three follow-up accessibility/mobile checks after layout adjustments. ESLint/TypeScript, formatting and production build passed. CLI inspection confirmed pause/resume, replay, offscreen pause, reduced-motion static rendering, and mouse offsets. Desktop/light, mobile/dark and 320px screenshots are under output/playwright/layered-*.png.
