"use client";

import { useEffect, useRef, useState } from "react";
import { BUSINESS } from "@/lib/seo";
import { PhoneIcon, EmailIcon, WhatsAppIcon } from "./contact-icons";

const HINT_INTERVAL_MS = 30000;
const HINT_VISIBLE_MS = 4500;

export default function ContactDrawer() {
  const [open, setOpen] = useState(false);
  const [hint, setHint] = useState(false);
  const openRef = useRef(open);
  const close = () => setOpen(false);

  useEffect(() => {
    openRef.current = open;
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [open]);

  // Small mobile-only nudge: every 30s, remind the visitor the numbers are
  // one tap away, since the full list is now tucked behind the drawer.
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!window.matchMedia("(max-width: 640px)").matches) return;

    let hideTimer;
    const interval = setInterval(() => {
      if (openRef.current) return;
      setHint(true);
      hideTimer = setTimeout(() => setHint(false), HINT_VISIBLE_MS);
    }, HINT_INTERVAL_MS);

    return () => {
      clearInterval(interval);
      clearTimeout(hideTimer);
    };
  }, []);

  return (
    <>
      <div className="contact-drawer-trigger-wrap">
        <div
          className={`contact-hint${hint ? " show" : ""}`}
          role="status"
          onClick={() => {
            setHint(false);
            setOpen(true);
          }}
        >
          Here are our numbers — tap to call or WhatsApp
        </div>
        <button
          type="button"
          className="contact-drawer-trigger"
          onClick={() => {
            setHint(false);
            setOpen(true);
          }}
          aria-haspopup="dialog"
        >
          <span className="row-icon"><PhoneIcon /></span>
          <span className="row-text">
            <span>Call or WhatsApp us</span>
            <span className="city">Phone, WhatsApp &amp; email</span>
          </span>
          <span className="chev" aria-hidden="true">&rsaquo;</span>
        </button>
      </div>

      <div
        className={`contact-drawer-overlay${open ? " open" : ""}`}
        onClick={close}
        aria-hidden="true"
      />
      <div
        className={`contact-drawer${open ? " open" : ""}`}
        role="dialog"
        aria-modal="true"
        aria-label="Phone numbers, WhatsApp and email"
      >
        <div className="contact-drawer-head">
          <span>Get in touch</span>
          <button type="button" className="contact-drawer-close" onClick={close} aria-label="Close">
            &times;
          </button>
        </div>
        <div className="contact-drawer-body">
          {BUSINESS.phones.map((p) => (
            <a key={p.city} href={`tel:${p.href}`} onClick={close}>
              <span className="info-icon"><PhoneIcon /></span>
              <span>
                <span className="main">{p.display}</span>
                <span className="sub">{p.city}</span>
              </span>
            </a>
          ))}
          <a href={BUSINESS.whatsapp} onClick={close}>
            <span className="info-icon wa"><WhatsAppIcon /></span>
            <span>
              <span className="main">{BUSINESS.whatsappDisplay}</span>
              <span className="sub">WhatsApp</span>
            </span>
          </a>
          <a href={`mailto:${BUSINESS.email}`} onClick={close}>
            <span className="info-icon"><EmailIcon /></span>
            <span>
              <span className="main">{BUSINESS.email}</span>
              <span className="sub">Email</span>
            </span>
          </a>
        </div>
      </div>
    </>
  );
}
