import { BUSINESS } from "@/lib/seo";

const phone = (city) => BUSINESS.phones.find((p) => p.city === city);

// City landing pages. Each one is a draft until its copy has been approved:
// fill in `intro`, `areas` and `faqs`, then set `published: true`. Publishing
// is what puts the page in the sitemap, switches on its link in the footer's
// "Areas we cover" column, and links the branch name in the Contact Us phone
// table — there is nothing else to turn on.
//
// A draft is a 404 in production. With SHOW_DRAFTS=true it renders for review,
// marked noindex and kept out of the sitemap.
//
// The schema for these pages is a Service provided by the one real
// LocalBusiness in Nottingham. Don't give London or Birmingham a LocalBusiness
// of their own unless the business has a real, staffed address there.
export const CITIES = [
  {
    slug: "cargo-to-pakistan-from-london",
    city: "London",
    published: false,
    title: "Cargo to Pakistan from London | Door to Door | PAK Cargo",
    description:
      "Send cargo to Pakistan from London with UK collection, weekly air flights and sea containers. Call our London line on 020 3916 6786 for a free quote.",
    h1: "Cargo to Pakistan from London",
    phone: phone("London"),
    intro: "",
    areas: "",
    // [{ q, a }] — 3 or 4 city-specific questions; also output as FAQPage schema.
    faqs: [],
  },
  {
    slug: "cargo-to-pakistan-from-birmingham",
    city: "Birmingham",
    published: false,
    title: "Cargo to Pakistan from Birmingham | Door to Door | PAK Cargo",
    description:
      "Send cargo to Pakistan from Birmingham with door collection, weekly air flights and sea containers. Call 0121 339 5786 for a free, fixed-price quote.",
    h1: "Cargo to Pakistan from Birmingham",
    phone: phone("Birmingham"),
    intro: "",
    areas: "",
    faqs: [],
  },
  {
    slug: "cargo-to-pakistan-from-nottingham",
    city: "Nottingham",
    published: false,
    title: "Cargo to Pakistan from Nottingham | Door to Door | PAK Cargo",
    description:
      "Send cargo to Pakistan from Nottingham with collection or drop-off, weekly flights and sea containers. Call 0115 736 5786 for a free, fixed-price quote.",
    h1: "Cargo to Pakistan from Nottingham",
    phone: phone("Nottingham"),
    intro: "",
    areas: "",
    faqs: [],
  },
];

export const cityBySlug = (slug) => CITIES.find((c) => c.slug === slug);

export const publishedCities = () => CITIES.filter((c) => c.published);

// The published page for a branch, if there is one, for the Contact Us table.
export const publishedCityFor = (city) => CITIES.find((c) => c.city === city && c.published);
