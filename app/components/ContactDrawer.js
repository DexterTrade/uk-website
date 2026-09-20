"use client";

import { useEffect, useRef, useState } from "react";
import { BUSINESS } from "@/lib/seo";
import { PhoneIcon, EmailIcon, WhatsAppIcon } from "./contact-icons";

const HINT_INTERVAL_MS = 20000;
const HINT_VISIBLE_MS = 4500;
const HINT_FIRST_DELAY_MS = 1200;

export default function ContactDrawer() {
  const [open, setOpen] = useState(false);
  const [hint, setHint] = useState(false);
  const openRef = useRef(open);
  const phoneSectionVisibleRef = useRef(false);
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

  // If the page has its own always-visible phone numbers section (e.g. the
  // homepage), don't nag with the hint while it's already on screen — the
  // visitor can already see the numbers directly.
  useEffect(() => {
    if (typeof window === "undefined") return;
    const el = document.getElementById("phone-numbers");
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        phoneSectionVisibleRef.current = entry.isIntersecting;
        if (entry.isIntersecting) setHint(false);
      },
      { threshold: 0.2 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // Small mobile-only nudge: shows shortly after landing (so a first-time
  // visitor immediately knows the numbers live behind this tab), then every
  // 20s afterwards while the drawer stays closed and the phone numbers
  // section (if the page has one) isn't already in view.
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!window.matchMedia("(max-width: 640px)").matches) return;

    let hideTimer;
    const showHint = () => {
      if (openRef.current) return;
      if (phoneSectionVisibleRef.current) return;
      setHint(true);
      hideTimer = setTimeout(() => setHint(false), HINT_VISIBLE_MS);
    };

    const firstTimer = setTimeout(showHint, HINT_FIRST_DELAY_MS);
    const interval = setInterval(showHint, HINT_INTERVAL_MS);

    return () => {
      clearTimeout(firstTimer);
      clearInterval(interval);
      clearTimeout(hideTimer);
    };
  }, []);

  return (
    <>
      {/* mobile-only: a small tab on the left edge instead of a full-width
          row in the hero card, so it reads as a persistent trigger rather
          than a page section */}
      <div className="fixed top-1/2 left-0 z-40 hidden -translate-y-1/2 max-[640px]:block">
        <div
          className={`absolute top-1/2 left-full ml-2 w-[210px] -translate-y-1/2 rounded-[10px] bg-ink px-[14px] py-[11px] text-[13px] leading-[1.4] font-semibold text-white shadow-[0_14px_30px_-14px_rgba(22,35,60,0.55)] transition duration-[250ms] ${
            hint ? "pointer-events-auto translate-x-0 cursor-pointer opacity-100" : "pointer-events-none -translate-x-1 opacity-0"
          }`}
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
          className="flex flex-col items-center gap-1 rounded-r-xl bg-green px-[7px] py-4 text-white shadow-[4px_0_16px_-6px_rgba(22,35,60,0.35)] transition hover:bg-green-dark"
          onClick={() => {
            setHint(false);
            setOpen(true);
          }}
          aria-haspopup="dialog"
          aria-label="Phone numbers, WhatsApp and email"
        >
          <span aria-hidden="true" className="text-lg leading-none">&rsaquo;</span>
        </button>
      </div>

      <div
        className={`fixed inset-0 z-[70] bg-[rgba(22,35,60,0.45)] backdrop-blur-[2px] transition-opacity duration-200 ${
          open ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
        }`}
        onClick={close}
        aria-hidden="true"
      />
      <div
        className={`fixed inset-y-0 left-0 z-[75] flex w-[min(84vw,320px)] flex-col rounded-[0_18px_18px_0] bg-white pb-[env(safe-area-inset-bottom,0px)] shadow-[18px_0_44px_-20px_rgba(22,35,60,0.5)] transition-transform duration-[280ms] ease-out ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
        role="dialog"
        aria-modal="true"
        aria-label="Phone numbers, WhatsApp and email"
      >
        <div className="flex flex-none items-center justify-between border-b border-line-light px-5 pt-[22px] pb-4 font-head text-base font-bold">
          <span>Get in touch</span>
          <button
            type="button"
            className="h-[34px] w-[34px] flex-none cursor-pointer rounded-full border-none bg-bg-soft text-xl leading-none text-ink"
            onClick={close}
            aria-label="Close"
          >
            &times;
          </button>
        </div>
        <div className="flex flex-col gap-[10px] overflow-y-auto px-5 pt-[18px] pb-[26px]">
          {BUSINESS.phones.map((p) => (
            <a
              key={p.city}
              href={`tel:${p.href}`}
              onClick={close}
              className="flex items-center gap-[13px] rounded-xl border-[1.5px] border-line px-[14px] py-3 text-ink transition hover:border-green hover:bg-green-soft"
            >
              <span className="flex h-9 w-9 flex-none items-center justify-center rounded-full bg-green-soft text-green">
                <PhoneIcon className="h-[17px] w-[17px]" />
              </span>
              <span>
                <span className="block text-[15.5px] font-bold">{p.display}</span>
                <span className="mt-0.5 block text-xs font-medium tracking-[0.05em] text-faint uppercase">{p.city}</span>
              </span>
            </a>
          ))}
          <a
            href={BUSINESS.whatsapp}
            onClick={close}
            className="flex items-center gap-[13px] rounded-xl border-[1.5px] border-line px-[14px] py-3 text-ink transition hover:border-green hover:bg-green-soft"
          >
            <span className="flex h-9 w-9 flex-none items-center justify-center rounded-full bg-green text-white">
              <WhatsAppIcon className="h-[17px] w-[17px]" />
            </span>
            <span>
              <span className="block text-[15.5px] font-bold">{BUSINESS.whatsappDisplay}</span>
              <span className="mt-0.5 block text-xs font-medium tracking-[0.05em] text-faint uppercase">WhatsApp</span>
            </span>
          </a>
          <a
            href={`mailto:${BUSINESS.email}`}
            onClick={close}
            className="flex items-center gap-[13px] rounded-xl border-[1.5px] border-line px-[14px] py-3 text-ink transition hover:border-green hover:bg-green-soft"
          >
            <span className="flex h-9 w-9 flex-none items-center justify-center rounded-full bg-green-soft text-green">
              <EmailIcon className="h-[17px] w-[17px]" />
            </span>
            <span>
              <span className="block text-[15.5px] font-bold">{BUSINESS.email}</span>
              <span className="mt-0.5 block text-xs font-medium tracking-[0.05em] text-faint uppercase">Email</span>
            </span>
          </a>
        </div>
      </div>
    </>
  );
}
