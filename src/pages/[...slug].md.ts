import type { APIRoute, GetStaticPaths } from 'astro';
import type { CollectionEntry } from 'astro:content';
import { getCollection } from 'astro:content';

// Per-page raw Markdown for AI agents: append `.md` to any doc URL (e.g.
// /new-mint/system.md) to fetch that page's source as clean text instead of the
// themed HTML. Fully static — prerendered into dist/ at build, no SSR. Pairs with
// the aggregate llms.txt family from starlight-llms-txt (see astro.config.mjs).
export const prerender = true;

export const getStaticPaths: GetStaticPaths = async () => {
  const docs = await getCollection('docs');
  // entry.id is the extensionless path: 'index', 'new-mint', 'new-mint/system'.
  // The [...slug] rest param maps each to /index.md, /new-mint.md, etc.
  return docs.map((entry) => ({ params: { slug: entry.id }, props: { entry } }));
};

export const GET: APIRoute = ({ props }) => {
  const entry = props.entry as CollectionEntry<'docs'>;
  const { title, description } = entry.data;

  // Drop the leading run of blank lines and component `import` statements — that's
  // build-time MDX scaffolding, not content. Everything from the first real line on
  // is preserved verbatim (Tabs/Aside/CardGrid tags included — the raw tradeoff).
  const lines = (entry.body ?? '').split('\n');
  let start = 0;
  while (start < lines.length) {
    const line = lines[start].trim();
    if (line === '' || line.startsWith('import ')) start++;
    else break;
  }
  const body = lines.slice(start).join('\n').trimEnd();

  // The rendered page's H1 comes from frontmatter, so the raw body has no title —
  // prepend the frontmatter title + description to keep each .md self-describing.
  const md = `# ${title}\n\n${description ? `${description}\n\n` : ''}${body}\n`;

  return new Response(md, {
    headers: { 'Content-Type': 'text/markdown; charset=utf-8' },
  });
};
