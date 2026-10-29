# MyTax mascot — 2026-10-04

The homepage opening uses its original money SVG again. A smaller pointing mouse appears beside each scrollytelling chapter title, guiding attention to the demonstration. The existing open-palm mouse remains at the initial tax-planning entrance and disappears after selecting a planning purpose. No calculator, tax-rule, playback timing or storage behavior changed.

## Assets and generation

- Mode: built-in imagegen image editing, transparent_background=true; one supplied reference image.
- Original generated PNG: `docs/assets/mytax-mascot-green-source.png` (1145×1373, transparent alpha).
- Deployed asset: `public/images/mytax-mascot-green.webp` (640×767, 73,892 bytes, transparent alpha).
- Sharp resized and encoded the generated PNG to WebP; it did not alter the illustration or remove its background. Source PNG is preserved under docs, which is excluded from deployment.

Final prompt:

> Edit the provided image as the target. Asset type: transparent mascot cutout for the Thai personal-finance web app MyTax. Preserve the exact mouse character's identity, oversized round pink ears, big brown eyes, warm grey fur, cream face and tummy, soft polished cartoon illustration style, friendly proportions and pink tail. Change the golden necktie and collar to a tasteful green (#63df98 with deeper green shading). Make the gesture welcoming and relaxed: one paw holds the same simple tax-paper/calculator prop, the other offers an open palm as if gently inviting someone to start; avoid pointing aggressively or thumbs-up. Keep a warm friendly smile. Entire full body including ears, paws, feet and tail must be inside frame with a little breathing room. One character only, no text, no logos, no new props, no scenery, no frame, no ground shadow or background. Produce a truly transparent alpha background, clean anti-aliased edges without black or white fringe, readable when reduced to 160–280px tall on a black or white webpage. This is a single character asset, not a website mockup.

## Integration and checks

- Shared `Mascot.tsx` presents a decorative, noninteractive image. Nearby headings and instructions carry meaning for assistive technology.
- Homepage money SVG retains the existing one-time pullback. Pointing mice move with the existing story scenes, without additional loops. Reduced motion displays the full static story. Planning uses a static image, hidden from print.
- Light/dark screenshots reviewed at 1440, 390 and 320px. Image loads with alpha, has no horizontal overflow and does not cover the title or action buttons. Actual entrance completes at the identity transform with one animation iteration.
- Seven relevant existing browser tests passed: homepage/expanded accessibility in both themes, guide accessibility in both themes, mobile/theme behavior, Thai ESG explicit apply and PWA offline features. Formatting, ESLint and TypeScript passed.
- Screenshots: `output/playwright/mascot-*.png`; production evidence is recorded in VALIDATION.md.

## Pointing pose and placement revision

- Built-in imagegen edited the preserved green-tie source PNG to a relaxed pointing pose, without the paper/calculator prop. Transparent source preserved at `docs/assets/mytax-mascot-pointing-source.png`.
- Project asset: `public/images/mytax-mascot-pointing.webp`, 480×576, 46,972bytes, true alpha; Sharp only resized/encoded it.
- Current layout: original opening money SVG; pointing guide next to each story title (96px desktop,56px mobile after the language revision); planning welcome unchanged. No new replay button or change to once-per-scene playback. See LANGUAGE-UX.md.
- Screenshots reviewed at1440/800/390/320px in both themes. No horizontal overflow or title/mascot overlap. Relevant existing homepage accessibility/theme/mobile tests passed3/3 in24.3s. Formatting, ESLint/TypeScript and preview production/PWA build passed.

Final pointing-pose prompt (built-in imagegen edit, transparent_background=true):

> Edit the provided green-tie mouse cutout. Asset type: a transparent mascot guide for MyTax's three-step financial scrollytelling. Preserve the mouse identity, oversized pink ears, brown eyes, grey fur, cream belly, polished cartoon style, green tie/collar, full body proportions and pink tail. Change only the pose/props: remove the tax-paper/calculator from the paw; turn the body slightly toward the viewer's right, with its right-side paw gently pointing diagonally up and right toward a nearby webpage demonstration. The other paw rests naturally near its tummy. Friendly relaxed smile, eyes looking toward the direction of the pointing paw. Keep both paws anatomically coherent. One character only, whole ears/feet/tail inside frame with breathing room. No text, logo, objects, scenery, frame, shadow or backdrop. True transparent alpha background with clean anti-aliased edges, readable as a small 100-160px tall guide on black or white. This is a single character cutout, not a website mockup.
