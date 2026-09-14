// Shared demo data for the customer portal and admin panel.
// Replace these constants with real API calls when this is wired to a backend.

export const money = (n) =>
  Number(n).toLocaleString("en-GB", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export const SHIPMENTS = {
  "PC-4471": {
    ref: "PC-4471",
    status: "In transit",
    service: "Air cargo, consolidated",
    route: "London Heathrow → Lahore (LHE)",
    weight: "3 pieces · 24.4 kg",
    eta: "18 September 2026",
    summary: "Cleared for export and loaded. Currently airside at Heathrow awaiting departure.",
    invoice: "INV-10431",
    stages: [
      { label: "Booking confirmed", when: "10 Sep, 11:02 · Birmingham", done: true },
      { label: "Collected from shipper", when: "11 Sep, 09:40 · B10", done: true },
      { label: "Received at warehouse, weighed", when: "11 Sep, 17:15 · London", done: true },
      { label: "Export cleared, loaded to flight", when: "13 Sep, 06:30 · LHR", done: true },
      { label: "Arrival & customs clearance, Lahore", when: "Expected 16 Sep", done: false },
      { label: "Out for door delivery", when: "Expected 18 Sep", done: false },
    ],
  },
  "BK-20931": {
    ref: "BK-20931",
    status: "At sea",
    service: "Sea freight, shared container (LCL)",
    route: "Felixstowe → Karachi (KHI)",
    weight: "6 pieces · 3.2 m³",
    eta: "12 October 2026",
    summary: "Container sailed on schedule. Vessel currently in the Gulf of Aden.",
    invoice: "INV-10428",
    stages: [
      { label: "Booking confirmed", when: "22 Aug, 14:20 · Manchester", done: true },
      { label: "Collected from shipper", when: "26 Aug, 10:05 · M14", done: true },
      { label: "Loaded into container", when: "29 Aug, 16:00 · Felixstowe", done: true },
      { label: "Vessel departed", when: "02 Sep, 03:10 · Felixstowe", done: true },
      { label: "Arrival Karachi port", when: "Expected 05 Oct", done: false },
      { label: "Clearance & door delivery", when: "Expected 12 Oct", done: false },
    ],
  },
};

export const INVOICE_DETAIL = {
  "INV-10428": {
    number: "INV-10428",
    status: "Paid",
    issued: "22 August 2026",
    due: "29 August 2026",
    customer: "A. Mahmood",
    customerCity: "Manchester M14",
    ref: "BK-20931",
    route: "Felixstowe → Karachi",
    lines: [
      { desc: "Sea freight, LCL — 3.2 m³ @ £195/m³", qty: "3.2", unit: "195.00", amount: "624.00" },
      { desc: "UK collection, Manchester", qty: "1", unit: "45.00", amount: "45.00" },
      { desc: "Export documentation", qty: "1", unit: "35.00", amount: "35.00" },
      { desc: "All-risk insurance, 1.5% of £2,400", qty: "1", unit: "36.00", amount: "36.00" },
    ],
    total: "740.00",
  },
  "INV-10431": {
    number: "INV-10431",
    status: "Unpaid",
    issued: "11 September 2026",
    due: "25 September 2026",
    customer: "S. Iqbal",
    customerCity: "Birmingham B10",
    ref: "PC-4471",
    route: "Heathrow → Lahore",
    lines: [
      { desc: "Air freight — 24.4 kg @ £4.20/kg", qty: "24.4", unit: "4.20", amount: "102.48" },
      { desc: "UK collection, Birmingham", qty: "1", unit: "35.00", amount: "35.00" },
      { desc: "Customs clearance, Lahore", qty: "1", unit: "48.00", amount: "48.00" },
    ],
    total: "185.48",
  },
};

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

export const INITIAL_SHIPMENTS = [
  { ref: "PC-4471", customer: "S. Iqbal", service: "Air cargo", route: "Heathrow → Lahore", weight: "24.4 kg", status: "In transit", invoice: "INV-10431", flag: "Invoice unpaid" },
  { ref: "BK-20931", customer: "A. Mahmood", service: "Sea freight (LCL)", route: "Felixstowe → Karachi", weight: "3.2 m³", status: "At sea", invoice: "INV-10428", flag: "" },
  { ref: "PC-4472", customer: "N. Hussain", service: "Air cargo", route: "Heathrow → Islamabad", weight: "11.0 kg", status: "At warehouse", invoice: "INV-10432", flag: "Awaiting export docs" },
  { ref: "PC-4473", customer: "R. Bibi", service: "Air cargo", route: "Manchester → Faisalabad", weight: "8.6 kg", status: "Booked", invoice: "INV-10433", flag: "Collection not booked" },
  { ref: "BK-20932", customer: "Zeeshan Traders", service: "Sea freight (FCL)", route: "Southampton → Karachi", weight: "20ft", status: "Customs clearance", invoice: "INV-10429", flag: "Duty query at port" },
  { ref: "PC-4468", customer: "M. Saleem", service: "Air cargo", route: "Heathrow → Sialkot", weight: "31.2 kg", status: "Delivered", invoice: "INV-10425", flag: "" },
];

export const INITIAL_INVOICES = [
  { number: "INV-10433", customer: "R. Bibi", ref: "PC-4473", issued: "13 Sep 2026", total: 71.12, status: "Draft" },
  { number: "INV-10432", customer: "N. Hussain", ref: "PC-4472", issued: "12 Sep 2026", total: 129.2, status: "Unpaid" },
  { number: "INV-10431", customer: "S. Iqbal", ref: "PC-4471", issued: "11 Sep 2026", total: 185.48, status: "Unpaid" },
  { number: "INV-10429", customer: "Zeeshan Traders", ref: "BK-20932", issued: "02 Sep 2026", total: 2480.0, status: "Unpaid" },
  { number: "INV-10428", customer: "A. Mahmood", ref: "BK-20931", issued: "22 Aug 2026", total: 740.0, status: "Paid" },
  { number: "INV-10425", customer: "M. Saleem", ref: "PC-4468", issued: "18 Aug 2026", total: 214.04, status: "Paid" },
];
