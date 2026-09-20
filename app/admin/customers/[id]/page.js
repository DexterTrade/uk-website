import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { money, STATUS_CLASS } from "@/lib/data";
import { DataList, DetailShell, Panel, formatDate, modeLabel, weightLabel } from "../../DetailUI";

export const metadata = {
  title: "Customer",
  robots: { index: false, follow: false },
};

const statusBadgeClass = (s) => (STATUS_CLASS[s] === "badge" ? "badge" : `badge ${STATUS_CLASS[s]}`);
const th =
  "bg-[#f8fafd] px-[18px] py-[11px] text-left font-head text-[13px] font-semibold text-soft";
const td = "border-t border-[#f1f4f9] px-[18px] py-[12px] text-[14.5px] text-muted";

export default async function CustomerDetailPage({ params }) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: customer } = await supabase
    .from("customers")
    .select(
      "id, name, phone, email, address, postcode, town, created_at, " +
        "shipments(id, reference, mode, status, parcels, weight_kg, collection_date, receiver_name, receiver_city, " +
        "invoices(total_charges, issued_date))"
    )
    .eq("id", id)
    .maybeSingle();

  if (!customer) notFound();

  const shipments = [...(customer.shipments || [])].sort((a, b) =>
    a.collection_date < b.collection_date ? 1 : -1
  );
  const invoiceOf = (s) => (Array.isArray(s.invoices) ? s.invoices[0] : s.invoices);
  const lifetime = shipments.reduce((sum, s) => sum + Number(invoiceOf(s)?.total_charges ?? 0), 0);

  return (
    <DetailShell
      back={{ href: "/admin", label: "Admin" }}
      eyebrow="Customer"
      title={customer.name}
      actions={
        <Link className="btn btn-green btn-sm" href="/admin/new-booking">
          + New booking
        </Link>
      }
    >
      <Panel title="Details">
        <DataList
          rows={[
            ["Mobile", customer.phone],
            ["Email", customer.email],
            ["Town / city", customer.town],
            ["Postcode", customer.postcode],
            ["Address", customer.address],
            ["Customer since", formatDate(String(customer.created_at).slice(0, 10))],
            ["Bookings", String(shipments.length)],
            ["Lifetime value", `£${money(lifetime)}`],
          ]}
        />
      </Panel>

      <Panel title={`Shipments (${shipments.length})`} padded={false}>
        <div className="scroll">
          <table className="w-full min-w-[760px]">
            <thead>
              <tr>
                <th className={th}>Reference</th>
                <th className={th}>Service</th>
                <th className={th}>Receiver</th>
                <th className={th}>Weight</th>
                <th className={th}>Collection</th>
                <th className={th}>Status</th>
                <th className={`${th} text-right`}>Charged</th>
              </tr>
            </thead>
            <tbody>
              {shipments.map((s) => (
                <tr key={s.id}>
                  <td className={`${td} font-semibold text-ink`}>
                    <Link className="text-green hover:underline" href={`/admin/shipments/${s.reference}`}>
                      {s.reference}
                    </Link>
                  </td>
                  <td className={td}>{modeLabel(s.mode)}</td>
                  <td className={td}>
                    {s.receiver_name} &middot; {s.receiver_city}
                  </td>
                  <td className={td}>{weightLabel(s.parcels, s.weight_kg)}</td>
                  <td className={td}>{formatDate(s.collection_date)}</td>
                  <td className={td}>
                    <span className={statusBadgeClass(s.status)}>{s.status}</span>
                  </td>
                  <td className={`${td} text-right font-semibold text-ink`}>
                    £{money(invoiceOf(s)?.total_charges ?? 0)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {shipments.length === 0 && <p className="empty">No shipments for this customer yet.</p>}
      </Panel>

      <Panel title={`Invoices (${shipments.length})`} padded={false}>
        <div className="scroll">
          <table className="w-full min-w-[560px]">
            <thead>
              <tr>
                <th className={th}>Reference</th>
                <th className={th}>Issued</th>
                <th className={th}>Service</th>
                <th className={`${th} text-right`}>Total</th>
                <th className={th}></th>
              </tr>
            </thead>
            <tbody>
              {shipments.map((s) => (
                <tr key={s.id}>
                  <td className={`${td} font-semibold text-ink`}>{s.reference}</td>
                  <td className={td}>{formatDate(invoiceOf(s)?.issued_date)}</td>
                  <td className={td}>{modeLabel(s.mode)}</td>
                  <td className={`${td} text-right font-semibold text-ink`}>
                    £{money(invoiceOf(s)?.total_charges ?? 0)}
                  </td>
                  <td className={td}>
                    <Link className="text-[13px] font-semibold text-green" href={`/admin/invoices/${s.reference}`}>
                      Open &rarr;
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {shipments.length === 0 && <p className="empty">No invoices for this customer yet.</p>}
      </Panel>
    </DetailShell>
  );
}
