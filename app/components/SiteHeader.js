"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

const NAV_ITEMS = [
  { href: "/sea-cargo", label: "Sea Cargo" },
  { href: "/air-cargo", label: "Air Cargo" },
  { href: "/excess-baggage", label: "Excess Baggage" },
  { href: "/pak-to-uk", label: "Pak to UK" },
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
          {NAV_ITEMS.map((item) => (
            <Link key={item.href} href={item.href} onClick={close}>
              {item.label}
            </Link>
          ))}
          <Link className="btn btn-green btn-sm" href="/contact-us" onClick={close}>Get a quote</Link>
        </nav>
      </div>
    </header>
  );
}
