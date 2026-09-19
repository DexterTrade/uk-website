import SiteHeader from "../components/SiteHeader";
import SiteFooter from "../components/SiteFooter";
import PageHero from "../components/PageHero";
import BottomCta from "../components/BottomCta";
import { pageMeta } from "@/lib/seo";

export const metadata = pageMeta({
  title: "Excess Baggage to Pakistan",
  description:
    "Flying to Pakistan and taking more than your airline allowance? Send the extra boxes and bags separately by air cargo, usually for less than airline excess fees.",
  path: "/excess-baggage",
});

export default function ExcessBaggagePage() {
  return (
    <>
      <SiteHeader variant="service" />
      <main>
        <PageHero
          eyebrow="Excess baggage · UK to Pakistan"
          title="Flying with more than your allowance? Send it separately."
          intro="If you're travelling to Pakistan and packing more than your airline lets you check in, our excess baggage service collects the extra boxes and bags and flies them as air cargo &mdash; usually for less than the airline would charge, and without turning up at check-in overweight."
          stats={[
            { n: "5–7 days", l: "Typical delivery" },
            { n: "Per kg", l: "Priced like air cargo" },
            { n: "No stress", l: "Skip the check-in scales" },
          ]}
          ctas={[
            { label: "Get a quote", href: "/contact-us", variant: "btn-navy" },
            { label: "Track a shipment", href: "/tracking", variant: "btn-ghost" },
          ]}
        />

        <div className="wrap">
          <div className="compare-card">
            <div className="compare-col bad">
              <h4>Checking in excess at the airport</h4>
              <ul>
                <li>Priced on the spot, per kilo</li>
                <li>No guarantee of space</li>
                <li>Paid at check-in, cash or card</li>
              </ul>
            </div>
            <div className="compare-vs">vs</div>
            <div className="compare-col good">
              <h4>Booking excess baggage with us</h4>
              <ul>
                <li>Fixed price, confirmed in advance</li>
                <li>Space booked against your flight date</li>
                <li>Collected or dropped off, delivered separately</li>
              </ul>
            </div>
          </div>
        </div>

        <section className="section wrap">
          <h2 className="h-sec">Why people use this</h2>
          <p className="lede">Popular around weddings, Eid, and family visits &mdash; anywhere you&rsquo;re carrying more than you can fly with.</p>
          <div className="cards">
            <article className="svc">
              <div className="num">01</div>
              <h3>Avoid airline excess fees</h3>
              <p>Airline per-kilo excess baggage charges are usually steep. Sending the extra weight as cargo is typically cheaper.</p>
            </article>
            <article className="svc">
              <div className="num alt">02</div>
              <h3>Pack before you fly</h3>
              <p>Drop your extra boxes and bags with us, or arrange a UK collection, any time before your flight &mdash; no need to have everything ready on travel day.</p>
            </article>
            <article className="svc">
              <div className="num">03</div>
              <h3>One weight limit at check-in</h3>
              <p>Travel light and stress-free through the airport, while the rest follows separately by air cargo.</p>
            </article>
            <article className="svc">
              <div className="num alt">04</div>
              <h3>Door delivery in Pakistan</h3>
              <p>Your excess baggage is delivered to the same address as our regular air cargo &mdash; you don&rsquo;t need to collect it yourself.</p>
            </article>
          </div>
        </section>

        <section className="band-soft">
          <div className="section wrap">
            <h2 className="h-sec">How it works</h2>
            <div className="cards">
              <div className="step">
                <span className="k">STEP 1</span>
                <h3>Tell us your travel date</h3>
                <p>Let us know when you&rsquo;re flying and roughly how much extra weight you&rsquo;re sending. We quote a fixed price per kg.</p>
              </div>
              <div className="step">
                <span className="k">STEP 2</span>
                <h3>Drop off or collection</h3>
                <p>Bring your boxes and bags to our warehouse, or book a UK collection, any time before your flight.</p>
              </div>
              <div className="step">
                <span className="k">STEP 3</span>
                <h3>Flies as air cargo</h3>
                <p>Your excess baggage joins our next consolidated air cargo departure to Pakistan.</p>
              </div>
              <div className="step">
                <span className="k">STEP 4</span>
                <h3>Delivered to your door</h3>
                <p>Cleared through customs and delivered to the consignee address in Pakistan, usually arriving around the same time as you or shortly after.</p>
              </div>
            </div>
          </div>
        </section>

        <section className="section wrap">
          <h2 className="h-sec">Pricing</h2>
          <p className="lede max-w-[60ch]">
            Excess baggage is priced per kilo, in line with our standard air cargo rates &mdash; see the <a href="/air-cargo">air cargo page</a> for
            the current bands. Tell us your travel date when you request a quote so we can confirm space on that week&rsquo;s departure.
          </p>
        </section>

        <BottomCta
          title="Travelling soon?"
          body="Tell us your flight date and roughly how much extra you're sending &mdash; we'll quote a fixed price and confirm space."
          primary={{ label: "Get a quote", href: "/contact-us" }}
          secondary={{ label: "Already sent something? Track it", href: "/tracking" }}
        />
      </main>
      <SiteFooter />
    </>
  );
}
