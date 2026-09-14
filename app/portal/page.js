import { Suspense } from "react";
import Link from "next/link";
import SiteHeader from "../components/SiteHeader";
import PortalClient from "./PortalClient";

export const metadata = {
  title: "Track a shipment & view invoices",
  description:
    "Track your PAK Cargo shipment from the UK to Pakistan and view or print your invoice. Enter your AWB, tracking number or booking reference.",
  alternates: {
    canonical: "/portal",
  },
  openGraph: {
    title: "Track a shipment & view invoices | PAK Cargo",
    description:
      "Track your PAK Cargo shipment from the UK to Pakistan and view or print your invoice.",
    url: "/portal",
  },
};

export default function PortalPage() {
  return (
    <div className="portal-body">
      <SiteHeader variant="portal" />

      <Suspense fallback={null}>
        <PortalClient />
      </Suspense>

      <footer className="site-footer">
        <div
          className="wrap-narrow bar"
          style={{ display: "flex", justifyContent: "space-between", gap: 20, flexWrap: "wrap", padding: "34px 20px", fontSize: 14 }}
        >
          <Link href="/" style={{ color: "#fff", fontFamily: "var(--font-head)", fontWeight: 700 }}>PAK CARGO</Link>
          <span style={{ color: "var(--faint)" }}>&copy; {new Date().getFullYear()} PAK Cargo Ltd &middot; Air &amp; sea freight, UK to Pakistan</span>
        </div>
      </footer>
    </div>
  );
}
