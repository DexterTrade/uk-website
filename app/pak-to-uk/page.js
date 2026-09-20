import SiteHeader from "../components/SiteHeader";
import SiteFooter from "../components/SiteFooter";
import PageHero from "../components/PageHero";
import BottomCta from "../components/BottomCta";
import ProcessDiagram from "../components/ProcessDiagram";
import { createClient } from "@/lib/supabase/server";
import { pageMeta } from "@/lib/seo";

const STEPS = [
  {
    title: "Get a quote",
    body: "Send us weight or volume, and the collection and delivery addresses. We quote a fixed all-in price, air or sea.",
  },
  {
    title: "Collected in Pakistan",
    body: "Our agents collect from the shipper in Pakistan, or accept drop-off at a local depot.",
  },
  {
    title: "Export & transit",
    body: "Export paperwork is filed, and the consignment travels by air or sea to the UK.",
  },
  {
    title: "Cleared & delivered",
    body: "UK import clearance, then door delivery to the consignee.",
  },
];

export const metadata = pageMeta({
  title: "Pakistan to UK Freight",
  description:
    "Pakistan to UK cargo by air and sea freight, with collection in Pakistan, UK customs clearance and door delivery across the UK from a trusted cargo service.",
  path: "/pak-to-uk",
});

export default async function PakToUkPage() {
  const supabase = await createClient();
  const { data: ratesRaw } = await supabase.from("rates").select("mode, estimated_time");
  const rateByMode = Object.fromEntries((ratesRaw || []).map((r) => [r.mode, r]));
  const airTime = rateByMode.air?.estimated_time || "8–10 days";
  const seaTime = rateByMode.sea?.estimated_time || "8–10 weeks";

  return (
    <>
      <SiteHeader variant="service" />
      <main>
        <PageHero
          eyebrow="Air & sea freight · Pakistan to UK"
          title="The reverse route, just as handled end to end."
          intro="Sending goods from Pakistan to the UK works the same way as our outbound service, in reverse: collection in Pakistan, air or sea freight, UK import clearance and door to door cargo delivery anywhere in the UK &mdash; a reliable cargo service connecting Pakistan back to the UK."
          stats={[
            { n: airTime, l: "Air, door to door" },
            { n: seaTime, l: "Sea, port to door" },
            { n: "UK-wide", l: "Delivery on arrival" },
          ]}
          ctas={[
            { label: "Request a quote", href: "/contact-us", variant: "btn-navy" },
            { label: "Track a shipment", href: "/tracking", variant: "btn-ghost" },
          ]}
        />

        <div className="wrap">
          <div className="route-strip">
            <span className="route-city">Karachi</span>
            <span className="route-city">Lahore</span>
            <span className="route-city">Islamabad</span>
            <span className="route-arrow">&rarr;</span>
            <span className="route-city route-dest">UK, door to door</span>
          </div>
        </div>

        <section className="section wrap">
          <h2 className="h-sec">Air or sea, from Pakistan</h2>
          <p className="lede">The same two services as our outbound route, running the other way.</p>
          <div className="cards">
            <article className="svc">
              <div className="num">01</div>
              <h3>Air cargo</h3>
              <p>Consolidated air cargo from Karachi, Lahore and Islamabad to the UK, for parcels, documents, samples and anything time-critical.</p>
            </article>
            <article className="svc">
              <div className="num alt">02</div>
              <h3>Sea freight</h3>
              <p>Shared-container (LCL) or full-container (FCL) sea freight from Karachi &mdash; the economical option for volume and business stock.</p>
            </article>
            <article className="svc">
              <div className="num">03</div>
              <h3>UK customs clearance</h3>
              <p>We handle import declarations and UK customs clearance on arrival, with any duties or VAT estimated up front.</p>
            </article>
            <article className="svc">
              <div className="num alt">04</div>
              <h3>UK-wide delivery</h3>
              <p>Door delivery anywhere on the UK mainland once your shipment has cleared customs.</p>
            </article>
          </div>
        </section>

        <section className="band-soft">
          <div className="section wrap">
            <h2 className="h-sec">How it works</h2>
            <p className="lede">Collection in Pakistan to door delivery in the UK &mdash; four steps.</p>
            <ProcessDiagram steps={STEPS} />
          </div>
        </section>

        <p className="wrap fine -mt-2 mb-10">
          Rates for the Pakistan &rarr; UK route depend on the collection city and current space &mdash; send us the details on the contact
          page and we&rsquo;ll reply with a fixed price the same working day.
        </p>

        <BottomCta
          title="Sending something from Pakistan to the UK?"
          body="Tell us what you're sending, the collection city, and where it's going in the UK &mdash; we reply the same working day with a fixed price."
          primary={{ label: "Get a quote", href: "/contact-us" }}
          secondary={{ label: "Already sent something? Track it", href: "/tracking" }}
        />
      </main>
      <SiteFooter />
    </>
  );
}
