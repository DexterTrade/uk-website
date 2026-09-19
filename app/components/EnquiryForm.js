"use client";

import { useState } from "react";

export default function EnquiryForm() {
  const [sent, setSent] = useState(false);

  function handleSubmit(e) {
    e.preventDefault();
    setSent(true);
  }

  return (
    <form style={{ display: "flex", flexDirection: "column", gap: 14 }} onSubmit={handleSubmit}>
      <label className="field">
        Your name
        <input className="input" name="name" required />
      </label>
      <label className="field">
        Phone or email
        <input className="input" name="contact" required />
      </label>
      <div className="grid-fields">
        <label className="field">
          Service
          <select className="select" name="service">
            <option>Air cargo</option>
            <option>Sea freight</option>
            <option>Not sure yet</option>
          </select>
        </label>
        <label className="field">
          Weight / volume
          <input className="input" name="weight" placeholder="e.g. 40 kg" />
        </label>
      </div>
      <label className="field">
        Collection postcode &amp; destination city
        <input className="input" name="route" placeholder="e.g. B10 &rarr; Lahore" />
      </label>
      <label className="field">
        What are you sending?
        <textarea className="textarea" name="details" rows={3} />
      </label>
      <button className="btn btn-navy" type="submit">Send enquiry</button>
      {sent && (
        <p className="alert alert-ok">
          Thank you &mdash; your enquiry is ready to send. Connect this form to your inbox or API route and we will reply the same working day.
        </p>
      )}
    </form>
  );
}
