# Farta Market Theme Tokens

## Source Colors

Primary colors are defined in `src/style/pages/_theme.scss`:

| Token | Value | Usage |
| --- | --- | --- |
| `main` | `#008874` | Primary brand teal, CTA, active states |
| `nomal-text` | `#1c1c1c` | Body text |
| `bold-text` | `#252525` | Headings and strong labels |
| `description` | `#ffc107` | Accent/warning highlight |

Global CSS variables are centralized in `src/style/pages/_all.scss`.
Semantic values such as `--color-danger`, `--color-success`, and `--color-info`
are existing app state colors moved into one shared location.

## Gradient Tokens

| Token | Intended Use |
| --- | --- |
| `--gradient-primary` | Main CTA buttons, active nav, selected states |
| `--gradient-primary-hover` | Hover state for primary CTA/buttons |
| `--gradient-brand` | Brand/logo text treatment |
| `--gradient-page-bg` | Global page background accent |
| `--gradient-admin-bg` | Admin shell background accent |
| `--gradient-primary-soft` | Subtle selected/hover surfaces and filters |
| `--gradient-surface` | Elevated page panels, modals, checkout/cart summaries |
| `--gradient-card` | Product cards, admin cards, assistant chat bubbles |
| `--gradient-hero-mesh` | Large storefront hero/detail image zones |
| `--gradient-glass` | Sticky navbar, secondary/ghost controls, glass panels |
| `--gradient-footer` | Footer background band |
| `--gradient-image-fade` | Image overlay fade where text/actions sit on media |
| `--gradient-card-accent` | Decorative card accent layer |
| `--gradient-danger` | Destructive actions and out-of-stock state |
| `--gradient-error-state` | Shared error state surface |
| `--gradient-success-soft` | Success messages and delivered/active badges |
| `--gradient-warning-soft` | Pending/warning status badges |
| `--gradient-info-soft` | Processing/info status badges |
| `--gradient-table-head` | Admin table header surface |
| `--gradient-product-overlay` | Product-card hover overlay |
| `--gradient-skeleton` | Loading skeleton shimmer |
| `--gradient-chart` | Admin dashboard bar chart fill |

## Rules

- Add new gradients in `_all.scss` only.
- Prefer `color-mix()` with existing variables instead of introducing loose hex values.
- Keep primary CTA text white and badge/status text on semantic color variables for contrast.
- Use `--radius-card` for cards/panels and `--radius-control` for inputs/buttons.
