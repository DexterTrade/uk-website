// The five service pages, for the places that list or link to all of them:
// the city pages' "Services from …" cards and the blog's related-services
// block.
export const SERVICES = [
  {
    href: "/sea-cargo",
    name: "Sea Cargo",
    blurb: "The economical way to send heavy and bulky goods, door to door through Karachi.",
  },
  {
    href: "/air-cargo",
    name: "Air Cargo",
    blurb: "Weekly flights to Pakistan for parcels, documents, gifts and anything urgent.",
  },
  {
    href: "/excess-baggage",
    name: "Excess Baggage",
    blurb: "Flying with more than your allowance? Send the extra as cargo instead.",
  },
  {
    href: "/pak-to-uk",
    name: "Pakistan to UK",
    blurb: "The same door to door service in reverse, by air or sea.",
  },
  {
    href: "/house-move",
    name: "House Move",
    blurb: "Packing, collection and shipping for families moving back to Pakistan.",
  },
];

export const serviceByHref = (href) => SERVICES.find((s) => s.href === href);
