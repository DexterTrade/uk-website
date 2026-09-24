import { SITE_URL } from "@/lib/seo";

export default function sitemap() {
  const now = new Date();

  const page = (path, priority, changeFrequency = "monthly") => ({
    url: `${SITE_URL}${path}`,
    lastModified: now,
    changeFrequency,
    priority,
  });

  return [
    page("/", 1, "weekly"),
    page("/air-cargo", 0.9),
    page("/sea-cargo", 0.9),
    page("/excess-baggage", 0.8),
    page("/pak-to-uk", 0.8),
    page("/house-move", 0.8),
    page("/tracking", 0.6),
    page("/faq", 0.5),
    page("/contact-us", 0.7),
  ];
}
