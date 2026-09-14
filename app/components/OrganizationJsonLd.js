import { BUSINESS, SITE_NAME, SITE_URL } from "@/lib/seo";

export default function OrganizationJsonLd() {
  const data = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "@id": `${SITE_URL}/#organization`,
    name: SITE_NAME,
    legalName: BUSINESS.legalName,
    url: SITE_URL,
    image: `${SITE_URL}/opengraph-image.png`,
    logo: `${SITE_URL}/icon.svg`,
    description:
      "Air and sea freight forwarding from the United Kingdom to Pakistan, with UK door collection, customs clearance and optional goods insurance.",
    telephone: BUSINESS.telephoneHref,
    email: BUSINESS.email,
    priceRange: "££",
    address: {
      "@type": "PostalAddress",
      streetAddress: BUSINESS.streetAddress,
      addressLocality: BUSINESS.addressLocality,
      postalCode: BUSINESS.postalCode,
      addressCountry: BUSINESS.addressCountry,
    },
    areaServed: [
      { "@type": "Country", name: "United Kingdom" },
      { "@type": "Country", name: "Pakistan" },
    ],
    openingHoursSpecification: {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
      opens: "09:00",
      closes: "18:00",
    },
    makesOffer: [
      { "@type": "Offer", itemOffered: { "@type": "Service", name: "Air cargo, UK to Pakistan" } },
      { "@type": "Offer", itemOffered: { "@type": "Service", name: "Sea freight, UK to Pakistan" } },
      { "@type": "Offer", itemOffered: { "@type": "Service", name: "Customs clearance" } },
      { "@type": "Offer", itemOffered: { "@type": "Service", name: "Goods insurance" } },
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
