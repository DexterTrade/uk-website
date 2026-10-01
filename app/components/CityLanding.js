import Link from "next/link";
import { notFound } from "next/navigation";
import AnnouncementBar from "./AnnouncementBar";
import SiteHeader from "./SiteHeader";
import SiteFooter from "./SiteFooter";
import WhatsAppFloat from "./WhatsAppFloat";
import PageHero from "./PageHero";
import BottomCta from "./BottomCta";
import JsonLd from "./JsonLd";
import RatesComparison from "./RatesComparison";
import ReviewStrip from "./ReviewStrip";
import { cityBySlug } from "@/lib/cities";
import { getRateFacts } from "@/lib/rates";
import { breadcrumbs, faqPage, service } from "@/lib/schema";
import { SERVICES } from "@/lib/services";
import { SHOW_DRAFTS, pageMeta } from "@/lib/seo";

// Shown only on a draft previewed with SHOW_DRAFTS — never in production,
// where a draft city page is a 404.
const Pending = ({ what }) => (
  <span className="rounded bg-amber-soft px-2 py-1 text-amber-ink">[Draft: {what} awaiting approved copy]</span>
);

function visibleCity(slug) {
  const city = cityBySlug(slug);
  if (!city || (!city.published && !SHOW_DRAFTS)) return null;
  return city;
}

export function cityMetadata(slug) {
  const city = visibleCity(slug);
  if (!city) return {};
  return pageMeta({
    title: city.title,
    description: city.description,
    path: `/${city.slug}`,
    noindex: !city.published,
  });
}

// One template for every "Cargo to Pakistan from <city>" page; the copy lives
// in lib/cities.js.
export default async function CityLanding({ slug }) {
  const city = visibleCity(slug);
  if (!city) notFound();

  const { sea, air } = await getRateFacts();
  const path = `/${city.slug}`;

  return (
    <>
      <JsonLd
        data={service({
          path,
          name: city.h1,
          serviceType: "Air and sea freight",
          areaServed: [
            { "@type": "City", name: city.city },
            { "@type": "Country", name: "Pakistan" },
          ],
        })}
      />
      <JsonLd data={breadcrumbs([{ name: city.h1, path }])} />
      {city.faqs.length > 0 && (
        <JsonLd data={faqPage({ path, name: `${city.city} FAQs`, faqs: city.faqs.map((f) => ({ q: f.q, text: f.a })) })} />
      )}
      <SiteHeader variant="service" announcement={<AnnouncementBar />} />
      <main data-location="city-page">
        <PageHero
          eyebrow={`${city.city} · UK to Pakistan & Kashmir`}
          title={city.h1}
          intro={city.intro || <Pending what="intro" />}
          ctas={[
            { label: "Get a quote", href: "/contact-us", variant: "btn-navy" },
            { label: `Call ${city.city} branch`, href: `tel:${city.phone.href}`, variant: "btn-ghost" },
          ]}
        />

        <section className="section wrap">
          <h2 className="h-sec">Collection areas in {city.city}</h2>
          <p className="lede whitespace-pre-line">{city.areas || <Pending what="collection areas" />}</p>
        </section>

        <section className="band-soft">
          <div className="section wrap">
            <h2 className="h-sec">Services from {city.city}</h2>
            <div className="cards">
              {SERVICES.map((s, i) => (
                <Link key={s.href} href={s.href} className="svc block text-ink">
                  <div className={`num ${i % 2 ? "alt" : ""}`}>{String(i + 1).padStart(2, "0")}</div>
                  <h3>{s.name}</h3>
                  <p>{s.blurb}</p>
                </Link>
              ))}
            </div>
          </div>
        </section>

        <section className="section wrap">
          <h2 className="h-sec">Rates and transit times</h2>
          <RatesComparison sea={sea} air={air} />
          <p className="fine mt-4">Rates are indicative. Your fixed price is confirmed with your quote.</p>
        </section>

        <section className="wrap border-t border-[#e6eaf2] py-[60px]">
          <h2 className="h-sec">{city.city} FAQs</h2>
          {city.faqs.length > 0 ? (
            <div className="faq">
              {city.faqs.map((f) => (
                <details key={f.q}>
                  <summary>
                    <h3 className="m-0 font-head text-[17px] font-semibold">{f.q}</h3>
                    <span className="plus" aria-hidden="true">+</span>
                  </summary>
                  <p>{f.a}</p>
                </details>
              ))}
            </div>
          ) : (
            <p className="lede">
              <Pending what="city FAQs" />
            </p>
          )}
        </section>

        <ReviewStrip />

        <BottomCta
          title={`Sending cargo from ${city.city}?`}
          body="Tell us what you're sending and where it's going — we reply the same working day with a fixed price."
          primary={{ label: "Get a quote", href: "/contact-us" }}
          secondary={{ label: "Already sent something? Track it", href: "/tracking" }}
        />
      </main>
      <SiteFooter />
      <WhatsAppFloat />
    </>
  );
}
