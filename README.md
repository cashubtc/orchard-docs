# Orchard Docs

Source for the **Orchard** documentation site, published at
**[docs.orchard.space](https://docs.orchard.space)**.

Orchard is an all-in-one [Cashu](https://cashu.space) mint manager. If you're
here to *read* the docs — how to install, run, and operate a mint — go to the
[live site](https://docs.orchard.space); that's the canonical reference. This
repo is just the machine that builds it. For Orchard's own source code, see
[github.com/cashubtc/orchard](https://github.com/cashubtc/orchard).

## Run it locally

```bash
npm install
npm run dev        # http://localhost:4321
```

Node **22** is required (see [.nvmrc](.nvmrc)). That's the whole setup — it's a
static [Astro](https://astro.build) + [Starlight](https://starlight.astro.build)
site, no services to stand up.

## Edit the docs

Content lives in [src/content/docs/](src/content/docs/) as Markdown / MDX, and
**the file path is the page URL** — `src/content/docs/install/configuration.mdx`
becomes `/install/configuration`. The folders group the docs by audience (install
and new-mint guides for operators, orchard for the app's features, development for
contributors); to add a page, drop a file in the right one.

Two rules every page must follow:

- **Frontmatter `title` and `description`** — they drive the page heading, SEO,
  social cards, and search snippets.
- **No invented commands or config.** These are product docs held to the same
  accuracy bar as code; if exact steps aren't known yet, say so rather than guess.

Run `npm run dev` and the page hot-reloads as you write.

## Build & deploy

```bash
npm run build      # → dist/  (static HTML + Pagefind search index)
npm run preview    # serve the built dist/ locally
```

Push to `master` deploys to **Cloudflare Pages**; every PR gets a preview URL.
Fully static — no SSR, no adapter, no edge functions.

## Conventions

Project conventions, the five quality pillars, theming, and the markdown-engine
version pin all live in **[AGENTS.md](AGENTS.md)** — the source of truth for both
human and AI contributors. Read it before any non-trivial change.
[CLAUDE.md](CLAUDE.md) is the Claude Code-specific companion and defers to it.

## License

[MIT](LICENSE) © Cashu
