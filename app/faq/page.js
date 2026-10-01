import Link from "next/link";
import AnnouncementBar from "../components/AnnouncementBar";
import SiteHeader from "../components/SiteHeader";
import SiteFooter from "../components/SiteFooter";
import JsonLd from "../components/JsonLd";
import RichText, { plainText } from "../components/RichText";
import { buildFaqs } from "@/lib/faq";
import { getRateFacts } from "@/lib/rates";
import { breadcrumbs, faqPage } from "@/lib/schema";
import { pageMeta } from "@/lib/seo";

const PATH = "/faq";

export const metadata = pageMeta({
  title: "Cargo to Pakistan FAQ | Delivery, Duties & Items | PAK Cargo",
  description:
    "Cargo to Pakistan FAQ: delivery times, prohibited items, customs duties, insurance and delivery to Kashmir. Still have a question? WhatsApp us today.",
  path: PATH,
});

export default async function FaqPage() {
  const faqs = buildFaqs(await getRateFacts());

  return (
    <>
      <JsonLd
        data={faqPage({
          path: PATH,
          name: "Cargo to Pakistan FAQ",
          faqs: faqs.map((f) => ({ q: f.q, text: plainText(f.a) })),
        })}
      />
      <JsonLd data={breadcrumbs([{ name: "FAQ", path: PATH }])} />
      <SiteHeader variant="service" announcement={<AnnouncementBar />} />
      <main>
        <section className="section wrap pt-14">
          <span className="eyebrow">FAQ</span>
          <h1 className="mt-[18px] mb-3 text-[clamp(30px,4vw,42px)] font-extrabold">
            Cargo to Pakistan: Frequently Asked Questions
          </h1>
          <p className="lede max-w-[62ch]">
            Answers to the most common questions about sending cargo to Pakistan from the UK: delivery times, prices,
            what you can send, customs duties, insurance and tracking. Can&rsquo;t find what you need?{" "}
            <Link href="/contact-us">Contact us</Link> and we&rsquo;ll answer directly.
          </p>
          {/* Answers are in the HTML from the first byte; <details> only hides
              them visually, so search engines read every one. */}
          <div className="faq">
            {faqs.map((f) => (
              <details key={f.q}>
                <summary>
                  <h2>{f.q}</h2>
                  <span className="plus" aria-hidden="true">+</span>
                </summary>
                <p>
                  <RichText parts={f.a} />
                </p>
              </details>
            ))}
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
