import Link from "next/link";
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
  sea: { headline_rate: "From £195/m³", rate_note: "Shared container (LCL) · 30–40 day delivery", pickup_charge: 35 },
  air: { headline_rate: "From £3.10/kg", rate_note: "Tiered by weight · 5–7 day delivery", pickup_charge: 35 },
};

export default async function Home() {
  const supabase = await createClient();
  const { data: ratesRaw } = await supabase.from("rates").select("mode, headline_rate, rate_note, pickup_charge");
  const rateByMode = Object.fromEntries((ratesRaw || []).map((r) => [r.mode, r]));
  const seaRate = rateByMode.sea || RATE_DEFAULTS.sea;
  const airRate = rateByMode.air || RATE_DEFAULTS.air;

  return (
    <>
      <SiteHeader />

      <main id="top">
        <section className="border-b border-[#e6eaf2] bg-[linear-gradient(180deg,#f4f8f6_0%,#ffffff_100%)]">
          <div className="wrap grid grid-cols-[repeat(auto-fit,minmax(320px,1fr))] items-center gap-11 pt-[60px] pb-14 max-[640px]:gap-8 max-[640px]:pt-10 max-[640px]:pb-10">
            <div>
              <span className="eyebrow">Direct cargo &middot; By sea &amp; by air &middot; Nationwide UK collection</span>
              <h1 className="my-5 mb-[18px] text-[clamp(34px,5vw,54px)] leading-[1.05] font-extrabold">
                DOOR TO DOOR CARGO TO <span className="text-green">PAKISTAN</span> &amp; <span className="text-green">KASHMIR</span>.
              </h1>
              <p className="max-w-[46ch] text-[18px] leading-[1.6] text-muted">
                A trusted cargo service connecting the UK to Pakistan and Kashmir. Fast cargo by air for urgent
                consignments, economical cargo by sea for volume, and a dedicated London cargo hub handling
                direct, door to door collection on every booking.
              </p>
            </div>
            <div className="card card-shadow max-[640px]:hidden">
              <h2 className="text-[19px] font-bold">Speak to us now</h2>
              <p className="mt-1.5 text-[14.5px] text-soft">
                Call your nearest branch, or reach us on WhatsApp for a quick response.
              </p>
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
                    <span className="row-icon wa"><WhatsAppIcon /></span>
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

        <section className="wrap py-[60px]">
          <div className="grid grid-cols-[1.5fr_1fr] items-center gap-11 max-[860px]:grid-cols-1">
            <div className="overflow-hidden rounded-[18px] shadow-[0_24px_54px_-30px_rgba(22,35,60,0.4)] [aspect-ratio:220/130]">
              <img className="block h-full w-full object-cover" src="/assets/photos/sea-cargo.jpg" alt="Sea cargo — container ship" />
            </div>
            <div>
              <span className="eyebrow">Sea Cargo</span>
              <h2 className="mt-[14px] text-[clamp(24px,3vw,32px)] font-extrabold">Economical cargo by sea</h2>
              <p className="mt-[10px] max-w-[46ch] text-[15.5px] leading-[1.65] text-muted">
                Shared-container (LCL) space by the cubic metre, or a full container of your own — the
                economical route for furniture, business stock and full households.
              </p>
              <div className="mt-[22px] flex items-baseline gap-2">
                <span className="font-head text-[30px] font-extrabold text-green">{seaRate.headline_rate}</span>
                <span className="text-[13px] text-faint">{seaRate.rate_note}</span>
              </div>
              <div className="mt-[14px] flex max-w-[320px] flex-col gap-2 border-t border-line pt-[14px]">
                <div className="flex justify-between gap-3 text-sm text-muted"><span>Freight rate</span><strong className="font-semibold text-ink">{seaRate.headline_rate}</strong></div>
                <div className="flex justify-between gap-3 text-sm text-muted"><span>UK pickup</span><strong className="font-semibold text-ink">&pound;{Number(seaRate.pickup_charge).toFixed(0)}</strong></div>
              </div>
              <p className="fine mt-[10px]">Full cost breakdown provided with your quote.</p>
              <Link className="btn btn-navy mt-6" href="/sea-cargo">See sea cargo &rarr;</Link>
            </div>
          </div>
        </section>

        <section className="wrap border-t border-[#e6eaf2] py-[60px]">
          <div className="grid grid-cols-[1fr_1.5fr] items-center gap-11 max-[860px]:grid-cols-1">
            <div>
              <span className="eyebrow">Air Cargo</span>
              <h2 className="mt-[14px] text-[clamp(24px,3vw,32px)] font-extrabold">Fast cargo by air</h2>
              <p className="mt-[10px] max-w-[46ch] text-[15.5px] leading-[1.65] text-muted">
                Weekly consolidated departures to Karachi, Lahore and Islamabad — the fast route when speed
                matters more than volume.
              </p>
              <div className="mt-[22px] flex items-baseline gap-2">
                <span className="font-head text-[30px] font-extrabold text-green">{airRate.headline_rate}</span>
                <span className="text-[13px] text-faint">{airRate.rate_note}</span>
              </div>
              <div className="mt-[14px] flex max-w-[320px] flex-col gap-2 border-t border-line pt-[14px]">
                <div className="flex justify-between gap-3 text-sm text-muted"><span>Freight rate</span><strong className="font-semibold text-ink">{airRate.headline_rate}</strong></div>
                <div className="flex justify-between gap-3 text-sm text-muted"><span>UK pickup</span><strong className="font-semibold text-ink">&pound;{Number(airRate.pickup_charge).toFixed(0)}</strong></div>
              </div>
              <p className="fine mt-[10px]">Full cost breakdown provided with your quote.</p>
              <Link className="btn btn-navy mt-6" href="/air-cargo">See air cargo &rarr;</Link>
            </div>
            <div className="overflow-hidden rounded-[18px] shadow-[0_24px_54px_-30px_rgba(22,35,60,0.4)] [aspect-ratio:220/130] max-[860px]:order-first">
              <img className="block h-full w-full object-cover" src="/assets/photos/air-cargo.jpg" alt="Air cargo — cargo plane" />
            </div>
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
            <Link className="btn btn-navy mt-5" href="/moving-back-home">See relocation service &rarr;</Link>
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
