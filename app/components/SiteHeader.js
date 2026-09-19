"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { BUSINESS } from "@/lib/seo";
import { PhoneIcon } from "./contact-icons";

const NAV_ITEMS = [
  { href: "/sea-cargo", label: "Sea Cargo" },
  { href: "/air-cargo", label: "Air Cargo" },
  { href: "/excess-baggage", label: "Excess Baggage" },
  { href: "/pak-to-uk", label: "Pak to UK" },
  { href: "/moving-back-home", label: "Relocation" },
  { href: "/tracking", label: "Track" },
  { href: "/faq", label: "FAQ" },
];

const SUBTITLES = {
  home: "UK ⇄ Pakistan Cargo",
  tracking: "Track a shipment",
};

export default function SiteHeader({ variant = "home" }) {
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);

  const subtitle = SUBTITLES[variant] || SUBTITLES.home;

  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [open]);

  return (
    <header className="site-header">
      <div className="wrap bar">
        <Link className="brand" href="/" onClick={close}>
          <span className="mark">
            <img src="/assets/logo-mark.svg" alt="PAK Cargo logo" />
          </span>
          <span>
            <span className="name" style={{ display: "block" }}>PAK CARGO</span>
            <span className="sub">{subtitle}</span>
          </span>
        </Link>

        <button
          type="button"
          className="nav-toggle"
          aria-expanded={open}
          aria-controls="site-nav"
          aria-label={open ? "Close menu" : "Open menu"}
          onClick={() => setOpen((v) => !v)}
        >
          <span />
          <span />
          <span />
        </button>

        <div className={`nav-overlay${open ? " open" : ""}`} onClick={close} aria-hidden="true" />

        <nav className={`site-nav${open ? " open" : ""}`} id="site-nav">
          <div className="site-nav-head">
            <span className="site-nav-title">Menu</span>
          </div>
          <div className="site-nav-links">
            {NAV_ITEMS.map(({ href, label }, i) => (
              <Link key={href} href={href} onClick={close}>
                <span className="idx">{String(i + 1).padStart(2, "0")}</span>
                {label}
              </Link>
            ))}
          </div>
          <div className="site-nav-foot">
            <a className="btn btn-green btn-sm" href={BUSINESS.whatsapp} onClick={close}>
              Quick Response on WhatsApp
            </a>
            <a className="site-nav-phone" href={`tel:${BUSINESS.phones[0].href}`} onClick={close}>
              <PhoneIcon /> {BUSINESS.phones[0].display}
            </a>
          </div>
        </nav>
      </div>
    </header>
  );
}
