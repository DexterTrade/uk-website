import AnnouncementBar from "../components/AnnouncementBar";
import SiteHeader from "../components/SiteHeader";
import SiteFooter from "../components/SiteFooter";
import PageHero from "../components/PageHero";
import BottomCta from "../components/BottomCta";
import ProcessDiagram from "../components/ProcessDiagram";
import Link from "next/link";
import JsonLd from "../components/JsonLd";
import { getRateFacts } from "@/lib/rates";
import { breadcrumbs, service } from "@/lib/schema";
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

const PATH = "/pak-to-uk";

export const metadata = pageMeta({
  title: "Pakistan to UK Cargo | Air & Sea Freight | PAK Cargo",
  description:
    "Reliable Pakistan to UK cargo by air and sea. Collection across Pakistan, customs clearance and delivery to your UK door. Request your free quote today.",
  path: PATH,
});

export default async function PakToUkPage() {
  const { air, sea } = await getRateFacts();
  const airTime = air.time;
  const seaTime = sea.time;

  return (
    <>
      <JsonLd
        data={service({
          path: PATH,
          name: "Pakistan to UK Cargo",
          serviceType: "Air and sea freight",
          description:
            "Air and sea cargo from Pakistan to the UK with collection, customs clearance and UK door delivery.",
        })}
      />
      <JsonLd data={breadcrumbs([{ name: "Pakistan to UK", path: PATH }])} />
      <SiteHeader variant="service" announcement={<AnnouncementBar />} />
      <main>
        <PageHero
          eyebrow="Air & sea freight · Pakistan to UK"
          title="Pakistan to UK Cargo by Air & Sea"
          intro="The reverse route, just as handled end to end. Sending goods from Pakistan to the UK works the same way as our outbound service, in reverse: collection in Pakistan, air or sea freight, UK import clearance and door to door cargo delivery anywhere in the UK — a reliable cargo service connecting Pakistan back to the UK."
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
          <p className="lede">
            The same two services we run for{" "}
            <Link href="/">sending cargo from the UK to Pakistan</Link>, running the other way.
          </p>
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
          body="Tell us what you're sending, the collection city, and where it's going in the UK — we reply the same working day with a fixed price."
          primary={{ label: "Get a quote", href: "/contact-us" }}
          secondary={{ label: "Already sent something? Track it", href: "/tracking" }}
        />
      </main>
      <SiteFooter />
    </>
  );
}
