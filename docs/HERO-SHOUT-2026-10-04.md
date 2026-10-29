# Home opening: shouting mascot

Owner request: move the money illustration from left to right, place the existing mouse on the left in an excited shouting pose, and show “รวยไม่ไหวแล้วโว้ยย!”.

The centre keeps the readable Thai heading, calculator action and trust statements. On phones the mouse and money sit below the actions. The decorative quote is HTML so its Thai letters remain sharp. No sound, financial calculation, privacy policy or network integration changed. The existing entrance and pointer motion respect reduced-motion preferences.

Design: retain black/white surfaces, the existing green positive tokens and self-hosted Bai Jamjuree for Thai. One cheerful mascot is the visual emphasis; the original money SVG provides balance on the right. Remove the right-hand ledger artwork from this opening only. Existing story mascots remain unchanged.

Asset generated with the built-in image generation tool, using the previous green-tie mascot as its edit reference. Genuine alpha was checked, and the project WebP is 640 × 767, 68,940 bytes. Source: `docs/assets/mytax-mascot-shouting-source.png`. Deployed asset: `public/images/mytax-mascot-shouting.webp`.

## Final image prompt

Use case: precise-object-edit. Asset type: transparent mascot cutout for MyTax website hero. Edit target: referenced gray mouse mascot. Keep its identity, big round pink ears, cream belly, soft shaded illustrated fur, small tuft, cute proportions, green collar and green tie. Change its pose to excited joyful shouting: mouth opened wide in a happy triumphant shout, one paw cupped beside the mouth, the other lifted in celebration. Face and gaze turn slightly toward the right where webpage title will be. Full body visible including ears, paws, feet and curled pink tail. Remove the paper and calculator from its hands. Clean polished same illustration style. Genuine transparent background, no background objects, no cast background shadow, no cropped limbs. No text or speech bubble in image; exact Thai quote will be rendered accessibly with HTML separately. Only one mouse.

## Visual evidence

`output/playwright/hero-shout-{light,dark}-{390,768,1280,1815}.png` records the final opening on phones, tablets and desktops. Both themes loaded the mascot correctly; the calculator remained in the first viewport and horizontal overflow checks passed. The mobile coin sits away from the quote bubble. Reduced-motion inspection confirmed no animation on the camera, mascot or quote and no mouse parallax.

Validation: 54 unit tests, 38 browser tests, lint, format check and production build passed. The new mascot is included in the existing offline precache (23 static assets).

Published release `dpl_3ykm738n357yhLm9drNX8kbbeNyu` READY at https://mytax-indol.vercel.app/. Live browser verified the mascot loaded, mouse left, money right, requested quote present, old opening ledger removed and no horizontal overflow. Screenshot: `output/playwright/hero-shout-live.png`.
