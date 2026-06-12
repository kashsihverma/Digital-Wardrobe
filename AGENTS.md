# Agent Instructions

Use this file before every prompt in this project. Treat it as the working agreement for building Digital Wardrobe.

## First Steps

1. Read `DESIGN.md` before making UI decisions.
2. Preserve the design language in `DESIGN.md`: Vercel-inspired, near-white canvas, ink typography, subtle hairlines, restrained shadows, and hero-scale mesh gradients only.
3. Check the existing files before editing. Follow the current project structure unless there is a clear reason to add a new folder or abstraction.
4. Keep changes scoped to the requested feature.

## Design Source Of Truth

- `DESIGN.md` is the primary design system.
- Use its color, typography, spacing, radius, elevation, and component rules.
- Headlines should be sentence-case, weight `600`, and use the negative tracking defined in the design file.
- Use mono typography only for technical captions, labels, code, and small metadata.
- Do not introduce random colors, heavy shadows, all-caps headlines, decorative blobs, or one-note palettes.
- Keep cards at the radii specified in `DESIGN.md`, usually `8px` or `12px`.

## MCP Servers And Research

Use MCP servers before guessing when the task touches their area:

- Astro MCP: use for Astro routing, layouts, images, content collections, integrations, islands, deployment, and current framework guidance.
- shadcn MCP: use for component registry, installation guidance, UI component APIs, and shadcn blocks. If the MCP tool is unavailable in the current session, use `npx shadcn@latest` commands as a fallback.
- Figma MCP: use when available to inspect design files, frames, tokens, spacing, typography, and visual details. If unavailable, ask for the Figma file/link or continue from `DESIGN.md`.

Prefer official docs or MCP results over memory for framework-specific behavior.

## Tech Stack

- Framework: Astro.
- Styling: Tailwind CSS 4.
- UI primitives: shadcn/ui where useful.
- Interactivity: React islands only where needed.
- Static sections: Astro components by default.
- Images: Astro image components from `astro:assets` for optimized local and approved remote images.

Do not hydrate the whole page just to use React. Keep Astro static-first and add client islands for specific interactions such as filters, drawers, dialogs, upload flows, outfit builders, carousels, and dashboards.

## File Organization

Use multiple focused files for each website function instead of large monolithic files.

Recommended structure:

```text
src/
  assets/
  components/
    layout/
    sections/
    wardrobe/
    ui/
  data/
  lib/
  layouts/
  pages/
  styles/
```

Guidelines:

- Put shared page chrome in `src/layouts/`.
- Put header, footer, navigation, and shell components in `src/components/layout/`.
- Put landing page sections in `src/components/sections/`.
- Put Digital Wardrobe product features in `src/components/wardrobe/`.
- Put shadcn-generated components in `src/components/ui/`.
- Put reusable data arrays in `src/data/`.
- Put utilities and formatting helpers in `src/lib/`.
- Put global Tailwind/theme styles in `src/styles/global.css`.
- Keep each file focused on one responsibility.

## Tailwind 4 Rules

- Use Tailwind 4 with `@import "tailwindcss";`.
- Define project tokens in CSS using Tailwind 4 theme variables when needed.
- Map `DESIGN.md` tokens into reusable CSS variables or Tailwind theme tokens.
- Prefer utility classes for layout and spacing, but extract repeated patterns into components.
- Avoid inline magic values unless they come directly from `DESIGN.md` or solve a precise layout need.

## shadcn Rules

- Use shadcn for accessible primitives such as button, card, dialog, sheet, dropdown-menu, form, input, select, tabs, accordion, table, sidebar, skeleton, sonner, tooltip, and navigation-menu.
- Adapt shadcn styles to match `DESIGN.md`; do not accept default visual styling blindly.
- Keep shadcn components in `src/components/ui/`.
- Use shadcn React components inside React islands when interactivity is required.
- Use Astro components for static marketing sections even when they visually resemble shadcn cards.

## Frontend Quality

- Build the actual usable page or feature, not a landing-page placeholder, unless a landing page is explicitly requested.
- Design for mobile, tablet, desktop, and wide desktop.
- Ensure text never overlaps, clips, or overflows its container.
- Use icons in tool buttons and controls where appropriate.
- Use real or generated bitmap visuals when a website needs visual assets.
- Avoid nested cards, decorative gradient orbs, and generic stock-like compositions.
- Keep operational/product UI quiet, scannable, and dense enough for repeated use.

## Verification

Before finishing implementation work:

1. Run `npm run build`.
2. Fix TypeScript, Astro, import, and styling errors.
3. For visual work, run the dev server and inspect the page in browser screenshots when possible.
4. Report anything that could not be verified.

## Git And Safety

- Do not revert user changes unless explicitly asked.
- Do not delete unrelated files.
- Keep generated build output out of commits unless the project expects it.
- Prefer small, explainable edits over broad rewrites.
