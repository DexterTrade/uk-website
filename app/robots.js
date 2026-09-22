import { SITE_URL } from "@/lib/seo";

export default function robots() {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        // /invoice/* are private, per-customer links. They carry a noindex
        // header of their own; this is the second line of defence.
        disallow: ["/admin", "/invoice"],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
