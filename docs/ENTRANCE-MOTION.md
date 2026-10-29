# MyTax — restrained entrance animation

Updated 2026-10-03. Implementation: src/motion.css, imported by src/main.tsx.

- Header enters in 300ms. Home heading, description, buttons and small supporting line appear with 0/40/70/90ms offsets and 380ms duration.
- Home demo and selected primary page surfaces enter in 420ms with an 80ms offset. The sequence completes within 500ms of each element mounting; lazy content begins when ready.
- Fade starts at opacity 0.55 and moves up 8px; no bounce, scale, blur, loading gate or scroll listener.
- CSS animations run once per mounted element. Normal value edits do not restart them. Existing question-panel motion and the demonstration loop remain intact.
- New animations only apply with prefers-reduced-motion: no-preference. Reduced-motion and print display content normally. No permanent transforms, opacity or animation overlays remain after the entrance; controls stay interactive.

Verification: formatting, ESLint/TypeScript and production/PWA build passed. Seven relevant existing browser checks passed, covering homepage/forms/guide contrast in both themes, mobile layouts, wizard navigation, and ledger entry/saving. CLI verified actual entrance timing, iteration count 1, completed opacity 1 with zero active entrance animations, and reduced-motion animationName none. Tax calculation/storage behaviour was not changed or retested with new cosmetic unit tests.

Deployment and live checks: see MYTAX-DEPLOYMENT.md and VALIDATION.md.
