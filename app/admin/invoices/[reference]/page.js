import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { DetailShell } from "../../DetailUI";
import InvoiceDocument from "../../InvoiceDocument";
import PrintButton from "./PrintButton";

export const metadata = {
  title: "Invoice",
  robots: { index: false, follow: false },
};

export default async function InvoiceDetailPage({ params }) {
  const { reference } = await params;
  const supabase = await createClient();

  const [{ data: shipment }, { data: userData }, { data: seaRate }] = await Promise.all([
    supabase
      .from("shipments")
      .select(
        "reference, mode, parcels, weight_kg, goods_description, goods_value_gbp, collection_date, " +
          "receiver_name, receiver_phone, receiver_phone_alt, receiver_email, receiver_address, " +
          "receiver_city, receiver_country, customers(id, name, phone, email, address, postcode, town), " +
          "invoices(rate_per_kg, other_charges, total_charges, issued_date)"
      )
      .ilike("reference", reference)
      .maybeSingle(),
    supabase.auth.getUser(),
    supabase.from("rates").select("estimated_time").eq("mode", "sea").maybeSingle(),
  ]);

  if (!shipment) notFound();

  const embedded = (value) => (Array.isArray(value) ? value[0] : value);
  const invoice = embedded(shipment.invoices);
  const customer = embedded(shipment.customers);
  if (!invoice) notFound();

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
      {/* Same component the preview modal renders, so the page and the preview
          can't drift into two different invoices. */}
      <div className="mx-auto max-w-[860px] overflow-hidden rounded-xl border border-line bg-white">
        <InvoiceDocument
          shipment={shipment}
          customer={customer || {}}
          invoice={invoice}
          operator={userData?.user?.email || ""}
          seaEstimate={seaRate?.estimated_time || ""}
        />
      </div>

      <p className="fine mt-5 text-center print:hidden-force">
        Use &ldquo;Print / save PDF&rdquo; and choose <strong>Save as PDF</strong> as the destination. Turn on
        &ldquo;Background graphics&rdquo; in the print dialogue so the header bar, totals and watermark come
        through.
      </p>
    </DetailShell>
  );
}
