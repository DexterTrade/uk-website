import { createClient } from "@/lib/supabase/server";
import AdminClient from "./AdminClient";

export const metadata = {
  title: "Admin panel",
  robots: { index: false, follow: false },
};

function formatDate(dateStr) {
  if (!dateStr) return "—";
  return new Date(`${dateStr}T00:00:00Z`).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

// "3 parcels · 24.5 kg" — the same shape the tracking RPC builds for the
// public page, kept here rather than stored so the columns stay numeric.
function weightLabel(parcels, weightKg) {
  return `${parcels} ${parcels === 1 ? "parcel" : "parcels"} · ${Number(weightKg)} kg`;
}

export default async function AdminPage() {
  const supabase = await createClient();

  const [
    { data: userData },
    { data: shipmentsRaw },
    { data: invoicesRaw },
    { data: ratesRaw },
    { data: customersRaw },
    { data: statusesRaw },
  ] = await Promise.all([
    supabase.auth.getUser(),
    supabase
      .from("shipments")
      .select(
        "id, reference, status, mode, parcels, weight_kg, collection_date, receiver_name, receiver_city, flag, created_at, customers(id, name, phone, town), invoices(total_charges)"
      )
      .order("created_at", { ascending: false }),
    supabase
      .from("invoices")
      .select(
        "id, issued_date, rate_per_kg, other_charges, total_charges, bill_to_name, bill_to_town, shipments(reference, mode, weight_kg)"
      )
      .order("issued_date", { ascending: false }),
    supabase
      .from("rates")
      .select("mode, headline_rate, rate_note, estimated_time, pickup_charge, next_dispatch_date, next_dispatch_note")
      .order("mode"),
    supabase.from("customers").select("id, name, phone, email, town, postcode").order("name"),
    supabase.from("shipment_statuses").select("value, position, tone").order("position"),
  ]);

  const statuses = (statusesRaw || []).map((s) => ({ value: s.value, tone: s.tone }));
  const toneOf = Object.fromEntries(statuses.map((s) => [s.value, s.tone]));

  // invoices.shipment_id is UNIQUE, so PostgREST embeds the invoice as an
  // object rather than an array — but tolerate both shapes.
  const embedded = (value) => (Array.isArray(value) ? value[0] : value);

  const shipments = (shipmentsRaw || []).map((s) => ({
    id: s.id,
    ref: s.reference,
    customerId: embedded(s.customers)?.id || null,
    customer: embedded(s.customers)?.name || "—",
    service: s.mode === "air" ? "Air cargo" : "Sea cargo",
    mode: s.mode,
    route: `${embedded(s.customers)?.town || "UK"} → ${s.receiver_city}`,
    receiver: s.receiver_name,
    weight: weightLabel(s.parcels, s.weight_kg),
    collection: formatDate(s.collection_date),
    status: s.status,
    tone: toneOf[s.status] || "grey",
    flag: s.flag || "",
    total: Number(embedded(s.invoices)?.total_charges ?? 0),
    createdAt: s.created_at,
  }));

  const invoices = (invoicesRaw || []).map((i) => ({
    id: i.id,
    ref: embedded(i.shipments)?.reference || "—",
    customer: i.bill_to_name,
    town: i.bill_to_town || "—",
    mode: embedded(i.shipments)?.mode === "air" ? "Air" : "Sea",
    issued: formatDate(i.issued_date),
    issuedISO: i.issued_date,
    rate: Number(i.rate_per_kg),
    other: Number(i.other_charges),
    total: Number(i.total_charges),
  }));

  // Booking and spend counts are derived from the shipments already loaded
  // rather than asking Postgres for aggregates per customer.
  const customers = (customersRaw || []).map((c) => {
    const theirs = shipments.filter((s) => s.customerId === c.id);
    return {
      id: c.id,
      name: c.name,
      phone: c.phone,
      email: c.email || "—",
      town: c.town,
      postcode: c.postcode,
      bookings: theirs.length,
      spend: theirs.reduce((sum, s) => sum + s.total, 0),
      lastRef: theirs[0]?.ref || "—",
    };
  });

  const rates = (ratesRaw || []).map((r) => ({
    mode: r.mode,
    headline_rate: r.headline_rate,
    rate_note: r.rate_note || "",
    estimated_time: r.estimated_time || "",
    pickup_charge: Number(r.pickup_charge),
    next_dispatch_date: r.next_dispatch_date || "",
    next_dispatch_note: r.next_dispatch_note || "",
  }));

  // Computed on the server so the dashboard's "this month" figures follow the
  // calendar instead of the hardcoded "Sep 2026" string match they used to.
  const now = new Date();
  const monthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  const monthLabel = now.toLocaleDateString("en-GB", { month: "long", year: "numeric" });

  return (
    <AdminClient
      shipments={shipments}
      invoices={invoices}
      customers={customers}
      statuses={statuses}
      rates={rates}
      monthKey={monthKey}
      monthLabel={monthLabel}
      staffEmail={userData?.user?.email}
    />
  );
}
