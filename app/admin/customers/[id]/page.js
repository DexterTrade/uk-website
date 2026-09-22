import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { money } from "@/lib/data";
import { DataList, DetailShell, Panel, formatDate } from "../../DetailUI";

export const metadata = {
  title: "Customer",
  robots: { index: false, follow: false },
};

// Deliberately the customer record on its own — no shipment or invoice tables.
// Those belong to the shipment detail page; this answers "who is this person".
// The booking count and lifetime value are still shown because they are facts
// about the customer rather than a listing.
export default async function CustomerDetailPage({ params }) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: customer } = await supabase
    .from("customers")
    .select("id, name, phone, email, address, postcode, town, created_at, shipments(id, invoices(total_charges))")
    .eq("id", id)
    .maybeSingle();

  if (!customer) notFound();

  const shipments = customer.shipments || [];
  const lifetime = shipments.reduce((sum, s) => {
    const invoice = Array.isArray(s.invoices) ? s.invoices[0] : s.invoices;
    return sum + Number(invoice?.total_charges ?? 0);
  }, 0);

  return (
    <DetailShell
      back="/admin"
      eyebrow="Customer"
      title={customer.name}
      actions={
        <Link className="btn btn-green btn-sm" href="/admin/new-booking">
          + New booking
        </Link>
      }
    >
      <Panel title="Customer details">
        <DataList
          rows={[
            ["Name", customer.name],
            ["Mobile", customer.phone],
            ["Email", customer.email],
            ["Address", customer.address],
            ["Town / city", customer.town],
            ["Postcode", customer.postcode],
            ["Customer since", formatDate(String(customer.created_at).slice(0, 10))],
            ["Bookings", String(shipments.length)],
            ["Lifetime value", `£${money(lifetime)}`],
          ]}
        />
      </Panel>

      <p className="fine">
        Bookings for this customer are listed under Shipments in the admin panel; open one to see its shipment,
        customer and invoice details together.
      </p>
    </DetailShell>
  );
}
