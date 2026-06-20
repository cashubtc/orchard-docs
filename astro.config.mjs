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
  // Old URLs that no longer have their own page. The Install section is now
  // Overview / Installation / Configuration; the per-service connection steps
  // are env-var settings that live on the Configuration page, and the legacy
  // "Existing Mint" URLs fold in here too. Redirect them all so inbound links
  // and search results don't 404 (Astro emits static redirect pages in `dist/`).
  redirects: {
    '/existing-mint': '/install',
    '/existing-mint/bitcoin-core': '/install/configuration',
    '/existing-mint/lightning': '/install/configuration',
    '/existing-mint/mint': '/install/configuration',
    '/install/orchard': '/install/installation',
    '/install/bitcoin': '/install/configuration',
    '/install/lightning': '/install/configuration',
    '/install/taproot-assets': '/install/configuration',
    '/install/mint': '/install/configuration',
    '/install/ai': '/orchard/ai',
    // "Your Orchard" was reorganized to mirror the app's own navigation. The
    // standalone Monitoring and Configuration pages were retired: health/activity
    // now lives on the Dashboard, and mint metadata/config (plus database backup)
    // folded into the Mint page. Redirect the deployed URLs so they don't 404.
    '/orchard/monitoring': '/orchard/dashboard',
    '/orchard/configuration': '/orchard/mint',
  },
  integrations: [
    starlight({
      title: 'Orchard Docs',
      description:
        'Documentation for Orchard — the all-in-one Cashu mint manager. Guides for setting up and running your own sovereign bank in cyberspace.',
      // Emits /llms.txt (a curated map), /llms-full.txt (the whole corpus),
      // /llms-small.txt (a trimmed variant), and one subset per journey — all
      // static files generated at build for AI agents. Pairs with the per-page
      // `<slug>.md` endpoint (src/pages/[...slug].md.ts). See AGENTS.md pillar 3.
      plugins: [
        starlightLlmsTxt({
          projectName: 'Orchard',
          description:
            'Operator documentation for Orchard, the free, self-hosted, all-in-one Cashu mint manager. Written for people running their own Bitcoin + Lightning + Cashu mint, not for API consumers.',
          details: [
            'Orchard is a free, open-source, self-hosted web app that manages a complete Cashu mint stack — Bitcoin Core, a Lightning node, the mint, and the machine they run on — from one dashboard.',
            'These are product/operator docs for self-hosters setting up and running their own mint, not developer API docs. The source code lives at https://github.com/cashubtc/orchard; this site is canonical for how to install, run, and operate Orchard.',
            'Append `.md` to any page URL (for example https://docs.orchard.space/new-mint/system.md) to fetch that page as raw Markdown.',
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
                'Operate Orchard day to day: set up the instance, settings, crew, the change log, the dashboard, the Bitcoin/Lightning/Mint service views (including mint database backup and restore), and the built-in AI assistant.',
              paths: ['orchard', 'orchard/**'],
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
        // Adds a <link rel="alternate" type="text/markdown"> per page pointing at
        // its `<slug>.md` variant, so agents can auto-discover the raw Markdown.
        Head: './src/components/Head.astro',
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
            { label: 'Overview', slug: 'install' },
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
            { label: 'Dashboard', slug: 'orchard/dashboard' },
            { label: 'Bitcoin', slug: 'orchard/bitcoin' },
            { label: 'Lightning', slug: 'orchard/lightning' },
            { label: 'Mint', slug: 'orchard/mint' },
            { label: 'AI', slug: 'orchard/ai' },
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
