import SiteHeader from "../components/SiteHeader";
import SiteFooter from "../components/SiteFooter";
import EnquiryForm from "../components/EnquiryForm";
import { BUSINESS } from "@/lib/seo";

export const metadata = {
  title: "Contact Us",
  description:
    "Get a fixed-price quote for air or sea freight, excess baggage or Pakistan to UK shipping. Phone, WhatsApp and email details for PAK Cargo.",
  alternates: { canonical: "/contact-us" },
};

export default function ContactUsPage() {
  return (
    <>
      <SiteHeader variant="service" />
      <main>
        <section className="section wrap" style={{ paddingTop: 56 }}>
          <span className="eyebrow">Contact us</span>
          <h1 style={{ fontSize: "clamp(30px,4vw,42px)", fontWeight: 800, margin: "18px 0 12px" }}>Get a quote</h1>
          <p className="lede" style={{ maxWidth: "56ch" }}>
            Tell us what you are sending and where it is going &mdash; air, sea, excess baggage or Pakistan to UK.
            We reply the same working day with a fixed price.
          </p>

          <div
            style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 48, marginTop: 40 }}
          >
            <div>
              <a className="btn btn-green" style={{ width: "fit-content" }} href={BUSINESS.whatsapp}>
                Message us on WhatsApp
              </a>
              <div style={{ fontSize: 15, lineHeight: 1.9, color: "var(--muted)", marginTop: 22 }}>
                <div><strong style={{ color: "var(--ink)" }}>{BUSINESS.legalName}</strong></div>
                <div>{BUSINESS.streetAddress}, {BUSINESS.addressLocality} {BUSINESS.postalCode}</div>
                {BUSINESS.phones.map((p) => (
                  <div key={p.city}>{p.city} <a href={`tel:${p.href}`}>{p.display}</a></div>
                ))}
                <div>WhatsApp <a href={BUSINESS.whatsapp}>{BUSINESS.whatsappDisplay}</a></div>
                <div>Email <a href={`mailto:${BUSINESS.email}`}>{BUSINESS.email}</a></div>
                <div>Mon&ndash;Sat, 10am&ndash;7pm</div>
              </div>
            </div>
            <EnquiryForm />
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
