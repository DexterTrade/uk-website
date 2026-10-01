import Link from "next/link";
import AnnouncementBar from "../components/AnnouncementBar";
import SiteHeader from "../components/SiteHeader";
import SiteFooter from "../components/SiteFooter";
import PageHero from "../components/PageHero";
import BottomCta from "../components/BottomCta";
import NextDispatch from "../components/NextDispatch";
import JsonLd from "../components/JsonLd";
import ReviewStrip from "../components/ReviewStrip";
import StepCards from "../components/StepCards";
import { getRateFacts } from "@/lib/rates";
import { breadcrumbs, service } from "@/lib/schema";
import { pageMeta } from "@/lib/seo";

const PATH = "/sea-cargo";

// Built per request because the description quotes the live transit time.
export async function generateMetadata() {
  const { sea } = await getRateFacts();
  return pageMeta({
    title: "Sea Cargo UK to Pakistan | Door to Door Shipping | PAK Cargo",
    description: `Low-cost sea cargo from the UK to Pakistan & Kashmir. Door-to-door collection, customs clearance and home delivery in ${sea.time}. Get a free quote today.`,
    path: PATH,
    image: { url: "/assets/photos/sea-cargo.jpg", alt: "Sea cargo container ship shipping from the UK to Pakistan" },
  });
}

export default async function SeaCargoPage() {
  const { rates, sea } = await getRateFacts();

  const steps = [
    {
      title: "Tell us the volume",
      body: "Send an item list or the rough cubic metres, and the destination city. We'll confirm shared-container (LCL) space or a full 20ft/40ft container at a fixed price.",
    },
    {
      title: "Collection before the cut-off",
      body: "We collect anywhere in the UK, or you drop off at our warehouse before the next container's cut-off date. Every item is measured, labelled and logged.",
    },
    {
      title: "The container sails",
      body: `We file the export paperwork, load and seal the container, and it sails for Karachi. Allow ${sea.time} door to door.`,
    },
    {
      title: "Karachi clearance and delivery",
      body: "Our agents clear your goods at Karachi port, then deliver to the door anywhere in Pakistan, with onward delivery into Kashmir.",
    },
  ];

  return (
    <>
      <JsonLd
        data={service({
          path: PATH,
          name: "Sea Cargo from the UK to Pakistan",
          serviceType: "Sea freight",
          description: `Door-to-door sea cargo from the UK to Pakistan and Kashmir with collection, customs clearance and home delivery in ${sea.time}.`,
        })}
      />
      <JsonLd data={breadcrumbs([{ name: "Sea Cargo", path: PATH }])} />
      <SiteHeader variant="service" announcement={<AnnouncementBar />} />
      <main>
        <NextDispatch
          mode="sea"
          date={rates.sea.next_dispatch_date}
          note={rates.sea.next_dispatch_note}
          estimatedTime={sea.time}
        />

        <PageHero
          eyebrow="Cargo by sea · UK to Pakistan & Kashmir"
          title="Sea Cargo from the UK to Pakistan & Kashmir"
          intro="The economical route for volume and household goods. Shared-container (LCL) space priced per kg, or a full 20ft / 40ft container of your own — a reliable, door to door cargo service for furniture, machinery, business stock and household consignments, with sea freight Karachi departures and onward delivery into Kashmir."
          stats={[
            { n: sea.time, l: "Door to door" },
            { n: "LCL or FCL", l: "Shared or full container" },
            { n: "Karachi", l: "Primary destination port" },
          ]}
          ctas={[
            { label: "Request a quote", href: "/contact-us", variant: "btn-navy" },
            { label: "Track a shipment", href: "/tracking", variant: "btn-ghost" },
          ]}
        />

        <section className="section wrap">
          <h2 className="h-sec">LCL or FCL &mdash; whichever fits</h2>
          <p className="lede">Pay for the space you need, or take a whole container for yourself.</p>
          <div className="cards">
            <article className="svc">
              <div className="num">01</div>
              <h3>Shared container (LCL)</h3>
              <p>
                Pay per kg in a shared container &mdash; the most economical option for smaller volumes, with a{" "}
                {sea.minKg} kg minimum.
              </p>
            </article>
            <article className="svc">
              <div className="num alt">02</div>
              <h3>Full container (FCL)</h3>
              <p>Book a 20ft or 40ft container exclusively for your own goods &mdash; ideal for business stock or a full household move.</p>
            </article>
            <article className="svc">
              <div className="num">03</div>
              <h3>Customs handled</h3>
              <p>
                Export paperwork in the UK and clearance at the Pakistani port, handled by our own agents, with{" "}
                <Link href="/faq">customs duties in Pakistan</Link> estimated before departure.
              </p>
            </article>
            <article className="svc">
              <div className="num alt">04</div>
              <h3>Optional insurance</h3>
              <p>All-risk cover at a percentage of declared value, arranged at the point of booking.</p>
            </article>
          </div>
          <p className="lede mt-8">
            Moving your whole household back to Pakistan? See our <Link href="/house-move">house move service</Link>.
          </p>
        </section>

        <section className="band-soft">
          <div className="section wrap">
            <h2 className="h-sec">Rates</h2>
            <p className="lede">Indicative per-kg rates for shared-container sea freight.</p>
            <div className="table-wrap">
              <table>
                <thead>
                  <tr><th>Service</th><th>Weight / volume</th><th>Rate</th><th>Transit</th></tr>
                </thead>
                <tbody>
                  <tr><td className="key">Sea freight (LCL)</td><td>Per kg</td><td className="rate">{sea.rateLabel}</td><td>{sea.time}</td></tr>
                  <tr><td className="key">Sea freight (FCL)</td><td>20ft / 40ft container</td><td className="rate">On request</td><td>{sea.time}</td></tr>
                </tbody>
              </table>
            </div>
            <div className="mt-4 flex flex-wrap gap-3">
              <span className="inline-block rounded-full border border-line bg-bg-soft px-4 py-[7px] text-[13px] font-semibold text-ink">
                Minimum weight: {sea.minKg} kg
              </span>
              <span className="inline-block rounded-full border border-line bg-bg-soft px-4 py-[7px] text-[13px] font-semibold text-ink">
                Handling fee: {sea.fee}
              </span>
            </div>
          </div>
        </section>

        <section className="section wrap">
          <h2 className="h-sec">How it works</h2>
          <p className="lede">
            From your UK door to the door in Pakistan, here&rsquo;s how sea cargo from the UK to Pakistan works.
          </p>
          <StepCards steps={steps} />
        </section>

        <ReviewStrip />

        <BottomCta
          title="Ready to send by sea?"
          body="Tell us what you're sending and where it's going — we reply the same working day with a fixed price."
          primary={{ label: "Get a quote", href: "/contact-us" }}
          secondary={{ label: "Already sent something? Track it", href: "/tracking" }}
        />
      </main>
      <SiteFooter />
    </>
  );
}
