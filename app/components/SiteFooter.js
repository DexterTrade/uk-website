import Link from "next/link";
import { BUSINESS } from "@/lib/seo";

export default function SiteFooter() {
  return (
    <footer className="bg-ink text-[#b9c3d6]">
      <div className="wrap grid grid-cols-[1.5fr_1fr_1fr_1.4fr] gap-10 pt-16 pb-11 max-[900px]:grid-cols-2 max-[560px]:grid-cols-1 max-[560px]:gap-8 max-[560px]:pt-12 max-[560px]:pb-8">
        <div className="max-[900px]:col-span-2">
          <Link className="mb-[18px] flex items-center gap-[10px]" href="/">
            <span className="flex h-10 w-10 items-center justify-center rounded-md bg-white p-1">
              <img className="h-full w-full object-contain" src="/assets/logo-mark.svg" alt="PAK Cargo" />
            </span>
            <span>
              <span className="block font-head text-lg leading-[1.1] font-extrabold text-white">PAK CARGO</span>
              <span className="text-[10.5px] font-medium tracking-[0.14em] text-[#8b96ad] uppercase">
                UK &harr; Pakistan Cargo
              </span>
            </span>
          </Link>
          <p className="mb-5 max-w-[36ch] text-[14.5px] leading-[1.7] text-[#b9c3d6]">
            Air and sea freight, excess baggage, and Pakistan to UK cargo &mdash; collected, cleared and
            delivered door to door, with live tracking on every shipment.
          </p>
          <a className="btn btn-green btn-sm" href={BUSINESS.whatsapp}>Quick Response on WhatsApp</a>
        </div>

        <div>
          <h3 className="mb-[18px] font-head text-[12.5px] font-bold tracking-[0.09em] text-white uppercase">
            Services
          </h3>
          <nav className="flex flex-col gap-[11px]">
            <Link className="text-[14.5px] text-[#b9c3d6] hover:text-white" href="/sea-cargo">Sea Cargo</Link>
            <Link className="text-[14.5px] text-[#b9c3d6] hover:text-white" href="/air-cargo">Air Cargo</Link>
            <Link className="text-[14.5px] text-[#b9c3d6] hover:text-white" href="/excess-baggage">Excess Baggage</Link>
            <Link className="text-[14.5px] text-[#b9c3d6] hover:text-white" href="/pak-to-uk">Pakistan to UK</Link>
            <Link className="text-[14.5px] text-[#b9c3d6] hover:text-white" href="/moving-back-home">
              Moving Back to Pakistan
            </Link>
          </nav>
        </div>

        <div>
          <h3 className="mb-[18px] font-head text-[12.5px] font-bold tracking-[0.09em] text-white uppercase">
            Company
          </h3>
          <nav className="flex flex-col gap-[11px]">
            <Link className="text-[14.5px] text-[#b9c3d6] hover:text-white" href="/tracking">Track a shipment</Link>
            <Link className="text-[14.5px] text-[#b9c3d6] hover:text-white" href="/faq">FAQ</Link>
            <Link className="text-[14.5px] text-[#b9c3d6] hover:text-white" href="/contact-us">Contact us</Link>
          </nav>
        </div>

        <div>
          <h3 className="mb-[18px] font-head text-[12.5px] font-bold tracking-[0.09em] text-white uppercase">
            Contact
          </h3>
          <address className="mb-[18px] text-[14.5px] leading-[1.7] text-[#b9c3d6] not-italic">
            {BUSINESS.streetAddress}
            <br />
            {BUSINESS.addressLocality} {BUSINESS.postalCode}
          </address>
          <ul className="mb-[18px] flex list-none flex-col gap-[9px] p-0">
            {BUSINESS.phones.map((p) => (
              <li
                key={p.city}
                className="flex items-baseline justify-between gap-[14px] border-b border-white/[0.06] pb-[9px] text-sm"
              >
                <span className="text-[#8b96ad]">{p.city}</span>
                <a className="font-semibold whitespace-nowrap text-white" href={`tel:${p.href}`}>{p.display}</a>
              </li>
            ))}
          </ul>
          <div className="mb-[14px] flex flex-col gap-[9px] text-[14.5px]">
            <a className="font-semibold text-[#b9c3d6] hover:text-white" href={BUSINESS.whatsapp}>
              WhatsApp &middot; {BUSINESS.whatsappDisplay}
            </a>
            <a className="font-semibold text-[#b9c3d6] hover:text-white" href={`mailto:${BUSINESS.email}`}>
              {BUSINESS.email}
            </a>
          </div>
        </div>
      </div>

      <div className="wrap flex flex-wrap items-center justify-between gap-4 border-t border-white/[0.08] py-[22px] text-[13px] text-[#8b96ad]">
        <span>&copy; {new Date().getFullYear()} PAK Cargo Ltd</span>
        <span>Air &amp; sea freight, UK &harr; Pakistan</span>
      </div>
    </footer>
  );
}
