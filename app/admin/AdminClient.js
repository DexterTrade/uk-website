"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { money, STATUS_CLASS, STATUSES, FILTERS } from "@/lib/data";
import { issueInvoice, markInvoicePaid, signOutAction, updateRate, updateShipmentStatus } from "./actions";

const NAV = [
  { key: "dash", label: "Dashboard" },
  { key: "ship", label: "Shipments" },
  { key: "inv", label: "Invoices" },
  { key: "new", label: "New invoice" },
  { key: "rates", label: "Rates" },
];

const EMPTY_LINE = () => ({ desc: "", qty: "1", unit: "0.00" });

const invClass = (s) => (s === "Paid" ? "badge" : s === "Draft" ? "badge badge-grey" : "badge badge-red");
const statusBadgeClass = (s) => (STATUS_CLASS[s] === "badge" ? "badge" : `badge ${STATUS_CLASS[s]}`);
const matches = (text, q) => !q.trim() || text.toLowerCase().indexOf(q.trim().toLowerCase()) !== -1;

export default function AdminClient({ shipments, invoices, rates, staffEmail }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [view, setView] = useState("dash");
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");

  const [lines, setLines] = useState([{ id: 1, ...EMPTY_LINE() }]);
  const [nextLineId, setNextLineId] = useState(2);
  const [form, setForm] = useState({ customer: "", ref: "", service: "Air cargo", due: "" });
  const [issuedNote, setIssuedNote] = useState("");
  const [formError, setFormError] = useState("");

  const [rateForm, setRateForm] = useState(() =>
    Object.fromEntries(
      rates.map((r) => [
        r.mode,
        {
          headline_rate: r.headline_rate,
          rate_note: r.rate_note,
          pickup_charge: String(r.pickup_charge),
          next_dispatch_date: r.next_dispatch_date || "",
          next_dispatch_note: r.next_dispatch_note || "",
        },
      ])
    )
  );
  const [rateSaved, setRateSaved] = useState({});

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

  function handleStatusChange(shipmentId, status) {
    startTransition(async () => {
      await updateShipmentStatus(shipmentId, status);
      router.refresh();
    });
  }

  function handleMarkPaid(invoiceId) {
    startTransition(async () => {
      await markInvoicePaid(invoiceId);
      router.refresh();
    });
  }

  function updateLine(id, field, value) {
    setLines((prev) => prev.map((l) => (l.id === id ? { ...l, [field]: value } : l)));
  }

  function removeLine(id) {
    setLines((prev) => prev.filter((l) => l.id !== id));
  }

  function addLine() {
    setLines((prev) => [...prev, { id: nextLineId, ...EMPTY_LINE() }]);
    setNextLineId((n) => n + 1);
  }

  function handleIssue() {
    setFormError("");
    startTransition(async () => {
      const result = await issueInvoice({
        customer: form.customer,
        reference: form.ref,
        service: form.service,
        dueDate: form.due || null,
        lines,
      });
      if (result?.error) {
        setFormError(result.error);
        return;
      }
      setIssuedNote(
        `${result.invoice.number} issued for ${result.invoice.customer_name} — £${money(result.invoice.total)}. It now appears in the invoice list.`
      );
      setLines([{ id: 1, ...EMPTY_LINE() }]);
      setNextLineId(2);
      setForm({ customer: "", ref: "", service: "Air cargo", due: "" });
      router.refresh();
    });
  }

  function updateRateField(mode, field, value) {
    setRateForm((prev) => ({ ...prev, [mode]: { ...prev[mode], [field]: value } }));
    setRateSaved((prev) => ({ ...prev, [mode]: false }));
  }

  function handleSaveRate(mode) {
    startTransition(async () => {
      const result = await updateRate(mode, rateForm[mode]);
      if (!result?.error) {
        setRateSaved((prev) => ({ ...prev, [mode]: true }));
        router.refresh();
      }
    });
  }

  return (
    <div className="admin">
      <aside className="admin-side">
        <Link className="flex items-center gap-[10px]" href="/">
          <span className="flex h-[42px] w-[42px] flex-none items-center justify-center rounded-md bg-white">
            <img className="h-full w-full object-contain" src="/assets/logo-mark.svg" alt="PAK Cargo" />
          </span>
          <span>
            <span className="block font-head text-base font-extrabold text-white">
              PAK CARGO
            </span>
            <span className="text-[10.5px] font-medium tracking-[0.14em] text-faint uppercase">Admin</span>
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
          <Link href="/tracking">Customer tracking &rarr;</Link>
          <Link href="/">Public website &rarr;</Link>
          <div className="who">Signed in as {staffEmail || "…"}</div>
          <form action={signOutAction}>
            <button type="submit" className="btn btn-ghost btn-sm mt-1 w-full">
              Sign out
            </button>
          </form>
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
                <table className="min-w-[640px]">
                  <thead>
                    <tr><th>Reference</th><th>Customer</th><th>Route</th><th>Status</th><th>Flag</th></tr>
                  </thead>
                  <tbody>
                    {attention.map((s) => (
                      <tr key={s.id}>
                        <td className="key">{s.ref}</td>
                        <td>{s.customer}</td>
                        <td>{s.route}</td>
                        <td><span className={statusBadgeClass(s.status)}>{s.status}</span></td>
                        <td className="text-red">{s.flag}</td>
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
            <p className="sub">{shipmentRows.length} records. Change a status and customer tracking updates.</p>
            <div className="chips">
              {FILTERS.map((f) => (
                <button key={f} className="chip" aria-pressed={f === filter} onClick={() => setFilter(f)}>
                  {f}
                </button>
              ))}
            </div>
            <div className="pane">
              <div className="scroll">
                <table className="min-w-[820px]">
                  <thead>
                    <tr>
                      <th>Reference</th><th>Customer</th><th>Service</th><th>Route</th>
                      <th>Weight</th><th>Status</th><th>Invoice</th>
                    </tr>
                  </thead>
                  <tbody>
                    {shipmentRows.map((s) => (
                      <tr key={s.id}>
                        <td className="key">{s.ref}</td>
                        <td>{s.customer}</td>
                        <td>{s.service}</td>
                        <td>{s.route}</td>
                        <td>{s.weight}</td>
                        <td>
                          <select
                            className="status-select"
                            value={s.status}
                            disabled={isPending}
                            onChange={(e) => handleStatusChange(s.id, e.target.value)}
                          >
                            {STATUSES.map((o) => (
                              <option key={o} value={o}>{o}</option>
                            ))}
                          </select>
                        </td>
                        <td>{s.invoice}</td>
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
                <table className="min-w-[760px]">
                  <thead>
                    <tr>
                      <th>Invoice</th><th>Customer</th><th>Shipment</th><th>Issued</th>
                      <th className="num-right">Total</th><th>Status</th><th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {invoiceRows.map((i) => (
                      <tr key={i.id}>
                        <td className="key">{i.number}</td>
                        <td>{i.customer}</td>
                        <td>{i.ref}</td>
                        <td>{i.issued}</td>
                        <td className="num-right font-semibold">£{money(i.total)}</td>
                        <td><span className={invClass(i.status)}>{i.status}</span></td>
                        <td>
                          {i.status !== "Paid" && (
                            <button className="btn btn-ghost btn-sm" disabled={isPending} onClick={() => handleMarkPaid(i.id)}>
                              Mark paid
                            </button>
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
          <section className="admin-view max-w-[880px]">
            <h1>New invoice</h1>
            <p className="sub">Lines total live. Issuing saves the invoice for internal records &mdash; customers only ever see tracking, never invoices.</p>
            <div className="pane p-6">
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
                <div className="flex items-baseline gap-[18px]">
                  <span className="text-[15px] text-soft">Invoice total</span>
                  <span className="total">£{money(draftTotal)}</span>
                </div>
              </div>

              <div className="mt-5 flex flex-wrap gap-3">
                <button className="btn btn-green" disabled={isPending} onClick={handleIssue}>
                  {isPending ? "Issuing…" : "Issue invoice"}
                </button>
                <button className="btn btn-ghost" onClick={() => window.print()}>Preview print</button>
              </div>
              {formError && <p className="alert alert-error">{formError}</p>}
              {issuedNote && <p className="alert alert-ok">{issuedNote}</p>}
            </div>
          </section>
        )}

        {view === "rates" && (
          <section className="admin-view max-w-[720px]">
            <h1>Rates</h1>
            <p className="sub">These are the headline rates and pickup charges shown on the homepage pricing cards.</p>
            {["sea", "air"].map((mode) => (
              <div className="pane p-6" key={mode}>
                <h2 className="mb-4 text-[17px] font-bold capitalize">
                  {mode} cargo
                </h2>
                <div className="grid-fields">
                  <label className="field">
                    Headline rate
                    <input
                      className="input"
                      placeholder="From £195/m³"
                      value={rateForm[mode]?.headline_rate || ""}
                      onChange={(e) => updateRateField(mode, "headline_rate", e.target.value)}
                    />
                  </label>
                  <label className="field">
                    Pickup charge (&pound;)
                    <input
                      className="input"
                      inputMode="decimal"
                      value={rateForm[mode]?.pickup_charge || ""}
                      onChange={(e) => updateRateField(mode, "pickup_charge", e.target.value)}
                    />
                  </label>
                </div>
                <label className="field mt-4">
                  Note
                  <input
                    className="input"
                    placeholder="Shared container (LCL) · 30–40 day delivery"
                    value={rateForm[mode]?.rate_note || ""}
                    onChange={(e) => updateRateField(mode, "rate_note", e.target.value)}
                  />
                </label>
                {mode === "sea" && (
                  <>
                    <p className="fine mt-5 mb-1">
                      Next departure &mdash; shown as a countdown banner on the Sea Cargo page. Leave the date blank to hide it.
                    </p>
                    <div className="grid-fields">
                      <label className="field">
                        Next dispatch date
                        <input
                          className="input"
                          type="date"
                          value={rateForm.sea?.next_dispatch_date || ""}
                          onChange={(e) => updateRateField("sea", "next_dispatch_date", e.target.value)}
                        />
                      </label>
                      <label className="field">
                        Dispatch note
                        <input
                          className="input"
                          placeholder="Karachi-bound LCL container"
                          value={rateForm.sea?.next_dispatch_note || ""}
                          onChange={(e) => updateRateField("sea", "next_dispatch_note", e.target.value)}
                        />
                      </label>
                    </div>
                  </>
                )}
                <div className="mt-[18px] flex items-center gap-[14px]">
                  <button className="btn btn-green btn-sm" disabled={isPending} onClick={() => handleSaveRate(mode)}>
                    Save
                  </button>
                  {rateSaved[mode] && <span className="text-[13.5px] text-green-ink">Saved &mdash; live on the homepage now.</span>}
                </div>
              </div>
            ))}
          </section>
        )}
      </main>
    </div>
  );
}
