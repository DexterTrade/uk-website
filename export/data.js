// Shared demo data + helpers for the PAK Cargo portal and admin panel.
// Replace the constants with API calls when you wire this into Next.js.

const money = (n) =>
  Number(n).toLocaleString("en-GB", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const SHIPMENTS = {
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
      { label: "Out for door delivery", when: "Expected 18 Sep", done: false }
    ]
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
      { label: "Clearance & door delivery", when: "Expected 12 Oct", done: false }
    ]
  }
};

const INVOICE_DETAIL = {
  "INV-10428": {
    number: "INV-10428", status: "Paid", issued: "22 August 2026", due: "29 August 2026",
    customer: "A. Mahmood", customerCity: "Manchester M14", ref: "BK-20931", route: "Felixstowe → Karachi",
    lines: [
      { desc: "Sea freight, LCL — 3.2 m³ @ £195/m³", qty: "3.2", unit: "195.00", amount: "624.00" },
      { desc: "UK collection, Manchester", qty: "1", unit: "45.00", amount: "45.00" },
      { desc: "Export documentation", qty: "1", unit: "35.00", amount: "35.00" },
      { desc: "All-risk insurance, 1.5% of £2,400", qty: "1", unit: "36.00", amount: "36.00" }
    ],
    total: "740.00"
  },
  "INV-10431": {
    number: "INV-10431", status: "Unpaid", issued: "11 September 2026", due: "25 September 2026",
    customer: "S. Iqbal", customerCity: "Birmingham B10", ref: "PC-4471", route: "Heathrow → Lahore",
    lines: [
      { desc: "Air freight — 24.4 kg @ £4.20/kg", qty: "24.4", unit: "4.20", amount: "102.48" },
      { desc: "UK collection, Birmingham", qty: "1", unit: "35.00", amount: "35.00" },
      { desc: "Customs clearance, Lahore", qty: "1", unit: "48.00", amount: "48.00" }
    ],
    total: "185.48"
  }
};

const STATUS_CLASS = {
  "Booked": "badge-grey",
  "Collected": "badge-grey",
  "At warehouse": "badge-amber",
  "In transit": "badge-navy",
  "At sea": "badge-navy",
  "Customs clearance": "badge-amber",
  "Out for delivery": "badge",
  "Delivered": "badge"
};

const STATUSES = ["Booked", "Collected", "At warehouse", "In transit", "At sea", "Customs clearance", "Out for delivery", "Delivered"];

const escapeHtml = (s) =>
  String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

function timelineHtml(stages) {
  return stages
    .map(
      (s) => `
      <div class="timeline-row${s.done ? " done" : ""}">
        <div class="rail"><span class="dot"></span><span class="line"></span></div>
        <div class="body">
          <div class="lbl">${escapeHtml(s.label)}</div>
          <div class="when">${escapeHtml(s.when)}</div>
        </div>
      </div>`
    )
    .join("");
}

function invoiceHtml(inv) {
  const badge = inv.status === "Paid" ? "badge" : "badge badge-red";
  const lines = inv.lines
    .map(
      (l) => `
      <tr>
        <td>${escapeHtml(l.desc)}</td>
        <td class="num-right">${escapeHtml(l.qty)}</td>
        <td class="num-right">£${escapeHtml(l.unit)}</td>
        <td class="num-right" style="font-weight:600">£${escapeHtml(l.amount)}</td>
      </tr>`
    )
    .join("");

  return `
    <div class="invoice">
      <div class="head">
        <div>
          <div class="no">${escapeHtml(inv.number)}</div>
          <div class="dates">Issued ${escapeHtml(inv.issued)} · due ${escapeHtml(inv.due)}</div>
        </div>
        <div style="text-align:right">
          <span class="${badge}">${escapeHtml(inv.status)}</span>
          <div class="total">£${escapeHtml(inv.total)}</div>
        </div>
      </div>
      <div class="parties">
        <div>
          <div class="k">Billed to</div>
          <div class="v">${escapeHtml(inv.customer)}<br />${escapeHtml(inv.customerCity)}</div>
        </div>
        <div>
          <div class="k">Shipment</div>
          <div class="v">${escapeHtml(inv.ref)}<br />${escapeHtml(inv.route)}</div>
        </div>
      </div>
      <div class="lines">
        <table>
          <thead>
            <tr>
              <th>Description</th>
              <th class="num-right">Qty</th>
              <th class="num-right">Unit</th>
              <th class="num-right">Amount</th>
            </tr>
          </thead>
          <tbody>${lines}</tbody>
        </table>
      </div>
      <div class="foot">
        <span style="font-size:15px;color:var(--soft)">Total due</span>
        <span class="t">£${escapeHtml(inv.total)}</span>
      </div>
    </div>
    <div data-noprint style="display:flex;gap:12px;flex-wrap:wrap;margin-top:16px">
      <button class="btn btn-ghost" onclick="window.print()">Print / save as PDF</button>
      <a class="btn btn-ghost" href="https://wa.me/440000000000">Query this invoice</a>
    </div>`;
}
