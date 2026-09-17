"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { BUSINESS } from "@/lib/seo";
import { trackShipment, lookupInvoice } from "./actions";

function formatLongDate(dateStr) {
  if (!dateStr) return "—";
  return new Date(`${dateStr}T00:00:00Z`).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

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
            <div className="when">{s.when_label}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

function ShipmentResult({ loading, shipmentKey, data, onViewInvoice }) {
  if (loading) {
    return <p className="fine" style={{ marginTop: 16 }}>Looking up shipment…</p>;
  }
  if (!data) {
    return (
      <p className="alert alert-error">
        No shipment found for &ldquo;{shipmentKey || ""}&rdquo;. Check the reference and try again.
      </p>
    );
  }
  const stages = data.stages || [];
  const done = stages.filter((x) => x.done).length;
  const pct = stages.length ? Math.round((done / stages.length) * 100) : 0;

  return (
    <div className="result-grid">
      <div>
        <div style={{ display: "flex", gap: 10, alignItems: "baseline", flexWrap: "wrap" }}>
          <span style={{ fontFamily: "var(--font-head)", fontWeight: 700, fontSize: 24, color: "var(--navy)" }}>
            {data.reference}
          </span>
          <span className="badge">{data.status}</span>
        </div>
        <p style={{ fontSize: 15, color: "var(--muted)", marginTop: 12 }}>{data.summary}</p>
        <div className="progress"><span style={{ width: `${pct}%` }} /></div>
        <div style={{ fontSize: 13, color: "var(--faint)", marginTop: 8 }}>
          {done} of {stages.length} milestones complete
        </div>
        <dl className="meta">
          <dt>Service</dt><dd>{data.service}</dd>
          <dt>Route</dt><dd>{data.route}</dd>
          <dt>Pieces / weight</dt><dd>{data.weight_label}</dd>
          <dt>Est. delivery</dt><dd>{data.eta_label || "—"}</dd>
          <dt>Invoice</dt><dd>{data.invoice_number || "—"}</dd>
        </dl>
        {data.invoice_number && (
          <button className="btn btn-ghost" style={{ marginTop: 22 }} data-noprint onClick={() => onViewInvoice(data.invoice_number)}>
            View this invoice
          </button>
        )}
      </div>
      <Timeline stages={stages} />
    </div>
  );
}

function InvoiceResult({ loading, invoiceKey, data }) {
  if (loading) {
    return <p className="fine" style={{ marginTop: 16 }}>Looking up invoice…</p>;
  }
  if (!data) {
    return <p className="alert alert-error">No invoice found for &ldquo;{invoiceKey || ""}&rdquo;.</p>;
  }
  const badge = data.status === "Paid" ? "badge" : "badge badge-red";
  const total = Number(data.total).toFixed(2);

  return (
    <>
      <div className="invoice">
        <div className="head">
          <div>
            <div className="no">{data.number}</div>
            <div className="dates">Issued {formatLongDate(data.issued_date)} &middot; due {formatLongDate(data.due_date)}</div>
          </div>
          <div style={{ textAlign: "right" }}>
            <span className={badge}>{data.status}</span>
            <div className="total">&pound;{total}</div>
          </div>
        </div>
        <div className="parties">
          <div>
            <div className="k">Billed to</div>
            <div className="v">{data.customer_name}<br />{data.customer_city || ""}</div>
          </div>
          <div>
            <div className="k">Shipment</div>
            <div className="v">{data.shipment_reference || "—"}<br />{data.route || ""}</div>
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
              {(data.lines || []).map((l, i) => (
                <tr key={i}>
                  <td>{l.description}</td>
                  <td className="num-right">{l.qty}</td>
                  <td className="num-right">&pound;{Number(l.unit_price).toFixed(2)}</td>
                  <td className="num-right" style={{ fontWeight: 600 }}>&pound;{Number(l.amount).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="foot">
          <span style={{ fontSize: 15, color: "var(--soft)" }}>Total due</span>
          <span className="t">&pound;{total}</span>
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
  const initialRef = params.get("ref") || "PC-4471";
  const initialInvoice = params.get("invoice") || "INV-10431";

  const [tab, setTab] = useState(params.get("invoice") ? "invoice" : "track");

  const [trackInput, setTrackInput] = useState(initialRef);
  const [trackKey, setTrackKey] = useState(initialRef);
  const [shipmentData, setShipmentData] = useState(null);
  const [shipmentLoading, setShipmentLoading] = useState(true);

  const [invoiceInput, setInvoiceInput] = useState(initialInvoice);
  const [invoiceKey, setInvoiceKey] = useState(initialInvoice);
  const [invoiceData, setInvoiceData] = useState(null);
  const [invoiceLoading, setInvoiceLoading] = useState(true);

  useEffect(() => {
    let ignore = false;
    trackShipment(trackKey).then((data) => {
      if (!ignore) {
        setShipmentData(data);
        setShipmentLoading(false);
      }
    });
    return () => {
      ignore = true;
    };
  }, [trackKey]);

  useEffect(() => {
    let ignore = false;
    lookupInvoice(invoiceKey).then((data) => {
      if (!ignore) {
        setInvoiceData(data);
        setInvoiceLoading(false);
      }
    });
    return () => {
      ignore = true;
    };
  }, [invoiceKey]);

  function runTrack(ref) {
    setShipmentLoading(true);
    setTrackKey(ref);
  }

  function runLookupInvoice(number) {
    setInvoiceLoading(true);
    setInvoiceKey(number);
  }

  function openInvoice(number) {
    setInvoiceInput(number);
    runLookupInvoice(number);
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
            runTrack(trackInput);
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
        <ShipmentResult loading={shipmentLoading} shipmentKey={trackKey} data={shipmentData} onViewInvoice={openInvoice} />
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
            runLookupInvoice(invoiceInput);
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
        <InvoiceResult loading={invoiceLoading} invoiceKey={invoiceKey} data={invoiceData} />
      </section>

      <p className="fine" style={{ marginTop: 22 }} data-noprint>
        Can&rsquo;t find your reference? <a href={BUSINESS.whatsapp}>Message us on WhatsApp</a> and
        we will look it up. Staff: <a href="/admin">open the admin panel</a>.
      </p>
    </main>
  );
}
