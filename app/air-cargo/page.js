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
import { nextDispatchDate, dispatchDaysLabel } from "@/lib/dispatch-days";

const PATH = "/air-cargo";

// "8–10 days" → "8–10 Days", to sit in a title-cased heading.
const titleCase = (text) => text.replace(/\b[a-z]/g, (c) => c.toUpperCase());

// Built per request because the description quotes the live transit time.
export async function generateMetadata() {
  const { air } = await getRateFacts();
  return pageMeta({
    title: "Air Cargo UK to Pakistan | Weekly Flights | PAK Cargo",
    description: `Fast air cargo from the UK to Pakistan & Kashmir in ${air.time}. Weekly flights, UK-wide collection, customs clearance and door delivery. Get a free quote.`,
    path: PATH,
    image: { url: "/assets/photos/air-cargo.jpg", alt: "Air cargo plane loading shipment to Pakistan" },
  });
}

export default async function AirCargoPage() {
  const { rates, air } = await getRateFacts();
  const airRate = rates.air;
  const estimatedTime = air.time;

  const steps = [
    {
      title: "Send weight and destination",
      body: `Tell us the weight (${air.minKg} kg minimum), box sizes and destination city. You get a fixed price at ${air.rateLabel} plus a ${air.fee} handling fee.`,
    },
    {
      title: "Collection or drop-off",
      body: "We collect anywhere in the UK, or you drop off at our warehouse. Your boxes are weighed and added to the next weekly consolidated flight.",
    },
    {
      title: "Flown to Pakistan",
      body: "We file the export paperwork, and your cargo flies to Karachi, Lahore or Islamabad on the next departure.",
    },
    {
      title: `At the door in ${air.time}`,
      body: "Import clearance in Pakistan, then door delivery to the receiver, including onward delivery into Kashmir.",
    },
  ];

  // Recurring weekly flight days (set in /admin) take priority over the
  // legacy one-off date field, so the departure poster stays current on its
  // own instead of needing a manual date update every week.
  const dispatchDate = nextDispatchDate(airRate?.dispatch_days) || airRate?.next_dispatch_date;
  const dispatchNote = airRate?.next_dispatch_note || dispatchDaysLabel(airRate?.dispatch_days);

  return (
    <>
      <JsonLd
        data={service({
          path: PATH,
          name: "Air Cargo from the UK to Pakistan",
          serviceType: "Air freight",
          description: `Fast air cargo from the UK to Pakistan and Kashmir in ${air.time}, with weekly departures, UK-wide collection and door delivery.`,
        })}
      />
      <JsonLd data={breadcrumbs([{ name: "Air Cargo", path: PATH }])} />
      <SiteHeader variant="service" announcement={<AnnouncementBar />} />
      <main>
        <NextDispatch
          mode="air"
          date={dispatchDate}
          note={dispatchNote}
          estimatedTime={estimatedTime}
        />

        <PageHero
          eyebrow="Cargo by air · UK to Pakistan & Kashmir"
          title={`Air Cargo from the UK to Pakistan in ${titleCase(air.time)}`}
          intro="A speedy cargo service connecting the UK to Pakistan by air: weekly consolidated air cargo departures to Karachi, Lahore and Islamabad, with onward delivery to most cities across Pakistan and into Kashmir. Best for parcels, documents, samples and anything time-critical."
          stats={[
            { n: estimatedTime, l: "Collection to door delivery" },
            { n: "Weekly", l: "Consolidated departures" },
          ]}
          ctas={[
            { label: "Request a quote", href: "/contact-us", variant: "btn-navy" },
            { label: "Track a shipment", href: "/tracking", variant: "btn-ghost" },
          ]}
        />

        <div className="wrap">
          <div className="schedule-strip">
            <span className="schedule-label">UK collection days</span>
            <div className="schedule-days">
              {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d) => (
                <span key={d} className="schedule-day active">
                  {d}
                </span>
              ))}
            </div>
            <span className="fine ml-auto">Book any day &mdash; cargo consolidates for the next weekly departure.</span>
          </div>
        </div>

        <section className="section wrap">
          <h2 className="h-sec">Why send by air</h2>
          <p className="lede">The right choice when speed matters more than volume &mdash; an express cargo service for time-critical shipments.</p>
          <div className="cards">
            <article className="svc">
              <div className="num">01</div>
              <h3>Weekly departures</h3>
              <p>Consolidated air cargo leaves the UK every week, so you are never waiting long for the next slot.</p>
            </article>
            <article className="svc">
              <div className="num alt">02</div>
              <h3>Door to door</h3>
              <p>We collect from your address in the UK and deliver to the consignee&rsquo;s door in Pakistan &mdash; no separate courier handoffs.</p>
            </article>
            <article className="svc">
              <div className="num">03</div>
              <h3>Customs handled</h3>
              <p>Export paperwork in the UK and import clearance in Pakistan are handled by our own agents, with duties estimated up front.</p>
            </article>
            <article className="svc">
              <div className="num alt">04</div>
              <h3>Optional insurance</h3>
              <p>All-risk cover at a percentage of declared value, arranged at the point of booking.</p>
            </article>
          </div>
          <p className="lede mt-8">
            Flying to Pakistan yourself with more than your allowance? Send the extra as{" "}
            <Link href="/excess-baggage">excess baggage</Link> instead of paying airline fees.
          </p>
        </section>

        <section className="band-soft">
          <div className="section wrap">
            <h2 className="h-sec">Rates</h2>
            <p className="lede">Indicative per-kilo rate for door-to-door air cargo.</p>
            <div className="table-wrap">
              <table>
                <thead>
                  <tr><th>Weight</th><th>Rate</th><th>Transit</th></tr>
                </thead>
                <tbody>
                  <tr><td className="key">{air.minKg} kg +</td><td className="rate">{air.rateLabel}</td><td>{estimatedTime}</td></tr>
                </tbody>
              </table>
            </div>
            <div className="mt-4 flex flex-wrap gap-3">
              <span className="inline-block rounded-full border border-line bg-bg-soft px-4 py-[7px] text-[13px] font-semibold text-ink">
                Minimum weight: {air.minKg} kg
              </span>
              <span className="inline-block rounded-full border border-line bg-bg-soft px-4 py-[7px] text-[13px] font-semibold text-ink">
                Handling fee: {air.fee}
              </span>
            </div>
          </div>
        </section>

        <section className="section wrap">
          <h2 className="h-sec">How it works</h2>
          <p className="lede">
            Book any day and your cargo joins the next weekly flight. Here&rsquo;s how air cargo from the UK to
            Pakistan works.
          </p>
          <StepCards steps={steps} />
        </section>

        <ReviewStrip />

        <BottomCta
          title="Ready to send by air?"
          body="Tell us what you're sending and where it's going — we reply the same working day with a fixed price."
          primary={{ label: "Get a quote", href: "/contact-us" }}
          secondary={{ label: "Already sent something? Track it", href: "/tracking" }}
        />
      </main>
      <SiteFooter />
    </>
  );
}
