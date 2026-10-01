import Link from "next/link";
import AnnouncementBar from "../components/AnnouncementBar";
import SiteHeader from "../components/SiteHeader";
import SiteFooter from "../components/SiteFooter";
import PageHero from "../components/PageHero";
import EnquiryForm from "../components/EnquiryForm";
import JsonLd from "../components/JsonLd";
import ReviewStrip from "../components/ReviewStrip";
import { PhoneIcon, EmailIcon, WhatsAppIcon } from "../components/contact-icons";
import ContactDrawer from "../components/ContactDrawer";
import { BUSINESS, pageMeta } from "@/lib/seo";
import { breadcrumbs, contactPage } from "@/lib/schema";
import { publishedCityFor } from "@/lib/cities";

const PATH = "/contact-us";
const TITLE = "UK to Pakistan Cargo Quote | Contact PAK Cargo";

export const metadata = pageMeta({
  title: TITLE,
  description:
    "Get a UK to Pakistan cargo quote from our London, Birmingham or Nottingham office. Call, WhatsApp or email us Mon-Sat, 9am-6pm. Request your quote now.",
  path: PATH,
});

const H2 = "h-sec";
const BODY = "mt-4 max-w-[70ch] text-[16px] leading-[1.7] text-muted";

const ADDRESS = `${BUSINESS.streetAddress}, ${BUSINESS.addressLocality} ${BUSINESS.postalCode}`;

export default function ContactUsPage() {
  return (
    <>
      <JsonLd data={contactPage({ path: PATH, name: TITLE })} />
      <JsonLd data={breadcrumbs([{ name: "Contact Us", path: PATH }])} />
      <SiteHeader variant="service" announcement={<AnnouncementBar />} />
      <main>
        <PageHero
          eyebrow="Contact us"
          title="Get a UK to Pakistan Cargo Quote"
          intro="Get a free UK to Pakistan cargo quote for air cargo, sea cargo, excess baggage or Pakistan to UK shipping. Tell us what you're sending and where it's going, and we'll reply the same working day with a fixed price."
          stats={[
            { n: "Same day", l: "Reply on working days" },
            { n: "Fixed price", l: "Confirmed before you book" },
          ]}
        />

        <section className="section wrap pt-2">
          <div className="contact-grid" data-location="contact-card">
            <div className="contact-card max-[640px]:hidden">
              <h2>Reach us directly</h2>
              <a className="btn btn-green w-full" href={BUSINESS.whatsapp}>
                Quick Response on WhatsApp
              </a>
              <div className="hero-contact-list">
                <div className="contact-inline-rows">
                  <div className="contact-phones-inline">
                    {BUSINESS.phones.map((p) => (
                      <a key={p.city} href={`tel:${p.href}`}>
                        <span className="row-icon"><PhoneIcon /></span>
                        <span className="row-text">
                          <span>{p.display}</span>
                          <span className="city">{p.city}</span>
                        </span>
                      </a>
                    ))}
                  </div>
                  <a href={BUSINESS.whatsapp}>
                    <span className="row-icon"><WhatsAppIcon /></span>
                    <span className="row-text">
                      <span>{BUSINESS.whatsappDisplay}</span>
                      <span className="city">WhatsApp</span>
                    </span>
                  </a>
                  <a href={`mailto:${BUSINESS.email}`}>
                    <span className="row-icon"><EmailIcon /></span>
                    <span className="row-text">
                      <span>{BUSINESS.email}</span>
                      <span className="city">Email</span>
                    </span>
                  </a>
                </div>
              </div>
              <div className="contact-meta">
                <div><strong>{BUSINESS.legalName}</strong></div>
                <div>{ADDRESS}</div>
                <div>Mon&ndash;Sat, 9am&ndash;6pm</div>
              </div>
            </div>

            <div className="contact-card">
              <h2>Or send us a message</h2>
              <EnquiryForm location="contact-us" />
            </div>
          </div>
        </section>

        <ReviewStrip />

        <section className="wrap border-t border-[#e6eaf2] py-[60px]">
          <h2 className={H2}>Which Number Should I Call?</h2>
          <div className="table-wrap max-w-[640px]" data-location="contact-branch-table">
            <table className="w-full min-w-0">
              <thead>
                <tr><th scope="col">Branch</th><th scope="col">Phone</th></tr>
              </thead>
              <tbody>
                {BUSINESS.phones.map((p) => {
                  // A branch links to its city page once that page is live.
                  const cityPage = publishedCityFor(p.city);
                  return (
                    <tr key={p.city}>
                      <th scope="row">
                        {cityPage ? <Link href={`/${cityPage.slug}`}>{p.city}</Link> : p.city}
                      </th>
                      <td><a href={`tel:${p.href}`}>{p.display}</a></td>
                    </tr>
                  );
                })}
                <tr>
                  <th scope="row">WhatsApp (fastest reply)</th>
                  <td><a href={BUSINESS.whatsapp}>{BUSINESS.whatsappDisplay}</a></td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className={BODY}>
            Call the branch closest to you. Whether you&rsquo;re sending cargo to Pakistan from London, Birmingham,
            Nottingham or anywhere else in the UK, every branch can give you a quote, book a collection and answer
            tracking questions. For the quickest response, message us on WhatsApp. You can send photos of your items,
            and we&rsquo;ll reply with a price.
          </p>
        </section>

        <section className="wrap border-t border-[#e6eaf2] py-[60px]">
          <h2 className={H2}>Opening Hours and Response Times</h2>
          <p className={BODY}>
            We&rsquo;re open Monday to Saturday, 9am to 6pm. Quote requests sent on a working day get a fixed price
            the same day, and messages sent on a Sunday are answered on Monday morning. In busy periods, such as the
            weeks before Eid and the wedding season, book early to secure space on the next flight or container.
          </p>
        </section>

        <section className="wrap border-t border-[#e6eaf2] py-[60px]">
          <h2 className={H2}>What to Include in Your Quote Request</h2>
          <p className={BODY}>
            The more you tell us, the more accurate your cargo to Pakistan quote will be. Please include:
          </p>
          <ul className="mt-4 flex max-w-[70ch] list-disc flex-col gap-2 pl-6 text-[16px] leading-[1.6] text-muted marker:text-green">
            <li>Your collection postcode in the UK, or tell us you&rsquo;ll drop off at our warehouse</li>
            <li>The destination city or town in Pakistan or Kashmir</li>
            <li>What you&rsquo;re sending, plus the approximate weight or box sizes</li>
            <li>Air or sea, or &ldquo;not sure&rdquo; and we&rsquo;ll recommend the best option</li>
            <li>For excess baggage: your flight date</li>
            <li>For a house move: a rough list of furniture and appliances</li>
          </ul>
        </section>

        <section className="wrap border-t border-[#e6eaf2] py-[60px]">
          <h2 className={H2}>Sending From Pakistan to the UK?</h2>
          <p className={BODY}>
            You can request a <Link href="/pak-to-uk">Pakistan to UK cargo quote</Link> from here too. Tell us the
            collection city in Pakistan (for example Karachi, Lahore or Islamabad), what&rsquo;s being sent, and the
            delivery postcode in the UK. Our agents in Pakistan arrange the collection, and we handle UK customs
            clearance and delivery to the door.
          </p>
        </section>

        <section className="wrap border-t border-[#e6eaf2] py-[60px]">
          <h2 className={H2}>Our Registered Office</h2>
          <p className={BODY}>
            {BUSINESS.legalName},{" "}
            {BUSINESS.mapsUrl ? (
              <a href={BUSINESS.mapsUrl} target="_blank" rel="noopener">
                {ADDRESS}
              </a>
            ) : (
              ADDRESS
            )}
            . Registered in England &amp; Wales, company no. {BUSINESS.companyNumber}.
          </p>
          {/* Map slot: renders only once the Google Business Profile embed URL
              is set in lib/seo.js — never as an empty box. The fixed aspect
              ratio holds the space so the lazy iframe can't shift the layout. */}
          {BUSINESS.mapsEmbedUrl && (
            <div className="mt-6 max-w-[760px] overflow-hidden rounded-xl border border-line [aspect-ratio:16/9]">
              <iframe
                src={BUSINESS.mapsEmbedUrl}
                className="h-full w-full border-0"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title={`PAK Cargo office map — ${BUSINESS.streetAddress}, ${BUSINESS.addressLocality}`}
              />
            </div>
          )}
          <p className={BODY}>
            Already booked? <Link href="/tracking">Track your shipment</Link> or read our{" "}
            <Link href="/faq">FAQ</Link>.
          </p>
        </section>

        {/* mobile-only left-edge trigger, rendered outside the hidden card */}
        <ContactDrawer />
      </main>
      <SiteFooter />
    </>
  );
}
