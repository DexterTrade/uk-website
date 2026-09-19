import SiteHeader from "../components/SiteHeader";
import SiteFooter from "../components/SiteFooter";
import PageHero from "../components/PageHero";
import BottomCta from "../components/BottomCta";
import { pageMeta } from "@/lib/seo";

export const metadata = pageMeta({
  title: "Moving Back to Pakistan",
  description:
    "Relocating to Pakistan for good? We pack, ship and deliver your whole household — furniture, appliances and personal belongings — door to door.",
  path: "/moving-back-home",
});

export default function MovingBackHomePage() {
  return (
    <>
      <SiteHeader variant="service" />
      <main>
        <PageHero
          eyebrow="Relocation · UK to Pakistan"
          title="Moving back to Pakistan? We'll bring your whole household with you."
          intro="Furniture, appliances and personal belongings — packed, shipped and delivered to your door. A dedicated relocation service for families moving home for good."
          stats={[
            { n: "Full household", l: "Furniture & appliances" },
            { n: "Door to door", l: "Packed to delivered" },
            { n: "Sea or air", l: "Whichever suits your move" },
          ]}
          ctas={[
            { label: "Request a quote", href: "/contact-us", variant: "btn-navy" },
            { label: "Track a shipment", href: "/tracking", variant: "btn-ghost" },
          ]}
        />

        <section className="section wrap">
          <h2 className="h-sec">Everything for the move, handled</h2>
          <p className="lede">Not just boxes — a full household, packed and delivered safely.</p>
          <div className="cards">
            <article className="svc">
              <div className="num">01</div>
              <h3>Full home packing</h3>
              <p>We pack your furniture, appliances and belongings for the move, ready for shipping.</p>
            </article>
            <article className="svc">
              <div className="num alt">02</div>
              <h3>Appliance-safe handling</h3>
              <p>Fridges, washing machines and furniture are handled and secured properly for the journey.</p>
            </article>
            <article className="svc">
              <div className="num">03</div>
              <h3>Customs for personal effects</h3>
              <p>We prepare the paperwork for used household goods entering Pakistan, with duties estimated up front.</p>
            </article>
            <article className="svc">
              <div className="num alt">04</div>
              <h3>Door delivery</h3>
              <p>Delivered &mdash; and unpacked on request &mdash; at your new home in Pakistan.</p>
            </article>
          </div>
        </section>

        <section className="band-soft">
          <div className="section wrap">
            <h2 className="h-sec">How it works</h2>
            <div className="cards">
              <div className="step">
                <span className="k">STEP 1</span>
                <h3>Get a quote</h3>
                <p>Tell us what you&rsquo;re bringing. We survey the volume and quote a fixed price, air or sea.</p>
              </div>
              <div className="step">
                <span className="k">STEP 2</span>
                <h3>We collect &amp; pack</h3>
                <p>Our team collects from your UK address and packs everything securely for the move.</p>
              </div>
              <div className="step">
                <span className="k">STEP 3</span>
                <h3>Shipped to Pakistan</h3>
                <p>Your household goods travel by sea or air, whichever suits your timeline and budget.</p>
              </div>
              <div className="step">
                <span className="k">STEP 4</span>
                <h3>Delivered home</h3>
                <p>Cleared through customs and delivered to your new address in Pakistan.</p>
              </div>
            </div>
          </div>
        </section>

        <p className="wrap fine -mt-2 mb-10">
          Household relocation is quoted individually based on volume and destination &mdash; tell us what you&rsquo;re
          bringing and we&rsquo;ll confirm a fixed price the same working day.
        </p>

        <BottomCta
          title="Planning your move back?"
          body="Tell us what you're bringing and where it's going &mdash; we'll survey the volume and confirm a fixed price the same working day."
          primary={{ label: "Get a quote", href: "/contact-us" }}
          secondary={{ label: "Already booked? Track it", href: "/tracking" }}
        />
      </main>
      <SiteFooter />
    </>
  );
}
