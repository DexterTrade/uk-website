"use server";

import { createClient } from "@/lib/supabase/server";

// Both RPCs are SECURITY DEFINER functions that return exactly one row (or
// null) for an exact reference/number match — see the Supabase migrations.
// No table access is granted to anonymous visitors beyond these two calls.

export async function trackShipment(reference) {
  const ref = String(reference || "").trim();
  if (!ref) return null;
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("get_shipment_by_reference", { p_reference: ref });
  if (error) return null;
  return data;
}

export async function lookupInvoice(number) {
  const num = String(number || "").trim();
  if (!num) return null;
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("get_invoice_by_number", { p_number: num });
  if (error) return null;
  return data;
}
