"use client";

import { useEffect, useState } from "react";
import { BUSINESS } from "@/lib/seo";
import { PhoneIcon, EmailIcon } from "./contact-icons";

export default function ContactDrawer() {
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);

  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [open]);

  return (
    <>
      <button
        type="button"
        className="contact-drawer-trigger"
        onClick={() => setOpen(true)}
        aria-haspopup="dialog"
      >
        <span className="row-icon"><PhoneIcon /></span>
        <span className="row-text">
          <span>Phone numbers</span>
          <span className="city">{BUSINESS.phones.length} UK branches</span>
        </span>
        <span className="chev" aria-hidden="true">&rsaquo;</span>
      </button>

      <div
        className={`contact-drawer-overlay${open ? " open" : ""}`}
        onClick={close}
        aria-hidden="true"
      />
      <div
        className={`contact-drawer${open ? " open" : ""}`}
        role="dialog"
        aria-modal="true"
        aria-label="Phone numbers and email"
      >
        <div className="contact-drawer-head">
          <span>Call a branch</span>
          <button type="button" className="contact-drawer-close" onClick={close} aria-label="Close">
            &times;
          </button>
        </div>
        <div className="hero-contact-list contact-drawer-body">
          {BUSINESS.phones.map((p) => (
            <a key={p.city} href={`tel:${p.href}`} onClick={close}>
              <span className="row-icon"><PhoneIcon /></span>
              <span className="row-text">
                <span>{p.display}</span>
                <span className="city">{p.city}</span>
              </span>
            </a>
          ))}
          <a href={`mailto:${BUSINESS.email}`} onClick={close}>
            <span className="row-icon"><EmailIcon /></span>
            <span className="row-text">
              <span>{BUSINESS.email}</span>
              <span className="city">Email</span>
            </span>
          </a>
        </div>
      </div>
    </>
  );
}
