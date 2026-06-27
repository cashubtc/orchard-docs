import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';
import starlightLlmsTxt from 'starlight-llms-txt';
import tailwindcss from '@tailwindcss/vite';
import icon from 'astro-icon';

// Production URL — drives canonical links, the auto-generated sitemap, and the
// absolute OG image URL below. Cloudflare Pages serves the built `dist/` from
// the edge; this is a fully static site (no SSR/adapter).
const site = 'https://docs.orchard.space';

// Open external links in a new tab. The New Mint pages hand off to off-site setup
// guides (MiniBolt, RaspiBolt); opening those in a new tab keeps the reader's place
// in the docs. Internal navigation (relative or same-origin links) is left alone.
// Small inline rehype pass so we don't pull in a dependency for one rule.
function rehypeExternalLinksNewTab() {
  return (tree) => {
    const visit = (node) => {
      if (node.type === 'element' && node.tagName === 'a') {
        const href = node.properties?.href;
        if (typeof href === 'string' && /^https?:\/\//i.test(href) && !href.startsWith(site)) {
          node.properties.target = '_blank';
          node.properties.rel = 'noopener noreferrer';
        }
      }
      node.children?.forEach(visit);
    };
    visit(tree);
  };
}

export default defineConfig({
  site,
  // Inline external links (the off-site guides we hand off to) open in a new tab.
  // LinkCard components aren't markdown, so external ones carry `target` directly.
  markdown: {
    rehypePlugins: [rehypeExternalLinksNewTab],
  },
  integrations: [
    starlight({
      title: 'Orchard Docs',
      description:
        'Documentation for Orchard, the all-in-one Cashu mint manager. Guides for setting up and running your own sovereign bank in cyberspace.',
      // Emits /llms.txt (a curated map), /llms-full.txt (the whole corpus),
      // /llms-small.txt (a trimmed variant), and one subset per journey — all
      // static files generated at build for AI agents. See AGENTS.md pillar 3.
      plugins: [
        starlightLlmsTxt({
          projectName: 'Orchard',
          description:
            'Operator documentation for Orchard, the free, self-hosted, all-in-one Cashu mint manager. Written for people running their own Bitcoin + Lightning + Cashu mint, not for API consumers.',
          details: [
            'Orchard is a free, open-source, self-hosted web app that manages a complete Cashu mint stack (Bitcoin Core, a Lightning node, the mint, and the machine they run on) from one dashboard.',
            'These are product/operator docs for self-hosters setting up and running their own mint, not developer API docs. The source code lives at https://github.com/cashubtc/orchard; this site is canonical for how to install, run, and operate Orchard.',
          ].join('\n\n'),
          customSets: [
            {
              label: 'New Mint',
              description:
                'Stand up a full Cashu mint stack from scratch: system, Bitcoin, Lightning, the mint, and Orchard to manage it.',
              paths: ['new-mint', 'new-mint/**'],
            },
            {
              label: 'Install',
              description:
                'Install Orchard (Node.js or Docker) and configure it with environment variables, including how to connect the services it manages: Bitcoin, Lightning, Taproot Assets, and the mint.',
              paths: ['install', 'install/**'],
            },
            {
              label: 'Your Orchard',
              description:
                'Operate Orchard day to day: set up the instance, settings, crew, the change log, the Home screen, the Bitcoin/Lightning/Mint service views (including mint database backup and restore), and the built-in AI assistant.',
              paths: ['orchard', 'orchard/**'],
            },
            {
              label: 'Development',
              description:
                'Develop Orchard from source: run the client and server locally, development-only configuration, the unit tests and CI pipeline, and the Playwright end-to-end stacks.',
              paths: ['development', 'development/**'],
            },
          ],
        }),
      ],
      // i18n is intentionally OFF while the docs are still being authored:
      // English is the single source of truth, served from the root. Locales and
      // translations get re-introduced in one pass once content is frozen — see
      // AGENTS.md "Localization (deferred)". Don't re-add `locales` without the
      // translated pages, or non-English routes fall back to English silently.
      logo: {
        src: './src/assets/orchard-logo.svg',
        alt: 'Orchard',
      },
      favicon: '/favicon.ico',
      // Carries over the marketing site's palette, fonts, and warm dark theme.
      customCss: ['./src/styles/orchard.css'],
      // Custom header chrome: the official "ORCHARD DOCS" wordmark in place of
      // the text title, and Orchard's own "nostrich" mark for the Nostr link.
      components: {
        SiteTitle: './src/components/SiteTitle.astro',
        SocialIcons: './src/components/SocialIcons.astro',
        // Re-renders the default Footer and appends a shared lightbox <dialog>
        // so `.screenshot` figures expand on click. (Footer renders once per page.)
        Footer: './src/components/Lightbox.astro',
      },
      social: [
        { icon: 'github', label: 'GitHub', href: 'https://github.com/cashubtc/orchard' },
        {
          icon: 'nostr',
          label: 'Nostr',
          href: 'https://primal.net/p/npub10rchardds5s08quj9rlpfc2a5dkdqtmcwwyxnyn32wgqrpzglxsssjyujv',
        },
        { icon: 'x.com', label: 'X', href: 'https://x.com/CashuOrchard' },
      ],
      // Surfaced by Starlight's built-in (Pagefind) search and a11y tooling.
      // 'index' is the root Overview page. When locales return, restore the
      // per-item `translations` labels here (see AGENTS.md "Localization").
      sidebar: [
        { label: 'Overview', slug: 'index' },
        {
          label: 'New Mint',
          // Collapsed by default — the longest section, and most readers land in
          // Install or Your Orchard. Starlight still auto-expands it when the
          // reader is on one of its pages.
          collapsed: true,
          items: [
            { label: 'New Mint', slug: 'new-mint' },
            { label: 'System', slug: 'new-mint/system' },
            { label: 'Bitcoin Node', slug: 'new-mint/bitcoin-node' },
            { label: 'Lightning Node', slug: 'new-mint/lightning-node' },
            { label: 'Cashu Mint', slug: 'new-mint/mint' },
            { label: 'Orchard', slug: 'new-mint/orchard' },
          ],
        },
        {
          label: 'Install',
          items: [
            { label: 'Installation', slug: 'install/installation' },
            { label: 'Configuration', slug: 'install/configuration' },
          ],
        },
        {
          label: 'Your Orchard',
          items: [
            { label: 'Your Orchard', slug: 'orchard' },
            { label: 'Setup', slug: 'orchard/setup' },
            { label: 'Settings', slug: 'orchard/settings' },
            { label: 'Crew', slug: 'orchard/crew' },
            { label: 'Change Log', slug: 'orchard/changelog' },
            { label: 'Home', slug: 'orchard/home' },
            { label: 'Bitcoin', slug: 'orchard/bitcoin' },
            { label: 'Lightning', slug: 'orchard/lightning' },
            { label: 'Mint', slug: 'orchard/mint' },
            { label: 'Ecash', slug: 'orchard/ecash' },
            { label: 'AI', slug: 'orchard/ai' },
          ],
        },
        {
          // Contributor-facing section: running Orchard from source, dev config,
          // testing/CI, and the e2e setup. The one scoped exception to the
          // "product docs, not developer docs" rule (see AGENTS.md).
          label: 'Development',
          items: [
            { label: 'Development', slug: 'development' },
            { label: 'Running Locally', slug: 'development/running-locally' },
            { label: 'Testing & CI', slug: 'development/testing' },
            { label: 'End-to-End Testing', slug: 'development/e2e' },
          ],
        },
      ],
      // Starlight emits canonical, og:title/description/type and twitter:card
      // automatically; it does not generate an OG image — supply ours here.
      head: [
        {
          tag: 'meta',
          attrs: { property: 'og:image', content: `${site}/og-image.png` },
        },
        {
          tag: 'meta',
          attrs: { name: 'twitter:image', content: `${site}/og-image.png` },
        },
        // Preload above-the-fold fonts so they fetch in parallel with the
        // document instead of after CSS parses — keeps them off the LCP chain.
        // (Bold stays lazy: it's only used below the fold.)
        ...['/fonts/bai-jamjuree/BaiJamjuree-Regular.woff2', '/fonts/bai-jamjuree/BaiJamjuree-SemiBold.woff2', '/fonts/tarotheque/Tarotheque.woff2'].map(
          (href) => ({
            tag: 'link',
            attrs: { rel: 'preload', as: 'font', type: 'font/woff2', href, crossorigin: 'anonymous' },
          }),
        ),
      ],
      lastUpdated: true,
    }),
    icon(),
  ],
  vite: {
    plugins: [tailwindcss()],
  },
});
