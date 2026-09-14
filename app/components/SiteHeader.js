"use client";

import { useState } from "react";
import Link from "next/link";

const NAV_ITEMS = {
  home: [
    { href: "/#services", label: "Services" },
    { href: "/#how", label: "How it works" },
    { href: "/#rates", label: "Rates" },
    { href: "/portal", label: "Track & invoices" },
    { href: "/#faq", label: "FAQ" },
  ],
  portal: [
    { href: "/#services", label: "Services" },
    { href: "/#rates", label: "Rates" },
  ],
};

export default function SiteHeader({ variant = "home" }) {
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);

  const items = NAV_ITEMS[variant] || NAV_ITEMS.home;
  const isPortal = variant === "portal";
  const subtitle = isPortal ? "Customer portal" : "UK → Pakistan freight";
  const brandHref = isPortal ? "/" : "/#top";

  return (
    <header className="site-header">
      <div className={`${isPortal ? "wrap-narrow" : "wrap"} bar`}>
        <Link className="brand" href={brandHref} onClick={close}>
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

        <nav className={`site-nav${open ? " open" : ""}`} id="site-nav">
          {items.map((item) => (
            <Link key={item.href} href={item.href} onClick={close}>
              {item.label}
            </Link>
          ))}
          <Link className="btn btn-green btn-sm" href="/#contact" onClick={close}>Get a quote</Link>
        </nav>
      </div>
    </header>
  );
}
