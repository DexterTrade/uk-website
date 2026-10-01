// JSON-LD builders. The homepage defines the business entities once, under
// fixed @ids; every other page refers back to them by @id instead of repeating
// the address and phone numbers.
import { BUSINESS, SITE_NAME, SITE_URL } from "@/lib/seo";

export const ORG_ID = `${SITE_URL}/#organization`;
export const LOCAL_ID = `${SITE_URL}/#localbusiness`;
export const WEBSITE_ID = `${SITE_URL}/#website`;

const abs = (path) => (path === "/" ? `${SITE_URL}/` : `${SITE_URL}${path}`);

// Only real, live profiles: an empty list leaves `sameAs` out altogether
// rather than publishing a placeholder.
function sameAs() {
  const urls = BUSINESS.social.map((s) => s.url).filter(Boolean);
  return urls.length ? { sameAs: urls } : {};
}

export function homeGraph() {
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": ORG_ID,
        name: SITE_NAME,
        legalName: BUSINESS.legalName,
        url: `${SITE_URL}/`,
        logo: `${SITE_URL}/assets/logo-mark.svg`,
        email: BUSINESS.email,
        telephone: BUSINESS.phones[0].href,
        ...sameAs(),
      },
      {
        "@type": "LocalBusiness",
        "@id": LOCAL_ID,
        name: SITE_NAME,
        url: `${SITE_URL}/`,
        image: `${SITE_URL}/opengraph-image.png`,
        telephone: BUSINESS.phones[0].href,
        email: BUSINESS.email,
        priceRange: "££",
        parentOrganization: { "@id": ORG_ID },
        address: {
          "@type": "PostalAddress",
          streetAddress: BUSINESS.streetAddress,
          addressLocality: BUSINESS.addressLocality,
          postalCode: BUSINESS.postalCode,
          addressCountry: BUSINESS.addressCountry,
        },
        openingHoursSpecification: {
          "@type": "OpeningHoursSpecification",
          dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
          opens: "09:00",
          closes: "18:00",
        },
        areaServed: ["United Kingdom", "Pakistan", "Azad Kashmir"],
        ...sameAs(),
      },
      {
        "@type": "WebSite",
        "@id": WEBSITE_ID,
        name: SITE_NAME,
        url: `${SITE_URL}/`,
        publisher: { "@id": ORG_ID },
      },
    ],
  };
}

// Home is always the first crumb, so callers pass only what comes after it.
export function breadcrumbs(items) {
  const all = [{ name: "Home", path: "/" }, ...items];
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: all.map((c, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: c.name,
      item: abs(c.path),
    })),
  };
}

export function service({ path, name, serviceType, description, areaServed }) {
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    "@id": `${abs(path)}#service`,
    name,
    serviceType,
    ...(description ? { description } : {}),
    url: abs(path),
    provider: { "@id": LOCAL_ID },
    areaServed: areaServed || [
      { "@type": "Country", name: "United Kingdom" },
      { "@type": "Country", name: "Pakistan" },
    ],
  };
}

// `faqs` are { q, text } pairs — the plain-text answer, which must match what
// the page shows word for word.
export function faqPage({ path, name, faqs }) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "@id": `${abs(path)}#faqpage`,
    url: abs(path),
    name,
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.text },
    })),
  };
}

export function webPage({ path, name, description }) {
  return {
    "@context": "https://schema.org",
    "@type": "WebPage",
    url: abs(path),
    name,
    description,
    isPartOf: { "@id": WEBSITE_ID },
    publisher: { "@id": ORG_ID },
  };
}

export function contactPage({ path, name }) {
  return {
    "@context": "https://schema.org",
    "@type": "ContactPage",
    url: abs(path),
    name,
    about: { "@id": ORG_ID },
    mainEntity: {
      "@id": ORG_ID,
      contactPoint: [
        ...BUSINESS.phones.map((p) => ({
          "@type": "ContactPoint",
          telephone: p.href,
          contactType: "customer service",
          areaServed: "GB",
          name: `${p.city} office`,
        })),
        {
          "@type": "ContactPoint",
          telephone: BUSINESS.whatsapp.replace("https://wa.me/", "+"),
          contactType: "customer service",
          name: "WhatsApp",
        },
      ],
    },
  };
}

export function blogPosting({ path, headline, datePublished, dateModified, author, image }) {
  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "@id": `${abs(path)}#article`,
    mainEntityOfPage: abs(path),
    headline,
    datePublished,
    dateModified: dateModified || datePublished,
    author: { "@type": "Person", name: author },
    ...(image ? { image: abs(image) } : {}),
    publisher: { "@id": ORG_ID },
  };
}
