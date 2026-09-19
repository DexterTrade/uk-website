import SiteHeader from "../components/SiteHeader";
import SiteFooter from "../components/SiteFooter";
import PageHero from "../components/PageHero";
import BottomCta from "../components/BottomCta";

export const metadata = {
  title: "Sea Cargo, UK to Pakistan & Kashmir",
  description:
    "Direct cargo by sea from the UK to Karachi and on to Kashmir. Shared-container (LCL) and full-container (FCL) options, door to door collection, customs clearance and 30-40 day transit.",
  alternates: { canonical: "/sea-cargo" },
};

export default function SeaCargoPage() {
  return (
    <>
      <SiteHeader variant="service" />
      <main>
        <PageHero
          eyebrow="Cargo by sea · UK to Pakistan &amp; Kashmir"
          title="Direct cargo by sea — the economical route for volume and household goods."
          intro="Shared-container (LCL) space by the cubic metre, or a full 20ft / 40ft container of your own. A reliable cargo service for furniture, machinery, business stock and household consignments, with onward delivery into Kashmir."
          stats={[
            { n: "30–40 days", l: "Port to door" },
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
              <p>Pay per cubic metre in a shared container &mdash; the most economical option for smaller volumes, with a 1 m&sup3; minimum.</p>
            </article>
            <article className="svc">
              <div className="num alt">02</div>
              <h3>Full container (FCL)</h3>
              <p>Book a 20ft or 40ft container exclusively for your own goods &mdash; ideal for business stock or a full household move.</p>
            </article>
            <article className="svc">
              <div className="num">03</div>
              <h3>Customs handled</h3>
              <p>Export paperwork in the UK and clearance at the Pakistani port, handled by our own agents, with duties estimated before departure.</p>
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
            <p className="lede">Indicative per-cubic-metre rates for shared-container sea freight.</p>
            <div className="table-wrap">
              <table>
                <thead>
                  <tr><th>Service</th><th>Weight / volume</th><th>Rate</th><th>Transit</th></tr>
                </thead>
                <tbody>
                  <tr><td className="key">Sea freight (LCL)</td><td>Per m&sup3;, min 1 m&sup3;</td><td className="rate">&pound;195 / m&sup3;</td><td>30&ndash;40 days</td></tr>
                  <tr><td className="key">Sea freight (FCL)</td><td>20ft / 40ft container</td><td className="rate">On request</td><td>30&ndash;40 days</td></tr>
                </tbody>
              </table>
            </div>
            <p className="fine" style={{ marginTop: 14 }}>
              Rates exclude destination duties and optional insurance.
            </p>
          </div>
        </section>

        <section className="section wrap">
          <h2 className="h-sec">How it works</h2>
          <div className="cards">
            <div className="step">
              <span className="k">STEP 1</span>
              <h3>Get a quote</h3>
              <p>Tell us the volume or container size and the destination city. We quote a fixed all-in price.</p>
            </div>
            <div className="step">
              <span className="k">STEP 2</span>
              <h3>We collect</h3>
              <p>Collection anywhere in the UK, or drop off at our warehouse. Goods are measured and logged against your reference.</p>
            </div>
            <div className="step">
              <span className="k">STEP 3</span>
              <h3>Loaded &amp; sailed</h3>
              <p>We file the export paperwork, load the container and book the vessel.</p>
            </div>
            <div className="step">
              <span className="k">STEP 4</span>
              <h3>Cleared &amp; delivered</h3>
              <p>Port clearance in Karachi, then door delivery to the consignee.</p>
            </div>
          </div>
        </section>

        <BottomCta
          title="Ready to send by sea?"
          body="Tell us what you're sending and where it's going &mdash; we reply the same working day with a fixed price."
          primary={{ label: "Get a quote", href: "/contact-us" }}
          secondary={{ label: "Already sent something? Track it", href: "/tracking" }}
        />
      </main>
      <SiteFooter />
    </>
  );
}
