// What each tracking status means, for the explainer on /tracking. Keyed by
// the status names in the `shipment_statuses` table, in the same order.
//
// This is customer-facing copy, so it lives here rather than in the database,
// but it must follow the table: rename or add a status in Supabase and update
// this list to match, or the page will describe a workflow the tracker no
// longer shows.
export const STATUS_MEANINGS = [
  {
    status: "Collected",
    meaning:
      "your goods have been collected or dropped off, then weighed or measured and logged against your reference.",
  },
  {
    status: "Dispatched from warehouse",
    meaning: "your shipment has left our UK warehouse for the airport or port.",
  },
  {
    status: "Dispatched from UK",
    meaning: "your cargo is on its flight or container vessel to Pakistan.",
  },
  {
    status: "In transit",
    meaning: "your shipment is on its way to Pakistan by air or sea.",
  },
  {
    status: "Arrived in Karachi",
    meaning: "your shipment has landed or docked and is waiting for customs.",
  },
  {
    status: "Cleared from customs",
    meaning: "our agents have cleared your goods through Pakistan Customs.",
  },
  {
    status: "Out for delivery",
    meaning: "your cargo is with our delivery team on its way to the receiver.",
  },
  {
    status: "Delivered",
    meaning: "your shipment has been handed over at the delivery address.",
  },
];
