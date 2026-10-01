import Link from "next/link";
import SiteHeader from "./components/SiteHeader";
import SiteFooter from "./components/SiteFooter";
import WhatsAppFloat from "./components/WhatsAppFloat";
import { BUSINESS } from "@/lib/seo";

const LINKS = [
  { href: "/sea-cargo", label: "Sea Cargo" },
  { href: "/air-cargo", label: "Air Cargo" },
  { href: "/excess-baggage", label: "Excess Baggage" },
  { href: "/pak-to-uk", label: "Pakistan to UK" },
  { href: "/house-move", label: "House Move" },
  { href: "/tracking", label: "Track a shipment" },
  { href: "/faq", label: "FAQ" },
  { href: "/contact-us", label: "Contact us" },
];

// Still answers with HTTP 404, and Next adds the one robots tag it needs
// (noindex) — which is why the root layout sets no robots tag of its own.
export default function NotFound() {
  return (
    <>
      <SiteHeader variant="service" />
      <main className="wrap section">
        <span className="eyebrow">Error 404</span>
        <h1 className="mt-[18px] text-[clamp(30px,4.5vw,46px)] font-extrabold">Sorry, we can&rsquo;t find that page</h1>
        <p className="lede">
          The page may have moved, or the link may be mistyped. These will get you where you need to go:
        </p>
        <ul className="mt-8 grid max-w-[720px] list-none grid-cols-[repeat(auto-fill,minmax(200px,1fr))] gap-3 p-0">
          {LINKS.map((l) => (
            <li key={l.href}>
              <Link
                href={l.href}
                className="block rounded-[10px] border border-line bg-white px-4 py-3 font-semibold text-ink hover:border-green hover:text-green"
              >
                {l.label} &rarr;
              </Link>
            </li>
          ))}
        </ul>
        <a className="btn btn-green mt-8" href={BUSINESS.whatsapp} data-location="not-found">
          Quick Response on WhatsApp
        </a>
      </main>
      <SiteFooter />
      <WhatsAppFloat />
    </>
  );
}
