# Four UI refinements — 2026-10-04

## Changes

- Tax-law illustration: same gray/cream mascot and green tie, now crying and gripping two prison bars. Removed the separate CSS bars to keep the hands visibly wrapped around the illustrated bars and the face unobstructed. Educational caption and legal text unchanged.
- Ledger: green primary Statement button in a restrained outlined strip, larger icon and 56px minimum target. Mobile button spans its strip. Preview, duplicate checks, confirmation, local processing and tax data remain unchanged.
- About: fifth top-navigation button, with active/aria-current page state, removed from Settings. Footer entry remains. Mobile navigation uses five equal columns with wrapping text instead of shrinking the labels.
- Tax wizard: live estimate amount uses the existing negative/red theme token throughout steps 1–3. Missing/invalid input still displays the pending state rather than an invented zero; formulas remain unchanged.

## Mascot asset

Created using the built-in imagegen tool with the existing `public/images/mytax-mascot-two-money.webp` as the character reference. Original transparent PNG is retained at `docs/assets/mytax-mascot-crying-bars-source.png`. WebP at `public/images/mytax-mascot-crying-bars.webp` is 800×959, 94,710 bytes, with alpha preserved; resized/encoded only for delivery.

### Final prompt

Use case: identity-preserve. Asset type: transparent cartoon illustration for the MyTax tax-law educational page. Input image: reference for the existing mascot identity and illustration style. Preserve the same cute gray and cream mouse with oversized pink ears, brown eyes, pink tail, green tie and soft polished cartoon shading. Change its pose and expression: the mouse is SAD and CRYING with visible blue tears running down both cheeks, worried raised eyebrows, trembling frowning mouth, NO SMILE. Both hands visibly wrap around and firmly grip TWO tall vertical prison bars, one on either side of its face, fingers in front of the bars. Include these two full-length metallic muted rose-gray prison bars in the illustration, from above its ears to below its feet, no frame and no extra bars in front of its face. Full body centered, portrait composition with small safe margins around ears and feet. Remove ALL money, banknotes and calculators. True transparent background, no environment, no lettering, no watermark. Clearly show hands gripping the bars, crying expression and tears. Keep the friendly same-character style, not grim or scary.

## Validation

New browser cases cover main-nav keyboard/history access, all five items in the mobile viewport, red live totals at every pre-result step in both themes, prominent Statement action with keyboard dialog/focus return, the new loaded mascot and absence of overlaid bars. Existing About access test now checks the main navigation in place of the removed Settings entry. All fixtures remain synthetic.

The first browser run exposed the taller mobile header encroaching on the first input and a pre-existing dialog cleanup using an already-cleared React ref. Reduced header padding while retaining 44px navigation targets; dialog cleanup now retains the dialog element and explicitly restores the connected opener with no scroll. The eight directly affected cases passed after these corrections.

Checks and production release are recorded in VALIDATION.md.
