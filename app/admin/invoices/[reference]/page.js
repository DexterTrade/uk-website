import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { money } from "@/lib/data";
import { BUSINESS } from "@/lib/seo";
import { DetailShell, formatDate, modeLabel, weightLabel } from "../../DetailUI";
import PrintButton from "./PrintButton";

export const metadata = {
  title: "Invoice",
  robots: { index: false, follow: false },
};

export default async function InvoiceDetailPage({ params }) {
  const { reference } = await params;
  const supabase = await createClient();

  const { data: shipment } = await supabase
    .from("shipments")
    .select(
      "reference, mode, parcels, weight_kg, goods_description, collection_date, receiver_name, " +
        "receiver_address, receiver_city, receiver_country, customers(id, name), " +
        "invoices(id, rate_per_kg, other_charges, total_charges, issued_date, " +
        "bill_to_name, bill_to_address, bill_to_postcode, bill_to_town, bill_to_phone, bill_to_email)"
    )
    .ilike("reference", reference)
    .maybeSingle();

  if (!shipment) notFound();

  const invoice = Array.isArray(shipment.invoices) ? shipment.invoices[0] : shipment.invoices;
  const customer = Array.isArray(shipment.customers) ? shipment.customers[0] : shipment.customers;
  if (!invoice) notFound();

  const freight = Math.round(Number(invoice.rate_per_kg) * Number(shipment.weight_kg) * 100) / 100;
  const other = Number(invoice.other_charges);
  const total = Number(invoice.total_charges);
  // Staff can overwrite the suggested total, so the lines don't always add up
  // to it. Show the difference as its own line rather than printing a document
  // whose arithmetic looks broken.
  const adjustment = Math.round((total - freight - other) * 100) / 100;

  return (
    <DetailShell
      back={{ href: `/admin/shipments/${shipment.reference}`, label: shipment.reference }}
      eyebrow="Invoice"
      title={shipment.reference}
      actions={
        <>
          <Link className="btn btn-ghost btn-sm" href={`/admin/customers/${customer?.id}`}>
            Customer
          </Link>
          <Link className="btn btn-ghost btn-sm" href={`/admin/shipments/${shipment.reference}/edit`}>
            Edit
          </Link>
          <PrintButton />
        </>
      }
    >
      <article className="invoice-doc mx-auto max-w-[780px] rounded-xl border border-line bg-white p-10 max-[520px]:p-5">
        <header className="flex flex-wrap items-start justify-between gap-6 border-b border-[#eef1f7] pb-7">
          <div>
            <p className="font-head text-[22px] font-extrabold text-ink">{BUSINESS.legalName}</p>
            <address className="mt-2 text-[13.5px] leading-[1.6] text-muted not-italic">
              {BUSINESS.streetAddress}
              <br />
              {BUSINESS.addressLocality} {BUSINESS.postalCode}
              <br />
              {BUSINESS.phones[0].display} &middot; {BUSINESS.email}
            </address>
            <p className="mt-2 text-[12.5px] text-faint">
              Registered in England &amp; Wales no. {BUSINESS.companyNumber}
            </p>
          </div>
          <div className="text-right">
            <p className="font-head text-[26px] font-extrabold tracking-[0.04em] text-green uppercase">Invoice</p>
            <p className="mt-2 text-[13.5px] text-muted">
              Reference
              <br />
              <strong className="text-[17px] text-ink">{shipment.reference}</strong>
            </p>
            <p className="mt-2 text-[13.5px] text-muted">
              Issued
              <br />
              <strong className="text-ink">{formatDate(invoice.issued_date)}</strong>
            </p>
          </div>
        </header>

        <div className="grid grid-cols-2 gap-8 border-b border-[#eef1f7] py-7 max-[520px]:grid-cols-1">
          <div>
            <p className="text-xs font-semibold tracking-[0.06em] text-faint uppercase">Billed to</p>
            <address className="mt-2 text-[14.5px] leading-[1.65] text-ink not-italic">
              <strong>{invoice.bill_to_name}</strong>
              <br />
              {invoice.bill_to_address}
              <br />
              {invoice.bill_to_town} {invoice.bill_to_postcode}
              <br />
              {invoice.bill_to_phone}
              {invoice.bill_to_email && (
                <>
                  <br />
                  {invoice.bill_to_email}
                </>
              )}
            </address>
          </div>
          <div>
            <p className="text-xs font-semibold tracking-[0.06em] text-faint uppercase">Delivered to</p>
            <address className="mt-2 text-[14.5px] leading-[1.65] text-ink not-italic">
              <strong>{shipment.receiver_name}</strong>
              <br />
              {shipment.receiver_address}
              <br />
              {shipment.receiver_city}, {shipment.receiver_country}
            </address>
          </div>
        </div>

        <div className="py-7">
          <table className="w-full border-collapse">
            <thead>
              <tr>
                <th className="border-b border-[#e2e7f0] pb-[10px] text-left font-head text-[12.5px] font-semibold tracking-[0.05em] text-soft uppercase">
                  Description
                </th>
                <th className="border-b border-[#e2e7f0] pb-[10px] text-right font-head text-[12.5px] font-semibold tracking-[0.05em] text-soft uppercase">
                  Amount
                </th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="border-b border-[#f1f4f9] py-[13px] text-[14.5px] text-ink">
                  {modeLabel(shipment.mode)} — {weightLabel(shipment.parcels, shipment.weight_kg)} at £
                  {money(invoice.rate_per_kg)}/kg
                  <span className="mt-1 block text-[13px] text-soft">
                    {shipment.goods_description} · collected {formatDate(shipment.collection_date)}
                  </span>
                </td>
                <td className="border-b border-[#f1f4f9] py-[13px] text-right text-[14.5px] text-ink">
                  £{money(freight)}
                </td>
              </tr>
              <tr>
                <td className="border-b border-[#f1f4f9] py-[13px] text-[14.5px] text-ink">
                  Customs duty, handling and packing
                </td>
                <td className="border-b border-[#f1f4f9] py-[13px] text-right text-[14.5px] text-ink">
                  £{money(other)}
                </td>
              </tr>
              {adjustment !== 0 && (
                <tr>
                  <td className="border-b border-[#f1f4f9] py-[13px] text-[14.5px] text-ink">
                    Adjustment
                    <span className="mt-1 block text-[13px] text-soft">Agreed price difference</span>
                  </td>
                  <td className="border-b border-[#f1f4f9] py-[13px] text-right text-[14.5px] text-ink">
                    {adjustment < 0 ? "−" : ""}£{money(Math.abs(adjustment))}
                  </td>
                </tr>
              )}
              <tr>
                <td className="pt-5 text-right font-head text-[15px] font-bold text-ink">Total paid</td>
                <td className="pt-5 text-right font-head text-[22px] font-extrabold text-green">£{money(total)}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <footer className="border-t border-[#eef1f7] pt-6 text-[13px] leading-[1.6] text-soft">
          Paid in full at the point of booking. Track this shipment at pakcargouk.co.uk/tracking using reference{" "}
          <strong className="text-ink">{shipment.reference}</strong> and the mobile number above.
        </footer>
      </article>

      <p className="fine mt-5 text-center print:hidden-force">
        Print to PDF from your browser&rsquo;s print dialogue to email or hand this to the customer.
      </p>
    </DetailShell>
  );
}
