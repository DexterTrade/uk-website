import { createClient } from "@/lib/supabase/server";

// Used only when the rates query fails or a column is blank. They mirror the
// live rows so a failed read doesn't put a different price on the page — but
// the `rates` table is the source of truth; edit figures in /admin → Rates.
const FALLBACK = {
  sea: { headline_rate: "£1.25/kg", rate_note: "Min. 20 kg", estimated_time: "8–10 weeks", pickup_charge: 5 },
  air: { headline_rate: "£7.50/kg", rate_note: "Min. 10 kg", estimated_time: "8–10 days", pickup_charge: 20 },
};

const MIN_KG = { sea: 20, air: 10 };

// Both rate rows, keyed by mode, with blanks filled from FALLBACK.
export async function getRates() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("rates")
    .select(
      "mode, headline_rate, rate_note, estimated_time, pickup_charge, next_dispatch_date, next_dispatch_note, dispatch_days",
    );
  const byMode = Object.fromEntries((data || []).map((r) => [r.mode, r]));
  const merge = (mode) => {
    const row = byMode[mode] || {};
    const out = { ...FALLBACK[mode], ...row };
    for (const key of Object.keys(FALLBACK[mode])) {
      if (row[key] === null || row[key] === undefined || row[key] === "") out[key] = FALLBACK[mode][key];
    }
    return out;
  };
  return { sea: merge("sea"), air: merge("air") };
}

const money = (n, decimals) => `£${decimals ? n.toFixed(2) : String(Math.round(n * 100) / 100)}`;

// The figures the page copy quotes, in the shapes the copy needs. Parsed out of
// the free-text admin fields, so "£7.5/kg" still reads "£7.50 per kg" and
// "Min. 10kg" still yields 10; anything unparseable falls back to the raw text.
export function rateFacts(rate, mode) {
  const rateNum = String(rate.headline_rate).match(/£\s*(\d+(?:\.\d+)?)/);
  const perKg = rateNum ? money(Number(rateNum[1]), true) : String(rate.headline_rate).replace(/\/kg$/i, "");
  const minMatch = String(rate.rate_note || "").match(/(\d+)\s*kg/i);
  const time = rate.estimated_time;
  return {
    perKg,
    rateLabel: `${perKg}/kg`,
    minKg: minMatch ? Number(minMatch[1]) : MIN_KG[mode],
    fee: money(Number(rate.pickup_charge) || 0, false),
    time,
    // "8–10 weeks" → "8 to 10 weeks", for sentences that spell the range out.
    timeWords: String(time).replace(/\s*[–-]\s*/, " to "),
  };
}

// Convenience for pages that only need the copy figures.
export async function getRateFacts() {
  const rates = await getRates();
  return { rates, sea: rateFacts(rates.sea, "sea"), air: rateFacts(rates.air, "air") };
}
