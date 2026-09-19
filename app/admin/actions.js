"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { STATUSES } from "@/lib/data";

// Server Actions are public HTTP endpoints in their own right — the proxy
// only guards page navigations, so every action re-checks the session
// itself rather than trusting that the caller reached it through /admin.
async function requireStaff() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  if (!data?.claims) {
    redirect("/admin/login");
  }
  return supabase;
}

export async function signOutAction() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/admin/login");
}

export async function updateShipmentStatus(shipmentId, status) {
  if (!STATUSES.includes(status)) {
    return { error: "Unknown status." };
  }
  const supabase = await requireStaff();
  const { error } = await supabase.from("shipments").update({ status }).eq("id", shipmentId);
  if (error) return { error: error.message };
  revalidatePath("/admin");
  return { ok: true };
}

export async function markInvoicePaid(invoiceId) {
  const supabase = await requireStaff();
  const { error } = await supabase.from("invoices").update({ status: "Paid" }).eq("id", invoiceId);
  if (error) return { error: error.message };
  revalidatePath("/admin");
  return { ok: true };
}

export async function updateRate(mode, { headline_rate, rate_note, pickup_charge }) {
  if (mode !== "air" && mode !== "sea") {
    return { error: "Unknown rate mode." };
  }
  const supabase = await requireStaff();
  const { error } = await supabase
    .from("rates")
    .update({
      headline_rate: String(headline_rate || "").trim(),
      rate_note: String(rate_note || "").trim() || null,
      pickup_charge: Number.parseFloat(pickup_charge) || 0,
    })
    .eq("mode", mode);
  if (error) return { error: error.message };
  revalidatePath("/admin");
  revalidatePath("/");
  return { ok: true };
}

export async function issueInvoice({ customer, reference, service, dueDate, lines }) {
  const supabase = await requireStaff();

  const cleanLines = (lines || [])
    .map((l) => ({
      description: String(l.desc || "").trim() || "Line item",
      qty: Number.parseFloat(l.qty) || 0,
      unit_price: Number.parseFloat(l.unit) || 0,
    }))
    .filter((l) => l.qty > 0 || l.unit_price > 0);

  if (cleanLines.length === 0) {
    return { error: "Add at least one invoice line." };
  }

  const total = cleanLines.reduce((sum, l) => sum + l.qty * l.unit_price, 0);
  const customerName = String(customer || "").trim() || "Unnamed customer";
  const shipmentReference = String(reference || "").trim() || null;

  let shipmentId = null;
  if (shipmentReference) {
    const { data: shipment } = await supabase
      .from("shipments")
      .select("id")
      .ilike("reference", shipmentReference)
      .maybeSingle();
    shipmentId = shipment?.id ?? null;
  }

  const { data: seq, error: seqError } = await supabase.rpc("nextval_invoice_number");
  if (seqError) return { error: seqError.message };
  const number = `INV-${seq}`;

  const { data: invoice, error: invoiceError } = await supabase
    .from("invoices")
    .insert({
      number,
      shipment_id: shipmentId,
      shipment_reference: shipmentReference,
      customer_name: customerName,
      issued_date: new Date().toISOString().slice(0, 10),
      due_date: dueDate || null,
      status: "Unpaid",
      total: Math.round(total * 100) / 100,
    })
    .select("id, number, customer_name, total")
    .single();

  if (invoiceError) return { error: invoiceError.message };

  const { error: linesError } = await supabase.from("invoice_lines").insert(
    cleanLines.map((l, i) => ({
      invoice_id: invoice.id,
      position: i + 1,
      description: l.description,
      qty: l.qty,
      unit_price: l.unit_price,
    }))
  );

  if (linesError) return { error: linesError.message };

  revalidatePath("/admin");
  return { ok: true, invoice };
}
