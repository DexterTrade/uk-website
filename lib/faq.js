// Single source of truth for the FAQ — rendered on /faq and reused for its
// FAQPage structured data, so the two can never drift apart. Answers are
// RichText parts (strings plus { text, href } links); the schema gets the same
// words as plain text.
//
// Built from the live rates (see lib/rates.js) because several answers quote
// a price or a delivery time, and those must follow /admin → Rates.
export function buildFaqs({ sea, air }) {
  return [
    {
      q: "How long does delivery take?",
      a: [
        `Air cargo usually takes ${air.timeWords} from collection to door delivery, with weekly departures. Sea cargo takes ${sea.timeWords} door to door, including clearance at Karachi port. Outlying districts and Kashmir can take one to two days longer.`,
      ],
    },
    {
      q: "What can I not send?",
      a: [
        "No flammable liquids, aerosols, batteries loose in the box, perishables, currency, weapons or prescription medicines without documentation. If you are unsure about an item, send us a photo before you pack it.",
      ],
    },
    {
      q: "Do you collect from my address?",
      a: [
        "Yes, anywhere on the UK mainland, usually within two working days of booking. You can also drop goods at our warehouse during opening hours.",
      ],
    },
    {
      q: "Who pays the duties in Pakistan?",
      a: [
        "Destination duties and taxes are set by Pakistan Customs and are payable by the consignee unless you ask us to prepay them. We give you an estimate in writing before the consignment departs.",
      ],
    },
    {
      q: "Is my shipment insured?",
      a: [
        "Basic carrier liability is included. All-risk cover for the full declared value is optional and charged as a percentage of that value at the time of booking.",
      ],
    },
    {
      q: "Do you ship from Pakistan to the UK as well?",
      a: [
        "Yes — air and sea freight run in both directions. See our ",
        { text: "Pakistan to UK page", href: "/pak-to-uk" },
        " for how the reverse route works.",
      ],
    },
    {
      q: "Can I send excess baggage instead of paying airline fees?",
      a: [
        "Yes. If you're flying and have more than your airline allowance, our excess baggage service collects or accepts drop-off before your flight and delivers separately — usually cheaper than airline excess fees.",
      ],
    },
    {
      q: "Do you deliver cargo to Kashmir?",
      a: [
        "Yes — both our air and sea cargo services carry on past our main Pakistani hubs with onward delivery into Kashmir. Tell us the destination town when you request a quote and we'll confirm delivery time and price.",
      ],
    },
    {
      q: "How much does it cost to send cargo to Pakistan?",
      a: [
        `Sea cargo is ${sea.perKg} per kg (${sea.minKg} kg minimum) plus a ${sea.fee} handling fee. Air cargo is ${air.perKg} per kg (${air.minKg} kg minimum) plus a ${air.fee} handling fee. Full containers and house moves are quoted individually. These rates are indicative, and your fixed price is confirmed with your quote before you book.`,
      ],
    },
    {
      q: "When is the next departure?",
      a: [
        "Air cargo departs every week, so you can book any day and your goods join the next flight. Sea containers leave on set dates, and the next departure date is shown on our ",
        { text: "Sea Cargo page", href: "/sea-cargo" },
        ". Book before the cut-off to secure your space.",
      ],
    },
    {
      q: "Can I book a full container?",
      // The brief's wording sold LCL space "by the cubic metre"; sea is
      // deliberately priced per kg on this site, so the answer says so.
      a: [
        "Yes. Along with shared-container (LCL) space priced per kg, you can book a full 20ft or 40ft container for business stock or a complete household move.",
      ],
    },
    {
      q: "How do I track my shipment?",
      a: [
        "Go to our ",
        { text: "Track a Shipment page", href: "/tracking" },
        " and enter your tracking number and the sender's phone number used for the booking. Both are printed on your invoice.",
      ],
    },
    {
      q: "Can I drop my goods off instead of booking a collection?",
      a: [
        "Yes. You can drop off at our warehouse Monday to Saturday, 9am to 6pm. Message us on WhatsApp before you come and we'll confirm the drop-off address and the best time.",
      ],
    },
    {
      q: "How do I get a quote?",
      a: [
        "Fill in the form on our ",
        { text: "Contact page", href: "/contact-us" },
        ", call your nearest branch, or message us on WhatsApp. Tell us what you're sending, the weight or size, your UK postcode and the destination city, and we reply the same working day with a fixed price.",
      ],
    },
  ];
}
