"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  money,
  STATUS_CLASS,
  STATUSES,
  FILTERS,
  INITIAL_SHIPMENTS,
  INITIAL_INVOICES,
} from "@/lib/data";

const NAV = [
  { key: "dash", label: "Dashboard" },
  { key: "ship", label: "Shipments" },
  { key: "inv", label: "Invoices" },
  { key: "new", label: "New invoice" },
];

const invClass = (s) => (s === "Paid" ? "badge" : s === "Draft" ? "badge badge-grey" : "badge badge-red");
const statusBadgeClass = (s) => (STATUS_CLASS[s] === "badge" ? "badge" : `badge ${STATUS_CLASS[s]}`);
const matches = (text, q) => !q.trim() || text.toLowerCase().indexOf(q.trim().toLowerCase()) !== -1;

export default function AdminClient() {
  const [view, setView] = useState("dash");
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");
  const [shipments, setShipments] = useState(INITIAL_SHIPMENTS);
  const [invoices, setInvoices] = useState(INITIAL_INVOICES);
  const [lines, setLines] = useState([
    { id: 1, desc: "Air freight — 24 kg @ £4.20/kg", qty: "24", unit: "4.20" },
    { id: 2, desc: "UK collection", qty: "1", unit: "35.00" },
  ]);
  const [nextLineId, setNextLineId] = useState(3);
  const [form, setForm] = useState({ customer: "", ref: "", service: "Air cargo", due: "" });
  const [issuedNote, setIssuedNote] = useState("");

  const active = useMemo(() => shipments.filter((s) => s.status !== "Delivered"), [shipments]);
  const unpaid = useMemo(() => invoices.filter((i) => i.status === "Unpaid"), [invoices]);
  const monthly = useMemo(() => invoices.filter((i) => i.issued.indexOf("Sep 2026") !== -1), [invoices]);
  const attention = useMemo(() => shipments.filter((s) => s.flag), [shipments]);

  const shipmentRows = useMemo(
    () =>
      shipments
        .filter((s) => filter === "All" || s.status === filter)
        .filter((s) => matches(`${s.ref} ${s.customer} ${s.route} ${s.service}`, search)),
    [shipments, filter, search]
  );
  const invoiceRows = useMemo(
    () => invoices.filter((i) => matches(`${i.number} ${i.customer} ${i.ref}`, search)),
    [invoices, search]
  );

  const draftTotal = useMemo(
    () => lines.reduce((sum, l) => sum + (parseFloat(l.qty) || 0) * (parseFloat(l.unit) || 0), 0),
    [lines]
  );

  function updateShipmentStatus(ref, status) {
    setShipments((prev) => prev.map((s) => (s.ref === ref ? { ...s, status } : s)));
  }

  function markPaid(number) {
    setInvoices((prev) => prev.map((i) => (i.number === number ? { ...i, status: "Paid" } : i)));
  }

  function updateLine(id, field, value) {
    setLines((prev) => prev.map((l) => (l.id === id ? { ...l, [field]: value } : l)));
  }

  function removeLine(id) {
    setLines((prev) => prev.filter((l) => l.id !== id));
  }

  function addLine() {
    setLines((prev) => [...prev, { id: nextLineId, desc: "", qty: "1", unit: "0.00" }]);
    setNextLineId((n) => n + 1);
  }

  function issueInvoice() {
    const total = draftTotal;
    const priorCount = invoices.filter((i) => i.number.indexOf("INV-104") === 0).length;
    const number = `INV-${10434 + priorCount - 5}`;
    const customer = form.customer || "Unnamed customer";
    setInvoices((prev) => [
      { number, customer, ref: form.ref || "—", issued: "14 Sep 2026", total, status: "Unpaid" },
      ...prev,
    ]);
    setIssuedNote(`${number} issued for ${customer} — £${money(total)}. It now appears in the invoice list and the customer portal.`);
  }

  return (
    <div className="admin">
      <aside className="admin-side">
        <Link className="brand" href="/">
          <span className="mark" style={{ width: 42, height: 42, background: "#fff", borderRadius: 6 }}>
            <img src="/assets/logo-mark.svg" alt="PAK Cargo" />
          </span>
          <span>
            <span style={{ display: "block", fontFamily: "var(--font-head)", fontWeight: 800, fontSize: 16, color: "#fff" }}>
              PAK CARGO
            </span>
            <span className="sub" style={{ color: "var(--faint)" }}>Admin</span>
          </span>
        </Link>
        <nav className="nav">
          {NAV.map((n) => (
            <button
              key={n.key}
              aria-current={view === n.key ? "page" : undefined}
              onClick={() => setView(n.key)}
            >
              {n.label}
            </button>
          ))}
        </nav>
        <div className="foot">
          <Link href="/portal">Customer portal &rarr;</Link>
          <Link href="/">Public website &rarr;</Link>
          <div className="who">Signed in as operations@pakcargo</div>
        </div>
      </aside>

      <main className="admin-main">
        <div className="admin-top">
          <input
            className="input"
            placeholder="Search reference, customer or city…"
            aria-label="Search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <button className="btn btn-green btn-sm" onClick={() => setView("new")}>+ New invoice</button>
        </div>

        {view === "dash" && (
          <section className="admin-view">
            <h1>Dashboard</h1>
            <p className="sub">Week of 14 September 2026</p>
            <div className="kpis">
              <div className="kpi">
                <div className="k">Active shipments</div>
                <div className="v">{active.length}</div>
                <div className="n good">
                  {active.filter((s) => s.service === "Air cargo").length} air &middot;{" "}
                  {active.filter((s) => s.service !== "Air cargo").length} sea
                </div>
              </div>
              <div className="kpi">
                <div className="k">Awaiting collection</div>
                <div className="v">{shipments.filter((s) => s.status === "Booked").length}</div>
                <div className="n">Booked, not yet picked up</div>
              </div>
              <div className="kpi">
                <div className="k">Unpaid invoices</div>
                <div className="v">{unpaid.length}</div>
                <div className="n bad">£{money(unpaid.reduce((a, b) => a + b.total, 0))} outstanding</div>
              </div>
              <div className="kpi">
                <div className="k">Invoiced this month</div>
                <div className="v">£{money(monthly.reduce((a, b) => a + b.total, 0))}</div>
                <div className="n">Across {monthly.length} invoices</div>
              </div>
            </div>
            <div className="pane">
              <div className="pane-head">
                <h2>Shipments needing attention</h2>
                <button className="btn btn-ghost btn-sm" onClick={() => setView("ship")}>All shipments</button>
              </div>
              <div className="scroll">
                <table style={{ minWidth: 640 }}>
                  <thead>
                    <tr><th>Reference</th><th>Customer</th><th>Route</th><th>Status</th><th>Flag</th></tr>
                  </thead>
                  <tbody>
                    {attention.map((s) => (
                      <tr key={s.ref}>
                        <td className="key">{s.ref}</td>
                        <td>{s.customer}</td>
                        <td>{s.route}</td>
                        <td><span className={statusBadgeClass(s.status)}>{s.status}</span></td>
                        <td style={{ color: "var(--red)" }}>{s.flag}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </section>
        )}

        {view === "ship" && (
          <section className="admin-view">
            <h1>Shipments</h1>
            <p className="sub">{shipmentRows.length} records. Change a status and the customer portal updates.</p>
            <div className="chips">
              {FILTERS.map((f) => (
                <button key={f} className="chip" aria-pressed={f === filter} onClick={() => setFilter(f)}>
                  {f}
                </button>
              ))}
            </div>
            <div className="pane">
              <div className="scroll">
                <table style={{ minWidth: 820 }}>
                  <thead>
                    <tr>
                      <th>Reference</th><th>Customer</th><th>Service</th><th>Route</th>
                      <th>Weight</th><th>Status</th><th>Invoice</th>
                    </tr>
                  </thead>
                  <tbody>
                    {shipmentRows.map((s) => (
                      <tr key={s.ref}>
                        <td className="key">{s.ref}</td>
                        <td>{s.customer}</td>
                        <td>{s.service}</td>
                        <td>{s.route}</td>
                        <td>{s.weight}</td>
                        <td>
                          <select
                            className="status-select"
                            value={s.status}
                            onChange={(e) => updateShipmentStatus(s.ref, e.target.value)}
                          >
                            {STATUSES.map((o) => (
                              <option key={o} value={o}>{o}</option>
                            ))}
                          </select>
                        </td>
                        <td><Link href={`/portal?invoice=${encodeURIComponent(s.invoice)}`}>{s.invoice}</Link></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {shipmentRows.length === 0 && <p className="empty">No shipments match that search or filter.</p>}
            </div>
          </section>
        )}

        {view === "inv" && (
          <section className="admin-view">
            <h1>Invoices</h1>
            <p className="sub">
              £{money(unpaid.reduce((a, b) => a + b.total, 0))} outstanding across {unpaid.length} unpaid invoices.
            </p>
            <div className="pane">
              <div className="scroll">
                <table style={{ minWidth: 760 }}>
                  <thead>
                    <tr>
                      <th>Invoice</th><th>Customer</th><th>Shipment</th><th>Issued</th>
                      <th className="num-right">Total</th><th>Status</th><th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {invoiceRows.map((i) => (
                      <tr key={i.number}>
                        <td className="key"><Link href={`/portal?invoice=${encodeURIComponent(i.number)}`}>{i.number}</Link></td>
                        <td>{i.customer}</td>
                        <td>{i.ref}</td>
                        <td>{i.issued}</td>
                        <td className="num-right" style={{ fontWeight: 600 }}>£{money(i.total)}</td>
                        <td><span className={invClass(i.status)}>{i.status}</span></td>
                        <td>
                          {i.status !== "Paid" && (
                            <button className="btn btn-ghost btn-sm" onClick={() => markPaid(i.number)}>Mark paid</button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {invoiceRows.length === 0 && <p className="empty">No invoices match that search.</p>}
            </div>
          </section>
        )}

        {view === "new" && (
          <section className="admin-view" style={{ maxWidth: 880 }}>
            <h1>New invoice</h1>
            <p className="sub">Lines total live. Issuing saves the invoice and makes it visible in the customer portal.</p>
            <div className="pane" style={{ padding: 24 }}>
              <div className="grid-fields">
                <label className="field">
                  Customer
                  <input
                    className="input"
                    placeholder="Full name"
                    value={form.customer}
                    onChange={(e) => setForm((f) => ({ ...f, customer: e.target.value }))}
                  />
                </label>
                <label className="field">
                  Shipment reference
                  <input
                    className="input"
                    placeholder="PC-0000"
                    value={form.ref}
                    onChange={(e) => setForm((f) => ({ ...f, ref: e.target.value }))}
                  />
                </label>
                <label className="field">
                  Service
                  <select
                    className="select"
                    value={form.service}
                    onChange={(e) => setForm((f) => ({ ...f, service: e.target.value }))}
                  >
                    <option>Air cargo</option>
                    <option>Sea freight (LCL)</option>
                    <option>Sea freight (FCL)</option>
                  </select>
                </label>
                <label className="field">
                  Due date
                  <input
                    className="input"
                    type="date"
                    value={form.due}
                    onChange={(e) => setForm((f) => ({ ...f, due: e.target.value }))}
                  />
                </label>
              </div>

              <div className="line-rows">
                {lines.map((l) => (
                  <div className="line-row" key={l.id}>
                    <label className="field field-mini desc">
                      Description
                      <input
                        className="input"
                        value={l.desc}
                        placeholder="Air freight 24 kg"
                        onChange={(e) => updateLine(l.id, "desc", e.target.value)}
                      />
                    </label>
                    <label className="field field-mini">
                      Qty
                      <input
                        className="input"
                        inputMode="decimal"
                        value={l.qty}
                        onChange={(e) => updateLine(l.id, "qty", e.target.value)}
                      />
                    </label>
                    <label className="field field-mini">
                      Unit £
                      <input
                        className="input"
                        inputMode="decimal"
                        value={l.unit}
                        onChange={(e) => updateLine(l.id, "unit", e.target.value)}
                      />
                    </label>
                    <div className="amount">
                      <span className="v">£{money((parseFloat(l.qty) || 0) * (parseFloat(l.unit) || 0))}</span>
                      <button aria-label="Remove line" onClick={() => removeLine(l.id)}>&times;</button>
                    </div>
                  </div>
                ))}
              </div>
              <div className="line-foot">
                <button className="btn btn-ghost btn-sm" onClick={addLine}>+ Add line</button>
                <div style={{ display: "flex", alignItems: "baseline", gap: 18 }}>
                  <span style={{ fontSize: 15, color: "var(--soft)" }}>Invoice total</span>
                  <span className="total">£{money(draftTotal)}</span>
                </div>
              </div>

              <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginTop: 20 }}>
                <button className="btn btn-green" onClick={issueInvoice}>Issue invoice</button>
                <button className="btn btn-ghost" onClick={() => window.print()}>Preview print</button>
              </div>
              {issuedNote && <p className="alert alert-ok">{issuedNote}</p>}
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
