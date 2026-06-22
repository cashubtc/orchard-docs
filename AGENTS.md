# AGENTS.md

Guidance for AI coding agents (Claude Code, Cursor, Codex, etc.) working on the
Orchard documentation site.

> Human contributors: this is also the source of truth for project conventions.
> [CLAUDE.md](CLAUDE.md) defers to it.

---

## What this project is

The documentation site for **Orchard** — an all-in-one Cashu mint manager. It
lives at [docs.orchard.space](https://docs.orchard.space) and is the companion
to the marketing site at [orchard.space](https://orchard.space). Content first:
the job is to explain how to set up, run, and tend an Orchard-managed Cashu mint.

**These are product docs, not developer docs.** Orchard is a free, open-source,
self-hosted application, and the reader is the **operator** standing up and
running their own mint — not a developer integrating a library or calling an API.
The setup, install, and use guides *are* part of the product: a feature someone
can't figure out how to run isn't really shipped. So treat the walkthroughs as
core product surface — write for the self-hoster at the keyboard, hold the steps
to the same accuracy bar as code, and keep contributor/internal-architecture
material out of scope unless it directly helps that reader reach a working mint.

The README is being slimmed to a short pointer that links **to this site**, so
**these docs — not the README — are the canonical reference** for installing,
running, and using Orchard. Link the [repo](https://github.com/cashubtc/orchard)
for source code, releases, and issues; don't cast the README as the authority on
how to run Orchard. When a page's exact steps aren't written yet, say so and let
them land *here* — never redirect the reader to the README for the "real" steps.

**One scoped exception — the Development section.** There is a contributor-facing
**Development** section (`src/content/docs/development/`) covering how to run
Orchard from source: the dev client/server, development-only config, the unit
tests and CI, and the Playwright e2e setup. It is the deliberate exception to
"product docs, not developer docs" — keep it narrow to what helps someone build on
or contribute to Orchard, and keep the operator pages free of contributor detail.
Unlike the operator install guides, it develops against `master`/a feature branch,
not a pinned release tag.

**Stack:** [Astro 6](https://astro.build) + [Starlight](https://starlight.astro.build)
+ [Tailwind CSS v4](https://tailwindcss.com) (via `@tailwindcss/vite`) +
[astro-icon](https://github.com/natemoo-re/astro-icon). Fully static, deployed
to Cloudflare Pages on push to `master`. Node **22** (see [.nvmrc](.nvmrc)).

Markdown engine is `@astrojs/markdown-satteri` (pinned via Starlight's peer dep;
`@astrojs/mdx` is pinned to `6.0.2` in `package.json` `overrides` to keep the
satteri version consistent across the tree — don't float it).

No SSR, no edge functions, no client framework. Starlight ships the interactive
bits (search, theme toggle, mobile nav); add JavaScript only where it earns it.

---

## The five pillars

In roughly this priority order. When they trade off, prefer the higher one.

### 1. Performance & speed
- **Stay static.** Starlight pre-renders to HTML; Cloudflare serves `dist/` from
  the edge. Don't add SSR, middleware, or `output: 'server'`.
- **Don't fight Starlight's bundle.** Reach for custom `<script>` only for
  genuinely interactive behavior Starlight doesn't already provide.
- **Self-host fonts** (already done) with `font-display: swap`. The above-the-fold
  weights are preloaded in [astro.config.mjs](astro.config.mjs); keep that list
  tight. Don't add font families casually.
- **Image discipline.** Use `astro:assets` for raster images with `width`/`height`
  to prevent CLS. Prefer SVG for icons/marks.

### 2. Accessibility (humans)
- Starlight's components are accessible out of the box — don't undo that. Keep
  heading order sane (one `<h1>` per page, set by frontmatter `title`).
- New text must clear **WCAG AA (4.5:1)**. The theme tokens in
  [src/styles/orchard.css](src/styles/orchard.css) are tuned for this on both
  dark and light — verify any color you add.
- Every interactive element stays keyboard-reachable with a visible focus state.

### 3. Agent accessibility (machines & LLMs)
First-class, not an afterthought — Orchard's audience includes agents.
- Clean semantic Markdown/MDX is the best LLM-readable format. Avoid raw `<div>`
  soup in MDX; use Starlight components and real prose.
- Every page has a unique, descriptive frontmatter `title` **and** `description`
  (drives `<title>`, meta description, OG tags, and search snippets).
- `robots.txt` and the sitemap stay permissive for legitimate crawlers,
  including AI/LLM user agents.
- A future [llms.txt](https://llmstxt.org) (e.g. via `starlight-llms-txt`) is
  worth adding once there's enough content to summarize.

### 4. SEO
- Descriptive frontmatter `title` + `description` on every page.
- Stable, hyphenated, lowercase URLs (the file path under `content/docs/`).
- The sitemap is auto-generated by Starlight from `site` in the Astro config.
  Confirm new pages appear in `dist/sitemap-index.xml` after build.
- Write for humans first; agents and search engines reward the same thing.

### 5. Content quality
- **Be accurate. Don't invent commands, flags, or config.** If the exact steps
  aren't written yet, say so and let them land here — link the
  [repo](https://github.com/cashubtc/orchard) for the code, not as a stand-in
  "source of truth" for how to run Orchard. Never fabricate a plausible recipe.
- Lead with the reader's goal. Use Starlight's `Steps`, `Aside`, `Card`,
  `LinkCard`, `Tabs`, and `Code` components instead of reinventing them.
- **Write plainly: literal, not flowery.** Say what a thing does, not what it
  evokes. Avoid metaphor, idiom, and decorative phrasing; they read as vague and
  they translate badly. Every page is regenerated into multiple languages once
  content freezes (see [Localization](#localization-deferred)), and figurative
  prose is where translations drift or break. Prefer "each layer builds on the
  one below" to "each settles down to the one below." Plain English is also the
  most reliable input for the LLM readers in pillar 3.
  - **No em dashes in body prose.** Recast with a colon, parentheses, or two
    sentences. They invite run-on, comma-spliced phrasing that translates poorly.

---

## Project layout

```
src/
├── assets/orchard-logo.svg   # brand mark — hardcoded gradient fills (rendered as <img>)
├── content/docs/             # the docs (.md / .mdx); file path = URL
├── content.config.ts         # Starlight docs collection (docsLoader + docsSchema)
└── styles/orchard.css        # Tailwind v4 layers + @font-face + Starlight token overrides

public/                       # fonts, favicon.ico, og-image.png, robots.txt, _headers
```

---

## Conventions

### Theming
- All brand color/typography decisions live in [src/styles/orchard.css](src/styles/orchard.css),
  expressed as Starlight CSS custom properties (`--sl-color-*`, `--sl-font`).
  Dark is the default (`:root`); light overrides under `:root[data-theme='light']`.
- Brand tokens are also exposed via Tailwind `@theme` (`--color-theme-1…7`,
  `--color-title`, `--color-body`, `--font-heading`, `--font-body`) so custom
  components match the marketing site. Use those, not arbitrary hex.
- Tailwind utilities first; scoped component CSS second; this global file only
  for tokens, `@font-face`, and Starlight overrides.

### Customizing Starlight
- Override components via Starlight's [component overrides](https://starlight.astro.build/guides/overriding-components/)
  (the `components` config), not by patching `node_modules`.
- Don't reorder or remove the `@layer base, starlight, theme, components, utilities;`
  line at the top of `orchard.css` — the Tailwind/Starlight integration depends on it.

### What NOT to do
- Don't add React/Vue/Svelte/Solid unless a feature truly requires hydration.
- Don't switch to SSR or add a server adapter.
- Don't bypass `content.config.ts` / Starlight's content collection.
- Don't disable the strict TS config in [tsconfig.json](tsconfig.json).
- Don't float `@astrojs/mdx` off `6.0.2` without re-checking the satteri peer.

---

## Localization (deferred)

The site ships **English-only** for now, on purpose. While the docs are under
active authoring the content changes too often to keep translations in sync —
and stale locale pages that silently show English are worse than none (that was
the original "languages don't work" bug). English is the single source of truth;
translations are a derived artifact we regenerate **in one pass once content is
frozen**, not maintained alongside active edits.

**Current state:** no `locales` / `defaultLocale` in [astro.config.mjs](astro.config.mjs),
no `src/content/docs/<lang>/` directories, no sidebar `translations`. Honestly
monolingual — no language picker, no `/<lang>/` fallback routes, no fallback banner.

**Re-introducing translations (once content is frozen):**
1. Add `defaultLocale: 'root'` + the `locales` block back to the config (English
   `root` plus whatever set is wanted — last round was `es`, `de`, `ko`, `pl`).
2. Restore the per-item `translations` labels on the sidebar.
3. Translate every page to `src/content/docs/<lang>/<same-path>`.
4. Verify: `npm run build`, then a broken-link sweep over each `dist/<lang>/`.

**Conventions that held last time (reuse them):** keep protocol/product names in
English (Orchard, Cashu, Bitcoin, Lightning, LND, CLN, Nutshell, CDK, `bitcoind`,
`cdk-mintd`); treat `mint` / `ecash` / `stack` as borrowed terms, inflected
naturally; keep `<TabItem label="…">` labels English; prefix internal links with
the locale (`/es/new-mint/…`). One translator per locale keeps terminology
consistent within a language. **Never re-enable `locales` without the translated
pages in place**, or non-English routes fall back to English silently.

---

## Commands

```bash
npm install
npm run dev        # http://localhost:4321  — user runs this; do not background it
npm run build      # → dist/  (also builds the Pagefind search index)
npm run preview    # serve dist/ locally
```

No test suite or linter is configured yet. When one is added, document it here.

### Verifying a change
1. `npm run build` succeeds with no errors.
2. Load the affected page(s) via `npm run preview`.
3. For metadata/`<head>` changes: view-source on the built HTML and confirm
   `<title>`, `<meta name="description">`, OG tags, and the sitemap entry.
4. For UI changes: check both light and dark themes and keyboard navigation.

---

## Deployment

Cloudflare Pages, GitHub integration. PRs get preview URLs; merges to `master`
deploy production.

- Build: `npm run build`
- Output: `dist/`
- Node: `22`

Fully static. No environment variables in use today.
