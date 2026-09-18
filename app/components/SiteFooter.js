import Link from "next/link";

export default function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="wrap bar">
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span className="mark">
            <img src="/assets/logo-mark.svg" alt="PAK Cargo" />
          </span>
          <span style={{ fontFamily: "var(--font-head)", fontWeight: 800, fontSize: 17, color: "#fff" }}>
            PAK CARGO
          </span>
        </div>
        <nav>
          <Link href="/air-cargo">Air Cargo</Link>
          <Link href="/sea-cargo">Sea Cargo</Link>
          <Link href="/excess-baggage">Excess Baggage</Link>
          <Link href="/pak-to-uk">Pak to UK</Link>
          <Link href="/tracking">Track</Link>
          <Link href="/faq">FAQ</Link>
          <Link href="/contact-us">Contact</Link>
        </nav>
        <div style={{ fontSize: 13.5, color: "var(--faint)" }}>
          &copy; {new Date().getFullYear()} PAK Cargo Ltd &middot; Air &amp; sea freight, UK &harr; Pakistan
        </div>
      </div>
    </footer>
  );
}
