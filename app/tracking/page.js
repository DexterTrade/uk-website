import { Suspense } from "react";
import SiteHeader from "../components/SiteHeader";
import SiteFooter from "../components/SiteFooter";
import WhatsAppFloat from "../components/WhatsAppFloat";
import TrackingClient from "./TrackingClient";

export const metadata = {
  title: "Track a Shipment",
  description:
    "Track your PAK Cargo shipment from the UK to Pakistan. Enter your AWB, tracking number or booking reference.",
  alternates: { canonical: "/tracking" },
};

export default function TrackingPage() {
  return (
    <div className="portal-body">
      <SiteHeader variant="tracking" />
      <Suspense fallback={null}>
        <TrackingClient />
      </Suspense>
      <SiteFooter />
      <WhatsAppFloat />
    </div>
  );
}
