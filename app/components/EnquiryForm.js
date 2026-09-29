"use client";

import { useState } from "react";
import { BUSINESS } from "@/lib/seo";

// wa.me rather than web.whatsapp.com: this is a customer, who almost certainly
// has the app and almost certainly has no WhatsApp Web session to drop into.
// (The admin panel picks per device, because staff do have one.)
const WHATSAPP_NUMBER = BUSINESS.whatsapp.replace(/^https:\/\/wa\.me\//, "");

export default function EnquiryForm() {
  // Holds the composed link so the message can be reopened by hand if the tab
  // was blocked or WhatsApp never came up.
  const [chatUrl, setChatUrl] = useState(null);

  function handleSubmit(e) {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const field = (name) => String(data.get(name) || "").trim();

    const lines = [
      "New enquiry from the website",
      "",
      `Name: ${field("name")}`,
      `Contact: ${field("contact")}`,
      `Service: ${field("service")}`,
    ];
    if (field("weight")) lines.push(`Weight / volume: ${field("weight")}`);
    if (field("route")) lines.push(`Collection & destination: ${field("route")}`);
    if (field("details")) lines.push("", `Sending: ${field("details")}`);

    const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(lines.join("\n"))}`;

    // A submit button is not an <a>, so the site-wide contact listener never
    // sees this one — it has to report itself.
    window.gtag_report_conversion?.();

    // Opened synchronously inside the submit with nothing awaited first, or
    // the browser counts it as an unrequested popup and blocks it.
    const opened = window.open(url, "_blank", "noopener,noreferrer");
    if (!opened) window.location.href = url;
    setChatUrl(url);
  }

  return (
    <form className="flex flex-col gap-3.5" onSubmit={handleSubmit}>
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
      <button className="btn btn-green" type="submit">Send enquiry on WhatsApp</button>
      <p className="fine">
        Opens WhatsApp with your details filled in &mdash; press send there and we reply the same working day.
      </p>
      {chatUrl && (
        <p className="alert alert-ok" role="status">
          WhatsApp should be opening with your enquiry ready.{" "}
          <strong>Press send in WhatsApp to deliver it.</strong> If nothing opened,{" "}
          <a href={chatUrl} target="_blank" rel="noopener noreferrer" data-no-conversion>
            open the chat here
          </a>
          .
        </p>
      )}
    </form>
  );
}
