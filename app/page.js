import Link from "next/link";
import SiteHeader from "./components/SiteHeader";
import SiteFooter from "./components/SiteFooter";
import BottomCta from "./components/BottomCta";
import FaqJsonLd from "./components/FaqJsonLd";
import WhatsAppFloat from "./components/WhatsAppFloat";
import { PlaneIcon, ShipIcon } from "./components/icons";
import { FAQS } from "@/lib/faq";
import { BUSINESS } from "@/lib/seo";
import { createClient } from "@/lib/supabase/server";

export const metadata = {
  alternates: {
    canonical: "/",
  },
};

const SERVICES = [
  {
    num: "01",
    href: "/sea-cargo",
    title: "Sea cargo & containers",
    body: "Economical cargo by sea — shared-container (LCL) space by the cubic metre, or a full 20ft / 40ft container of your own.",
  },
  {
    num: "02",
    alt: true,
    href: "/air-cargo",
    title: "Air cargo, UK → Pakistan",
    body: "Fast cargo by air — weekly consolidated departures to Karachi, Lahore and Islamabad. Best for anything time-critical.",
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
    body: "The same direct cargo service, running the other way, with UK customs clearance and delivery.",
  },
];

const RATE_DEFAULTS = {
  sea: { headline_rate: "From £195/m³", rate_note: "Shared container (LCL) · 30–40 day delivery", pickup_charge: 35 },
  air: { headline_rate: "From £3.10/kg", rate_note: "Tiered by weight · 5–7 day delivery", pickup_charge: 35 },
};

export default async function Home() {
  const supabase = await createClient();
  const { data: ratesRaw } = await supabase.from("rates").select("mode, headline_rate, rate_note, pickup_charge");
  const rateByMode = Object.fromEntries((ratesRaw || []).map((r) => [r.mode, r]));
  const seaRate = rateByMode.sea || RATE_DEFAULTS.sea;
  const airRate = rateByMode.air || RATE_DEFAULTS.air;

  return (
    <>
      <FaqJsonLd />
      <SiteHeader />

      <main id="top">
        <section className="hero">
          <div className="wrap hero-grid">
            <div>
              <span className="eyebrow">Direct cargo &middot; By sea &amp; by air &middot; Nationwide UK collection</span>
              <h1>DOOR TO DOOR CARGO TO PAKISTAN &amp; KASHMIR.</h1>
              <p className="intro">
                A trusted cargo service connecting the UK to Pakistan and Kashmir. Fast cargo by air for urgent
                consignments, economical cargo by sea for volume, and a dedicated London cargo hub handling
                direct, door to door collection on every booking.
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
              <h2 style={{ fontSize: 19, fontWeight: 700 }}>Speak to us now</h2>
              <p style={{ fontSize: 14.5, color: "var(--soft)", marginTop: 6 }}>
                Call your nearest branch, or message us on WhatsApp for the fastest reply.
              </p>
              <div className="hero-contact-list">
                {BUSINESS.phones.map((p) => (
                  <a key={p.city} href={`tel:${p.href}`}>
                    <span>{p.display}</span>
                    <span className="city">{p.city}</span>
                  </a>
                ))}
                <a href={`mailto:${BUSINESS.email}`}>
                  <span>{BUSINESS.email}</span>
                  <span className="city">Email</span>
                </a>
              </div>
              <a className="btn btn-green" style={{ marginTop: 16, width: "100%" }} href={BUSINESS.whatsapp}>
                Message us on WhatsApp
              </a>
            </div>
          </div>
        </section>

        <section className="section wrap" id="rates">
          <h2 className="h-sec">Rates</h2>
          <p className="lede">
            Simple, direct cargo pricing by sea or by air, plus one small UK pickup charge. Ask for a full
            quote and we confirm the exact price the same working day.
          </p>
          <div className="rate-grid">
            <div className="rate-card">
              <div className="rate-icon"><ShipIcon /></div>
              <h3>Sea Cargo</h3>
              <div className="rate-value">{seaRate.headline_rate}</div>
              <p className="rate-note">{seaRate.rate_note}</p>
              <div className="rate-pickup">+ &pound;{Number(seaRate.pickup_charge).toFixed(0)} UK pickup</div>
              <Link className="btn btn-navy btn-sm" href="/sea-cargo">See sea cargo rates &rarr;</Link>
            </div>
            <div className="rate-card navy">
              <div className="rate-icon"><PlaneIcon /></div>
              <h3>Air Cargo</h3>
              <div className="rate-value">{airRate.headline_rate}</div>
              <p className="rate-note">{airRate.rate_note}</p>
              <div className="rate-pickup">+ &pound;{Number(airRate.pickup_charge).toFixed(0)} UK pickup</div>
              <Link className="btn btn-navy btn-sm" href="/air-cargo">See air cargo rates &rarr;</Link>
            </div>
          </div>
          <p className="fine" style={{ marginTop: 14 }}>
            Rates exclude destination duties and optional insurance. See the{" "}
            <Link href="/excess-baggage">excess baggage</Link> and <Link href="/pak-to-uk">Pakistan to UK</Link>{" "}
            pages for those routes.
          </p>
        </section>

        <section className="band-soft" id="services">
          <div className="section wrap">
            <h2 className="h-sec">Services</h2>
            <p className="lede">A speedy, reliable cargo service across four ways to move goods between the UK, Pakistan and Kashmir.</p>
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
          </div>
        </section>

        <section className="section wrap" id="how">
          <h2 className="h-sec">How it works</h2>
          <div className="cards">
            <div className="step">
              <span className="k">STEP 1</span>
              <h3>Get a quote</h3>
              <p>Send us weight, dimensions and the destination city. We quote a fixed all-in price, air or sea, the same working day.</p>
            </div>
            <div className="step">
              <span className="k">STEP 2</span>
              <h3>We collect</h3>
              <p>Direct collection anywhere in the UK, or drop off at our cargo hub. Goods are weighed, labelled and logged against your reference.</p>
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
