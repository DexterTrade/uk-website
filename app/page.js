import Image from "next/image";
import Link from "next/link";
import AnnouncementBar from "./components/AnnouncementBar";
import SiteHeader from "./components/SiteHeader";
import SiteFooter from "./components/SiteFooter";
import WhatsAppFloat from "./components/WhatsAppFloat";
import { PhoneIcon, EmailIcon, WhatsAppIcon } from "./components/contact-icons";
import ContactDrawer from "./components/ContactDrawer";
import EnquiryForm from "./components/EnquiryForm";
import JsonLd from "./components/JsonLd";
import RatesComparison from "./components/RatesComparison";
import ReviewStrip from "./components/ReviewStrip";
import { BUSINESS, pageMeta } from "@/lib/seo";
import { homeGraph } from "@/lib/schema";
import { getRateFacts } from "@/lib/rates";
import { GUIDE_WHAT_CAN_YOU_SEND, isPublished } from "@/lib/blog";
import seaPhoto from "@/public/assets/photos/sea-cargo.jpg";
import airPhoto from "@/public/assets/photos/air-cargo.jpg";
import movingPhoto from "@/public/assets/photos/moving-home.jpg";

export const metadata = pageMeta({
  title: "Cargo to Pakistan UK | Door to Door Sea & Air | PAK Cargo",
  description:
    "Door to door cargo to Pakistan from the UK. Sea & air cargo, excess baggage and customs clearance to Pakistan & Kashmir, fully insured. Get a free quote.",
  path: "/",
});

const WHY_US = [
  {
    title: "A fixed price before you book",
    body: "Tell us what you're sending and where it's going, and we'll reply the same working day with a fixed price. There are no surprises at collection and no hidden extras, and destination duties are estimated in writing before your cargo leaves the UK.",
  },
  {
    title: "Door to door, from anywhere in the UK",
    body: "We collect from any address on the UK mainland, usually within two working days of booking. Or you can drop your goods at our warehouse. Either way, your cargo is delivered to the receiver's door in Pakistan, with onward delivery into Kashmir.",
  },
  {
    title: "Customs handled at both ends",
    body: "Our own agents file the UK export paperwork and clear your shipment through Pakistan Customs, so you never have to deal with the port or the airport yourself.",
  },
  {
    title: "Branches in London, Birmingham and Nottingham",
    body: "Call your nearest branch or message us on WhatsApp for a quick response. The same team looks after your shipment from the first quote to the final delivery, and every shipment can be tracked online.",
  },
];

const SECTION = "wrap border-t border-[#e6eaf2] py-[60px]";
const H2 = "text-[clamp(24px,3vw,32px)] font-extrabold";
const BODY = "mt-4 max-w-[70ch] text-[16px] leading-[1.7] text-muted";

export default async function Home() {
  const { sea, air } = await getRateFacts();

  return (
    <>
      <JsonLd data={homeGraph()} />
      <SiteHeader announcement={<AnnouncementBar />} />

      <main id="top">
        <section className="border-b border-[#e6eaf2] bg-[linear-gradient(180deg,#f4f8f6_0%,#ffffff_100%)]">
          <div className="wrap grid grid-cols-[repeat(auto-fit,minmax(320px,1fr))] items-center gap-11 pt-[60px] pb-14 max-[640px]:gap-8 max-[640px]:pt-10 max-[640px]:pb-10">
            <div>
              <span className="eyebrow">Door to door cargo &middot; By sea &amp; by air &middot; Nationwide UK collection</span>
              {/* Written in normal case; the capitals are CSS. */}
              <h1 className="my-5 mb-[18px] text-[clamp(34px,5vw,54px)] leading-[1.05] font-extrabold uppercase">
                Door to Door Cargo to <span className="text-green">Pakistan</span> &amp;{" "}
                <span className="text-green">Kashmir</span> from the UK
              </h1>
              <p className="mb-4 max-w-[52ch] text-[16.5px] leading-[1.65] text-muted">
                PAK Cargo sends cargo to Pakistan from the UK, door to door. We collect from any address on the UK
                mainland, handle the export paperwork and customs clearance, and deliver to your family&rsquo;s front
                door anywhere in Pakistan and Kashmir. Send heavy and bulky goods economically by sea, or choose air
                cargo when you need it there fast.
              </p>
              <p
                lang="ur"
                dir="rtl"
                className="max-w-[430px] font-urdu text-[19px] leading-[2.1] text-muted max-[640px]:max-w-full max-[640px]:text-[17px]"
              >
                یو کے سے <span className="text-green">پاکستان</span> میں گھر سے گھر تک ڈیلیوری۔ اپنے
                گھر والوں اور پیاروں تک گھریلو و تجارتی سامان، فرنیچر، الیکٹرانکس اور ہر قسم کا سامان ہمارے ذریعے
                بھجوا سکتے ہیں۔
              </p>
            </div>
            <div className="card card-shadow max-[640px]:hidden" data-location="home-hero">
              <p className="font-head text-[17px] font-bold text-ink">Speak to us now</p>
              <p className="mt-1 text-[13.5px] text-soft">Call a branch, or message us on WhatsApp.</p>
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
              <a className="btn btn-green mt-4 w-full" href={BUSINESS.whatsapp}>
                Quick Response on WhatsApp
              </a>
            </div>
          </div>
        </section>

        {/* mobile-only left-edge trigger, rendered outside the hero card so
            it's still mounted when the card itself is hidden on phones */}
        <ContactDrawer />

        {/* Mobile-only contact list. Kept deliberately small so the service
            sections below it carry the weight of the page on a phone. */}
        <section
          id="phone-numbers"
          data-location="home-mobile-list"
          className="hidden max-[640px]:block wrap border-t border-[#e6eaf2] py-6"
        >
          <span className="eyebrow">Call us directly</span>
          <div className="mt-2.5 flex flex-col">
            {BUSINESS.phones.map((p) => (
              <a
                key={p.city}
                href={`tel:${p.href}`}
                className="flex items-center gap-2.5 py-[7px] text-[14px] font-semibold text-ink"
              >
                <PhoneIcon className="h-[15px] w-[15px] flex-none text-green" />
                <span className="flex min-w-0 flex-1 items-center justify-between gap-3">
                  <span>{p.display}</span>
                  <span className="text-[11px] font-medium tracking-[0.06em] text-faint uppercase">{p.city}</span>
                </span>
              </a>
            ))}
            <a
              href={BUSINESS.whatsapp}
              className="flex items-center gap-2.5 py-[7px] text-[14px] font-semibold text-ink"
            >
              <WhatsAppIcon className="h-[15px] w-[15px] flex-none text-green" />
              <span className="flex min-w-0 flex-1 items-center justify-between gap-3">
                <span>{BUSINESS.whatsappDisplay}</span>
                <span className="text-[11px] font-medium tracking-[0.06em] text-faint uppercase">WhatsApp</span>
              </span>
            </a>
            <a
              href={`mailto:${BUSINESS.email}`}
              className="flex items-center gap-2.5 py-[7px] text-[14px] font-semibold text-ink"
            >
              <EmailIcon className="h-[15px] w-[15px] flex-none text-green" />
              <span className="min-w-0 flex-1 truncate">{BUSINESS.email}</span>
            </a>
          </div>
        </section>

        <section className={SECTION}>
          <div className="svc-split">
            <div className="svc-head">
              <span className="eyebrow">Sea Cargo</span>
              <h2 className={`mt-[14px] ${H2}`}>Sea Cargo to Pakistan &mdash; Economical</h2>
              <p className="mt-2 text-[15px] text-muted">Economical cargo by sea.</p>
            </div>
            <div className="svc-media overflow-hidden rounded-[18px] shadow-[0_24px_54px_-30px_rgba(22,35,60,0.4)] [aspect-ratio:220/130]">
              <Image
                className="block h-full w-full object-cover"
                src={seaPhoto}
                sizes="(max-width: 860px) 100vw, 560px"
                alt="Sea cargo container ship shipping from the UK to Pakistan"
              />
            </div>
            <div className="svc-rates">
              <div className="flex items-baseline gap-2">
                <span className="font-head text-[25px] font-bold text-green">{sea.rateLabel}</span>
                <span className="text-[13px] text-faint">Min. {sea.minKg} kg &middot; {sea.time}</span>
              </div>
              <p className="fine mt-[10px]">Full cost breakdown provided with your quote.</p>
              <Link className="btn btn-navy mt-5" href="/sea-cargo">See sea cargo &rarr;</Link>
            </div>
            <p className="svc-fee text-[12.5px] text-faint">
              Handling fee <span className="text-muted">{sea.fee}</span>
            </p>
          </div>
        </section>

        <section className={SECTION}>
          <div className="svc-split">
            <div className="svc-head">
              <span className="eyebrow">Air Cargo</span>
              <h2 className={`mt-[14px] ${H2}`}>Air Cargo to Pakistan &mdash; Fast</h2>
              <p className="mt-2 text-[15px] text-muted">Fast cargo by air.</p>
            </div>
            <div className="svc-media overflow-hidden rounded-[18px] shadow-[0_24px_54px_-30px_rgba(22,35,60,0.4)] [aspect-ratio:220/130]">
              <Image
                className="block h-full w-full object-cover"
                src={airPhoto}
                sizes="(max-width: 860px) 100vw, 560px"
                alt="Air cargo plane loading shipment to Pakistan"
              />
            </div>
            <div className="svc-rates">
              <div className="flex items-baseline gap-2">
                <span className="font-head text-[25px] font-bold text-green">{air.rateLabel}</span>
                <span className="text-[13px] text-faint">Min. {air.minKg} kg &middot; {air.time}</span>
              </div>
              <p className="fine mt-[10px]">Full cost breakdown provided with your quote.</p>
              <Link className="btn btn-navy mt-5" href="/air-cargo">See air cargo &rarr;</Link>
            </div>
            <p className="svc-fee text-[12.5px] text-faint">
              Handling fee <span className="text-muted">{air.fee}</span>
            </p>
          </div>
        </section>

        <section className="wrap grid grid-cols-[1.2fr_1fr] items-center gap-10 border-t border-[#e6eaf2] py-[46px] max-[860px]:grid-cols-1">
          <div>
            <span className="eyebrow">Excess Baggage</span>
            <h2 className="mt-3 text-[clamp(21px,2.6vw,27px)] font-extrabold">Excess Baggage to Pakistan</h2>
            <p className="mt-2 text-[16px] font-semibold text-ink">Flying with extra baggage? Send it as cargo instead.</p>
            <p className="mt-[10px] max-w-[48ch] text-[15px] leading-[1.65] text-muted">
              Taking more than your airline allowance to Pakistan? Book the extra weight with us instead of
              paying at the check-in desk — usually much cheaper than airline excess fees.
            </p>
            <Link className="btn btn-navy mt-5" href="/excess-baggage">See excess baggage &rarr;</Link>
          </div>
          <div className="flex flex-col gap-[10px]">
            <div className="rounded-[10px] bg-red-soft px-4 py-[13px] text-[14.5px] font-semibold text-red">&#10007; Priced on the spot, at the airport</div>
            <div className="rounded-[10px] bg-green-soft px-4 py-[13px] text-[14.5px] font-semibold text-green-ink">&#10003; Fixed price, booked before you fly</div>
          </div>
        </section>

        <section className="wrap grid grid-cols-[1.2fr_1fr] items-center gap-10 border-t border-[#e6eaf2] py-[46px] max-[860px]:grid-cols-1">
          <div>
            <span className="eyebrow">Pakistan to UK</span>
            <h2 className="mt-3 text-[clamp(21px,2.6vw,27px)] font-extrabold">Pakistan to UK Cargo</h2>
            <p className="mt-2 text-[16px] font-semibold text-ink">The same service, running in reverse.</p>
            <p className="mt-[10px] max-w-[48ch] text-[15px] leading-[1.65] text-muted">
              Sending goods from Pakistan back to the UK? Air or sea freight, collected in Pakistan, cleared
              through UK customs and delivered to your door.
            </p>
            <Link className="btn btn-navy mt-5" href="/pak-to-uk">See Pakistan to UK &rarr;</Link>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-[14px] rounded-[14px] border-[1.5px] border-navy bg-white px-7 py-[22px] shadow-[0_14px_34px_-24px_rgba(46,69,147,0.3)]">
            <span className="rounded-full bg-bg-soft px-4 py-2 text-sm font-semibold text-ink">Karachi</span>
            <span className="rounded-full bg-bg-soft px-4 py-2 text-sm font-semibold text-ink">Lahore</span>
            <span className="text-xl font-bold text-navy">&rarr;</span>
            <span className="rounded-full bg-navy px-4 py-2 text-sm font-semibold text-white">UK</span>
          </div>
        </section>

        <section className="wrap grid grid-cols-[1.2fr_1fr] items-center gap-10 border-t border-[#e6eaf2] py-[46px] max-[860px]:grid-cols-1">
          <div>
            <span className="eyebrow">Moving Back to Pakistan</span>
            <h2 className="mt-3 text-[clamp(21px,2.6vw,27px)] font-extrabold">Moving Back to Pakistan</h2>
            <p className="mt-2 text-[16px] font-semibold text-ink">
              Relocating home for good? We&rsquo;ll bring your whole household.
            </p>
            <p className="mt-[10px] max-w-[48ch] text-[15px] leading-[1.65] text-muted">
              Furniture, appliances and personal belongings — packed, shipped and delivered to your new
              address in Pakistan. Quoted individually based on what you&rsquo;re bringing.
            </p>
            <Link className="btn btn-navy mt-5" href="/house-move">See house move service &rarr;</Link>
          </div>
          <div className="ml-auto max-w-[340px] overflow-hidden rounded-[14px] shadow-[0_20px_46px_-28px_rgba(22,35,60,0.4)] [aspect-ratio:1/1] max-[860px]:ml-0 max-[860px]:max-w-full">
            <Image
              className="block h-full w-full object-cover"
              src={movingPhoto}
              sizes="(max-width: 860px) 100vw, 340px"
              alt="Household goods packed for moving back to Pakistan"
            />
          </div>
        </section>

        {/* Section A */}
        <section className="band-soft">
          <div className="section wrap">
            <h2 className={H2}>Why Send Cargo to Pakistan with PAK Cargo</h2>
            <p className="lede">
              Sending cargo from the UK to Pakistan should be simple: one price, one team, and your goods delivered
              to the right door. Here&rsquo;s what you get with every shipment.
            </p>
            <div className="cards">
              {WHY_US.map((w, i) => (
                <article className="svc" key={w.title}>
                  <div className={`num ${i % 2 ? "alt" : ""}`}>{String(i + 1).padStart(2, "0")}</div>
                  <h3>{w.title}</h3>
                  <p>{w.body}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* Section B */}
        <section className={SECTION}>
          <h2 className={H2}>Sea Cargo or Air Cargo to Pakistan: Which Is Right for You?</h2>
          <p className="lede">Both of our UK to Pakistan shipping services are door to door. The difference is speed and price.</p>
          <RatesComparison sea={sea} air={air} />
          <p className={BODY}>
            Choose sea cargo when you&rsquo;re sending a lot. At {sea.perKg} per kg,{" "}
            <Link href="/sea-cargo">sea cargo from the UK to Pakistan</Link> is the most economical way to ship
            furniture, appliances, business stock or a full household. You can book shared-container space or a
            whole 20ft or 40ft container.
          </p>
          <p className={BODY}>
            Choose air cargo when time matters. <Link href="/air-cargo">Air cargo from the UK to Pakistan</Link>{" "}
            leaves every week and arrives door to door in {air.time}, making it ideal for parcels, documents, gifts
            for a wedding or Eid, and anything that can&rsquo;t wait.
          </p>
          <p className="fine mt-4">Rates are indicative. Your fixed price is confirmed with your quote.</p>
        </section>

        {/* Section C */}
        <section className={SECTION}>
          <h2 className={H2}>Door to Door Cargo Across Pakistan and Kashmir</h2>
          <p className={BODY}>
            Air cargo flies to Karachi, Lahore and Islamabad, and sea cargo arrives through Karachi port. From there,
            our delivery network carries your goods to the door in most cities across Pakistan, and on into Azad
            Kashmir. If your destination is a smaller town or village, tell us when you ask for a quote and
            we&rsquo;ll confirm the delivery time and price. Allow one to two extra days for outlying districts.
          </p>
          <p className={BODY}>
            Sending the other way? We also run a <Link href="/pak-to-uk">Pakistan to UK cargo service</Link> by air
            and sea, with UK customs clearance and delivery anywhere on the UK mainland.
          </p>
        </section>

        {/* Section D */}
        <section className={SECTION}>
          <h2 className={H2}>What Can You Send to Pakistan?</h2>
          <p className={BODY}>
            Most of what families and businesses send from the UK to Pakistan can travel with us, including:
          </p>
          <ul className="mt-4 flex max-w-[70ch] list-disc flex-col gap-2 pl-6 text-[16px] leading-[1.6] text-muted marker:text-green">
            <li>Clothes, shoes and gifts for weddings, Eid and family visits</li>
            <li>Household goods, kitchenware and bedding</li>
            <li>Furniture and large appliances (usually by sea)</li>
            <li>Electronics, such as laptops, TVs and mobile phones</li>
            <li>Business stock, samples and documents</li>
            <li>
              <Link href="/excess-baggage">Excess baggage</Link> when you&rsquo;re flying to Pakistan yourself
            </li>
          </ul>
          <p className={BODY}>
            Some items can&rsquo;t be sent as cargo, including flammable liquids, aerosols, loose batteries,
            perishable food, currency, weapons, and prescription medicines without documentation. If you&rsquo;re not
            sure about an item, send us a photo on WhatsApp before you pack it.
          </p>
          {isPublished(GUIDE_WHAT_CAN_YOU_SEND) && (
            <p className={BODY}>
              Not sure about an item? Read our full guide to{" "}
              <Link href={`/blog/${GUIDE_WHAT_CAN_YOU_SEND}`}>what you can send to Pakistan by cargo</Link>.
            </p>
          )}
        </section>

        {/* Section E */}
        <section className={SECTION}>
          <h2 className={H2}>Cargo to Pakistan: Quick Answers</h2>
          <div className="mt-6 grid max-w-[70ch] gap-6">
            <div>
              <h3 className="text-lg font-bold">How long does cargo take from the UK to Pakistan?</h3>
              <p className="mt-2 text-[16px] leading-[1.65] text-muted">
                About {air.time} by air and {sea.time} by sea, door to door.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-bold">Do you collect from my home?</h3>
              <p className="mt-2 text-[16px] leading-[1.65] text-muted">
                Yes. We collect anywhere on the UK mainland, usually within two working days of booking.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-bold">Who pays the customs duties in Pakistan?</h3>
              <p className="mt-2 text-[16px] leading-[1.65] text-muted">
                The receiver pays, unless you ask us to prepay them. We give you a written estimate before your cargo
                departs.
              </p>
            </div>
          </div>
          <p className="mt-6 font-semibold">
            <Link href="/faq">Read all FAQs &rarr;</Link>
          </p>
        </section>

        <ReviewStrip />

        <section id="contact" className="band-soft">
          <div className="section wrap">
            <span className="eyebrow">Contact us</span>
            <h2 className={`mt-3 ${H2}`}>Get a quote</h2>
            <p className="lede">
              Tell us what you are sending and where it is going &mdash; we reply the same working day with a
              fixed price.
            </p>
            <div className="contact-grid mt-9" data-location="home-contact">
              {/* Hidden on phones: the numbers already appear in the mobile
                  list above and in the contact drawer, so a third copy would
                  be the same three numbers a third time. */}
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
                <EnquiryForm location="home" />
              </div>
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
      <WhatsAppFloat />
    </>
  );
}
