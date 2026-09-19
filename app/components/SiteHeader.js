"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { BUSINESS } from "@/lib/seo";
import { PhoneIcon } from "./contact-icons";
import { ShipIcon, PlaneIcon, SuitcaseIcon, SwapIcon, HomeIcon, PinIcon, HelpIcon } from "./nav-icons";

const NAV_ITEMS = [
  { href: "/sea-cargo", label: "Sea Cargo", Icon: ShipIcon },
  { href: "/air-cargo", label: "Air Cargo", Icon: PlaneIcon },
  { href: "/excess-baggage", label: "Excess Baggage", Icon: SuitcaseIcon },
  { href: "/pak-to-uk", label: "Pak to UK", Icon: SwapIcon },
  { href: "/moving-back-home", label: "Relocation", Icon: HomeIcon },
  { href: "/tracking", label: "Track", Icon: PinIcon },
  { href: "/faq", label: "FAQ", Icon: HelpIcon },
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
            {NAV_ITEMS.map(({ href, label, Icon }) => (
              <Link key={href} href={href} onClick={close}>
                <Icon />
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
