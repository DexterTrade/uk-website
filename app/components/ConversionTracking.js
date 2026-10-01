"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { BUSINESS } from "@/lib/seo";
import { linkLocation, track } from "@/lib/track";

// dataLayer event name per kind of contact link.
function eventFor(link) {
  const href = link.getAttribute("href") || "";
  if (href.startsWith("tel:")) return "phone_click";
  if (href.startsWith("mailto:")) return "email_click";
  return "whatsapp_click";
}

// Where the click came from, plus the branch for a phone number — read from
// the number itself, so no link has to be tagged by hand.
function contextFor(link) {
  const params = { link_location: linkLocation(link) };
  const href = link.getAttribute("href") || "";
  if (href.startsWith("tel:")) {
    const branch = BUSINESS.phones.find((p) => href === `tel:${p.href}`);
    if (branch) params.branch = branch.city.toLowerCase();
  }
  return params;
}

// Every way a visitor actually makes contact: the branch numbers, WhatsApp and
// email, wherever on the site they appear.
const CONTACT_LINKS = [
  'a[href^="tel:"]',
  'a[href^="mailto:"]',
  'a[href*="wa.me"]',
  'a[href*="web.whatsapp.com"]',
].join(", ");

// One delegated listener rather than an onClick on each link: they live in
// seven files, several of them Server Components that would have to become
// client components purely to carry a handler, and a contact link added later
// would otherwise go silently untracked.
export default function ConversionTracking() {
  const pathname = usePathname();

  useEffect(() => {
    // /admin is staff running the business, not a sales enquiry. Counting
    // those would inflate the very figure the ad spend is judged on.
    if (pathname?.startsWith("/admin")) return undefined;

    function onClick(event) {
      if (event.defaultPrevented || event.button !== 0) return;
      // Modifier-clicks open a copy elsewhere rather than making contact.
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      if (!(event.target instanceof Element)) return;
      const link = event.target.closest(CONTACT_LINKS);
      if (!link) return;
      // A link that belongs to something which reports its own conversion —
      // the enquiry form's "open the chat here" fallback — must not count
      // the same enquiry twice.
      if (link.hasAttribute("data-no-conversion")) return;

      // Reported without intercepting the click, and without handing over a
      // url: gtag sends on a beacon that survives the page unload, so the
      // navigation can be left alone rather than made to wait on the tag.
      window.gtag_report_conversion?.();
      track(eventFor(link), contextFor(link));
    }

    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, [pathname]);

  return null;
}
