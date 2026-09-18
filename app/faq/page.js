import SiteHeader from "../components/SiteHeader";
import SiteFooter from "../components/SiteFooter";
import FaqJsonLd from "../components/FaqJsonLd";
import { FAQS } from "@/lib/faq";

export const metadata = {
  title: "Frequently Asked Questions",
  description:
    "Delivery times, prohibited items, collection, customs duties, insurance, and Pakistan-to-UK and excess baggage questions, answered.",
  alternates: { canonical: "/faq" },
};

export default function FaqPage() {
  return (
    <>
      <FaqJsonLd />
      <SiteHeader variant="service" />
      <main>
        <section className="section wrap" style={{ paddingTop: 56 }}>
          <span className="eyebrow">FAQ</span>
          <h1 style={{ fontSize: "clamp(30px,4vw,42px)", fontWeight: 800, margin: "18px 0 12px" }}>
            Frequently asked questions
          </h1>
          <p className="lede" style={{ maxWidth: "56ch" }}>
            Can&rsquo;t find what you need? <a href="/contact-us">Contact us</a> and we&rsquo;ll answer directly.
          </p>
          <div className="faq">
            {FAQS.map((f) => (
              <details key={f.q}>
                <summary>{f.q}<span className="plus">+</span></summary>
                <p>{f.a}</p>
              </details>
            ))}
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
