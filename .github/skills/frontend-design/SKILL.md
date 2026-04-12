---
name: frontend-design
description: 'Design and implement distinctive frontend interfaces with strong visual direction. Use when creating new pages, redesigning screens, defining tokens (type/color/spacing), improving responsive behavior, and crafting meaningful motion.'
argument-hint: 'Describe product goal, audience, platform, and desired vibe (e.g. editorial, playful, minimal, premium).'
user-invocable: true
---

# Frontend Design

## Outcome

Create intentional, production-ready UI that feels specific to the product, not generic boilerplate.

## Default Operating Profile

- Scope: workspace skill (team-shared in this repository).
- Existing design systems: preserve-first (minimal, compatible enhancements).
- Styling intensity: balanced (distinctive but pragmatic for production apps).

## When to Use

- New frontend page/screen from scratch.
- Redesign or visual refresh of an existing page.
- Need a coherent type/color/motion system before implementation.
- Need to improve responsive quality across mobile and desktop.

## Inputs To Gather First

- Primary user goal for this screen.
- Target audience and tone keywords.
- Must-keep content or existing design-system constraints.
- Platform context (web app, landing page, dashboard, mobile web).
- Accessibility and performance constraints.

## Procedure

1. Define the design brief.
   - Identify the single most important user action.
   - Write a one-line visual intent statement (what this UI should feel like).
   - List hard constraints (brand colors, existing components, legal text, etc.).
2. Pick a visual direction.
   - Propose 2-3 distinct directions.
   - Choose one direction based on product goal and audience fit.
3. Build tokens before components.
   - Define CSS variables for color, typography, spacing, radius, border, and shadow.
   - Establish typography scale and rhythm before detailed layout work.
4. Build layout hierarchy.
   - Start mobile-first.
   - Define clear sections, focal area, and scanning flow.
   - Expand to desktop with intentional reflow, not just stretched columns.
5. Add signature styling.
   - Use expressive typography choices and purposeful color contrast.
   - Add atmospheric background treatment (gradient, shape field, subtle pattern, texture).
   - Avoid generic card grids unless they truly fit the content.
6. Add meaningful motion.
   - Use a small set of purposeful animations: load reveal, staggered section entry, emphasis transitions.
   - Honor reduced-motion preferences.
7. Validate quality gates.
   - Check responsive behavior on narrow and wide viewports.
   - Check accessibility basics (contrast, focus visibility, readable text sizes).
   - Check visual consistency against tokens.
8. Deliver implementation summary.
   - Explain visual direction, key token choices, and why they support product goals.
   - List files changed and key behaviors to verify.

## Decision Logic

- If working inside an existing design system: preserve established patterns, then add only minimal visual enhancements.
- If no design system exists: create a compact token layer first to avoid one-off styles.
- If content density is high: prioritize typography hierarchy and spacing clarity before adding decorative effects.
- If this is a marketing surface: prioritize brand expression and first-impression storytelling.

## Quality Criteria (Done When)

- UI has a clear visual identity and does not look template-generated.
- Typography, colors, spacing, and motion follow a consistent token system.
- Mobile and desktop both feel intentionally designed.
- Accessibility basics are covered and reduced-motion is respected.
- The implementation avoids default stacks and generic purple-on-white styling unless explicitly required by existing brand rules.

## Practical References

- [Direction prompts](./references/direction-prompts.md)
- [Quality checklist](./references/quality-checklist.md)
