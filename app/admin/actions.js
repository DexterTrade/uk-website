"use server";

import { randomUUID } from "node:crypto";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { bookingSchema, fieldErrors, normalizeUkMobile, toBookingPayload } from "@/lib/validation/booking";
import { getTodayISO } from "@/lib/server-time";
import { SITE_URL } from "@/lib/seo";

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

// Appends to the audit trail. Deliberately swallows its own failures: a log
// write that errors must never roll back or block the work it is recording.
async function logActivity(supabase, { action, summary, subject = null }) {
  try {
    const { data } = await supabase.auth.getClaims();
    await supabase.from("activity_log").insert({
      actor_email: data?.claims?.email || null,
      created_by: data?.claims?.sub || null,
      action,
      summary,
      subject,
    });
  } catch {
    // Ignored on purpose — see above.
  }
}

export async function signOutAction() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/admin/login");
}

// The status list lives in shipment_statuses, so validity is checked against
// the table rather than a constant that could drift away from it. The FK on
// shipments.status would reject an unknown value anyway; this is just a
// clearer error than a constraint violation.
async function assertKnownStatus(supabase, status) {
  const { data } = await supabase
    .from("shipment_statuses")
    .select("value")
    .eq("value", status)
    .maybeSingle();
  return Boolean(data);
}

export async function updateShipmentStatus(shipmentId, status) {
  const supabase = await requireStaff();
  if (!(await assertKnownStatus(supabase, status))) return { error: "Unknown status." };

  const { data: updated, error } = await supabase
    .from("shipments")
    .update({ status })
    .eq("id", shipmentId)
    .select("reference")
    .maybeSingle();
  if (error) return { error: error.message };

  await logActivity(supabase, {
    action: "shipment.status",
    subject: updated?.reference || null,
    summary: `Set ${updated?.reference || "a shipment"} to ${status}`,
  });
  revalidatePath("/admin");
  return { ok: true };
}

// Bulk status change. Works on whatever set of rows the panel passes up —
// the current filtered selection or everything — in one statement rather
// than a request per row.
export async function updateShipmentStatuses(shipmentIds, status) {
  const supabase = await requireStaff();

  const ids = [...new Set((shipmentIds || []).filter(Boolean))];
  if (ids.length === 0) return { error: "Select at least one shipment." };
  if (!(await assertKnownStatus(supabase, status))) return { error: "Unknown status." };

  const { data, error } = await supabase
    .from("shipments")
    .update({ status })
    .in("id", ids)
    .select("id, reference");
  if (error) return { error: error.message };

  const references = (data || []).map((r) => r.reference).sort();
  await logActivity(supabase, {
    action: "shipment.status.bulk",
    subject: references.join(", ") || null,
    summary: `Set ${references.length} shipments to ${status}`,
  });
  revalidatePath("/admin");
  return { ok: true, updated: data?.length ?? 0 };
}

export async function updateRate(
  mode,
  { headline_rate, rate_note, estimated_time, pickup_charge, next_dispatch_date, next_dispatch_note }
) {
  if (mode !== "air" && mode !== "sea") {
    return { error: "Unknown rate mode." };
  }
  const supabase = await requireStaff();
  const { error } = await supabase
    .from("rates")
    .update({
      headline_rate: String(headline_rate || "").trim(),
      rate_note: String(rate_note || "").trim() || null,
      estimated_time: String(estimated_time || "").trim() || null,
      pickup_charge: Number.parseFloat(pickup_charge) || 0,
      next_dispatch_date: next_dispatch_date || null,
      next_dispatch_note: String(next_dispatch_note || "").trim() || null,
    })
    .eq("mode", mode);
  if (error) return { error: error.message };

  await logActivity(supabase, {
    action: "rates.updated",
    subject: mode,
    summary: `Updated ${mode} cargo rates`,
  });
  revalidatePath("/admin");
  revalidatePath("/");
  revalidatePath("/sea-cargo");
  revalidatePath("/air-cargo");
  revalidatePath("/excess-baggage");
  revalidatePath("/pak-to-uk");
  return { ok: true };
}

// Creates the customer-facing invoice link, or returns the existing one.
// `regenerate` mints a fresh token, which silently kills the old link — that
// is how a link sent to the wrong person is revoked.
//
// The token is deliberately not derived from the reference: PC0001, PC0002,
// ... is sequential, so a reference-keyed URL would expose every invoice to
// anyone who could count. Two random UUIDs give ~244 bits from the platform
// CSPRNG.
export async function createInvoiceShareLink(reference, regenerate = false) {
  const supabase = await requireStaff();

  const { data: shipment } = await supabase
    .from("shipments")
    .select("id, invoices(id, share_token)")
    .ilike("reference", reference)
    .maybeSingle();

  const invoice = Array.isArray(shipment?.invoices) ? shipment.invoices[0] : shipment?.invoices;
  if (!invoice) return { error: "That booking has no invoice." };

  let token = invoice.share_token;
  if (!token || regenerate) {
    token = `${randomUUID()}${randomUUID()}`.replace(/-/g, "");
    const { error } = await supabase
      .from("invoices")
      .update({ share_token: token, share_created_at: new Date().toISOString() })
      .eq("id", invoice.id);
    if (error) return { error: error.message };
    await logActivity(supabase, {
      action: regenerate ? "invoice.link.regenerated" : "invoice.link.created",
      subject: reference,
      summary: regenerate
        ? `Regenerated the customer invoice link for ${reference} — the previous link stopped working`
        : `Created the customer invoice link for ${reference}`,
    });
    revalidatePath("/admin");
    revalidatePath(`/admin/invoices/${reference}`);
  }

  return { ok: true, url: `${SITE_URL}/invoice/${token}`, regenerated: Boolean(regenerate) };
}

// Everything the invoice document needs for one booking, fetched on demand so
// the shipments list doesn't carry invoice bodies for every row it renders.
export async function getInvoicePreview(reference) {
  const supabase = await requireStaff();

  const [{ data: shipment }, { data: userData }, { data: seaRate }] = await Promise.all([
    supabase
      .from("shipments")
      .select(
        "reference, mode, parcels, weight_kg, goods_description, goods_value_gbp, collection_date, " +
          "receiver_name, receiver_phone, receiver_phone_alt, receiver_email, receiver_address, " +
          "receiver_city, receiver_country, customers(name, phone, email, address, postcode, town), " +
          "invoices(rate_per_kg, other_charges, total_charges, issued_date, share_token)"
      )
      .ilike("reference", reference)
      .maybeSingle(),
    supabase.auth.getUser(),
    // Clause 3 of the printed terms quotes the sea delivery time, which is
    // editable in /admin → Rates. Read it rather than hardcoding a duplicate.
    supabase.from("rates").select("estimated_time").eq("mode", "sea").maybeSingle(),
  ]);

  if (!shipment) return { error: "That booking no longer exists." };

  const embedded = (value) => (Array.isArray(value) ? value[0] : value);
  const invoice = embedded(shipment.invoices);
  if (!invoice) return { error: "That booking has no invoice." };

  return {
    ok: true,
    data: {
      shipment,
      customer: embedded(shipment.customers) || {},
      invoice,
      // Placeholder for the operator/role work to come: the signed-in staff
      // account is the closest thing to "who booked this" we currently store.
      operator: userData?.user?.email || "",
      seaEstimate: seaRate?.estimated_time || "",
      shareUrl: invoice.share_token ? `${SITE_URL}/invoice/${invoice.share_token}` : "",
    },
  };
}

// Prefill for a returning customer. Returns null rather than an error for a
// number that isn't a valid UK mobile — staff are still mid-typing.
export async function lookupCustomer(phone) {
  const normalized = normalizeUkMobile(phone);
  if (!/^07\d{9}$/.test(normalized)) return null;
  const supabase = await requireStaff();
  const { data, error } = await supabase.rpc("find_customer_by_phone", { p_phone: normalized });
  if (error) return null;
  return data;
}

// Shipment + invoice are created together by one RPC, in one transaction, so
// a failure halfway can't leave a shipment with no invoice against it.
// The same yup schema the form uses runs again here: the client-side pass is
// for fast feedback, this one is the one that actually decides.
export async function createBooking(values) {
  const supabase = await requireStaff();

  // The collection date is always today and is never taken from the payload.
  // The form's input is disabled, but that is only presentation — this action
  // is a public HTTP endpoint, so the date is resolved here, server-side.
  const collection_date = await getTodayISO();
  const submitted = { ...values, collection_date };

  let clean;
  try {
    clean = await bookingSchema.validate(submitted, {
      abortEarly: false,
      stripUnknown: true,
      context: { originalDate: collection_date },
    });
  } catch (err) {
    return { error: "Please correct the highlighted fields.", fields: fieldErrors(err) };
  }

  const { data, error } = await supabase.rpc("create_booking", {
    payload: toBookingPayload(clean),
  });
  if (error) return { error: error.message };

  await logActivity(supabase, {
    action: "booking.created",
    subject: data?.reference || null,
    summary: `Created booking ${data?.reference} for ${clean.sender_name} — £${clean.total_charges.toFixed(2)}`,
  });
  revalidatePath("/admin");
  return { ok: true, booking: data };
}

// Editing an existing booking. The collection date is not editable, so it is
// re-read from the row rather than trusted from the payload — and passed as
// yup context so a booking whose collection date has since passed can still
// be re-saved.
export async function updateBooking(reference, values) {
  const supabase = await requireStaff();

  const { data: existing } = await supabase
    .from("shipments")
    .select("collection_date")
    .ilike("reference", reference)
    .maybeSingle();
  if (!existing) return { error: "That booking no longer exists." };

  const submitted = { ...values, collection_date: existing.collection_date };

  let clean;
  try {
    clean = await bookingSchema.validate(submitted, {
      abortEarly: false,
      stripUnknown: true,
      context: { originalDate: existing.collection_date },
    });
  } catch (err) {
    return { error: "Please correct the highlighted fields.", fields: fieldErrors(err) };
  }

  const { data, error } = await supabase.rpc("update_booking", {
    p_reference: reference,
    payload: toBookingPayload(clean),
  });
  if (error) return { error: error.message };

  await logActivity(supabase, {
    action: "booking.updated",
    subject: reference,
    summary: `Edited booking ${reference} for ${clean.sender_name} — £${clean.total_charges.toFixed(2)}`,
  });
  revalidatePath("/admin");
  revalidatePath(`/admin/shipments/${reference}`);
  revalidatePath(`/admin/invoices/${reference}`);
  revalidatePath("/admin/customers", "layout");
  return { ok: true, booking: data };
}
