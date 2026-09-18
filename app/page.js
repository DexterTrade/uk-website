import Link from "next/link";
import SiteHeader from "./components/SiteHeader";
import SiteFooter from "./components/SiteFooter";
import EnquiryForm from "./components/EnquiryForm";
import FaqJsonLd from "./components/FaqJsonLd";
import WhatsAppFloat from "./components/WhatsAppFloat";
import { FAQS } from "@/lib/faq";
import { BUSINESS } from "@/lib/seo";

export const metadata = {
  alternates: {
    canonical: "/",
  },
};

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
              <h1>Freight from the UK to Pakistan, handled end to end.</h1>
              <p className="intro">
                Air cargo for urgent consignments, sea freight for volume, and the customs clearance and
                insurance that go with both. One reference number follows your goods from collection in
                the UK to delivery in Pakistan.
              </p>
              <div className="cta-row">
                <Link className="btn btn-navy" href="#contact">Request a quote</Link>
                <Link className="btn btn-ghost" href="/portal">Track a shipment</Link>
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
                action="/portal"
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
                Opens the customer portal, where you can also view and print invoices.
              </p>
            </div>
          </div>
        </section>

        <section className="section wrap" id="services">
          <h2 className="h-sec">Services</h2>
          <p className="lede">Four things, done properly, on the one corridor we know best.</p>
          <div className="cards">
            <article className="svc">
              <div className="num">01</div>
              <h3>Air cargo, UK &rarr; Pakistan</h3>
              <p>
                Weekly consolidated departures to Karachi, Lahore and Islamabad, with onward delivery to
                most cities. Best for parcels, documents, samples and anything time-critical.
              </p>
            </article>
            <article className="svc">
              <div className="num alt">02</div>
              <h3>Sea freight &amp; containers</h3>
              <p>
                Shared-container (LCL) space by the cubic metre, or a full 20ft / 40ft container of your
                own. The economical route for furniture, machinery and household consignments.
              </p>
            </article>
            <article className="svc">
              <div className="num">03</div>
              <h3>Customs clearance</h3>
              <p>
                Export paperwork in the UK and clearance at the Pakistani port or airport, handled by our
                own agents. We tell you the duties before the goods travel, not after.
              </p>
            </article>
            <article className="svc">
              <div className="num alt">04</div>
              <h3>Goods insurance</h3>
              <p>
                Optional all-risk cover at a percentage of declared value, arranged at the point of
                booking and shown as a line on your invoice.
              </p>
            </article>
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
                <p>We file the export paperwork, book the space, and clear the consignment on arrival in Pakistan.</p>
              </div>
              <div className="step">
                <span className="k">STEP 4</span>
                <h3>Delivered &amp; invoiced</h3>
                <p>Door delivery to the consignee, with the signed proof and the final invoice available in your portal.</p>
              </div>
            </div>
          </div>
        </section>

        <section className="section wrap" id="rates">
          <h2 className="h-sec">Rates</h2>
          <p className="lede">
            Indicative per-kilo rates for door-to-door air cargo, and per-cubic-metre rates for
            shared-container sea freight. Replace these figures with your live tariff.
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

        <section className="band-dark" id="portal">
          <div className="wrap portal-cta">
            <div>
              <span className="eyebrow eyebrow-light">Customer portal</span>
              <h2 className="h-sec" style={{ marginTop: 18 }}>Tracking and invoices, on their own page.</h2>
              <p className="lede" style={{ maxWidth: "48ch" }}>
                One reference, two answers: where the goods are, and what is owed. Milestones from
                collection to door delivery, and a printable invoice against every shipment.
              </p>
            </div>
            <div className="links">
              <Link className="btn btn-green" href="/portal">Open the portal</Link>
              <Link className="quiet" href="/portal?ref=PC-4471">See a live example: PC-4471</Link>
              <Link className="quiet" href="/admin" style={{ color: "var(--faint)" }}>Staff admin panel</Link>
            </div>
          </div>
        </section>

        <section className="section wrap" id="faq">
          <h2 className="h-sec">Frequently asked</h2>
          <div className="faq">
            {FAQS.map((f) => (
              <details key={f.q}>
                <summary>{f.q}<span className="plus">+</span></summary>
                <p>{f.a}</p>
              </details>
            ))}
          </div>
        </section>

        <section className="band-soft" id="contact">
          <div
            className="section wrap"
            style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 48 }}
          >
            <div>
              <h2 className="h-sec">Get a quote</h2>
              <p className="lede" style={{ maxWidth: "46ch" }}>
                Tell us what you are sending and where it is going. We reply the same working day with a
                fixed price.
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: 18, marginTop: 32 }}>
                <a className="btn btn-green" style={{ width: "fit-content" }} href={BUSINESS.whatsapp}>
                  Message us on WhatsApp
                </a>
                <div style={{ fontSize: 15, lineHeight: 1.9, color: "var(--muted)" }}>
                  <div><strong style={{ color: "var(--ink)" }}>{BUSINESS.legalName}</strong></div>
                  <div>{BUSINESS.streetAddress}, {BUSINESS.addressLocality} {BUSINESS.postalCode}</div>
                  {BUSINESS.phones.map((p) => (
                    <div key={p.city}>{p.city} <a href={`tel:${p.href}`}>{p.display}</a></div>
                  ))}
                  <div>WhatsApp <a href={BUSINESS.whatsapp}>{BUSINESS.whatsappDisplay}</a></div>
                  <div>Email <a href={`mailto:${BUSINESS.email}`}>{BUSINESS.email}</a></div>
                  <div>Mon&ndash;Sat, 9am&ndash;6pm</div>
                </div>
              </div>
            </div>
            <EnquiryForm />
          </div>
        </section>
      </main>

      <SiteFooter />
      <WhatsAppFloat />
    </>
  );
}
