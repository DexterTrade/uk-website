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

export default async function AdminPage() {
  const supabase = await createClient();

  const [{ data: userData }, { data: shipmentsRaw }, { data: invoicesRaw }, { data: ratesRaw }] = await Promise.all([
    supabase.auth.getUser(),
    supabase
      .from("shipments")
      .select("id, reference, customer_name, service, route, weight_label, status, flag, invoices(number)")
      .order("created_at", { ascending: false }),
    supabase
      .from("invoices")
      .select("id, number, customer_name, shipment_reference, issued_date, total, status, shipments(reference)")
      .order("issued_date", { ascending: false }),
    supabase.from("rates").select("mode, headline_rate, rate_note, pickup_charge").order("mode"),
  ]);

  const shipments = (shipmentsRaw || []).map((s) => ({
    id: s.id,
    ref: s.reference,
    customer: s.customer_name,
    service: s.service,
    route: s.route,
    weight: s.weight_label,
    status: s.status,
    flag: s.flag || "",
    invoice: s.invoices?.[0]?.number || "—",
  }));

  const invoices = (invoicesRaw || []).map((i) => ({
    id: i.id,
    number: i.number,
    customer: i.customer_name,
    ref: i.shipments?.reference || i.shipment_reference || "—",
    issued: formatDate(i.issued_date),
    total: Number(i.total),
    status: i.status,
  }));

  const rates = (ratesRaw || []).map((r) => ({
    mode: r.mode,
    headline_rate: r.headline_rate,
    rate_note: r.rate_note || "",
    pickup_charge: Number(r.pickup_charge),
  }));

  return <AdminClient shipments={shipments} invoices={invoices} rates={rates} staffEmail={userData?.user?.email} />;
}
