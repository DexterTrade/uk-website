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

function ShipmentResult({ loading, searched, shipmentKey, data }) {
  if (loading) {
    return <p className="fine" style={{ marginTop: 16 }}>Looking up shipment…</p>;
  }
  if (!searched) {
    return null;
  }
  if (!data) {
    return (
      <p className="alert alert-error">
        No shipment found for &ldquo;{shipmentKey || ""}&rdquo;. Check the reference and sender&rsquo;s
        phone number and try again, or <a href={BUSINESS.whatsapp}>reach us on WhatsApp for a quick response</a>.
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
  const initialRef = params.get("ref") || "";
  const initialPhone = params.get("phone") || "";

  const [trackInput, setTrackInput] = useState(initialRef);
  const [phoneInput, setPhoneInput] = useState(initialPhone);
  const [trackKey, setTrackKey] = useState(initialRef);
  const [phoneKey, setPhoneKey] = useState(initialPhone);
  const [shipmentData, setShipmentData] = useState(null);
  const [shipmentLoading, setShipmentLoading] = useState(Boolean(initialRef && initialPhone));
  const [searched, setSearched] = useState(false);
  const [searchNonce, setSearchNonce] = useState(initialRef && initialPhone ? 1 : 0);

  useEffect(() => {
    if (!trackKey || !phoneKey || !searchNonce) return;
    let ignore = false;
    trackShipment(trackKey, phoneKey).then((data) => {
      if (!ignore) {
        setShipmentData(data);
        setShipmentLoading(false);
        setSearched(true);
      }
    });
    return () => {
      ignore = true;
    };
  }, [trackKey, phoneKey, searchNonce]);

  function runTrack(ref, phone) {
    if (!ref || !phone) return;
    setShipmentLoading(true);
    setTrackKey(ref);
    setPhoneKey(phone);
    setSearchNonce((n) => n + 1);
  }

  return (
    <main className="wrap-narrow" style={{ padding: "44px 20px 72px" }}>
      <h1 style={{ fontSize: "clamp(28px,4vw,40px)", fontWeight: 800 }}>Track a shipment</h1>
      <p className="lede">
        Enter your AWB / tracking number or booking reference, plus the sender&rsquo;s phone number used
        for the booking. Demo: <strong>PC-4471</strong> with phone <strong>07700 900001</strong> (air), or{" "}
        <strong>BK-20931</strong> with phone <strong>07700 900002</strong> (sea).
      </p>

      <section className="panel">
        <form
          className="row-inline"
          style={{ flexWrap: "wrap" }}
          onSubmit={(e) => {
            e.preventDefault();
            runTrack(trackInput.trim(), phoneInput.trim());
          }}
        >
          <input
            className="input"
            placeholder="AWB / tracking number or booking reference"
            aria-label="Tracking or booking reference"
            style={{ minHeight: 48 }}
            value={trackInput}
            onChange={(e) => setTrackInput(e.target.value)}
            required
          />
          <input
            className="input"
            placeholder="Sender's phone number"
            aria-label="Sender's phone number"
            style={{ minHeight: 48 }}
            value={phoneInput}
            onChange={(e) => setPhoneInput(e.target.value)}
            required
          />
          <button className="btn btn-green" type="submit">Track</button>
        </form>
        <ShipmentResult loading={shipmentLoading} searched={searched} shipmentKey={trackKey} data={shipmentData} />
      </section>

      <p className="fine" style={{ marginTop: 22 }}>
        Can&rsquo;t find your shipment? <a href={BUSINESS.whatsapp}>Reach us on WhatsApp for a quick response</a> and
        we will look it up.
      </p>
    </main>
  );
}
