"use client";

import { useEffect, useRef } from "react";
import { TRUSTPILOT } from "@/lib/seo";

const SCRIPT_SRC = "https://widget.trustpilot.com/bootstrap/v5/tp.widget.bootstrap.min.js";

function loadScript() {
  if (document.querySelector(`script[src="${SCRIPT_SRC}"]`)) return Promise.resolve();
  return new Promise((resolve) => {
    const s = document.createElement("script");
    s.src = SCRIPT_SRC;
    s.async = true;
    s.onload = resolve;
    document.body.appendChild(s);
  });
}

// Trustpilot TrustBox, placed beside the main calls to action. Off until
// TRUSTPILOT in lib/seo.js is enabled and filled in — and deliberately no
// AggregateRating/Review schema alongside it, which Google ignores for a
// business marking up its own reviews.
//
// The widget script only loads once the strip scrolls near the viewport, so it
// never competes with the page's largest paint, and the box has a fixed height
// so the late-arriving widget can't shift the layout.
export default function ReviewStrip() {
  const ref = useRef(null);
  const ready = TRUSTPILOT.enabled && TRUSTPILOT.businessUnitId && TRUSTPILOT.templateId;

  useEffect(() => {
    if (!ready || !ref.current) return undefined;
    const el = ref.current;
    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries.some((e) => e.isIntersecting)) return;
        observer.disconnect();
        loadScript().then(() => window.Trustpilot?.loadFromElement(el, true));
      },
      { rootMargin: "300px" },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [ready]);

  if (!ready) return null;

  return (
    <div className="wrap py-6">
      <div
        ref={ref}
        className="trustpilot-widget h-[24px] overflow-hidden"
        data-locale="en-GB"
        data-template-id={TRUSTPILOT.templateId}
        data-businessunit-id={TRUSTPILOT.businessUnitId}
        data-style-height="24px"
        data-style-width="100%"
      >
        <a href={TRUSTPILOT.profileUrl} target="_blank" rel="noopener noreferrer">
          Read our reviews on Trustpilot
        </a>
      </div>
    </div>
  );
}
