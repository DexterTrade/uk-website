// Central place for site-wide SEO facts. Change SITE_URL once you have a
// real domain (or set NEXT_PUBLIC_SITE_URL in your hosting env) and every
// canonical URL, the sitemap, robots.txt and structured data update with it.

export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || "https://pakcargouk.co.uk").replace(/\/$/, "");

export const SITE_NAME = "PAK Cargo";

const DEFAULT_OG_IMAGE = { url: "/opengraph-image.png", width: 1200, height: 630, alt: "PAK Cargo — door to door cargo to Pakistan" };

const INDEXABLE = {
  index: true,
  follow: true,
  googleBot: {
    index: true,
    follow: true,
    "max-image-preview": "large",
    "max-snippet": -1,
    "max-video-preview": -1,
  },
};

// Every page's metadata export should build on this, not just set
// {title, description, alternates}. Without it, a page inherits the
// root layout's openGraph/twitter block verbatim -- so sharing a link
// to any page other than the homepage produces a preview card (in
// WhatsApp, iMessage, Slack, etc.) showing the homepage's title,
// description and URL instead of that page's own.
//
// `title` is the whole <title>, brand included: the SEO brief words every
// title to fit 50–60 characters with "| PAK Cargo" already in it, so the
// layout's template must not append the brand a second time.
//
// The robots tag lives here rather than in the root layout. The 404 page gets
// its own `noindex` from Next, and a layout-level `index, follow` would sit
// beside it — two contradictory robots tags on one page.
export function pageMeta({ title, description, path, noindex = false, type = "website", image }) {
  return {
    title: { absolute: title },
    description,
    alternates: { canonical: path },
    // A page's openGraph replaces the layout's wholesale, so the shared card
    // image is restated here unless the page has a photo of its own
    // ({ url, alt }, e.g. its hero image). Next copies it into twitter:image.
    openGraph: {
      siteName: SITE_NAME,
      locale: "en_GB",
      type,
      title,
      description,
      url: path,
      images: [image || DEFAULT_OG_IMAGE],
    },
    twitter: { card: "summary_large_image", title, description },
    robots: noindex ? { index: false, follow: true } : INDEXABLE,
  };
}

// Draft city pages and blog posts render only when this is set (locally, or on
// a preview deployment), and even then carry noindex and stay out of the
// sitemap. Production leaves it unset, so a draft is simply a 404.
export const SHOW_DRAFTS = process.env.SHOW_DRAFTS === "true";

export const BUSINESS = {
  legalName: "PAK Cargo Ltd",
  phones: [
    { city: "London", display: "020 3916 6786", href: "+442039166786" },
    { city: "Birmingham", display: "0121 339 5786", href: "+441213395786" },
    { city: "Nottingham", display: "0115 736 5786", href: "+441157365786" },
  ],
  whatsapp: "https://wa.me/447935979268",
  whatsappDisplay: "07935 979268",
  email: "info@pakcargouk.co.uk",
  // Every domain the business trades under. SITE_URL is only the canonical
  // one; customers reach the site on either, so the invoice lists both rather
  // than implying the other address is not ours.
  domains: ["pakcargouk.co.uk", "pakcargouk.com"],
  // Companies House registration. A UK limited company must show this on its
  // website and on every invoice, so it appears in the footer and on the
  // printed invoice document.
  companyNumber: "17455357",
  streetAddress: "148 Sneinton Dale",
  addressLocality: "Nottingham",
  postalCode: "NG2 4HJ",
  addressCountry: "GB",
  hours: "Mo-Sa 09:00-18:00",
  // Live profiles the business owns, as { name, url }. Each one appears in the
  // footer and in the Organization/LocalBusiness `sameAs`, so the schema only
  // ever claims what a visitor can see. Empty until real URLs are supplied —
  // never add a placeholder here.
  social: [],
  // Google Business Profile. `mapsUrl` links the address text on Contact Us;
  // `mapsEmbedUrl` is the src of the embed iframe. Both stay empty until the
  // profile is verified, and the page renders nothing for either until then.
  mapsUrl: "",
  mapsEmbedUrl: "",
};

// Trustpilot TrustBox. The review strip renders nothing until `enabled` is
// switched on *and* the business unit and template ids are filled in from the
// Trustpilot dashboard. Keep it off until the first real reviews are live.
export const TRUSTPILOT = {
  enabled: false,
  businessUnitId: "",
  templateId: "",
  profileUrl: "",
};
