import Link from "next/link";
import { BUSINESS } from "@/lib/seo";

export default function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="wrap footer-grid">
        <div className="footer-brand">
          <Link className="brand" href="/">
            <span className="mark">
              <img src="/assets/logo-mark.svg" alt="PAK Cargo" />
            </span>
            <span>
              <span className="name">PAK CARGO</span>
              <span className="tag">UK &harr; Pakistan Cargo</span>
            </span>
          </Link>
          <p className="footer-tagline">
            Air and sea freight, excess baggage, and Pakistan to UK cargo &mdash; collected, cleared and
            delivered door to door, with live tracking on every shipment.
          </p>
          <a className="btn btn-green btn-sm" href={BUSINESS.whatsapp}>Message us on WhatsApp</a>
        </div>

        <div className="footer-col">
          <h3>Services</h3>
          <nav>
            <Link href="/sea-cargo">Sea Cargo</Link>
            <Link href="/air-cargo">Air Cargo</Link>
            <Link href="/excess-baggage">Excess Baggage</Link>
            <Link href="/pak-to-uk">Pakistan to UK</Link>
          </nav>
        </div>

        <div className="footer-col">
          <h3>Company</h3>
          <nav>
            <Link href="/tracking">Track a shipment</Link>
            <Link href="/faq">FAQ</Link>
            <Link href="/contact-us">Contact us</Link>
          </nav>
        </div>

        <div className="footer-col footer-contact">
          <h3>Contact</h3>
          <address>
            {BUSINESS.streetAddress}
            <br />
            {BUSINESS.addressLocality} {BUSINESS.postalCode}
          </address>
          <ul className="footer-phones">
            {BUSINESS.phones.map((p) => (
              <li key={p.city}>
                <span className="city">{p.city}</span>
                <a href={`tel:${p.href}`}>{p.display}</a>
              </li>
            ))}
          </ul>
          <div className="footer-extra">
            <a href={BUSINESS.whatsapp}>WhatsApp &middot; {BUSINESS.whatsappDisplay}</a>
            <a href={`mailto:${BUSINESS.email}`}>{BUSINESS.email}</a>
          </div>
          <p className="footer-hours">Mon&ndash;Sat, 9am&ndash;6pm</p>
        </div>
      </div>

      <div className="wrap footer-bottom">
        <span>&copy; {new Date().getFullYear()} PAK Cargo Ltd</span>
        <span>Air &amp; sea freight, UK &harr; Pakistan</span>
      </div>
    </footer>
  );
}
