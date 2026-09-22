"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { bookingSchema, fieldErrors, normalizeUkMobile, toBookingPayload } from "@/lib/validation/booking";
import { getTodayISO } from "@/lib/server-time";

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

  const { error } = await supabase.from("shipments").update({ status }).eq("id", shipmentId);
  if (error) return { error: error.message };
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
    .select("id");
  if (error) return { error: error.message };

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
  revalidatePath("/admin");
  revalidatePath("/");
  revalidatePath("/sea-cargo");
  revalidatePath("/air-cargo");
  revalidatePath("/excess-baggage");
  revalidatePath("/pak-to-uk");
  return { ok: true };
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

  revalidatePath("/admin");
  revalidatePath(`/admin/shipments/${reference}`);
  revalidatePath(`/admin/invoices/${reference}`);
  revalidatePath("/admin/customers", "layout");
  return { ok: true, booking: data };
}
