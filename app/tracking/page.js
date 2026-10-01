import { Suspense } from "react";
import Link from "next/link";
import AnnouncementBar from "../components/AnnouncementBar";
import SiteHeader from "../components/SiteHeader";
import SiteFooter from "../components/SiteFooter";
import WhatsAppFloat from "../components/WhatsAppFloat";
import JsonLd from "../components/JsonLd";
import TrackingClient from "./TrackingClient";
import { BUSINESS, pageMeta } from "@/lib/seo";
import { breadcrumbs, webPage } from "@/lib/schema";
import { getRateFacts } from "@/lib/rates";
import { STATUS_MEANINGS } from "@/lib/tracking-statuses";

const PATH = "/tracking";
const TITLE = "Track Cargo to Pakistan | Live Shipment Tracking | PAK Cargo";

export const metadata = pageMeta({
  title: TITLE,
  description:
    "Track cargo to Pakistan in seconds with your tracking number. No account needed. See every stage from UK collection to delivery. Track your shipment now.",
  path: PATH,
});

const H2 = "mt-12 text-[clamp(22px,2.8vw,28px)] font-extrabold";
const BODY = "mt-3 text-[16px] leading-[1.7] text-muted";

export default async function TrackingPage() {
  const { air, sea } = await getRateFacts();

  return (
    <div className="bg-bg-soft">
      <JsonLd
        data={webPage({
          path: PATH,
          name: TITLE,
          description: "Track cargo to Pakistan in seconds with your tracking number.",
        })}
      />
      <JsonLd data={breadcrumbs([{ name: "Tracking", path: PATH }])} />
      <SiteHeader variant="tracking" announcement={<AnnouncementBar />} />
      <main className="wrap-narrow px-5 pt-11 pb-[72px]">
        <h1 className="text-[clamp(28px,4vw,40px)] font-extrabold">Track Your Cargo to Pakistan</h1>
        <p className="lede">
          Track your cargo to Pakistan in seconds. Enter your tracking number and the sender&rsquo;s phone number used
          for the booking to see where your shipment is, from UK collection to door delivery in Pakistan or Kashmir.
        </p>

        <Suspense fallback={null}>
          <TrackingClient />
        </Suspense>

        <div className="max-w-[72ch]">
          <h2 className={H2}>What You Need to Track Your Cargo</h2>
          <p className={BODY}>
            You need two things, both printed on your invoice: your tracking number and the sender&rsquo;s phone
            number used for the booking. You don&rsquo;t need an account or a password. If you&rsquo;ve lost your
            invoice, message us on WhatsApp with the sender&rsquo;s name and collection date and we&rsquo;ll send your
            tracking number again.
          </p>

          <h2 className={H2}>What Each Tracking Status Means</h2>
          <p className={BODY}>Your shipment moves through these stages on its way to Pakistan:</p>
          <ol className="mt-3 flex list-decimal flex-col gap-2 pl-6 text-[16px] leading-[1.6] text-muted marker:font-bold marker:text-green">
            {STATUS_MEANINGS.map((s) => (
              <li key={s.status}>
                <strong className="text-ink">{s.status}</strong> &mdash; {s.meaning}
              </li>
            ))}
          </ol>

          <h2 className={H2}>How Long Does Cargo Take to Reach Pakistan?</h2>
          <p className={BODY}>
            Air cargo usually reaches the door {air.time} after collection, and sea cargo {sea.time}. Customs
            clearance is normally the stage that varies most, especially in busy periods such as the weeks before
            Eid. Deliveries to outlying districts and Kashmir can take one to two days longer than deliveries to major
            cities.
          </p>
          <p className={BODY}>
            Not booked yet? Compare our <Link href="/air-cargo">air cargo</Link> and{" "}
            <Link href="/sea-cargo">sea cargo</Link> services to choose the right speed and price.
          </p>

          <div data-location="tracking-cant-find">
            <h2 className={H2}>Can&rsquo;t Find Your Shipment?</h2>
            {/* The brief's "updates can take up to one working day to appear"
                is left out: a booking is trackable the moment it is made. */}
            <p className={BODY}>
              First, check that you&rsquo;ve entered the tracking number exactly as it appears on your invoice, and
              the sender&rsquo;s phone number used for the booking. If your shipment still doesn&rsquo;t show,
              message us on WhatsApp on <a href={BUSINESS.whatsapp}>{BUSINESS.whatsappDisplay}</a> or call your
              nearest branch and we&rsquo;ll look it up for you. For common questions about delivery times, duties and
              insurance, see our <Link href="/faq">FAQ</Link>.
            </p>
          </div>

          <h2 className={H2}>Tracking Excess Baggage and Pakistan to UK Shipments</h2>
          {/* Pakistan to UK bookings aren't in the online tracker (it verifies
              a UK sender's mobile), so that half of the brief's copy is
              replaced with what actually works for those customers. */}
          <p className={BODY}>
            The same tracking page works for excess baggage, which travels as air cargo and follows the air cargo
            stages above &mdash; just enter the tracking number and the sender&rsquo;s phone number from your
            invoice. For shipments from Pakistan to the UK, message us on WhatsApp with your reference and we&rsquo;ll
            update you on where your goods are, from collection in Pakistan through UK customs clearance to delivery
            at your UK door.
          </p>
        </div>
      </main>
      <SiteFooter />
      <WhatsAppFloat />
    </div>
  );
}
