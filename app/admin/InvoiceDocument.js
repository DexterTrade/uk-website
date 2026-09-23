import { money } from "@/lib/data";
import { BUSINESS } from "@/lib/seo";
import { EmailIcon } from "@/app/components/contact-icons";

// The invoice as the customer receives it. A plain presentational component
// with no server-only imports, so the same markup backs both the preview
// modal (client) and the printable page (server) — one design, not two that
// drift apart.
//
// Laid out for A4: `@page` and the print rules live in globals.css under
// `.invoice-doc`.

function formatDate(dateStr) {
  if (!dateStr) return "—";
  return new Date(`${dateStr}T00:00:00Z`).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function Party({ title, lines }) {
  return (
    <div className="flex-1">
      <p className="mb-[7px] border-b-2 border-green pb-[5px] text-[10.5px] font-bold tracking-[0.1em] text-green-ink uppercase">
        {title}
      </p>
      <dl className="text-[11.5px] leading-[1.55] text-ink">
        {lines.map(([label, value]) => (
          <div key={label} className="flex gap-[6px] py-[1px]">
            <dt className="w-[62px] flex-none text-soft">{label}</dt>
            <dd className="font-medium break-words">{value || "—"}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

function Fact({ label, value }) {
  return (
    <div className="flex-1 px-[10px] py-[8px] text-center">
      <p className="text-[8.5px] font-bold tracking-[0.09em] text-soft uppercase">{label}</p>
      <p className="mt-[3px] text-[12px] font-bold text-ink">{value}</p>
    </div>
  );
}

// Supplied by the business, reproduced verbatim apart from two plain spelling
// fixes ("disretion", "ma cause"). Clause 3 quotes the sea delivery time,
// which is editable in /admin → Rates, so it is interpolated from
// `rates.estimated_time` rather than frozen here — that figure previously
// drifted into three different values across the site, which is the whole
// reason that column exists.
function termsList(seaEstimate) {
  return [
    "Custom inspects the consignments and may at times impose duties/charges which we promptly notify to the customers. These charges are borne by the customers. Our company cannot predict these charges if any at all as it is upon the discretion of authorities and can only be informed/charged once the consignment is inspected by the customs.",
    "If parcel is not received in Pakistan and no enquiry is made within 3 months, we will dispose of the parcel without notice.",
    `By Sea, delivery within ${seaEstimate}.`,
    "If any parcel is lost or missing a credit note of 20 will be given. No cash refund.",
    "The parcel may be disposed off, if any undeclared & illegitimate item found in it.",
    "Any complaint should be notified in writing within 24 hours of receiving parcel in Pakistan & AJK, after that no responsibility will be taken.",
    "We take care of the parcels at our best, but any fragile cargo, i.e. electronics, electrics are couriered at owner's risk.",
    "Restricted items such as body sprays, perfumes, battery items and flammable items are not allowed in air shipment; if found it may cause delay in delivery procedure.",
    "We shall not be held liable for any delays or damages occurring during transit, particularly once the freight has entered the destination country.",
    "Any threats or any abusive language with our staff will terminate the contract and no refund and return will be made.",
    "If the ship sank or in case of fire in UK and Pakistan, the company will take no responsibility.",
    "Service Charges (Mandatory) € 20 in by Air.",
    "Customers are responsible for insuring their items against damage during transit. It is also the customer's responsibility to ensure items are properly and securely packed.",
  ];
}

export default function InvoiceDocument({ shipment, customer, invoice, operator, seaEstimate }) {
  const weight = Number(shipment.weight_kg);
  const rate = Number(invoice.rate_per_kg);
  const other = Number(invoice.other_charges);
  const total = Number(invoice.total_charges);

  const isPakistan = (shipment.receiver_country || "PK") === "PK";

  return (
    <article className="invoice-doc relative mx-auto w-full max-w-[820px] overflow-hidden bg-white px-[42px] py-[38px] text-ink max-[560px]:px-5 max-[560px]:py-6">
      {/* Watermark. aria-hidden and behind everything — decoration only. */}
      <img
        src="/assets/logo-mark.svg"
        alt=""
        aria-hidden="true"
        className="invoice-watermark pointer-events-none absolute top-1/2 left-1/2 w-[440px] max-w-none -translate-x-1/2 -translate-y-1/2 opacity-[0.045]"
      />

      <div className="relative">
        {/* ---------------------------------------------------- letterhead */}
        <header className="flex items-start justify-between gap-6 border-b-[3px] border-green pb-[18px]">
          <div className="flex items-center gap-[11px]">
            <img src="/assets/logo-mark.svg" alt="" className="h-[52px] w-[52px] flex-none object-contain" />
            <div>
              <p className="font-head text-[23px] leading-none font-extrabold tracking-[0.01em] text-ink">
                PAK CARGO
              </p>
              <p className="mt-[4px] text-[9.5px] font-semibold tracking-[0.16em] text-green-ink uppercase">
                UK &harr; Pakistan Cargo
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="font-head text-[26px] leading-none font-extrabold tracking-[0.06em] text-green uppercase">
              Invoice
            </p>
            <p className="mt-[8px] text-[10px] font-bold tracking-[0.08em] text-soft uppercase">Tracking no.</p>
            {/* The tracking number is the one thing a customer has to read off
                this document, so it is the only thing printed in red. */}
            <p className="font-head text-[17px] leading-tight font-extrabold text-red">{shipment.reference}</p>
            <p className="mt-[5px] text-[11px] text-muted">
              Issued <strong className="text-ink">{formatDate(invoice.issued_date)}</strong>
            </p>
          </div>
        </header>

        {/* Office details: address with postcode, all three branch numbers. */}
        <section className="flex flex-wrap items-start justify-between gap-x-8 gap-y-2 border-b border-line py-[12px] text-[10.5px] leading-[1.5] text-muted">
          <address className="not-italic">
            <strong className="text-ink">{BUSINESS.legalName}</strong>
            <br />
            {BUSINESS.streetAddress}, {BUSINESS.addressLocality} {BUSINESS.postalCode}
            <br />
            {/* Every domain the business trades under, not just the canonical
                one — a customer who reached us on the other address should see
                it here too. */}
            {BUSINESS.domains.join(" · ")}
          </address>
          <div className="text-right">
            {BUSINESS.phones.map((p) => (
              <span key={p.city} className="block">
                <span className="text-soft">{p.city}</span>{" "}
                <strong className="text-ink">{p.display}</strong>
              </span>
            ))}
            <span className="block">
              <span className="text-soft">WhatsApp</span>{" "}
              <strong className="text-ink">{BUSINESS.whatsappDisplay}</strong>
            </span>
          </div>
        </section>

        {/* Email gets its own band rather than a line in the address block:
            it is the channel customers are most likely to reply on. */}
        <section className="flex items-center justify-center gap-[7px] border-b border-line bg-green-soft px-3 py-[9px] text-center">
          <EmailIcon width="13" height="13" className="flex-none text-green-ink" />
          <span className="text-[9px] font-bold tracking-[0.1em] text-green-ink uppercase">Email</span>
          <a
            href={`mailto:${BUSINESS.email}`}
            className="font-head text-[14px] font-extrabold tracking-[0.01em] text-green-ink"
          >
            {BUSINESS.email}
          </a>
        </section>

        {/* --------------------------------------------- sender / receiver */}
        <section className="flex gap-9 pt-[16px] pb-[14px] max-[560px]:flex-col max-[560px]:gap-5">
          <Party
            title="Sender details"
            lines={[
              ["Name", customer.name],
              ["Address", customer.address],
              ["Town", `${customer.town} ${customer.postcode}`],
              ["Phone", customer.phone],
              ["Email", customer.email],
            ]}
          />
          <Party
            title="Receiver details"
            lines={[
              ["Name", shipment.receiver_name],
              ["Address", shipment.receiver_address],
              ["City", `${shipment.receiver_city}${isPakistan ? ", Pakistan" : `, ${shipment.receiver_country}`}`],
              ["Phone", shipment.receiver_phone],
              ...(shipment.receiver_phone_alt ? [["Alt. phone", shipment.receiver_phone_alt]] : []),
              ["Email", shipment.receiver_email],
            ]}
          />
        </section>

        {/* ---------------------------------------------------- fact strip */}
        <section className="flex divide-x divide-[#dbe4f0] rounded-[6px] border border-[#dbe4f0] bg-[#f7faff] max-[560px]:flex-wrap max-[560px]:divide-x-0">
          <Fact label="Cargo type" value={shipment.mode === "air" ? "Air cargo" : "Sea cargo"} />
          <Fact label="No. of parcels" value={shipment.parcels} />
          {/* Blank when no name is given. On the customer's copy that is
              always: "operator" is currently the signed-in staff account's
              email, an internal identifier, so it is passed empty and this
              cell stays blank until real operator names exist. There is no
              collection date here — the issue date above already dates the
              document. */}
          <Fact label="Booked by" value={operator || " "} />
        </section>

        {/* -------------------------------------------------- pricing table */}
        <table className="mt-[18px] w-full border-collapse text-[11.5px]">
          <thead>
            <tr className="bg-ink text-white">
              <th className="px-[10px] py-[8px] text-left font-head text-[9.5px] font-bold tracking-[0.09em] uppercase">
                Charges
              </th>
              <th className="px-[10px] py-[8px] text-right font-head text-[9.5px] font-bold tracking-[0.09em] whitespace-nowrap uppercase">
                Amount
              </th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-[#e6ebf3]">
              <td className="px-[10px] py-[8px]">Total weight</td>
              <td className="px-[10px] py-[8px] text-right whitespace-nowrap">{weight} kg</td>
            </tr>
            <tr className="border-b border-[#e6ebf3]">
              <td className="px-[10px] py-[8px]">Rate per kg</td>
              <td className="px-[10px] py-[8px] text-right whitespace-nowrap">£{money(rate)}</td>
            </tr>
            <tr className="border-b border-[#e6ebf3]">
              <td className="px-[10px] py-[8px]">Customs duty, handling and packing</td>
              <td className="px-[10px] py-[8px] text-right whitespace-nowrap">£{money(other)}</td>
            </tr>
            {/* No reconciling line: the total is whatever was agreed and
                stored, shown directly. */}
            <tr className="bg-green-soft">
              <td className="px-[10px] py-[11px] font-head text-[13px] font-extrabold text-green-ink">
                Total charges
              </td>
              <td className="px-[10px] py-[11px] text-right font-head text-[16px] font-extrabold whitespace-nowrap text-green-ink">
                £{money(total)}
              </td>
            </tr>
          </tbody>
        </table>

        {/* Description and value sit under the charges, side by side and
            small: they describe the consignment rather than price it. */}
        {/* Stays side by side at every width — the value column just narrows
            rather than dropping under the description. */}
        <section className="mt-[12px] flex gap-6 max-[560px]:gap-4">
          <div className="min-w-0 flex-1">
            <p className="text-[8px] font-bold tracking-[0.09em] text-soft uppercase">Description of goods</p>
            <p className="mt-[2px] text-[10px] leading-[1.45] break-words text-ink">
              {shipment.goods_description}
            </p>
          </div>
          <div className="w-[150px] flex-none max-[560px]:w-[86px]">
            <p className="text-[8px] font-bold tracking-[0.09em] text-soft uppercase">Value of goods</p>
            <p className="mt-[2px] text-[10px] leading-[1.45] text-ink">£{money(shipment.goods_value_gbp)}</p>
          </div>
        </section>

        <p className="mt-[10px] text-[10.5px] text-soft">
          Paid in full at the time of booking. No balance outstanding.
        </p>

        {/* ------------------------------------------------------- footer */}
        <footer className="mt-[22px] border-t border-line pt-[12px] text-[9.5px] leading-[1.55] text-soft">
          <p>
            <strong className="text-ink">Track this shipment</strong> at{" "}
            {BUSINESS.domains[0]}/tracking using tracking number{" "}
            <strong className="text-ink">{shipment.reference}</strong> and the sender&rsquo;s mobile number shown
            above.
          </p>
          <p className="mt-[5px]">
            {BUSINESS.legalName} &middot; Registered in England &amp; Wales no. {BUSINESS.companyNumber} &middot;
            Registered office {BUSINESS.streetAddress}, {BUSINESS.addressLocality} {BUSINESS.postalCode}
          </p>
        </footer>

        {/* Terms sit after the footer, at the very bottom, so on screen the
            invoice itself is what's visible and the customer scrolls to reach
            them. In print they shrink into two tight columns — see
            .invoice-terms in globals.css. */}
        {/* Small print, and styled to read as such: no panel, low contrast,
            two narrow columns. It stays real text — selectable, searchable and
            printed in full — just visually subordinate to the invoice. */}
        <section className="invoice-terms mt-[22px] border-t border-[#eef1f7] pt-[10px]">
          <h2 className="mb-[6px] text-[8px] font-semibold tracking-[0.05em] text-faint uppercase max-[560px]:text-[7.5px]">
            Please read Terms &amp; Conditions before signing the shipment
          </h2>
          <ol className="terms-list columns-2 gap-6 text-[8px] leading-[1.4] text-faint max-[560px]:columns-1 max-[560px]:text-[7px] max-[560px]:leading-[1.35]">
            {termsList(seaEstimate || "8–10 weeks").map((term, i) => (
              <li key={i} className="mb-[3px] flex break-inside-avoid gap-[4px]">
                <span className="flex-none">{i + 1}.</span>
                <span>{term}</span>
              </li>
            ))}
          </ol>
        </section>
      </div>
    </article>
  );
}
