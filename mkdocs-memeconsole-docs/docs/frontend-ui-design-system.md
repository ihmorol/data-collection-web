# Frontend UI Design System

This section documents the current UI tokens and behaviors as implemented in `src/app/globals.css` and page/component classes.

## Design tokens

| Token | Value | Usage |
|---|---|---|
| `--color-primary` | `#7C3AED` | Primary CTAs, highlights, focus accents |
| `--color-primary-light` | `#A78BFA` | Secondary highlights, badge text |
| `--color-primary-dark` | `#5B21B6` | Darker primary gradient balance |
| `--color-background-dark` | `#0B0118` | Main page background |
| `--color-surface-dark` | `#161021` | Header/footer/nav surfaces |
| `--color-card-dark` | `#161129` | Card containers |
| `--color-border-dark` | `#252530` | Borders and separators |
| `--color-success` | `#22C55E` | Success states |
| `--color-error` | `#EF4444` | Error states |
| `--color-warning` | `#F59E0B` | Warning states |

## Typography

Fonts loaded from Google Fonts in `src/app/layout.tsx`:

1. `Inter` for body and UI text.
2. `Plus Jakarta Sans` for display headings.
3. `Hind Siliguri` for Bangla text content.
4. `Material Icons` for iconography.

## Utility classes

| Utility class | Behavior |
|---|---|
| `.glass-card` | Semi-transparent card with blur + subtle border |
| `.glow-button` | Purple glow CTA with hover lift and pressed state |
| `.progress-gradient` | Purple gradient fill for progress bars |
| `.custom-scrollbar` | Thin themed scrollbar for internal scroll regions |

## Base accessibility and motion settings

1. `html` sets `color-scheme: dark`.
2. `*:focus-visible` has a 2px primary outline.
3. Reduced-motion media query minimizes animation and transitions.

## Page-level visual style patterns

1. Auth screens use radial gradient atmospheric backgrounds.
2. Dashboard cards use glassmorphism and border contrast.
3. Meme detail page uses sticky media pane and fixed action footer.
4. Admin dashboard uses animated counters and progress bars.

## Responsiveness patterns

1. Nav has desktop and mobile menu variants.
2. Gallery grid scales from 2 to 5 columns based on viewport.
3. Main card widths and paddings adapt for small screens.
4. Action buttons maintain touch-safe heights (`h-11` usage).

## Consistency constraints to preserve

When extending UI, keep these constraints:

1. Preserve dark-first visuals (`background-dark`, `surface-dark`, `card-dark`).
2. Reuse `glow-button`/`glass-card` before introducing new effect styles.
3. Keep icon language from Material Icons to avoid mixed icon sets.
4. Keep keyboard focus visibility and reduced-motion compliance.
