import { Suspense } from "react";
import SiteHeader from "../components/SiteHeader";
import SiteFooter from "../components/SiteFooter";
import WhatsAppFloat from "../components/WhatsAppFloat";
import TrackingClient from "./TrackingClient";
import { pageMeta } from "@/lib/seo";

export const metadata = pageMeta({
  title: "Track a Shipment",
  description:
    "Track your PAK Cargo shipment from the UK to Pakistan. Enter your AWB, tracking number or booking reference.",
  path: "/tracking",
});

export default function TrackingPage() {
  return (
    <div className="bg-bg-soft">
      <SiteHeader variant="tracking" />
      <Suspense fallback={null}>
        <TrackingClient />
      </Suspense>
      <SiteFooter />
      <WhatsAppFloat />
    </div>
  );
}
