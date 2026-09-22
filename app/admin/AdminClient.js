"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { money, statusBadgeClass } from "@/lib/data";
import { signOutAction, updateRate, updateShipmentStatus, updateShipmentStatuses } from "./actions";

// No Invoices tab: an invoice is 1:1 with its shipment and is shown in full on
// the shipment detail page, so a separate list would be the same rows twice.
const NAV = [
  { key: "dash", label: "Dashboard" },
  { key: "ship", label: "Shipments" },
  { key: "cust", label: "Customers" },
  { key: "rates", label: "Rates" },
];

const matches = (text, q) => !q.trim() || text.toLowerCase().indexOf(q.trim().toLowerCase()) !== -1;

export default function AdminClient({
  shipments,
  invoices,
  customers,
  statuses,
  rates,
  monthKey,
  monthLabel,
  staffEmail,
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [view, setView] = useState("dash");
  const [search, setSearch] = useState("");

  // Multi-select: an empty set means no filter, i.e. show everything.
  const [statusFilter, setStatusFilter] = useState(() => new Set());
  const [selected, setSelected] = useState(() => new Set());
  const [bulkStatus, setBulkStatus] = useState("");
  const [bulkNote, setBulkNote] = useState("");

  const [rateForm, setRateForm] = useState(() =>
    Object.fromEntries(
      rates.map((r) => [
        r.mode,
        {
          headline_rate: r.headline_rate,
          rate_note: r.rate_note,
          estimated_time: r.estimated_time || "",
          pickup_charge: String(r.pickup_charge),
          next_dispatch_date: r.next_dispatch_date || "",
          next_dispatch_note: r.next_dispatch_note || "",
        },
      ])
    )
  );
  const [rateSaved, setRateSaved] = useState({});

  const active = useMemo(() => shipments.filter((s) => s.status !== "Delivered"), [shipments]);
  const attention = useMemo(() => shipments.filter((s) => s.flag), [shipments]);

  // monthKey ("2026-09") comes from the server so this follows the calendar
  // instead of matching a hardcoded month name.
  const monthly = useMemo(
    () => invoices.filter((i) => (i.issuedISO || "").startsWith(monthKey)),
    [invoices, monthKey]
  );

  const shipmentRows = useMemo(
    () =>
      shipments
        .filter((s) => statusFilter.size === 0 || statusFilter.has(s.status))
        .filter((s) => matches(`${s.ref} ${s.customer} ${s.receiver} ${s.route} ${s.service}`, search)),
    [shipments, statusFilter, search]
  );

  // Selection is intersected with what's actually on screen, so narrowing the
  // filter can't leave rows selected that the user can no longer see — and
  // "apply to N selected" always means the N in front of them.
  const visibleSelected = useMemo(
    () => shipmentRows.filter((s) => selected.has(s.id)).map((s) => s.id),
    [shipmentRows, selected]
  );
  const allVisibleSelected = shipmentRows.length > 0 && visibleSelected.length === shipmentRows.length;
  const customerRows = useMemo(
    () => customers.filter((c) => matches(`${c.name} ${c.phone} ${c.email} ${c.town} ${c.postcode}`, search)),
    [customers, search]
  );

  function handleStatusChange(shipmentId, status) {
    startTransition(async () => {
      await updateShipmentStatus(shipmentId, status);
      router.refresh();
    });
  }

  function toggleStatusFilter(value) {
    setStatusFilter((prev) => {
      const next = new Set(prev);
      if (next.has(value)) next.delete(value);
      else next.add(value);
      return next;
    });
    setBulkNote("");
  }

  function toggleRow(id) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
    setBulkNote("");
  }

  function toggleAllVisible() {
    setSelected((prev) => {
      const next = new Set(prev);
      if (allVisibleSelected) shipmentRows.forEach((s) => next.delete(s.id));
      else shipmentRows.forEach((s) => next.add(s.id));
      return next;
    });
    setBulkNote("");
  }

  function handleBulkApply() {
    if (!bulkStatus || visibleSelected.length === 0) return;
    startTransition(async () => {
      const result = await updateShipmentStatuses(visibleSelected, bulkStatus);
      if (result?.error) {
        setBulkNote(result.error);
        return;
      }
      setBulkNote(
        `${result.updated} ${result.updated === 1 ? "shipment" : "shipments"} set to ${bulkStatus}.`
      );
      setSelected(new Set());
      setBulkStatus("");
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
          <Link className="btn btn-green btn-sm" href="/admin/new-booking">
            + New booking
          </Link>
        </div>

        {view === "dash" && (
          <section className="admin-view">
            <h1>Dashboard</h1>
            <p className="sub">{monthLabel}</p>
            <div className="kpis">
              <div className="kpi">
                <div className="k">Active shipments</div>
                <div className="v">{active.length}</div>
                <div className="n good">
                  {active.filter((s) => s.mode === "air").length} air &middot;{" "}
                  {active.filter((s) => s.mode === "sea").length} sea
                </div>
              </div>
              <div className="kpi">
                <div className="k">Awaiting collection</div>
                <div className="v">{shipments.filter((s) => s.status === "Booked").length}</div>
                <div className="n">Booked, not yet picked up</div>
              </div>
              <div className="kpi">
                <div className="k">Bookings this month</div>
                <div className="v">{monthly.length}</div>
                <div className="n">{shipments.length} in total</div>
              </div>
              <div className="kpi">
                <div className="k">Invoiced this month</div>
                <div className="v">£{money(monthly.reduce((a, b) => a + b.total, 0))}</div>
                <div className="n">Across {monthly.length} bookings</div>
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
                        <td className="key">
                          <Link className="text-green hover:underline" href={`/admin/shipments/${s.ref}`}>
                            {s.ref}
                          </Link>
                        </td>
                        <td>{s.customer}</td>
                        <td>{s.route}</td>
                        <td><span className={statusBadgeClass(s.tone)}>{s.status}</span></td>
                        <td className="text-red">{s.flag}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {attention.length === 0 && <p className="empty">Nothing flagged right now.</p>}
            </div>
          </section>
        )}

        {view === "ship" && (
          <section className="admin-view">
            <h1>Shipments</h1>
            <p className="sub">
              {shipmentRows.length} of {shipments.length} records. Change a status and customer tracking updates.
            </p>

            {/* Statuses come from the shipment_statuses table, so this list
                follows the database rather than a hardcoded subset. Filtering
                is additive: no chip pressed means no filter. */}
            <div className="chips">
              <button
                className="chip"
                aria-pressed={statusFilter.size === 0}
                onClick={() => {
                  setStatusFilter(new Set());
                  setBulkNote("");
                }}
              >
                All
              </button>
              {statuses.map((s) => (
                <button
                  key={s.value}
                  className="chip"
                  aria-pressed={statusFilter.has(s.value)}
                  onClick={() => toggleStatusFilter(s.value)}
                >
                  {s.value}
                </button>
              ))}
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-3 rounded-[10px] border border-[#e2e7f0] bg-white px-4 py-3">
              <span className="text-[13.5px] font-semibold text-ink">
                {visibleSelected.length} selected
              </span>
              <span className="text-[13px] text-soft">
                {statusFilter.size > 0 ? "within the current filter" : "across all shipments"}
              </span>
              <select
                className="status-select"
                aria-label="Bulk status"
                value={bulkStatus}
                disabled={isPending || visibleSelected.length === 0}
                onChange={(e) => setBulkStatus(e.target.value)}
              >
                <option value="">Set status to…</option>
                {statuses.map((s) => (
                  <option key={s.value} value={s.value}>
                    {s.value}
                  </option>
                ))}
              </select>
              <button
                className="btn btn-green btn-sm"
                disabled={isPending || !bulkStatus || visibleSelected.length === 0}
                onClick={handleBulkApply}
              >
                {isPending ? "Applying…" : "Apply"}
              </button>
              {visibleSelected.length > 0 && (
                <button
                  className="btn btn-ghost btn-sm"
                  onClick={() => {
                    setSelected(new Set());
                    setBulkNote("");
                  }}
                >
                  Clear selection
                </button>
              )}
              {bulkNote && <span className="text-[13px] font-medium text-green-ink">{bulkNote}</span>}
            </div>
            <div className="pane">
              <div className="scroll">
                <table className="min-w-[1090px]">
                  <thead>
                    <tr>
                      <th className="w-10">
                        <input
                          type="checkbox"
                          className="h-4 w-4 cursor-pointer align-middle accent-green"
                          aria-label="Select all shown shipments"
                          checked={allVisibleSelected}
                          onChange={toggleAllVisible}
                        />
                      </th>
                      <th>Reference</th><th>Customer</th><th>Service</th><th>Route</th>
                      <th>Weight</th><th>Collection</th><th>Status</th>
                      <th className="num-right">Charged</th><th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {shipmentRows.map((s) => (
                      <tr key={s.id}>
                        <td>
                          <input
                            type="checkbox"
                            className="h-4 w-4 cursor-pointer align-middle accent-green"
                            aria-label={`Select ${s.ref}`}
                            checked={selected.has(s.id)}
                            onChange={() => toggleRow(s.id)}
                          />
                        </td>
                        <td className="key">
                          <Link className="text-green hover:underline" href={`/admin/shipments/${s.ref}`}>
                            {s.ref}
                          </Link>
                        </td>
                        <td>
                          {s.customerId ? (
                            <Link className="hover:text-ink hover:underline" href={`/admin/customers/${s.customerId}`}>
                              {s.customer}
                            </Link>
                          ) : (
                            s.customer
                          )}
                        </td>
                        <td>{s.service}</td>
                        <td>{s.route}</td>
                        <td>{s.weight}</td>
                        <td>{s.collection}</td>
                        <td>
                          <select
                            className="status-select"
                            value={s.status}
                            disabled={isPending}
                            onChange={(e) => handleStatusChange(s.id, e.target.value)}
                          >
                            {statuses.map((o) => (
                              <option key={o.value} value={o.value}>{o.value}</option>
                            ))}
                          </select>
                        </td>
                        <td className="num-right font-semibold">£{money(s.total)}</td>
                        <td>
                          <Link className="btn btn-ghost btn-sm whitespace-nowrap" href={`/admin/shipments/${s.ref}`}>
                            View
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {shipmentRows.length === 0 && <p className="empty">No shipments match that search or filter.</p>}
            </div>
          </section>
        )}

        {view === "cust" && (
          <section className="admin-view">
            <h1>Customers</h1>
            <p className="sub">
              {customerRows.length} {customerRows.length === 1 ? "customer" : "customers"}. One record per mobile
              number &mdash; booking again with the same number reuses it rather than creating a duplicate.
            </p>
            <div className="pane">
              <div className="scroll">
                <table className="min-w-[820px]">
                  <thead>
                    <tr>
                      <th>Name</th><th>Mobile</th><th>Email</th><th>Town</th>
                      <th className="num-right">Bookings</th>
                      <th className="num-right">Spend</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {customerRows.map((c) => (
                      <tr key={c.id}>
                        <td className="key">
                          <Link className="text-green hover:underline" href={`/admin/customers/${c.id}`}>
                            {c.name}
                          </Link>
                        </td>
                        <td>{c.phone}</td>
                        <td>{c.email}</td>
                        <td>{c.town}</td>
                        <td className="num-right">{c.bookings}</td>
                        <td className="num-right font-semibold">£{money(c.spend)}</td>
                        <td>
                          <Link className="btn btn-ghost btn-sm" href={`/admin/customers/${c.id}`}>
                            View
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {customerRows.length === 0 && <p className="empty">No customers match that search.</p>}
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
                      placeholder={mode === "sea" ? "From £1.20/kg" : "From £3.10/kg"}
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
                <div className="grid-fields mt-4">
                  <label className="field">
                    Note
                    <input
                      className="input"
                      placeholder={mode === "sea" ? "Shared container (LCL)" : "Tiered by weight"}
                      value={rateForm[mode]?.rate_note || ""}
                      onChange={(e) => updateRateField(mode, "rate_note", e.target.value)}
                    />
                  </label>
                  <label className="field">
                    Estimated time
                    <input
                      className="input"
                      placeholder={mode === "sea" ? "8–10 weeks" : "8–10 days"}
                      value={rateForm[mode]?.estimated_time || ""}
                      onChange={(e) => updateRateField(mode, "estimated_time", e.target.value)}
                    />
                  </label>
                </div>
                <p className="fine mt-2 mb-1">
                  Estimated time is shown everywhere this mode&rsquo;s delivery time appears &mdash; the homepage,
                  the {mode === "sea" ? "Sea" : "Air"} Cargo page and its departure poster, and any page that quotes
                  it. Change it once here and it updates everywhere.
                </p>
                <p className="fine mt-5 mb-1">
                  Next departure &mdash; shown as a poster banner on the {mode === "sea" ? "Sea" : "Air"} Cargo page.
                  Leave the date blank to hide it.
                </p>
                <div className="grid-fields">
                  <label className="field">
                    Next dispatch date
                    <input
                      className="input"
                      type="date"
                      value={rateForm[mode]?.next_dispatch_date || ""}
                      onChange={(e) => updateRateField(mode, "next_dispatch_date", e.target.value)}
                    />
                  </label>
                  <label className="field">
                    Dispatch note
                    <input
                      className="input"
                      placeholder={mode === "sea" ? "Karachi-bound LCL container" : "Weekly consolidated departure"}
                      value={rateForm[mode]?.next_dispatch_note || ""}
                      onChange={(e) => updateRateField(mode, "next_dispatch_note", e.target.value)}
                    />
                  </label>
                </div>
                <div className="mt-[18px] flex items-center gap-[14px]">
                  <button className="btn btn-green btn-sm" disabled={isPending} onClick={() => handleSaveRate(mode)}>
                    Save
                  </button>
                  {rateSaved[mode] && (
                    <span className="text-[13.5px] text-green-ink">Saved &mdash; live everywhere it&rsquo;s shown now.</span>
                  )}
                </div>
              </div>
            ))}
          </section>
        )}
      </main>
    </div>
  );
}
