import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import tailwind from '@astrojs/tailwind';
import mdx from '@astrojs/mdx';
import fs from 'node:fs';
import path from 'node:path';
import { SITE } from './src/consts.ts';

const postDateCache = new Map();
function readPostDates(slug) {
  if (postDateCache.has(slug)) return postDateCache.get(slug);
  const file = path.join('src/content/posts', `${slug}.md`);
  let result = { pub: null, upd: null };
  try {
    const src = fs.readFileSync(file, 'utf8');
    const pub = src.match(/^pubDate:\s*([0-9-]+)/m);
    const upd = src.match(/^updatedDate:\s*([0-9-]+)/m);
    if (pub) result.pub = new Date(pub[1]);
    if (upd) result.upd = new Date(upd[1]);
  } catch {}
  postDateCache.set(slug, result);
  return result;
}

export default defineConfig({
  site: SITE.url,
  trailingSlash: 'always',
  build: {
    format: 'directory',
  },
  integrations: [
    tailwind({ applyBaseStyles: false }),
    mdx(),
    sitemap({
      filter: (page) => !page.includes('/404'),
      serialize(item) {
        const url = item.url;
        if (url === `${SITE.url}/`) {
          return { ...item, priority: 1.0, changefreq: 'weekly' };
        }
        const postMatch = url.match(/\/posts\/([^/]+)\//);
        if (postMatch) {
          const { pub, upd } = readPostDates(postMatch[1]);
          const last = upd ?? pub;
          return {
            ...item,
            priority: 0.8,
            changefreq: 'monthly',
            lastmod: last ? last.toISOString() : item.lastmod,
          };
        }
        if (url.includes('/tags/')) {
          return { ...item, priority: 0.5, changefreq: 'monthly' };
        }
        if (url.includes('/archive/')) {
          return { ...item, priority: 0.6, changefreq: 'weekly' };
        }
        if (url.includes('/about/')) {
          return { ...item, priority: 0.4, changefreq: 'yearly' };
        }
        return { ...item, priority: 0.5, changefreq: 'monthly' };
      },
    }),
  ],
  markdown: {
    shikiConfig: {
      theme: 'github-dark-dimmed',
      wrap: true,
    },
  },
  prefetch: {
    prefetchAll: true,
    defaultStrategy: 'viewport',
  },
});
