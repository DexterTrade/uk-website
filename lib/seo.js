// Central place for site-wide SEO facts. Change SITE_URL once you have a
// real domain (or set NEXT_PUBLIC_SITE_URL in your hosting env) and every
// canonical URL, the sitemap, robots.txt and structured data update with it.

export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || "https://pakcargouk.co.uk").replace(/\/$/, "");

export const SITE_NAME = "PAK Cargo";

export const BUSINESS = {
  legalName: "PAK Cargo Ltd",
  telephone: "+44 20 0000 0000",
  telephoneHref: "+442000000000",
  whatsapp: "https://wa.me/440000000000",
  email: "info@example.com",
  streetAddress: "Unit 0, Example Industrial Estate",
  addressLocality: "London",
  postalCode: "XX0 0XX",
  addressCountry: "GB",
  hours: "Mo-Sa 09:00-18:00",
};
