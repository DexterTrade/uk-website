"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { SHIPMENTS, INVOICE_DETAIL } from "@/lib/data";
import { BUSINESS } from "@/lib/seo";

function Timeline({ stages }) {
  return (
    <div>
      {stages.map((s, i) => (
        <div className={`timeline-row${s.done ? " done" : ""}`} key={i}>
          <div className="rail">
            <span className="dot" />
            <span className="line" />
          </div>
          <div className="body">
            <div className="lbl">{s.label}</div>
            <div className="when">{s.when}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

function ShipmentResult({ shipmentKey, onViewInvoice }) {
  const s = SHIPMENTS[String(shipmentKey || "").trim().toUpperCase()];
  if (!s) {
    return (
      <p className="alert alert-error">
        No shipment found for &ldquo;{shipmentKey || ""}&rdquo;. Check the reference and try again.
      </p>
    );
  }
  const done = s.stages.filter((x) => x.done).length;
  const pct = Math.round((done / s.stages.length) * 100);
  return (
    <div className="result-grid">
      <div>
        <div style={{ display: "flex", gap: 10, alignItems: "baseline", flexWrap: "wrap" }}>
          <span style={{ fontFamily: "var(--font-head)", fontWeight: 700, fontSize: 24, color: "var(--navy)" }}>
            {s.ref}
          </span>
          <span className="badge">{s.status}</span>
        </div>
        <p style={{ fontSize: 15, color: "var(--muted)", marginTop: 12 }}>{s.summary}</p>
        <div className="progress"><span style={{ width: `${pct}%` }} /></div>
        <div style={{ fontSize: 13, color: "var(--faint)", marginTop: 8 }}>
          {done} of {s.stages.length} milestones complete
        </div>
        <dl className="meta">
          <dt>Service</dt><dd>{s.service}</dd>
          <dt>Route</dt><dd>{s.route}</dd>
          <dt>Pieces / weight</dt><dd>{s.weight}</dd>
          <dt>Est. delivery</dt><dd>{s.eta}</dd>
          <dt>Invoice</dt><dd>{s.invoice}</dd>
        </dl>
        <button className="btn btn-ghost" style={{ marginTop: 22 }} data-noprint onClick={() => onViewInvoice(s.invoice)}>
          View this invoice
        </button>
      </div>
      <Timeline stages={s.stages} />
    </div>
  );
}

function InvoiceResult({ invoiceKey }) {
  const inv = INVOICE_DETAIL[String(invoiceKey || "").trim().toUpperCase()];
  if (!inv) {
    return <p className="alert alert-error">No invoice found for &ldquo;{invoiceKey || ""}&rdquo;.</p>;
  }
  const badge = inv.status === "Paid" ? "badge" : "badge badge-red";
  return (
    <>
      <div className="invoice">
        <div className="head">
          <div>
            <div className="no">{inv.number}</div>
            <div className="dates">Issued {inv.issued} &middot; due {inv.due}</div>
          </div>
          <div style={{ textAlign: "right" }}>
            <span className={badge}>{inv.status}</span>
            <div className="total">&pound;{inv.total}</div>
          </div>
        </div>
        <div className="parties">
          <div>
            <div className="k">Billed to</div>
            <div className="v">{inv.customer}<br />{inv.customerCity}</div>
          </div>
          <div>
            <div className="k">Shipment</div>
            <div className="v">{inv.ref}<br />{inv.route}</div>
          </div>
        </div>
        <div className="lines">
          <table>
            <thead>
              <tr>
                <th>Description</th>
                <th className="num-right">Qty</th>
                <th className="num-right">Unit</th>
                <th className="num-right">Amount</th>
              </tr>
            </thead>
            <tbody>
              {inv.lines.map((l, i) => (
                <tr key={i}>
                  <td>{l.desc}</td>
                  <td className="num-right">{l.qty}</td>
                  <td className="num-right">&pound;{l.unit}</td>
                  <td className="num-right" style={{ fontWeight: 600 }}>&pound;{l.amount}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="foot">
          <span style={{ fontSize: 15, color: "var(--soft)" }}>Total due</span>
          <span className="t">&pound;{inv.total}</span>
        </div>
      </div>
      <div data-noprint style={{ display: "flex", gap: 12, flexWrap: "wrap", marginTop: 16 }}>
        <button className="btn btn-ghost" onClick={() => window.print()}>Print / save as PDF</button>
        <a className="btn btn-ghost" href={BUSINESS.whatsapp}>Query this invoice</a>
      </div>
    </>
  );
}

export default function PortalClient() {
  const params = useSearchParams();
  const [tab, setTab] = useState(params.get("invoice") ? "invoice" : "track");
  const [trackInput, setTrackInput] = useState(params.get("ref") || "PC-4471");
  const [trackKey, setTrackKey] = useState(params.get("ref") || "PC-4471");
  const [invoiceInput, setInvoiceInput] = useState(params.get("invoice") || "INV-10431");
  const [invoiceKey, setInvoiceKey] = useState(params.get("invoice") || "INV-10431");

  function openInvoice(number) {
    setInvoiceInput(number);
    setInvoiceKey(number);
    setTab("invoice");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <main className="wrap-narrow" style={{ padding: "44px 20px 72px" }}>
      <h1 style={{ fontSize: "clamp(28px,4vw,40px)", fontWeight: 800 }}>Track a shipment</h1>
      <p className="lede">
        Enter your AWB / tracking number or booking reference. Demo references: <strong>PC-4471</strong>{" "}
        (air), <strong>BK-20931</strong> (sea).
      </p>

      <div className="tabs" role="tablist" data-noprint>
        <button role="tab" className="tab" aria-selected={tab === "track"} onClick={() => setTab("track")}>
          Shipment status
        </button>
        <button role="tab" className="tab" aria-selected={tab === "invoice"} onClick={() => setTab("invoice")}>
          Invoices
        </button>
      </div>

      <section className={`panel${tab !== "track" ? " hidden" : ""}`}>
        <form
          className="row-inline"
          data-noprint
          onSubmit={(e) => {
            e.preventDefault();
            setTrackKey(trackInput);
          }}
        >
          <input
            className="input"
            placeholder="AWB / tracking number or booking reference"
            aria-label="Tracking or booking reference"
            style={{ minHeight: 48 }}
            value={trackInput}
            onChange={(e) => setTrackInput(e.target.value)}
          />
          <button className="btn btn-green" type="submit">Track</button>
        </form>
        <ShipmentResult shipmentKey={trackKey} onViewInvoice={openInvoice} />
      </section>

      <section className={`panel${tab !== "invoice" ? " hidden" : ""}`}>
        <h2 style={{ fontSize: 20, fontWeight: 700 }}>Look up an invoice</h2>
        <p style={{ fontSize: 14.5, color: "var(--soft)", marginTop: 6 }}>
          Demo invoices: <strong>INV-10428</strong> (paid), <strong>INV-10431</strong> (unpaid).
        </p>
        <form
          className="row-inline"
          style={{ marginTop: 18 }}
          data-noprint
          onSubmit={(e) => {
            e.preventDefault();
            setInvoiceKey(invoiceInput);
          }}
        >
          <input
            className="input"
            placeholder="Invoice number"
            aria-label="Invoice number"
            style={{ minHeight: 48 }}
            value={invoiceInput}
            onChange={(e) => setInvoiceInput(e.target.value)}
          />
          <button className="btn btn-navy" type="submit">Find invoice</button>
        </form>
        <InvoiceResult invoiceKey={invoiceKey} />
      </section>

      <p className="fine" style={{ marginTop: 22 }} data-noprint>
        Can&rsquo;t find your reference? <a href={BUSINESS.whatsapp}>Message us on WhatsApp</a> and
        we will look it up. Staff: <a href="/admin">open the admin panel</a>.
      </p>
    </main>
  );
}
