# Theme settings drawer

Updated 2026-10-03. Replaced the native dropdown with three explicit theme buttons: system, light and dark. The selected option has a green outline/tint. Install remains available as a separate icon with an accessible label and browser-install help.

Desktop mouse hover reveals a compact horizontal tray to the left of Settings with a 200–240ms fade/slide. A pointer bridge keeps it open while moving across the gap. Leaving closes the hover tray. Clicking pins it open; clicking Settings again, clicking outside, moving keyboard focus outside or pressing Escape closes it. Escape returns focus to Settings. Hidden controls are inert and excluded from screen readers.

At 600px and below the tray opens under the settings row and stays within the viewport. Touch uses the same click toggle as keyboard Enter/Space. Reduced-motion preferences remove the transitions. Theme preference persistence, OS-theme listening, installation and service-worker update confirmation stay unchanged.

Implementation: src/AppTools.tsx and src/settings.css. Obsolete native-select/details CSS was removed. Existing accessibility and theme tests use the new visible buttons.

Validation: five relevant browser regressions passed (49.9s), followed by two light/dark accessibility tests (31.5s) that additionally scan the expanded drawer. Lint/TypeScript, formatting and production build passed. CLI checked hover, movement to a choice, Escape, outside dismissal, mobile layout, install help, keyboard choice, system-theme changes and reduced motion. Evidence screenshots: output/playwright/settings-desktop-light.png, settings-desktop-dark.png, settings-mobile-dark.png, settings-mobile-help.png and settings-mobile-320.png.

## Related tax-year selector — 2026-10-04

The calculator now presents its two tax years as explicit side-by-side buttons, matching the Settings tray: neutral surface, rounded choices, green selected outline/tint and 160ms hover/selection feedback. Year and purpose remain visible. On narrow screens icons hide, leaving readable year labels and 44px-plus touch targets. Reduced motion removes transitions. Buttons have aria-pressed and a labelled group; Tab/Enter/Space work natively. Changing the year retains entered amounts and clears eligibility confirmations as before; clicking the already selected year leaves the plan unchanged. No native year dropdown remains.

Implementation: TaxWorkspace.tsx and the year-choice rules in app.css. The existing default-year assertion now checks the selected button; accessibility scans also include calculator step1 in both themes. See VALIDATION.md and output/playwright/year-choice-*.png.
