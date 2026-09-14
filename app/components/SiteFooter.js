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
          <Link href="/#services">Services</Link>
          <Link href="/#rates">Rates</Link>
          <Link href="/portal">Track</Link>
          <Link href="/admin">Admin</Link>
          <Link href="/#faq">FAQ</Link>
          <Link href="/#contact">Contact</Link>
        </nav>
        <div style={{ fontSize: 13.5, color: "var(--faint)" }}>
          &copy; {new Date().getFullYear()} PAK Cargo Ltd &middot; Air &amp; sea freight, UK to Pakistan
        </div>
      </div>
    </footer>
  );
}
