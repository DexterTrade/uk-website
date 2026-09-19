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
    <header className="sticky top-0 z-50 border-b border-[#e6eaf2] bg-white/94 backdrop-blur-[10px]">
      <div className="wrap flex items-center gap-5 py-[10px]">
        <Link className="flex items-center gap-[10px]" href="/" onClick={close}>
          <span className="flex h-11 w-11 flex-none items-center justify-center">
            <img className="h-full w-full object-contain" src="/assets/logo-mark.svg" alt="PAK Cargo logo" />
          </span>
          <span>
            <span className="block font-head text-[19px] leading-[1.05] font-extrabold text-green">PAK CARGO</span>
            <span className="text-[10.5px] font-medium tracking-[0.14em] text-soft uppercase max-[420px]:hidden">
              {subtitle}
            </span>
          </span>
        </Link>

        <button
          type="button"
          className="ml-auto hidden h-11 w-11 flex-none cursor-pointer flex-col items-center justify-center gap-1 rounded-md border-[1.5px] border-[#d7deea] bg-white max-[1120px]:relative max-[1120px]:z-[56] max-[1120px]:flex"
          aria-expanded={open}
          aria-controls="site-nav"
          aria-label={open ? "Close menu" : "Open menu"}
          onClick={() => setOpen((v) => !v)}
        >
          <span
            className={`block h-0.5 w-5 rounded-sm bg-ink transition duration-200 ${open ? "translate-y-[6px] rotate-45" : ""}`}
          />
          <span className={`block h-0.5 w-5 rounded-sm bg-ink transition duration-200 ${open ? "opacity-0" : ""}`} />
          <span
            className={`block h-0.5 w-5 rounded-sm bg-ink transition duration-200 ${open ? "-translate-y-[6px] -rotate-45" : ""}`}
          />
        </button>

        <div
          className={`fixed inset-0 z-40 bg-[rgba(22,35,60,0.45)] backdrop-blur-[2px] transition-opacity duration-200 ${open ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"}`}
          onClick={close}
          aria-hidden="true"
        />

        <nav
          className={`ml-auto flex flex-wrap items-center justify-end gap-[18px] max-[1120px]:fixed max-[1120px]:inset-y-0 max-[1120px]:right-0 max-[1120px]:z-[45] max-[1120px]:ml-0 max-[1120px]:flex max-[1120px]:w-[min(88vw,360px)] max-[1120px]:flex-col max-[1120px]:items-stretch max-[1120px]:justify-start max-[1120px]:gap-0 max-[1120px]:overflow-y-auto max-[1120px]:rounded-[22px_0_0_22px] max-[1120px]:bg-white max-[1120px]:pt-[84px] max-[1120px]:px-7 max-[1120px]:pb-[calc(28px_+_env(safe-area-inset-bottom,0px))] max-[1120px]:shadow-[-22px_0_50px_-22px_rgba(22,35,60,0.5)] max-[1120px]:transition-transform max-[1120px]:duration-[320ms] max-[1120px]:ease-[cubic-bezier(0.22,1,0.36,1)] ${open ? "" : "max-[1120px]:translate-x-full"}`}
          id="site-nav"
        >
          <div className="hidden max-[1120px]:mb-[10px] max-[1120px]:flex max-[1120px]:items-center max-[1120px]:pb-5">
            <span className="font-head text-[11.5px] font-bold tracking-[0.22em] text-faint uppercase">Menu</span>
          </div>
          <div className="contents max-[1120px]:flex max-[1120px]:flex-1 max-[1120px]:flex-col">
            {NAV_ITEMS.map(({ href, label }, i) => (
              <Link
                key={href}
                href={href}
                onClick={close}
                className="group text-sm font-medium text-ink hover:text-green active:text-green max-[1120px]:flex max-[1120px]:items-baseline max-[1120px]:gap-4 max-[1120px]:px-0.5 max-[1120px]:py-[15px] max-[1120px]:font-head max-[1120px]:text-xl max-[1120px]:font-bold max-[1120px]:tracking-[-0.01em] max-[1120px]:transition-[color,gap] max-[1120px]:duration-[180ms] max-[1120px]:hover:gap-5 max-[1120px]:active:gap-5"
              >
                <span className="hidden text-xs font-semibold tracking-[0.03em] text-faint group-hover:text-green max-[1120px]:inline">
                  {String(i + 1).padStart(2, "0")}
                </span>
                {label}
              </Link>
            ))}
          </div>
          <div className="hidden max-[1120px]:mt-[14px] max-[1120px]:flex max-[1120px]:flex-col max-[1120px]:gap-3 max-[1120px]:border-t max-[1120px]:border-line-light max-[1120px]:pt-[18px]">
            <a className="btn btn-green btn-sm w-full" href={BUSINESS.whatsapp} onClick={close}>
              Quick Response on WhatsApp
            </a>
            <a
              className="flex items-center justify-center gap-2 p-1 text-[14.5px] font-semibold text-ink"
              href={`tel:${BUSINESS.phones[0].href}`}
              onClick={close}
            >
              <PhoneIcon className="flex-none text-green" /> {BUSINESS.phones[0].display}
            </a>
          </div>
        </nav>
      </div>
    </header>
  );
}
