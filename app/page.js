import Link from "next/link";
import SiteHeader from "./components/SiteHeader";
import SiteFooter from "./components/SiteFooter";
import WhatsAppFloat from "./components/WhatsAppFloat";
import { PlaneIllustration, ShipIllustration } from "./components/illustrations";
import { BUSINESS } from "@/lib/seo";
import { createClient } from "@/lib/supabase/server";

export const metadata = {
  alternates: {
    canonical: "/",
  },
};

const BRIEF_SERVICES = [
  {
    href: "/excess-baggage",
    title: "Excess Baggage",
    body: "Flying to Pakistan with more than your airline allowance? Send the extra weight as cargo instead — usually much cheaper than airline excess baggage fees.",
  },
  {
    href: "/pak-to-uk",
    title: "Pakistan to UK",
    body: "Sending goods from Pakistan back to the UK? The same air and sea service, running in reverse, with UK customs clearance and door delivery.",
  },
  {
    href: "/moving-back-home",
    title: "Moving Back to Pakistan",
    body: "Relocating home for good? We pack and deliver your whole household — furniture, appliances and all — safely to your door in Pakistan.",
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
      <SiteHeader />

      <main id="top">
        <section className="hero">
          <div className="wrap hero-grid">
            <div>
              <span className="eyebrow">Direct cargo &middot; By sea &amp; by air &middot; Nationwide UK collection</span>
              <h1>
                DOOR TO DOOR CARGO TO <span className="hl">PAKISTAN</span> &amp; <span className="hl">KASHMIR</span>.
              </h1>
              <p className="intro">
                A trusted cargo service connecting the UK to Pakistan and Kashmir. Fast cargo by air for urgent
                consignments, economical cargo by sea for volume, and a dedicated London cargo hub handling
                direct, door to door collection on every booking.
              </p>

              <div className="hero-urdu" dir="rtl" lang="ur">
                <p className="urdu-h">پاکستان اور کشمیر تک دروازے سے دروازے کارگو سروس</p>
                <p className="urdu-p">
                  برطانیہ سے پاکستان اور کشمیر تک ایک قابلِ اعتماد کارگو سروس۔ فوری ترسیل کے لیے تیز ہوائی کارگو،
                  زیادہ سامان کے لیے سستا سمندری کارگو، اور ہر بکنگ پر گھر سے براہِ راست وصولی۔
                </p>
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

        <section className="feature-section wrap">
          <div className="feature-grid">
            <div className="feature-image">
              <ShipIllustration />
            </div>
            <div className="feature-info">
              <span className="eyebrow">Sea Cargo</span>
              <h2>Economical cargo by sea</h2>
              <p className="lede-sm">
                Shared-container (LCL) space by the cubic metre, or a full container of your own — the
                economical route for furniture, business stock and full households.
              </p>
              <div className="feature-rate">
                <span className="value">{seaRate.headline_rate}</span>
                <span className="unit">{seaRate.rate_note}</span>
              </div>
              <div className="charges-list">
                <div className="row"><span>Freight rate</span><strong>{seaRate.headline_rate}</strong></div>
                <div className="row"><span>UK pickup</span><strong>&pound;{Number(seaRate.pickup_charge).toFixed(0)}</strong></div>
              </div>
              <p className="fine" style={{ marginTop: 10 }}>Full cost breakdown provided with your quote.</p>
              <Link className="btn btn-navy" href="/sea-cargo">See sea cargo &rarr;</Link>
            </div>
          </div>
        </section>

        <section className="feature-section wrap">
          <div className="feature-grid alt">
            <div className="feature-info">
              <span className="eyebrow">Air Cargo</span>
              <h2>Fast cargo by air</h2>
              <p className="lede-sm">
                Weekly consolidated departures to Karachi, Lahore and Islamabad — the fast route when speed
                matters more than volume.
              </p>
              <div className="feature-rate">
                <span className="value">{airRate.headline_rate}</span>
                <span className="unit">{airRate.rate_note}</span>
              </div>
              <div className="charges-list">
                <div className="row"><span>Freight rate</span><strong>{airRate.headline_rate}</strong></div>
                <div className="row"><span>UK pickup</span><strong>&pound;{Number(airRate.pickup_charge).toFixed(0)}</strong></div>
              </div>
              <p className="fine" style={{ marginTop: 10 }}>Full cost breakdown provided with your quote.</p>
              <Link className="btn btn-navy" href="/air-cargo">See air cargo &rarr;</Link>
            </div>
            <div className="feature-image">
              <PlaneIllustration />
            </div>
          </div>
        </section>

        <section className="section wrap" style={{ paddingTop: 8 }}>
          <div className="brief-row">
            {BRIEF_SERVICES.map((s) => (
              <Link key={s.href} href={s.href} className="brief-card">
                <h3>{s.title}</h3>
                <p>{s.body}</p>
                <span className="go">Learn more &rarr;</span>
              </Link>
            ))}
          </div>
        </section>
      </main>

      <SiteFooter />
      <WhatsAppFloat />
    </>
  );
}
