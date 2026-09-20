// Pure UI helpers shared by the portal and admin panel. Actual shipment and
// invoice data lives in Supabase — see lib/supabase/ and app/admin/actions.js.

export const money = (n) =>
  Number(n).toLocaleString("en-GB", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export const STATUS_CLASS = {
  Booked: "badge-grey",
  Collected: "badge-grey",
  "At warehouse": "badge-amber",
  "In transit": "badge-navy",
  "At sea": "badge-navy",
  "Customs clearance": "badge-amber",
  "Out for delivery": "badge",
  Delivered: "badge",
};

export const STATUSES = [
  "Booked",
  "Collected",
  "At warehouse",
  "In transit",
  "At sea",
  "Customs clearance",
  "Out for delivery",
  "Delivered",
];

export const FILTERS = ["All", "Booked", "At warehouse", "In transit", "At sea", "Customs clearance", "Delivered"];
