# CLAUDE.md

Project conventions and guardrails for Claude Code working on the Orchard docs site.

**The source of truth is [AGENTS.md](AGENTS.md).** Read it first — it covers the
stack, the five pillars (performance, accessibility, agent accessibility, SEO,
content quality), file layout, conventions, and what not to do. Everything below
is Claude-specific or worth surfacing for quick recall.

---

## Quick orientation

- **Stack:** Astro 6 + Starlight + Tailwind v4 + astro-icon. Fully static.
  Cloudflare Pages on push to `master`. Node 22.
- **Purpose:** Documentation for Orchard (an all-in-one Cashu mint manager).
  Companion to the marketing site at [orchard.space](https://orchard.space).
- **Content lives in** [src/content/docs/](src/content/docs/) as `.md`/`.mdx`;
  the file path is the URL.
- **Theme & fonts:** [src/styles/orchard.css](src/styles/orchard.css) maps the
  Orchard palette onto Starlight tokens. **Config:** [astro.config.mjs](astro.config.mjs).

## Non-negotiables (the short list)

1. **Stay static & lean.** No SSR, no server adapter, no client framework.
   Let Starlight provide the interactivity (search, theme toggle, nav).
2. **Be accurate.** Don't invent CLI commands, flags, or config you can't verify;
   link the [repo](https://github.com/cashubtc/orchard) instead.
3. **Every page has a real `title` + `description`** in frontmatter — they drive
   SEO, OG tags, and search snippets.
4. **Theme via tokens**, not arbitrary hex. Check WCAG AA on both light and dark.
5. **Keep the markdown engine consistent:** `@astrojs/mdx` is pinned to `6.0.2`
   in `package.json` `overrides` so it agrees with Starlight's
   `@astrojs/markdown-satteri` peer. Don't float it without re-checking.

## Workflow notes for Claude

- **Don't run `npm run dev` in the background.** The user runs long-lived servers
  themselves. To verify, use `npm run build` (one-shot) and report the result.
- **Plan mode for wide-reaching work.** Component overrides, dependency changes,
  restructuring the sidebar/nav, ripping out the theme — plan first.
- **Verify before declaring done.** Build the site; for UI changes, check the
  rendered output in both themes. State explicitly when you couldn't browser-test.
- **File references** in chat use markdown links with relative paths, not backticks.

## Commands

```bash
npm run build      # → dist/  (use this to verify; don't background dev)
npm run preview    # serve dist/ locally
```

---

For anything not covered here, defer to [AGENTS.md](AGENTS.md).
