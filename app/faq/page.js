import SiteHeader from "../components/SiteHeader";
import SiteFooter from "../components/SiteFooter";
import FaqJsonLd from "../components/FaqJsonLd";
import { FAQS } from "@/lib/faq";
import { pageMeta } from "@/lib/seo";

export const metadata = pageMeta({
  title: "Frequently Asked Questions",
  description:
    "Delivery times, prohibited items, collection, customs duties, insurance, and Pakistan-to-UK and excess baggage questions, answered.",
  path: "/faq",
});

export default function FaqPage() {
  return (
    <>
      <FaqJsonLd />
      <SiteHeader variant="service" />
      <main>
        <section className="section wrap pt-14">
          <span className="eyebrow">FAQ</span>
          <h1 className="mt-[18px] mb-3 text-[clamp(30px,4vw,42px)] font-extrabold">
            Frequently asked questions
          </h1>
          <p className="lede max-w-[56ch]">
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
