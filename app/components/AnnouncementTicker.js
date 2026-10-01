"use client";

import { useSyncExternalStore } from "react";

const COPIES = 6;
const subscribe = () => () => {};

function Item({ message, date, hidden }) {
  return (
    <span
      aria-hidden={hidden || undefined}
      className="mx-6 flex flex-none items-center gap-2 text-[13px] font-extrabold tracking-[0.01em] text-white uppercase whitespace-nowrap md:text-[14.5px]"
    >
      {message}
      <span className="rounded-full bg-white/20 px-2.5 py-[3px] text-[12px] font-bold normal-case tracking-normal md:text-[13px]">
        {date}
      </span>
    </span>
  );
}

// The server HTML carries the message exactly once. The repeats that fill the
// scrolling track are added in the browser, after hydration, and are
// aria-hidden — a dozen copies of one sentence in the page source reads as
// keyword stuffing to a crawler and as a dozen announcements to a screen reader.
export default function AnnouncementTicker({ message, date }) {
  // true in the browser, false during the server render and hydration.
  const mounted = useSyncExternalStore(subscribe, () => true, () => false);
  const extra = mounted ? COPIES - 1 : 0;

  return (
    <div className="overflow-hidden border-b border-black/10 bg-green py-[7px]" role="status">
      {/* Two identical groups translated by -50% make the loop seamless. */}
      <div className={`flex w-max ${mounted ? "animate-announcement-marquee" : ""}`}>
        <div className="flex flex-none items-center">
          <Item message={message} date={date} />
          {Array.from({ length: extra }).map((_, i) => (
            <Item key={i} message={message} date={date} hidden />
          ))}
        </div>
        {mounted && (
          <div className="flex flex-none items-center" aria-hidden="true">
            {Array.from({ length: COPIES }).map((_, i) => (
              <Item key={i} message={message} date={date} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
