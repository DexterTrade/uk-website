"use server";

import { createClient } from "@/lib/supabase/server";

// SECURITY DEFINER RPC that returns exactly one shipment (or null) for an
// exact reference match — no invoice data, no table access, no listing.
// See the Supabase migrations.
export async function trackShipment(reference) {
  const ref = String(reference || "").trim();
  if (!ref) return null;
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("get_shipment_by_reference", { p_reference: ref });
  if (error) return null;
  return data;
}
