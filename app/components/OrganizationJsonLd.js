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
      "Direct cargo service by sea and by air between the United Kingdom, Pakistan and Kashmir, plus excess baggage shipping, with UK door collection, customs clearance and optional goods insurance.",
    telephone: BUSINESS.phones[0].href,
    email: BUSINESS.email,
    priceRange: "££",
    address: {
      "@type": "PostalAddress",
      streetAddress: BUSINESS.streetAddress,
      addressLocality: BUSINESS.addressLocality,
      postalCode: BUSINESS.postalCode,
      addressCountry: BUSINESS.addressCountry,
    },
    contactPoint: [
      ...BUSINESS.phones.map((p) => ({
        "@type": "ContactPoint",
        telephone: p.href,
        contactType: "customer service",
        areaServed: p.city,
        availableLanguage: ["en"],
      })),
      {
        "@type": "ContactPoint",
        telephone: BUSINESS.whatsapp.replace("https://wa.me/", "+"),
        contactType: "customer service",
        url: BUSINESS.whatsapp,
        availableLanguage: ["en"],
      },
    ],
    areaServed: [
      { "@type": "Country", name: "United Kingdom" },
      { "@type": "Country", name: "Pakistan" },
      { "@type": "AdministrativeArea", name: "Azad Kashmir" },
    ],
    openingHoursSpecification: {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
      opens: "09:00",
      closes: "18:00",
    },
    makesOffer: [
      { "@type": "Offer", itemOffered: { "@type": "Service", name: "Sea cargo, UK to Pakistan" } },
      { "@type": "Offer", itemOffered: { "@type": "Service", name: "Air cargo, UK to Pakistan" } },
      { "@type": "Offer", itemOffered: { "@type": "Service", name: "Cargo to Kashmir" } },
      { "@type": "Offer", itemOffered: { "@type": "Service", name: "Excess baggage shipping" } },
      { "@type": "Offer", itemOffered: { "@type": "Service", name: "Air & sea cargo, Pakistan to UK" } },
      { "@type": "Offer", itemOffered: { "@type": "Service", name: "Household relocation, UK to Pakistan" } },
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
