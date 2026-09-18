import { SITE_NAME } from "@/lib/seo";

export default function manifest() {
  return {
    name: `${SITE_NAME} — Air & Sea Freight, UK ⇄ Pakistan`,
    short_name: SITE_NAME,
    description: "Track shipments for air and sea freight, excess baggage, and Pakistan to UK cargo.",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#01a159",
    icons: [
      { src: "/apple-icon.png", sizes: "180x180", type: "image/png" },
      { src: "/icon.svg", sizes: "any", type: "image/svg+xml" },
    ],
  };
}
