# Plus offer research and motion revision — 30 October 2026

Public pages reviewed: YNAB homepage and pricing, Monarch pricing and planning, Lunch Money pricing and features, Copilot homepage (pricing URL redirected to homepage). Eight page requests across four products; no private account use or purchase funnel completion. This is qualitative presentation research, not evidence that any pattern causes conversion.

## Findings and decisions

| Source | Observed presentation | MyTax adaptation |
| --- | --- | --- |
| https://www.ynab.com/ and https://www.ynab.com/pricing | Leads with money-related outcomes, repeated start action, trial information and an explanation of use over time. | Lead with a concrete decision: what remains after obligations, how it changes and what a proposed adjustment costs. Offer immediate demo/personal workspace, without copying unsupported savings claims, awards or testimonials. |
| https://www.monarch.com/pricing and https://www.monarch.com/features/planning | Explains subscription value and connects longer-term goals with monthly contributions. | Add an explicit comparison between basic recording and the Plus planning experience. Describe saved review points and goals; no promises of bank sync or independent professional monitoring. |
| https://lunchmoney.app/pricing and https://lunchmoney.app/features | Explains included features, monthly/annual choices, trial and price terms clearly; ongoing spending management rather than only setup. | Make what is included legible, clarify that this is currently a free prototype, and state that future price/renewal/cancellation terms must be supplied before checkout. No invented price, permanent-price guarantee or working payment button. |
| https://www.copilot.money/ | Shows actual product-style screens alongside outcomes and example budget adjustments. | Add a three-state interactive money preview, clearly synthetic and arithmetically consistent, before the working dashboard. Users can inspect both extra spendable money and reduced goal earmarks. No invented AI advisor or automated action claim. |

New presentation on /money-plan: offer hero, demo interaction, three outcome explanations, basic/Plus comparison, concise pricing/data/availability FAQs, personal and demo CTAs that focus/scroll to the existing tool. Persisted personal data and ongoing review calculations remain separate from the synthetic marketing preview.

## Motion implementation

One raster pose cannot provide independently articulated limbs. Improve the existing pose through smooth 180ms running bounce/rotation/squash, a 1450ms anticipation-to-accelerating exit trajectory and nine staggered soft smoke puffs attached to the runner's foot area. Reveal slides from left over 520ms. Decorative smoke does not intercept clicks; keyboard focus and reduced-motion behavior remain. The current animation is transform-based illustration motion, not skeletal animation or a multi-frame walking sprite.

## Validation

Lint/TypeScript; production build in browser setup; targeted browser tests for smoke containment, slide-in animation, reduced motion, preview changes, CTA mode/focus, mobile overflow and axe scans in both themes, plus existing tracking/persistence tests. This iteration changes presentation and motion, not taxes, financial formulas, billing or data permissions. No commit/push.

## Visual-first revision after user critique
Removed the always-visible long comparison/sales sections and shortened hero copy. Right-hand product demo now uses an animated allocation ring, changing money bars, and an explicit play/pause control that advances a three-step synthetic scenario once. Manual selection stops playback. Reduced motion removes transform/graph transitions; the user still controls the example. Three framed benefit cards replace long paragraphs; details and price/data limits are collapsed. Text uses stronger foreground values instead of faint body copy. Full working dashboard stays hidden until a personal/demo CTA is used (saved personal plans reopen the dashboard).

Additional references reread: Copilot homepage product examples https://www.copilot.money/ ; Monarch homepage screenshots and reports/goal narratives https://www.monarch.com/ ; YNAB product screenshots and concise entry CTA https://www.ynab.com/ . These support presenting the product visually; they do not establish that this new design will convert users to paid subscriptions. No fabricated reviews, prices, guarantees or unavailable service promises added.
