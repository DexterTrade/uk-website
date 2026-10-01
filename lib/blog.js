// The blog's post list. There is no CMS: a post is an entry here (its URL,
// meta fields, dates and related links) plus a body component registered in
// app/blog/posts/index.js.
//
// To publish a post: write its body, register it, set `published: true` and
// fill in `datePublished` (and `dateModified` on later edits). Publishing the
// first post is also what puts "Blog" in the navigation and footer, and /blog
// and the post in the sitemap — nothing else needs switching on.
//
// A draft (published: false) is a 404 in production. With SHOW_DRAFTS=true it
// renders for review, marked noindex and kept out of the sitemap.
export const POSTS = [
  {
    slug: "how-long-does-cargo-take-uk-to-pakistan",
    published: false,
    title: "How Long Does Cargo Take UK to Pakistan? | PAK Cargo",
    description:
      "Air cargo from the UK to Pakistan takes 8-10 days; sea cargo takes 8-10 weeks. See transit times by city, what slows shipments down, and how to plan ahead.",
    h1: "How Long Does Cargo Take from the UK to Pakistan? Air vs Sea, by City",
    focusKeyword: "how long does cargo take uk to pakistan",
    author: "PAK Cargo team",
    datePublished: null,
    dateModified: null,
    image: "/assets/photos/air-cargo.jpg",
    imageAlt: "Air cargo plane loading shipment to Pakistan",
    related: ["/air-cargo", "/sea-cargo", "/tracking"],
  },
  {
    slug: "what-can-you-send-to-pakistan-by-cargo",
    published: false,
    title: "What Can You Send to Pakistan by Cargo? | PAK Cargo",
    description:
      "See what you can and can't send to Pakistan by cargo from the UK: allowed items, banned goods, items needing paperwork and packing tips. Get a free quote.",
    h1: "What Can and Can't You Send to Pakistan by Cargo?",
    focusKeyword: "what can you send to pakistan by cargo",
    author: "PAK Cargo team",
    datePublished: null,
    dateModified: null,
    image: "/assets/photos/sea-cargo.jpg",
    imageAlt: "Sea cargo container ship shipping from the UK to Pakistan",
    related: ["/sea-cargo", "/air-cargo", "/excess-baggage", "/faq"],
  },
];

export const GUIDE_WHAT_CAN_YOU_SEND = "what-can-you-send-to-pakistan-by-cargo";

export const publishedPosts = () =>
  POSTS.filter((p) => p.published).sort((a, b) => String(b.datePublished).localeCompare(String(a.datePublished)));

export const hasPublishedPosts = () => POSTS.some((p) => p.published);

export const isPublished = (slug) => POSTS.some((p) => p.slug === slug && p.published);

export const postBySlug = (slug) => POSTS.find((p) => p.slug === slug);
