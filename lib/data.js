// Pure UI helpers shared by the portal and admin panel. Actual shipment and
// invoice data lives in Supabase — see lib/supabase/ and app/admin/actions.js.

export const money = (n) =>
  Number(n).toLocaleString("en-GB", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

// The list of statuses is NOT here — it lives in the `shipment_statuses`
// table and is fetched per request, so adding one is an INSERT rather than a
// migration plus edits in two files. This only maps the tone stored against
// each status to the badge class that renders it.
const TONE_CLASS = {
  grey: "badge badge-grey",
  amber: "badge badge-amber",
  navy: "badge badge-navy",
  green: "badge",
};

export const statusBadgeClass = (tone) => TONE_CLASS[tone] || TONE_CLASS.grey;
