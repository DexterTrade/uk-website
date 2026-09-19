import SiteHeader from "../components/SiteHeader";
import SiteFooter from "../components/SiteFooter";
import PageHero from "../components/PageHero";
import EnquiryForm from "../components/EnquiryForm";
import { BUSINESS, pageMeta } from "@/lib/seo";

export const metadata = pageMeta({
  title: "Contact Us",
  description:
    "Get a fixed-price quote for air or sea freight, excess baggage or Pakistan to UK shipping. Phone, WhatsApp and email details for PAK Cargo.",
  path: "/contact-us",
});

export default function ContactUsPage() {
  return (
    <>
      <SiteHeader variant="service" />
      <main>
        <PageHero
          eyebrow="Contact us"
          title="Get a quote"
          intro="Tell us what you are sending and where it is going — air, sea, excess baggage or Pakistan to UK. We reply the same working day with a fixed price."
          stats={[
            { n: "Same day", l: "Reply on working days" },
            { n: "Fixed price", l: "Confirmed before you book" },
          ]}
        />

        <section className="section wrap" style={{ paddingTop: 8 }}>
          <div className="contact-grid">
            <div className="contact-card">
              <h2>Reach us directly</h2>
              <a className="btn btn-green" style={{ width: "100%" }} href={BUSINESS.whatsapp}>
                Message us on WhatsApp
              </a>
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
              <div className="contact-meta">
                <div><strong>{BUSINESS.legalName}</strong></div>
                <div>{BUSINESS.streetAddress}, {BUSINESS.addressLocality} {BUSINESS.postalCode}</div>
                <div>Mon&ndash;Sat, 9am&ndash;6pm</div>
              </div>
            </div>

            <div className="contact-card">
              <h2>Or send us a message</h2>
              <EnquiryForm />
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
