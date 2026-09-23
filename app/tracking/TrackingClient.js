"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { BUSINESS } from "@/lib/seo";
import { trackShipment } from "./actions";

// The full status history, newest first. Every entry is something that has
// already happened, so every row renders as done — the most recent one is the
// shipment's current position.
function Timeline({ history }) {
  if (history.length === 0) {
    return <p className="fine">No status updates recorded yet.</p>;
  }
  return (
    <div>
      {history.map((h, i) => (
        <div className="timeline-row done" key={`${h.when_label}-${i}`}>
          <div className="rail">
            <span className="dot" />
            <span className="line" />
          </div>
          <div className="body">
            <div className="lbl">
              {h.status}
              {i === 0 && <span className="badge ml-2 align-middle">Now</span>}
            </div>
            <div className="when">{h.when_label}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

function ShipmentResult({ loading, searched, shipmentKey, data }) {
  if (loading) {
    return <p className="fine mt-4">Looking up shipment…</p>;
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
  const history = data.history || [];
  // Progress is how far along the real workflow the shipment is, not how many
  // history rows exist — a shipment whose status jumped straight to "Delivered"
  // is still complete.
  const step = Number(data.step) || 0;
  const steps = Number(data.steps) || 0;
  const pct = steps ? Math.round((step / steps) * 100) : 0;

  return (
    <div className="result-grid">
      <div>
        <div className="flex flex-wrap items-baseline gap-[10px]">
          <span className="font-head text-2xl font-bold text-navy">
            {data.reference}
          </span>
          <span className="badge">{data.status}</span>
        </div>
        <p className="mt-3 text-[15px] text-muted">{data.summary}</p>
        <div className="progress"><span style={{ width: `${pct}%` }} /></div>
        <div className="mt-2 text-[13px] text-faint">
          Step {step} of {steps}
        </div>
        <dl className="meta">
          <dt>Service</dt><dd>{data.service}</dd>
          <dt>Route</dt><dd>{data.route}</dd>
          <dt>Pieces / weight</dt><dd>{data.weight_label}</dd>
        </dl>
      </div>
      <div>
        <h2 className="mb-3 text-xs font-semibold tracking-[0.08em] text-faint uppercase">Status history</h2>
        <Timeline history={history} />
      </div>
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
    <main className="wrap-narrow px-5 pt-11 pb-[72px]">
      <h1 className="text-[clamp(28px,4vw,40px)] font-extrabold">Track a shipment</h1>
      <p className="lede">
        Enter your tracking number and the sender&rsquo;s phone number used for the booking &mdash; both are
        printed on your invoice.
      </p>

      <section className="panel">
        <form
          className="row-inline"
          onSubmit={(e) => {
            e.preventDefault();
            runTrack(trackInput.trim(), phoneInput.trim());
          }}
        >
          <input
            className="input min-h-12"
            placeholder="AWB / tracking number or booking reference"
            aria-label="Tracking or booking reference"
            value={trackInput}
            onChange={(e) => setTrackInput(e.target.value)}
            required
          />
          <input
            className="input min-h-12"
            placeholder="Sender's phone number"
            aria-label="Sender's phone number"
            value={phoneInput}
            onChange={(e) => setPhoneInput(e.target.value)}
            required
          />
          <button className="btn btn-green" type="submit">Track</button>
        </form>
        <ShipmentResult loading={shipmentLoading} searched={searched} shipmentKey={trackKey} data={shipmentData} />
      </section>

      <p className="fine mt-[22px]">
        Can&rsquo;t find your shipment? <a href={BUSINESS.whatsapp}>Reach us on WhatsApp for a quick response</a> and
        we will look it up.
      </p>
    </main>
  );
}
