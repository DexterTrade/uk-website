import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import BookingForm from "../../../BookingForm";
import { getTodayISO } from "@/lib/server-time";

export const metadata = {
  title: "Edit booking",
  robots: { index: false, follow: false },
};

export default async function EditBookingPage({ params }) {
  const { reference } = await params;
  const supabase = await createClient();

  const { data: shipment } = await supabase
    .from("shipments")
    .select(
      "reference, mode, parcels, weight_kg, goods_description, goods_value_gbp, collection_date, " +
        "receiver_name, receiver_phone, receiver_phone_alt, receiver_email, receiver_address, receiver_city, " +
        "receiver_country, customers(name, phone, email, address, postcode, town), " +
        "invoices(rate_per_kg, other_charges, total_charges)"
    )
    .ilike("reference", reference)
    .maybeSingle();

  if (!shipment) notFound();

  const customer = Array.isArray(shipment.customers) ? shipment.customers[0] : shipment.customers;
  const invoice = Array.isArray(shipment.invoices) ? shipment.invoices[0] : shipment.invoices;

  // Every value is a string: the form's inputs are controlled, and yup coerces
  // the numeric ones back on the way out.
  const initial = {
    mode: shipment.mode,
    parcels: String(shipment.parcels),
    weight_kg: String(Number(shipment.weight_kg)),
    goods_description: shipment.goods_description,
    goods_value_gbp: String(Number(shipment.goods_value_gbp)),
    collection_date: shipment.collection_date,

    rate_per_kg: String(Number(invoice?.rate_per_kg ?? 0)),
    other_charges: String(Number(invoice?.other_charges ?? 0)),
    total_charges: String(Number(invoice?.total_charges ?? 0)),

    sender_name: customer?.name || "",
    sender_phone: customer?.phone || "",
    sender_email: customer?.email || "",
    sender_address: customer?.address || "",
    sender_postcode: customer?.postcode || "",
    sender_town: customer?.town || "",

    receiver_country: shipment.receiver_country || "PK",
    receiver_name: shipment.receiver_name,
    receiver_phone: shipment.receiver_phone,
    receiver_phone_alt: shipment.receiver_phone_alt || "",
    receiver_email: shipment.receiver_email || "",
    receiver_address: shipment.receiver_address,
    receiver_city: shipment.receiver_city,
  };

  // Only used as the form's fallback "today"; the collection date shown is the
  // one already stored on the booking, and it is not editable.
  const today = await getTodayISO();

  return <BookingForm today={today} initial={initial} reference={shipment.reference} />;
}
