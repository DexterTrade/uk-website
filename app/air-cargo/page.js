import SiteHeader from "../components/SiteHeader";
import SiteFooter from "../components/SiteFooter";
import PageHero from "../components/PageHero";
import BottomCta from "../components/BottomCta";
import { pageMeta } from "@/lib/seo";

export const metadata = pageMeta({
  title: "Air Cargo, UK to Pakistan & Kashmir",
  description:
    "Fast cargo by air from the UK to Karachi, Lahore, Islamabad and on to Kashmir. Weekly consolidated departures, door to door collection, customs clearance and 5-7 day delivery.",
  path: "/air-cargo",
});

export default function AirCargoPage() {
  return (
    <>
      <SiteHeader variant="service" />
      <main>
        <PageHero
          eyebrow="Cargo by air · UK to Pakistan & Kashmir"
          title="Fast, express cargo by air — door to door in 5-7 days."
          intro="Weekly consolidated air cargo departures to Karachi, Lahore and Islamabad, with onward delivery to most cities across Pakistan and into Kashmir. Best for parcels, documents, samples and anything time-critical."
          stats={[
            { n: "5–7 days", l: "Collection to door delivery" },
            { n: "Weekly", l: "Consolidated departures" },
            { n: "3 cities", l: "Direct to KHI, LHE, ISB" },
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
                <span key={d} className={`schedule-day${d !== "Sun" ? " active" : ""}`}>
                  {d}
                </span>
              ))}
            </div>
            <span className="fine ml-auto">Book any day &mdash; cargo consolidates for the next weekly departure.</span>
          </div>
        </div>

        <section className="section wrap">
          <h2 className="h-sec">Why send by air</h2>
          <p className="lede">The right choice when speed matters more than volume.</p>
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
        </section>

        <section className="band-soft">
          <div className="section wrap">
            <h2 className="h-sec">Rates</h2>
            <p className="lede">Indicative per-kilo rates for door-to-door air cargo.</p>
            <div className="table-wrap">
              <table>
                <thead>
                  <tr><th>Weight</th><th>Rate</th><th>Transit</th></tr>
                </thead>
                <tbody>
                  <tr><td className="key">1&ndash;29 kg</td><td className="rate">&pound;4.20 / kg</td><td>5&ndash;7 days</td></tr>
                  <tr><td className="key">30&ndash;99 kg</td><td className="rate">&pound;3.60 / kg</td><td>5&ndash;7 days</td></tr>
                  <tr><td className="key">100 kg +</td><td className="rate">&pound;3.10 / kg</td><td>5&ndash;7 days</td></tr>
                </tbody>
              </table>
            </div>
            <p className="fine mt-[14px]">
              Rates exclude destination duties and optional insurance. Volumetric weight applies to light, bulky
              consignments at 1 kg per 6,000 cm&sup3;.
            </p>
          </div>
        </section>

        <section className="section wrap">
          <h2 className="h-sec">How it works</h2>
          <div className="cards">
            <div className="step">
              <span className="k">STEP 1</span>
              <h3>Get a quote</h3>
              <p>Send us weight, dimensions and the destination city. We quote a fixed all-in price.</p>
            </div>
            <div className="step">
              <span className="k">STEP 2</span>
              <h3>We collect</h3>
              <p>Collection anywhere in the UK, or drop off at our warehouse. Goods are weighed and logged against your reference.</p>
            </div>
            <div className="step">
              <span className="k">STEP 3</span>
              <h3>Export &amp; flight</h3>
              <p>We file the export paperwork and book the next available consolidated departure.</p>
            </div>
            <div className="step">
              <span className="k">STEP 4</span>
              <h3>Cleared &amp; delivered</h3>
              <p>Import clearance in Pakistan, then door delivery to the consignee.</p>
            </div>
          </div>
        </section>

        <BottomCta
          title="Ready to send by air?"
          body="Tell us what you're sending and where it's going &mdash; we reply the same working day with a fixed price."
          primary={{ label: "Get a quote", href: "/contact-us" }}
          secondary={{ label: "Already sent something? Track it", href: "/tracking" }}
        />
      </main>
      <SiteFooter />
    </>
  );
}
