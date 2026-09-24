import AnnouncementBar from "../components/AnnouncementBar";
import SiteHeader from "../components/SiteHeader";
import SiteFooter from "../components/SiteFooter";
import PageHero from "../components/PageHero";
import EnquiryForm from "../components/EnquiryForm";
import { PhoneIcon, EmailIcon, WhatsAppIcon } from "../components/contact-icons";
import ContactDrawer from "../components/ContactDrawer";
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
      <SiteHeader variant="service" announcement={<AnnouncementBar />} />
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

        <section className="section wrap pt-2">
          <div className="contact-grid">
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

        {/* mobile-only left-edge trigger, rendered outside the hidden card */}
        <ContactDrawer />
      </main>
      <SiteFooter />
    </>
  );
}
