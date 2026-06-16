# Orchard Docs

Documentation site for **Orchard** — the all-in-one [Cashu](https://cashu.space)
mint manager. Hosted at **[docs.orchard.space](https://docs.orchard.space)**.

Built with [Astro](https://astro.build) + [Starlight](https://starlight.astro.build)
+ [Tailwind CSS v4](https://tailwindcss.com), deployed to
[Cloudflare Pages](https://pages.cloudflare.com). Shares the stack, palette, and
fonts of the [marketing site](https://orchard.space).

## Requirements

- Node **22** (see [.nvmrc](.nvmrc))
- npm

## Local development

```bash
npm install
npm run dev      # http://localhost:4321
```

## Build & preview

```bash
npm run build    # → dist/  (includes the Pagefind search index)
npm run preview  # serve dist/ locally
```

## Project structure

```
src/
├── assets/
│   └── orchard-logo.svg     # brand mark (hardcoded gradient fills)
├── components/
│   └── CopyPrompt.astro     # "Copy prompt" CTA (clipboard → LLM primer)
├── content/
│   └── docs/                # the docs — Markdown / MDX
│       ├── index.mdx        # Overview (home, rendered in the docs layout)
│       └── getting-started.mdx
├── content.config.ts        # Starlight docs collection
└── styles/
    └── orchard.css          # Tailwind v4 + @font-face + Starlight theme tokens

public/
├── fonts/                   # self-hosted Bai Jamjuree + Tarotheque
├── favicon.ico
├── og-image.png
├── robots.txt
└── _headers                 # Cloudflare Pages cache/security headers
```

### Theme & branding

The Orchard palette and fonts are carried over from the marketing site and
mapped onto Starlight's design tokens in [src/styles/orchard.css](src/styles/orchard.css):

- **Dark is the brand default**; a warm cream **light** theme keeps the toggle
  (and `prefers-color-scheme`) working.
- **Body / UI / content headings** — Bai Jamjuree (self-hosted).
- **Header wordmark** — Tarotheque, the display face from the marketing site.
- Accent runs the logo's orange gradient (`theme-3`/`theme-4`).

Brand tokens (`--color-theme-1…7`, `--color-title`, `--color-body`) are also
exposed through Tailwind's `@theme`, so custom components can use `bg-theme-7`,
`text-title`, `font-heading`, etc., exactly as on the marketing site.

## What Starlight gives us

Full-text **search** (Pagefind, offline + keyboard-first), **accessible**
semantic output, automatic **sitemap**, dark/light theming, prev/next
pagination, and "last updated" timestamps — all static, all from the edge.

## Adding a page

1. Create a `.md` or `.mdx` file under `src/content/docs/`.
2. Give it frontmatter `title` and `description`.
3. Add it to the `sidebar` in [astro.config.mjs](astro.config.mjs) (or rely on
   autogeneration).
4. `npm run build` and confirm it appears in `dist/sitemap-index.xml`.

## Deployment

Connected to **Cloudflare Pages** via GitHub. Each PR gets a preview URL; merges
to `master` deploy production.

- Build command: `npm run build`
- Output directory: `dist`
- Node version: `22`

Fully static — no SSR, no edge functions, no adapter.

## License

See [LICENSE](LICENSE).
