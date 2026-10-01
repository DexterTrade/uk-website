import { SITE_URL } from "@/lib/seo";
import { publishedPosts } from "@/lib/blog";
import { publishedCities } from "@/lib/cities";

// When each page's content last changed. lastmod is only useful to search
// engines if it is true, so this is a real date rather than "now" on every
// request — bump a page's date when you change what it says.
const PAGES = [
  { path: "/", priority: 1, changeFrequency: "weekly", updated: "2026-10-02" },
  { path: "/air-cargo", priority: 0.9, updated: "2026-10-02" },
  { path: "/sea-cargo", priority: 0.9, updated: "2026-10-02" },
  { path: "/excess-baggage", priority: 0.8, updated: "2026-10-02" },
  { path: "/pak-to-uk", priority: 0.8, updated: "2026-10-02" },
  { path: "/house-move", priority: 0.8, updated: "2026-10-02" },
  { path: "/tracking", priority: 0.6, updated: "2026-10-02" },
  { path: "/faq", priority: 0.5, updated: "2026-10-02" },
  { path: "/contact-us", priority: 0.7, updated: "2026-10-02" },
];

// Cities and posts publish with `published: true` and so join the sitemap
// automatically; drafts never appear here. Bump a city's date when its copy
// changes.
const CITY_UPDATED = "2026-10-02";

const entry = (path, lastModified, priority, changeFrequency = "monthly") => ({
  url: path === "/" ? `${SITE_URL}/` : `${SITE_URL}${path}`,
  lastModified,
  changeFrequency,
  priority,
});

export default function sitemap() {
  const posts = publishedPosts();
  const entries = PAGES.map((p) => entry(p.path, p.updated, p.priority, p.changeFrequency));

  for (const c of publishedCities()) entries.push(entry(`/${c.slug}`, CITY_UPDATED, 0.7));

  // /blog joins once there is something on it.
  if (posts.length) {
    const newest = posts.map((p) => p.dateModified || p.datePublished).sort().at(-1);
    entries.push(entry("/blog", newest, 0.5, "weekly"));
    for (const p of posts) entries.push(entry(`/blog/${p.slug}`, p.dateModified || p.datePublished, 0.6));
  }

  return entries;
}
