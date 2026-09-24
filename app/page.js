import Link from "next/link";
import AnnouncementBar from "./components/AnnouncementBar";
import SiteHeader from "./components/SiteHeader";
import SiteFooter from "./components/SiteFooter";
import WhatsAppFloat from "./components/WhatsAppFloat";
import { PhoneIcon, EmailIcon, WhatsAppIcon } from "./components/contact-icons";
import ContactDrawer from "./components/ContactDrawer";
import { BUSINESS } from "@/lib/seo";
import { createClient } from "@/lib/supabase/server";

export const metadata = {
  alternates: {
    canonical: "/",
  },
};

const RATE_DEFAULTS = {
  sea: { headline_rate: "£1.20/kg", rate_note: "Shared container (LCL)", estimated_time: "8–10 weeks", pickup_charge: 35 },
  air: { headline_rate: "£3.10/kg", rate_note: "Tiered by weight", estimated_time: "8–10 days", pickup_charge: 35 },
};

export default async function Home() {
  const supabase = await createClient();
  const { data: ratesRaw } = await supabase
    .from("rates")
    .select("mode, headline_rate, rate_note, estimated_time, pickup_charge");
  const rateByMode = Object.fromEntries((ratesRaw || []).map((r) => [r.mode, r]));
  const seaRate = rateByMode.sea || RATE_DEFAULTS.sea;
  const airRate = rateByMode.air || RATE_DEFAULTS.air;

  return (
    <>
      <SiteHeader announcement={<AnnouncementBar />} />

      <main id="top">
        <section className="border-b border-[#e6eaf2] bg-[linear-gradient(180deg,#f4f8f6_0%,#ffffff_100%)]">
          <div className="wrap grid grid-cols-[repeat(auto-fit,minmax(320px,1fr))] items-center gap-11 pt-[60px] pb-14 max-[640px]:gap-8 max-[640px]:pt-10 max-[640px]:pb-10">
            <div>
              <span className="eyebrow">Door to door cargo &middot; By sea &amp; by air &middot; Nationwide UK collection</span>
              <h1 className="my-5 mb-[18px] text-[clamp(34px,5vw,54px)] leading-[1.05] font-extrabold">
                DOOR TO DOOR CARGO TO <span className="text-green">PAKISTAN</span> &amp; <span className="text-green">KASHMIR</span>.
              </h1>
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
            <div className="card card-shadow max-[640px]:hidden">
              <h2 className="text-[17px] font-bold">Speak to us now</h2>
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
        <section id="phone-numbers" className="hidden max-[640px]:block wrap border-t border-[#e6eaf2] py-6">
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

        <section className="wrap border-t border-[#e6eaf2] py-[60px]">
          <div className="svc-split">
            <div className="svc-head">
              <span className="eyebrow">Sea Cargo</span>
              <h2 className="mt-[14px] text-[clamp(24px,3vw,32px)] font-extrabold">Economical cargo By Sea</h2>
            </div>
            <div className="svc-media overflow-hidden rounded-[18px] shadow-[0_24px_54px_-30px_rgba(22,35,60,0.4)] [aspect-ratio:220/130]">
              <img className="block h-full w-full object-cover" src="/assets/photos/sea-cargo.jpg" alt="Sea cargo — container ship" />
            </div>
            <div className="svc-rates">
              <div className="flex items-baseline gap-2">
                <span className="font-head text-[25px] font-bold text-green">{seaRate.headline_rate}</span>
                <span className="text-[13px] text-faint">
                  {[seaRate.rate_note, seaRate.estimated_time].filter(Boolean).join(" · ")}
                </span>
              </div>
              <p className="fine mt-[10px]">Full cost breakdown provided with your quote.</p>
              <Link className="btn btn-navy mt-5" href="/sea-cargo">See sea cargo &rarr;</Link>
            </div>
            <p className="svc-fee text-[12.5px] text-faint">
              Handling fee <span className="text-muted">&pound;{Number(seaRate.pickup_charge).toFixed(0)}</span>
            </p>
          </div>
        </section>

        <section className="wrap border-t border-[#e6eaf2] py-[60px]">
          <div className="svc-split">
            <div className="svc-head">
              <span className="eyebrow">Air Cargo</span>
              <h2 className="mt-[14px] text-[clamp(24px,3vw,32px)] font-extrabold">Fast cargo By Air</h2>
            </div>
            <div className="svc-media overflow-hidden rounded-[18px] shadow-[0_24px_54px_-30px_rgba(22,35,60,0.4)] [aspect-ratio:220/130]">
              <img className="block h-full w-full object-cover" src="/assets/photos/air-cargo.jpg" alt="Air cargo — cargo plane" />
            </div>
            <div className="svc-rates">
              <div className="flex items-baseline gap-2">
                <span className="font-head text-[25px] font-bold text-green">{airRate.headline_rate}</span>
                <span className="text-[13px] text-faint">
                  {[airRate.rate_note, airRate.estimated_time].filter(Boolean).join(" · ")}
                </span>
              </div>
              <p className="fine mt-[10px]">Full cost breakdown provided with your quote.</p>
              <Link className="btn btn-navy mt-5" href="/air-cargo">See air cargo &rarr;</Link>
            </div>
            <p className="svc-fee text-[12.5px] text-faint">
              Handling fee <span className="text-muted">&pound;{Number(airRate.pickup_charge).toFixed(0)}</span>
            </p>
          </div>
        </section>

        <section className="wrap grid grid-cols-[1.2fr_1fr] items-center gap-10 border-t border-[#e6eaf2] py-[46px] max-[860px]:grid-cols-1">
          <div>
            <span className="eyebrow">Excess Baggage</span>
            <h2 className="mt-3 text-[clamp(21px,2.6vw,27px)] font-extrabold">Flying with extra baggage? Send it as cargo instead.</h2>
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
            <h2 className="mt-3 text-[clamp(21px,2.6vw,27px)] font-extrabold">The same service, running in reverse.</h2>
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
            <h2 className="mt-3 text-[clamp(21px,2.6vw,27px)] font-extrabold">Relocating home for good? We&rsquo;ll bring your whole household.</h2>
            <p className="mt-[10px] max-w-[48ch] text-[15px] leading-[1.65] text-muted">
              Furniture, appliances and personal belongings — packed, shipped and delivered to your new
              address in Pakistan. Quoted individually based on what you&rsquo;re bringing.
            </p>
            <Link className="btn btn-navy mt-5" href="/house-move">See house move service &rarr;</Link>
          </div>
          <div className="ml-auto max-w-[340px] overflow-hidden rounded-[14px] shadow-[0_20px_46px_-28px_rgba(22,35,60,0.4)] [aspect-ratio:1/1] max-[860px]:ml-0 max-[860px]:max-w-full">
            <img className="block h-full w-full object-cover" src="/assets/photos/moving-home.jpg" alt="Moving back to Pakistan — household relocation" />
          </div>
        </section>
      </main>

      <SiteFooter />
      <WhatsAppFloat />
    </>
  );
}
