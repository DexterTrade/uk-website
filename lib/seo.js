// Central place for site-wide SEO facts. Change SITE_URL once you have a
// real domain (or set NEXT_PUBLIC_SITE_URL in your hosting env) and every
// canonical URL, the sitemap, robots.txt and structured data update with it.

export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || "https://pakcargouk.co.uk").replace(/\/$/, "");

export const SITE_NAME = "PAK Cargo";

// Every page's metadata export should build on this, not just set
// {title, description, alternates}. Without it, a page inherits the
// root layout's openGraph/twitter block verbatim -- so sharing a link
// to any page other than the homepage produces a preview card (in
// WhatsApp, iMessage, Slack, etc.) showing the homepage's title,
// description and URL instead of that page's own.
export function pageMeta({ title, description, path }) {
  const fullTitle = `${title} | ${SITE_NAME}`;
  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: { title: fullTitle, description, url: path },
    twitter: { title: fullTitle, description },
  };
}

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
};
