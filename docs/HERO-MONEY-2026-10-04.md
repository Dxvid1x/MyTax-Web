# Larger money-holding mascot and right-hand ledger

Owner request: add the pictured ledger to the right, keep the right-hand money artwork, and make the left-hand mouse hold money and appear larger.

Implemented in `HomeOpening.tsx`, `opening.css` and the mobile opening overrides in `ux-review.css`. The restored ledger uses the original SVG geometry and green income/red expense indicators. It sits above the money stack. The mouse retains the shouting pose and owner-requested quote, holds a fan of generic green banknotes, and is larger on desktop and mobile. Central headings, actions and trust text stay unobstructed. The phone layout reserves more room below the actions, keeping the first-screen calculator position unchanged.

Design retains the established black/white surfaces, green accents and self-hosted Thai fonts. Existing entrance and mouse-parallax effects include the ledger, with reduced-motion handling. The existing story mascots, tax rules, storage, CSP and network policy are unchanged.

Generated with the built-in image generation tool, editing the previous shouting mascot. Source: `docs/assets/mytax-mascot-money-source.png`. Published asset: `public/images/mytax-mascot-money.webp` (800 × 959, 106,434 bytes). Transparent alpha was verified before converting to WebP; previous assets remain available.

## Final image prompt

Use case: precise-object-edit. Edit target: the referenced MyTax mouse mascot. Keep the exact cute gray mouse identity, enormous pink ears, cream belly, green collar and tie, tuft, soft shaded illustration style, full-body proportions and joyful open-mouth shouting expression. Keep its right-side paw cupped beside its mouth. Change the other raised paw: it now confidently holds a thick fan of mint-green banknotes with generic currency marks (not real banknotes), visible above and beside the left shoulder. Make the money substantial and clearly held with fingers, no floating money detached from hand. Full body including tail, ears, money and feet uncropped, compact portrait silhouette, minimal padding. Single mouse cutout with genuine transparent background and no scenery, no text, no speech bubble, no watermark. This is a larger playful website hero mascot, not a new character.

## Visual evidence

Final opening screenshots: `output/playwright/hero-money-{light,dark}-{390,768,1280,1815}.png`. Both themes loaded the image and retained the calculator in the first viewport without horizontal scrolling. Desktop, mobile and tablet screenshots were visually inspected.

Reduced-motion inspection confirmed no animation on the camera, mascot, quote or ledger, no pointer parallax, and a visible calculator action. Unit tests: 54 passed. Lint, format check and production build passed. The asset is included in the existing offline precache.

Full browser test suite: 38 passed.

Published release `dpl_3eCoeKsTrsSLvkkSigxVh87efDzo` READY at https://mytax-indol.vercel.app/. Live browser verified the new 800px mascot asset, mouse left, ledger and money right, original quote and no horizontal overflow. Screenshot: `output/playwright/hero-money-live.png`.
