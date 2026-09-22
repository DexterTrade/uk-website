"use client";

import { useCallback, useEffect, useMemo, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { money, statusBadgeClass } from "@/lib/data";
import {
  getInvoicePreview,
  signOutAction,
  updateRate,
  updateShipmentStatus,
  updateShipmentStatuses,
} from "./actions";
import InvoiceDocument from "./InvoiceDocument";
import RangeSlider from "./RangeSlider";
import Toast from "./Toast";

// No Invoices tab: an invoice is 1:1 with its shipment and is shown in full on
// the shipment detail page, so a separate list would be the same rows twice.
const NAV = [
  { key: "dash", label: "Dashboard" },
  { key: "ship", label: "Shipments" },
  { key: "cust", label: "Customers" },
  { key: "rates", label: "Rates" },
];

const matches = (text, q) => !q.trim() || text.toLowerCase().indexOf(q.trim().toLowerCase()) !== -1;

// Dates are sliders too, so they travel as whole days since the epoch —
// an integer the range input can step through, converted back for display.
const DAY_MS = 86400000;
const toDay = (iso) => (iso ? Math.round(Date.parse(`${iso}T00:00:00Z`) / DAY_MS) : NaN);
const dayLabel = (day) =>
  new Date(day * DAY_MS).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "2-digit" });

// A range the user hasn't touched spans the whole of the data; one they have
// is still clamped, because reloading can move the bounds underneath it.
const clampRange = (range, [min, max]) =>
  range === null
    ? [min, max]
    : [Math.max(Math.min(range[0], max), min), Math.min(Math.max(range[1], min), max)];

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

  // "" means no filter on that field.
  const [statusFilter, setStatusFilter] = useState("");
  const [serviceFilter, setServiceFilter] = useState("");
  // Ranges are null until touched, meaning "the full span". Storing it that
  // way rather than seeding with the bounds avoids having to resync state
  // every time the shipment list reloads and the bounds move.
  const [dateRange, setDateRange] = useState(null);
  const [priceRange, setPriceRange] = useState(null);
  const [weightRange, setWeightRange] = useState(null);

  const [selected, setSelected] = useState(() => new Set());
  const [bulkStatus, setBulkStatus] = useState("");

  // { reference, data } — data is null while the invoice is being fetched.
  const [preview, setPreview] = useState(null);

  const [toast, setToast] = useState(null);
  const toastTimer = useRef(null);

  // One toast at a time: a new message replaces the previous one and restarts
  // the timer, rather than queueing behind it.
  const showToast = useCallback((message, tone = "ok") => {
    clearTimeout(toastTimer.current);
    setToast({ message, tone, id: Date.now() });
    toastTimer.current = setTimeout(() => setToast(null), 4000);
  }, []);

  const dismissToast = useCallback(() => {
    clearTimeout(toastTimer.current);
    setToast(null);
  }, []);

  useEffect(() => () => clearTimeout(toastTimer.current), []);

  useEffect(() => {
    if (!preview) return undefined;
    const onKey = (e) => {
      if (e.key === "Escape") setPreview(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [preview]);

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

  // Derived from the statuses table rather than naming a status in code: the
  // first is the earliest stage and the last is the terminal one, so renaming
  // or reordering statuses in the database doesn't silently zero these.
  const firstStatus = statuses[0]?.value ?? "";
  const finalStatus = statuses[statuses.length - 1]?.value ?? "";

  const active = useMemo(
    () => shipments.filter((s) => s.status !== finalStatus),
    [shipments, finalStatus]
  );
  const attention = useMemo(() => shipments.filter((s) => s.flag), [shipments]);

  // monthKey ("2026-09") comes from the server so this follows the calendar
  // instead of matching a hardcoded month name.
  const monthly = useMemo(
    () => invoices.filter((i) => (i.issuedISO || "").startsWith(monthKey)),
    [invoices, monthKey]
  );

  // Slider bounds come from the data itself, so the handles always span
  // exactly what exists rather than an arbitrary hardcoded ceiling.
  const bounds = useMemo(() => {
    const days = shipments.map((s) => toDay(s.collectionISO)).filter((n) => Number.isFinite(n));
    const prices = shipments.map((s) => s.total);
    const weights = shipments.map((s) => s.weightKg);
    return {
      date: [days.length ? Math.min(...days) : 0, days.length ? Math.max(...days) : 0],
      price: [0, prices.length ? Math.ceil(Math.max(...prices)) : 0],
      weight: [0, weights.length ? Math.ceil(Math.max(...weights)) : 0],
    };
  }, [shipments]);

  const dateValue = clampRange(dateRange, bounds.date);
  const priceValue = clampRange(priceRange, bounds.price);
  const weightValue = clampRange(weightRange, bounds.weight);

  const filtersActive =
    Boolean(statusFilter) ||
    Boolean(serviceFilter) ||
    dateRange !== null ||
    priceRange !== null ||
    weightRange !== null;

  const shipmentRows = useMemo(
    () =>
      shipments
        .filter((s) => !statusFilter || s.status === statusFilter)
        .filter((s) => !serviceFilter || s.mode === serviceFilter)
        .filter((s) => {
          const day = toDay(s.collectionISO);
          return !Number.isFinite(day) || (day >= dateValue[0] && day <= dateValue[1]);
        })
        .filter((s) => s.total >= priceValue[0] && s.total <= priceValue[1])
        .filter((s) => s.weightKg >= weightValue[0] && s.weightKg <= weightValue[1])
        .filter((s) => matches(`${s.ref} ${s.customer} ${s.receiver} ${s.route} ${s.service}`, search)),
    [shipments, statusFilter, serviceFilter, dateValue, priceValue, weightValue, search]
  );

  // Selection is intersected with what's actually on screen, so narrowing the
  // filter can't leave rows selected that the user can no longer see — and
  // "apply to N selected" always means the N in front of them.
  const visibleSelected = useMemo(
    () => shipmentRows.filter((s) => selected.has(s.id)).map((s) => s.id),
    [shipmentRows, selected]
  );
  const allVisibleSelected = shipmentRows.length > 0 && visibleSelected.length === shipmentRows.length;

  // Bulk edit is for several rows at once; a single shipment is changed with
  // the status dropdown in its own row.
  const canBulkEdit = visibleSelected.length >= 2;
  const customerRows = useMemo(
    () => customers.filter((c) => matches(`${c.name} ${c.phone} ${c.email} ${c.town} ${c.postcode}`, search)),
    [customers, search]
  );

  function handleStatusChange(shipmentId, reference, status) {
    startTransition(async () => {
      const result = await updateShipmentStatus(shipmentId, status);
      if (result?.error) {
        showToast(result.error, "error");
        return;
      }
      showToast(`${reference} updated to ${status}.`);
      router.refresh();
    });
  }

  function openPreview(reference) {
    setPreview({ reference, data: null });
    startTransition(async () => {
      const result = await getInvoicePreview(reference);
      if (result?.error) {
        setPreview(null);
        showToast(result.error, "error");
        return;
      }
      setPreview({ reference, data: result.data });
    });
  }

  function resetFilters() {
    setStatusFilter("");
    setServiceFilter("");
    setDateRange(null);
    setPriceRange(null);
    setWeightRange(null);
  }

  function toggleRow(id) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleAllVisible() {
    setSelected((prev) => {
      const next = new Set(prev);
      if (allVisibleSelected) shipmentRows.forEach((s) => next.delete(s.id));
      else shipmentRows.forEach((s) => next.add(s.id));
      return next;
    });
  }

  function handleBulkApply() {
    if (!bulkStatus || !canBulkEdit) return;
    startTransition(async () => {
      const result = await updateShipmentStatuses(visibleSelected, bulkStatus);
      if (result?.error) {
        showToast(result.error, "error");
        return;
      }
      showToast(`${result.updated} shipments updated to ${bulkStatus}.`);
      setSelected(new Set());
      setBulkStatus("");
      router.refresh();
    });
  }

  function updateRateField(mode, field, value) {
    setRateForm((prev) => ({ ...prev, [mode]: { ...prev[mode], [field]: value } }));
  }

  function handleSaveRate(mode) {
    startTransition(async () => {
      const result = await updateRate(mode, rateForm[mode]);
      if (result?.error) {
        showToast(result.error, "error");
        return;
      }
      showToast(`${mode === "sea" ? "Sea" : "Air"} cargo rates saved — live everywhere they're shown.`);
      router.refresh();
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
                <div className="k">Awaiting dispatch</div>
                <div className="v">{shipments.filter((s) => s.status === firstStatus).length}</div>
                <div className="n">{firstStatus}, not yet moved on</div>
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

            <div className="mt-5 rounded-[10px] border border-[#e2e7f0] bg-white px-5 py-[18px]">
              <div className="grid-fields">
                {/* Statuses come from the shipment_statuses table, so this
                    follows the database rather than a hardcoded list. */}
                <label className="field">
                  Status
                  <select
                    className="select"
                    value={statusFilter}
                    onChange={(e) => {
                      setStatusFilter(e.target.value);
                    }}
                  >
                    <option value="">All statuses</option>
                    {statuses.map((s) => (
                      <option key={s.value} value={s.value}>
                        {s.value}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="field">
                  Service
                  <select
                    className="select"
                    value={serviceFilter}
                    onChange={(e) => {
                      setServiceFilter(e.target.value);
                    }}
                  >
                    <option value="">Air and sea</option>
                    <option value="air">Air cargo</option>
                    <option value="sea">Sea cargo</option>
                  </select>
                </label>
              </div>

              <div className="mt-6 grid grid-cols-[repeat(auto-fit,minmax(240px,1fr))] gap-x-8 gap-y-6">
                <RangeSlider
                  label="Collection date"
                  min={bounds.date[0]}
                  max={bounds.date[1]}
                  value={dateValue}
                  onChange={setDateRange}
                  format={dayLabel}
                  disabled={bounds.date[0] === bounds.date[1]}
                />
                <RangeSlider
                  label="Price charged"
                  min={bounds.price[0]}
                  max={bounds.price[1]}
                  value={priceValue}
                  onChange={setPriceRange}
                  format={(v) => `£${money(v)}`}
                  disabled={bounds.price[0] === bounds.price[1]}
                />
                <RangeSlider
                  label="Parcel weight"
                  min={bounds.weight[0]}
                  max={bounds.weight[1]}
                  value={weightValue}
                  onChange={setWeightRange}
                  format={(v) => `${v} kg`}
                  disabled={bounds.weight[0] === bounds.weight[1]}
                />
              </div>

              {filtersActive && (
                <button className="btn btn-ghost btn-sm mt-5" onClick={resetFilters}>
                  Reset filters
                </button>
              )}
            </div>

            {/* The controls appear only once there is a multi-row selection to
                act on; below that the bar explains what's missing instead of
                offering a disabled dropdown with no reason given. */}
            <div className="mt-4 flex min-h-[58px] flex-wrap items-center gap-3 rounded-[10px] border border-[#e2e7f0] bg-white px-4 py-3">
              {canBulkEdit ? (
                <>
                  <span className="text-[13.5px] font-semibold text-ink">
                    {visibleSelected.length} selected
                  </span>
                  <span className="text-[13px] text-soft">
                    {filtersActive ? "within the current filter" : "across all shipments"}
                  </span>
                  <select
                    className="status-select"
                    aria-label="Bulk status"
                    value={bulkStatus}
                    disabled={isPending}
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
                    disabled={isPending || !bulkStatus}
                    onClick={handleBulkApply}
                  >
                    {isPending ? "Applying…" : "Apply to all selected"}
                  </button>
                  <button className="btn btn-ghost btn-sm" onClick={() => setSelected(new Set())}>
                    Clear selection
                  </button>
                </>
              ) : (
                <p className="text-[13.5px] font-medium text-red">
                  Select multiple shipments to bulk update the status.
                  {visibleSelected.length === 1 && (
                    <span className="ml-1 font-normal text-soft">
                      One is selected — change a single shipment with the status dropdown in its row.
                    </span>
                  )}
                </p>
              )}
            </div>
            <div className="pane">
              <div className="scroll">
                <table className="min-w-[1240px]">
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
                      <th>Receiver</th><th>Weight</th><th>Collection</th><th>Status</th>
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
                        <td>{s.receiver}</td>
                        <td>{s.weight}</td>
                        <td>{s.collection}</td>
                        <td>
                          <select
                            className="status-select"
                            value={s.status}
                            disabled={isPending}
                            onChange={(e) => handleStatusChange(s.id, s.ref, e.target.value)}
                          >
                            {statuses.map((o) => (
                              <option key={o.value} value={o.value}>{o.value}</option>
                            ))}
                          </select>
                        </td>
                        <td className="num-right font-semibold">£{money(s.total)}</td>
                        <td>
                          <div className="flex gap-2">
                            <Link
                              className="btn btn-ghost btn-sm whitespace-nowrap"
                              href={`/admin/shipments/${s.ref}`}
                            >
                              View
                            </Link>
                            <button
                              className="btn btn-ghost btn-sm whitespace-nowrap"
                              onClick={() => openPreview(s.ref)}
                            >
                              Invoice
                            </button>
                          </div>
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
                </div>
              </div>
            ))}
          </section>
        )}
      </main>

      {preview && (
        <div
          className="invoice-overlay fixed inset-0 z-50 flex items-start justify-center overflow-auto bg-ink/50 px-5 py-8 backdrop-blur-[2px]"
          onClick={(e) => {
            if (e.target === e.currentTarget) setPreview(null);
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-label={`Invoice ${preview.reference}`}
            className="w-full max-w-[860px] overflow-hidden rounded-xl bg-white shadow-[0_30px_70px_-30px_rgba(22,35,60,0.6)]"
          >
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line px-5 py-[13px] print:hidden-force">
              <span className="font-head text-[15px] font-bold text-ink">
                Invoice preview &middot; {preview.reference}
              </span>
              <div className="flex flex-wrap gap-[10px]">
                <button
                  className="btn btn-green btn-sm"
                  disabled={!preview.data}
                  onClick={() => window.print()}
                >
                  Download PDF
                </button>
                <button className="btn btn-ghost btn-sm" onClick={() => setPreview(null)}>
                  Close
                </button>
              </div>
            </div>
            {preview.data ? (
              <InvoiceDocument {...preview.data} />
            ) : (
              <p className="px-6 py-16 text-center text-[15px] text-soft">Loading invoice…</p>
            )}
          </div>
        </div>
      )}

      <Toast toast={toast} onDismiss={dismissToast} />
    </div>
  );
}
