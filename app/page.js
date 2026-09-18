import Link from "next/link";
import SiteHeader from "./components/SiteHeader";
import SiteFooter from "./components/SiteFooter";
import BottomCta from "./components/BottomCta";
import FaqJsonLd from "./components/FaqJsonLd";
import WhatsAppFloat from "./components/WhatsAppFloat";
import { FAQS } from "@/lib/faq";

export const metadata = {
  alternates: {
    canonical: "/",
  },
};

const SERVICES = [
  {
    num: "01",
    href: "/air-cargo",
    title: "Air cargo, UK → Pakistan",
    body: "Weekly consolidated departures to Karachi, Lahore and Islamabad. Best for anything time-critical.",
  },
  {
    num: "02",
    alt: true,
    href: "/sea-cargo",
    title: "Sea freight & containers",
    body: "Shared-container (LCL) space by the cubic metre, or a full 20ft / 40ft container of your own.",
  },
  {
    num: "03",
    href: "/excess-baggage",
    title: "Excess baggage",
    body: "Flying with more than your airline allowance? Send the extra boxes and bags separately.",
  },
  {
    num: "04",
    alt: true,
    href: "/pak-to-uk",
    title: "Pakistan → UK",
    body: "The same air and sea service, running the other way, with UK customs clearance and delivery.",
  },
];

export default function Home() {
  return (
    <>
      <FaqJsonLd />
      <SiteHeader />

      <main id="top">
        <section className="hero">
          <div className="wrap hero-grid">
            <div>
              <span className="eyebrow">Air &amp; sea freight &middot; Nationwide UK collection</span>
              <h1>Freight between the UK and Pakistan, handled end to end.</h1>
              <p className="intro">
                Air cargo for urgent consignments, sea freight for volume, excess baggage for travellers, and a
                reverse route from Pakistan to the UK. One reference number follows your goods from collection
                to delivery.
              </p>
              <div className="cta-row">
                <Link className="btn btn-navy" href="/contact-us">Request a quote</Link>
                <Link className="btn btn-ghost" href="/tracking">Track a shipment</Link>
              </div>
              <div className="stats">
                <div>
                  <div className="n">5&ndash;7 days</div>
                  <div className="l">Air, door to door</div>
                </div>
                <div>
                  <div className="n">30&ndash;40 days</div>
                  <div className="l">Sea, port to door</div>
                </div>
                <div>
                  <div className="n">Full cover</div>
                  <div className="l">Optional goods insurance</div>
                </div>
              </div>
            </div>
            <div className="card card-shadow">
              <h2 style={{ fontSize: 19, fontWeight: 700 }}>Where is my shipment?</h2>
              <p style={{ fontSize: 14.5, color: "var(--soft)", marginTop: 6 }}>
                Enter your AWB / tracking number or booking reference. Demo: PC-4471 or BK-20931.
              </p>
              <form
                action="/tracking"
                method="get"
                style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 18 }}
              >
                <input
                  className="input"
                  name="ref"
                  defaultValue="PC-4471"
                  placeholder="e.g. PC-4471 or BK-20931"
                  aria-label="Tracking or booking reference"
                  style={{ minHeight: 48 }}
                />
                <button className="btn btn-green" type="submit">Track shipment</button>
              </form>
              <p className="fine" style={{ marginTop: 14 }}>
                Opens the shipment tracker &mdash; no account needed.
              </p>
            </div>
          </div>
        </section>

        <section className="section wrap" id="services">
          <h2 className="h-sec">Services</h2>
          <p className="lede">Four ways to move goods between the UK and Pakistan.</p>
          <div className="cards">
            {SERVICES.map((s) => (
              <Link key={s.href} href={s.href} className="svc" style={{ display: "block", color: "inherit" }}>
                <div className={`num${s.alt ? " alt" : ""}`}>{s.num}</div>
                <h3 style={{ color: "var(--ink)" }}>{s.title}</h3>
                <p>{s.body}</p>
                <p style={{ marginTop: 14, fontSize: 14, fontWeight: 600, color: "var(--green)" }}>Learn more &rarr;</p>
              </Link>
            ))}
          </div>
        </section>

        <section className="band-soft" id="how">
          <div className="section wrap">
            <h2 className="h-sec">How it works</h2>
            <div className="cards">
              <div className="step">
                <span className="k">STEP 1</span>
                <h3>Get a quote</h3>
                <p>Send us weight, dimensions and the destination city. We quote a fixed all-in price, air or sea.</p>
              </div>
              <div className="step">
                <span className="k">STEP 2</span>
                <h3>We collect</h3>
                <p>Collection anywhere in the UK, or drop off at our warehouse. Goods are weighed, labelled and logged against your reference.</p>
              </div>
              <div className="step">
                <span className="k">STEP 3</span>
                <h3>Clearance &amp; transit</h3>
                <p>We file the export paperwork, book the space, and clear the consignment on arrival.</p>
              </div>
              <div className="step">
                <span className="k">STEP 4</span>
                <h3>Delivered</h3>
                <p>Door delivery to the consignee, with signed proof of delivery logged against your reference.</p>
              </div>
            </div>
          </div>
        </section>

        <section className="section wrap" id="rates">
          <h2 className="h-sec">Rates</h2>
          <p className="lede">
            Indicative per-kilo rates for door-to-door air cargo, and per-cubic-metre rates for
            shared-container sea freight. See the <Link href="/excess-baggage">excess baggage</Link> and{" "}
            <Link href="/pak-to-uk">Pakistan to UK</Link> pages for those routes.
          </p>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Service</th>
                  <th>Weight / volume</th>
                  <th>Rate</th>
                  <th>Transit</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="key">Air cargo</td>
                  <td>1&ndash;29 kg</td>
                  <td className="rate">&pound;4.20 / kg</td>
                  <td>5&ndash;7 days</td>
                </tr>
                <tr>
                  <td className="key">Air cargo</td>
                  <td>30&ndash;99 kg</td>
                  <td className="rate">&pound;3.60 / kg</td>
                  <td>5&ndash;7 days</td>
                </tr>
                <tr>
                  <td className="key">Air cargo</td>
                  <td>100 kg +</td>
                  <td className="rate">&pound;3.10 / kg</td>
                  <td>5&ndash;7 days</td>
                </tr>
                <tr>
                  <td className="key">Sea freight (LCL)</td>
                  <td>Per m&sup3;, min 1 m&sup3;</td>
                  <td className="rate">&pound;195 / m&sup3;</td>
                  <td>30&ndash;40 days</td>
                </tr>
                <tr>
                  <td className="key">Sea freight (FCL)</td>
                  <td>20ft / 40ft container</td>
                  <td className="rate">On request</td>
                  <td>30&ndash;40 days</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="fine" style={{ marginTop: 14 }}>
            Rates exclude destination duties and optional insurance. Volumetric weight applies to light,
            bulky air consignments at 1 kg per 6,000 cm&sup3;.
          </p>
        </section>

        <BottomCta
          title="Track your shipment any time."
          body="Enter your reference number to see live milestones, from UK collection through to door delivery."
          primary={{ label: "Open tracking", href: "/tracking" }}
          secondary={{ label: "See a live example: PC-4471", href: "/tracking?ref=PC-4471" }}
        />

        <section className="section wrap" id="faq">
          <h2 className="h-sec">Frequently asked</h2>
          <div className="faq">
            {FAQS.slice(0, 3).map((f) => (
              <details key={f.q}>
                <summary>{f.q}<span className="plus">+</span></summary>
                <p>{f.a}</p>
              </details>
            ))}
          </div>
          <p style={{ marginTop: 20 }}>
            <Link href="/faq" style={{ fontWeight: 600 }}>See all FAQs &rarr;</Link>
          </p>
        </section>
      </main>

      <SiteFooter />
      <WhatsAppFloat />
    </>
  );
}
