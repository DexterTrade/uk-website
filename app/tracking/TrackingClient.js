"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { BUSINESS } from "@/lib/seo";
import { trackShipment } from "./actions";

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

function ShipmentResult({ loading, shipmentKey, data }) {
  if (loading) {
    return <p className="fine" style={{ marginTop: 16 }}>Looking up shipment…</p>;
  }
  if (!data) {
    return (
      <p className="alert alert-error">
        No shipment found for &ldquo;{shipmentKey || ""}&rdquo;. Check the reference and try again, or{" "}
        <a href={BUSINESS.whatsapp}>message us on WhatsApp</a>.
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
        </dl>
      </div>
      <Timeline stages={stages} />
    </div>
  );
}

export default function TrackingClient() {
  const params = useSearchParams();
  const initialRef = params.get("ref") || "PC-4471";

  const [trackInput, setTrackInput] = useState(initialRef);
  const [trackKey, setTrackKey] = useState(initialRef);
  const [shipmentData, setShipmentData] = useState(null);
  const [shipmentLoading, setShipmentLoading] = useState(true);

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

  function runTrack(ref) {
    setShipmentLoading(true);
    setTrackKey(ref);
  }

  return (
    <main className="wrap-narrow" style={{ padding: "44px 20px 72px" }}>
      <h1 style={{ fontSize: "clamp(28px,4vw,40px)", fontWeight: 800 }}>Track a shipment</h1>
      <p className="lede">
        Enter your AWB / tracking number or booking reference. Demo references: <strong>PC-4471</strong>{" "}
        (air), <strong>BK-20931</strong> (sea).
      </p>

      <section className="panel">
        <form
          className="row-inline"
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
        <ShipmentResult loading={shipmentLoading} shipmentKey={trackKey} data={shipmentData} />
      </section>

      <p className="fine" style={{ marginTop: 22 }}>
        Can&rsquo;t find your reference? <a href={BUSINESS.whatsapp}>Message us on WhatsApp</a> and we will look it up.
      </p>
    </main>
  );
}
