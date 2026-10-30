# Clip audit — 2026-10-30

Sources opened in the user's signed-in Opera session:
- https://www.instagram.com/reel/DfBQ1AgOC1S/ — heysansser: plugin recommendations grouped by task. Full post caption read and video frames inspected; audio was not transcribed. The post itself advises selecting one relevant tool, rather than installing all 30.
- https://www.instagram.com/reel/DfB5ZkBlVd_/ — keaykub.dev: explore three visual directions, refine a prototype, review it, then implement. Full post caption read and video frames inspected; audio was not transcribed.

## Applied to MyTax

Already present: Superpowers for planning/debugging/verification; Caveman for scoped implementation/review; frontend-design-premium and UI/UX skills for typography, colour, layout, motion and accessibility; DESIGN.md for durable project direction; local preview; unit/browser tests; GitHub Actions checks.

New deliverables: a standalone, synthetic-data ledger prototype with three selectable directions at output/ledger-directions.html; a repeatable preview-first workflow below. Existing financial screens and storage are not changed by the prototype. No new plugin, external account, paid plan, hook, background daemon or telemetry integration was installed.

## Tools from the first post

| Tools | Decision for this project |
| --- | --- |
| Superpowers, Caveman | Available already; continue using relevant workflows. |
| Matt Pocock Skills, ECC, Karpathy Skills, Ponytail, Agent Skills | Alternative engineering packs; avoid overlapping instructions without a demonstrated gap. |
| Graphify, Understand Anything | Optional for a larger codebase; current route/source documentation suffices. |
| Agent Reach, Last 30 Days | Browser/search already meets current research needs. |
| Career Ops, REA | Job search/reverse engineering is outside this financial website's present needs. |
| gstack, GSD, BMAD Method | Alternative orchestration systems; no demonstrated benefit from combining all of them. |
| Claude-Mem, Headroom | Session/context infrastructure, not website features; do not introduce new persistence just for this audit. |
| UI UX Pro Max, Taste, Impeccable | Relevant design guidance; existing frontend/UI skills overlap. Reviewed public repositories for UI UX Pro Max and Impeccable; not installed or represented as audited executable packages. |
| Archify, Diagram Design | Use a small Mermaid diagram when architecture needs explaining; no extra install now. |
| PPT Master, Skills by Anthropic | Presentation/document workflows already available; use when producing a deck/document. |
| OpenMontage, HyperFrames | Video production, not necessary to improve the present application. |
| Humanizer, I Have ADHD | Adopt direct short copy and answer-first summaries; no need to add software. |
| Marketing Skills | Public positioning still needs owner evidence and user validation, not invented marketing claims. |

## Preview-first workflow

1. Define the task, supported user and success criterion. Read DESIGN.md and current screen before editing.
2. For substantial visual changes, create three lightweight directions using synthetic data, outside the production bundle. Small fixes do not require three alternatives.
3. Compare information hierarchy, transaction density, mobile fit, colour meaning and keyboard access. Show the actual prototype to the owner for feedback when choosing a direction matters.
4. Implement the selected direction in existing components, preserving financial logic. Explicit user instructions can select a direction or authorize the agent to choose.
5. Run relevant unit and browser checks, inspect screenshots after animations settle, and document what remains uncertain. Production build and CI are separate from usability testing.
6. Keep local review distinct from publication. No commit, push, deployment, external sharing or account changes until authorized.

## Remaining priorities

- Owner identity/contact are placeholders; only the owner can supply real public details.
- No published independent expert tax review; automated tests do not replace it.
- No recorded study of first-time users. Test three tasks with 5 salary earners: calculate tax, save/restore a draft, import a statement. Record completion, confusion and mistakes; do not upload real financial data.
- Scope is salary/bonus tax and local ledger. Do not expand to every tax case or cloud accounts just to imitate another product.
- Localhost links work only on this computer. Share-screen is suitable now; a remote review URL requires a separately authorized deployment and synthetic data.

Primary references checked: https://github.com/pbakaus/impeccable ; https://github.com/nextlevelbuilder/ui-ux-pro-max-skill ; https://support.claude.com/en/articles/14604416-get-started-with-claude-design . We adopt the prototype-first practice without requiring a Claude subscription or claiming Claude-specific features exist inside MyTax.

## Verification in this audit
Unit tests: 71/71 passed. Format check and lint/TypeScript passed. Full browser run: 61/62 passed; the failing dark entry-dialog scan exposed a real contrast regression from the preceding ledger restyle. Fixed ledgerWorkspace.css by scoping segment overrides to period-toolbar, so the transaction dialog keeps its semantic selected colours. Reran accessibility.spec.ts and ui-polish.spec.ts: 6/6 passed after the fix. The entire 62-test suite was not rerun after that narrow fix. Standalone prototype: all three switches, example action feedback, desktop screenshots and 390px horizontal fit verified using Chrome and synthetic data. No commit or push performed.
