import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { money, statusBadgeClass } from "@/lib/data";
import { DataList, DetailShell, Panel, backToTab, formatDate, modeLabel, weightLabel } from "../../DetailUI";

export const metadata = {
  title: "Shipment",
  robots: { index: false, follow: false },
};

export default async function ShipmentDetailPage({ params, searchParams }) {
  // Next.js 16: params and searchParams are promises and must be awaited.
  const { reference } = await params;
  const { from } = await searchParams;
  const supabase = await createClient();

  const { data: shipment } = await supabase
    .from("shipments")
    .select(
      "id, reference, status, mode, parcels, weight_kg, goods_description, goods_value_gbp, collection_date, " +
        "receiver_name, receiver_phone, receiver_phone_alt, receiver_email, receiver_address, receiver_city, " +
        "receiver_country, eta_label, summary, flag, created_at, " +
        "shipment_statuses(tone), " +
        "customers(id, name, phone, email, address, postcode, town), " +
        "invoices(id, rate_per_kg, other_charges, total_charges, issued_date, bill_to_name, " +
        "bill_to_address, bill_to_postcode, bill_to_town, bill_to_phone, bill_to_email), " +
        "shipment_status_history(status, changed_at)"
    )
    .ilike("reference", reference)
    .maybeSingle();

  if (!shipment) notFound();

  const embedded = (value) => (Array.isArray(value) ? value[0] : value);
  const customer = embedded(shipment.customers);
  const invoice = embedded(shipment.invoices);
  // Newest first, matching what the customer sees on the tracking page.
  const history = [...(shipment.shipment_status_history || [])].sort((a, b) =>
    a.changed_at < b.changed_at ? 1 : -1
  );

  const freight = Math.round(Number(invoice?.rate_per_kg ?? 0) * Number(shipment.weight_kg) * 100) / 100;

  return (
    <DetailShell
      back={backToTab(from, "ship")}
      eyebrow="Shipment"
      title={shipment.reference}
      badge={
        <span className={statusBadgeClass(embedded(shipment.shipment_statuses)?.tone)}>{shipment.status}</span>
      }
      actions={
        <>
          <Link className="btn btn-ghost btn-sm" href={`/admin/customers/${customer?.id}`}>
            Customer
          </Link>
          <Link className="btn btn-ghost btn-sm" href={`/admin/invoices/${shipment.reference}`}>
            Invoice
          </Link>
          <Link className="btn btn-green btn-sm" href={`/admin/shipments/${shipment.reference}/edit`}>
            Edit booking
          </Link>
        </>
      }
    >
      {shipment.flag && (
        <p className="alert alert-error mt-0 mb-5">Flagged: {shipment.flag}</p>
      )}

      <Panel title="Shipment">
        <DataList
          rows={[
            ["Shipping", modeLabel(shipment.mode)],
            ["Parcels and weight", weightLabel(shipment.parcels, shipment.weight_kg)],
            ["Collection date", formatDate(shipment.collection_date)],
            ["Worth of goods", `£${money(shipment.goods_value_gbp)}`],
            ["Status", shipment.status],
            ["ETA", shipment.eta_label],
            ["Description of goods", shipment.goods_description],
          ]}
        />
      </Panel>

      <Panel
        title="Customer (sender)"
        action={
          <Link className="text-[13px] font-semibold text-green" href={`/admin/customers/${customer?.id}`}>
            Customer record &rarr;
          </Link>
        }
      >
        <DataList
          rows={[
            ["Name", customer?.name],
            ["Mobile", customer?.phone],
            ["Email", customer?.email],
            ["Town / city", customer?.town],
            ["Postcode", customer?.postcode],
            ["Address", customer?.address],
          ]}
        />
      </Panel>

      <Panel title="Receiver">
        <DataList
          rows={[
            ["Name", shipment.receiver_name],
            ["Mobile", shipment.receiver_phone],
            ["Second mobile", shipment.receiver_phone_alt],
            ["Email", shipment.receiver_email],
            ["City / district", shipment.receiver_city],
            ["Country", shipment.receiver_country],
            ["Address", shipment.receiver_address],
          ]}
        />
      </Panel>

      <Panel
        title="Invoice"
        action={
          <Link className="text-[13px] font-semibold text-green" href={`/admin/invoices/${shipment.reference}`}>
            Print / save PDF &rarr;
          </Link>
        }
      >
        <DataList
          rows={[
            ["Invoice number", shipment.reference],
            ["Issued", formatDate(invoice?.issued_date)],
            ["Rate per kg", `£${money(invoice?.rate_per_kg ?? 0)}`],
            ["Freight", `${Number(shipment.weight_kg)} kg × £${money(invoice?.rate_per_kg ?? 0)} = £${money(freight)}`],
            ["Duty + handling + packing", `£${money(invoice?.other_charges ?? 0)}`],
            ["Total charged", `£${money(invoice?.total_charges ?? 0)}`],
          ]}
        />

        <p className="mt-6 mb-3 text-xs font-semibold tracking-[0.06em] text-faint uppercase">
          Billed to (as printed on the invoice)
        </p>
        <DataList
          rows={[
            ["Name", invoice?.bill_to_name],
            ["Mobile", invoice?.bill_to_phone],
            ["Email", invoice?.bill_to_email],
            ["Address", invoice?.bill_to_address],
            ["Town / city", invoice?.bill_to_town],
            ["Postcode", invoice?.bill_to_postcode],
          ]}
        />
      </Panel>

      <Panel title="Status history" padded={false}>
        <div className="scroll">
          <table className="w-full min-w-[420px]">
            <thead>
              <tr>
                <th className="bg-[#f8fafd] px-[22px] py-[11px] text-left font-head text-[13px] font-semibold text-soft">
                  Status
                </th>
                <th className="bg-[#f8fafd] px-[22px] py-[11px] text-left font-head text-[13px] font-semibold text-soft">
                  Changed
                </th>
              </tr>
            </thead>
            <tbody>
              {history.map((h, i) => (
                <tr key={`${h.changed_at}-${i}`}>
                  <td className="border-t border-[#f1f4f9] px-[22px] py-[12px] text-[14.5px] text-ink">
                    {h.status}
                    {i === 0 && <span className="badge ml-2 align-middle">Now</span>}
                  </td>
                  <td className="border-t border-[#f1f4f9] px-[22px] py-[12px] text-[14.5px] text-muted">
                    {new Date(h.changed_at).toLocaleString("en-GB", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {history.length === 0 && <p className="empty">No status changes recorded yet.</p>}
      </Panel>

      <p className="fine">
        Customers see the status, route, weight and this timeline when they track — never the pricing above.
      </p>
    </DetailShell>
  );
}
