"use server";

import { createClient } from "@/lib/supabase/server";

// SECURITY DEFINER RPC that returns exactly one shipment (or null) for an
// exact reference + sender phone match — no invoice data, no table access,
// no listing. See the Supabase migrations.
export async function trackShipment(reference, senderPhone) {
  const ref = String(reference || "").trim();
  const phone = String(senderPhone || "").trim();
  if (!ref || !phone) return null;
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("get_shipment_by_reference", {
    p_reference: ref,
    p_sender_phone: phone,
  });
  if (error) return null;
  return data;
}
