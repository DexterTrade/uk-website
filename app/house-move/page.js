import Link from "next/link";
import AnnouncementBar from "../components/AnnouncementBar";
import SiteHeader from "../components/SiteHeader";
import SiteFooter from "../components/SiteFooter";
import PageHero from "../components/PageHero";
import BottomCta from "../components/BottomCta";
import ProcessDiagram from "../components/ProcessDiagram";
import JsonLd from "../components/JsonLd";
import ReviewStrip from "../components/ReviewStrip";
import { getRateFacts } from "@/lib/rates";
import { breadcrumbs, service } from "@/lib/schema";
import { pageMeta } from "@/lib/seo";
import { GUIDE_WHAT_CAN_YOU_SEND, isPublished } from "@/lib/blog";

const PATH = "/house-move";

const STEPS = [
  {
    title: "Get a quote",
    body: "Tell us what you’re bringing. We survey the volume and quote a fixed price, air or sea.",
  },
  {
    title: "We collect & pack",
    body: "Our team collects from your UK address and packs everything securely for the move.",
  },
  {
    title: "Shipped to Pakistan",
    body: "Your household goods travel by sea or air, whichever suits your timeline and budget.",
  },
  {
    title: "Delivered home",
    body: "Cleared through customs and delivered to your new address in Pakistan.",
  },
];

export const metadata = pageMeta({
  title: "Moving Back to Pakistan Shipping & Removals | PAK Cargo",
  description:
    "Moving back to Pakistan? Our shipping service packs, collects and delivers your household goods from the UK to your new home. Get a free quote today.",
  path: PATH,
  image: { url: "/assets/photos/moving-home.jpg", alt: "Household goods packed for moving back to Pakistan" },
});

const BODY = "mt-4 max-w-[70ch] text-[16px] leading-[1.7] text-muted";

export default async function MovingBackHomePage() {
  const { sea, air } = await getRateFacts();

  return (
    <>
      <JsonLd
        data={service({
          path: PATH,
          name: "Moving Back to Pakistan Shipping",
          serviceType: "Household removals",
          description:
            "Packing, collection and shipping of household goods from the UK to Pakistan for families moving back home.",
        })}
      />
      <JsonLd data={breadcrumbs([{ name: "House Move", path: PATH }])} />
      <SiteHeader variant="service" announcement={<AnnouncementBar />} />
      <main>
        <PageHero
          eyebrow="Relocation · UK to Pakistan"
          title="Moving Back to Pakistan? We Ship Your Whole Home"
          intro="Furniture, appliances and personal belongings — packed, shipped and delivered to your door. A dedicated relocation service and trusted cargo service for families moving home to Pakistan for good."
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

        <section className="wrap border-t border-[#e6eaf2] py-[60px]">
          <h2 className="h-sec">Shipping Your Household Goods to Pakistan</h2>
          <p className={BODY}>
            Moving back to Pakistan after years in the UK is a big step, and your belongings should be the easy part.
            Our moving back to Pakistan shipping service packs, collects and ships your whole household from your UK
            address to your new home in Pakistan or Kashmir. It&rsquo;s all at a fixed price, quoted the same working
            day.
          </p>
          <p className={BODY}>
            Most things in a normal home can travel with you: furniture, beds and mattresses, fridges, washing
            machines and other appliances, kitchenware, clothes, bedding, books and personal belongings. Some items
            need extra paperwork or can&rsquo;t be shipped at all, such as flammable liquids, aerosols, loose batteries
            and medicines without documentation. Check our <Link href="/faq">FAQ</Link>, or send us a photo of
            anything you&rsquo;re unsure about before you pack it.
          </p>
          {isPublished(GUIDE_WHAT_CAN_YOU_SEND) && (
            <p className={BODY}>
              Not sure about an item? Read our full guide to{" "}
              <Link href={`/blog/${GUIDE_WHAT_CAN_YOU_SEND}`}>what you can send to Pakistan by cargo</Link>.
            </p>
          )}
        </section>

        <section className="wrap border-t border-[#e6eaf2] py-[60px]">
          <h2 className="h-sec">Sea or Air for Your Move to Pakistan?</h2>
          {/* The brief's copy sold shared-container space "by the cubic
              metre"; sea is priced per kg on this site, so that is left out. */}
          <p className={BODY}>
            For a full household, <Link href="/sea-cargo">sea cargo</Link> is almost always the right choice. You can
            book shared-container space for a smaller move, or a 20ft or 40ft container of your own for a whole house.
            Sea cargo takes {sea.time} door to door.
          </p>
          <p className={BODY}>
            For the few things you&rsquo;ll need as soon as you land, such as documents, a laptop or clothes for the
            first weeks, send a small <Link href="/air-cargo">air cargo shipment</Link> that arrives in {air.time}.
            Many families combine the two.
          </p>
        </section>

        <section className="wrap border-t border-[#e6eaf2] py-[60px]">
          <h2 className="h-sec">Planning Your Move: A Simple Timeline</h2>
          <ol className="mt-5 flex max-w-[70ch] list-decimal flex-col gap-3 pl-6 text-[16px] leading-[1.65] text-muted marker:font-bold marker:text-green">
            <li>
              <strong className="text-ink">10–12 weeks before you need your goods in Pakistan:</strong> ask for a quote
              and tell us what you&rsquo;re bringing. We&rsquo;ll confirm the volume and a fixed price.
            </li>
            <li>
              <strong className="text-ink">4–6 weeks before departure:</strong> confirm your booking on the next
              container departure.
            </li>
            <li>
              <strong className="text-ink">1–2 weeks before departure:</strong> we pack and collect everything from
              your UK home.
            </li>
            <li>
              <strong className="text-ink">On arrival:</strong> customs clearance at Karachi, then delivery (and
              unpacking on request) at your new home.
            </li>
          </ol>
          <p className={BODY}>
            Moving at short notice? Tell us your dates anyway. We&rsquo;ll suggest the fastest way to get your
            household to Pakistan.
          </p>
        </section>

        <section className="wrap border-t border-[#e6eaf2] py-[60px]">
          <h2 className="h-sec">Customs for Used Household Goods</h2>
          <p className={BODY}>
            Used personal and household goods have their own customs rules in Pakistan. When you&rsquo;re relocating
            to Pakistan from the UK, we prepare the paperwork for you, and we give you a written estimate of any
            duties before your goods leave the UK. That way you know the full cost of your move up front and nothing
            is held at the port.
          </p>
        </section>

        <section className="band-soft">
          <div className="section wrap">
            <h2 className="h-sec">How it works</h2>
            <p className="lede">From a UK quote to your new front door in Pakistan &mdash; four steps.</p>
            <ProcessDiagram steps={STEPS} />
          </div>
        </section>

        <p className="wrap fine mt-8 mb-10">
          Household relocation is quoted individually based on volume and destination &mdash; tell us what you&rsquo;re
          bringing and we&rsquo;ll confirm a fixed price the same working day.
        </p>

        <ReviewStrip />

        <BottomCta
          title="Planning your move back?"
          body="Tell us what you're bringing and where it's going — we'll survey the volume and confirm a fixed price the same working day."
          primary={{ label: "Get a quote", href: "/contact-us" }}
          secondary={{ label: "Already booked? Track it", href: "/tracking" }}
        />
      </main>
      <SiteFooter />
    </>
  );
}
