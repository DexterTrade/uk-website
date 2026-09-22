"use client";

// A two-handle range slider built from two overlaid <input type="range">
// elements. Native inputs rather than drag maths, so keyboard control,
// touch and screen readers all work without being reimplemented.
//
// The overlay needs one trick: the inputs are stretched across each other,
// so the top one would swallow every click. Both are given
// pointer-events: none and only their thumbs take pointer events back (see
// .range-slider in globals.css).
export default function RangeSlider({
  label,
  min,
  max,
  step = 1,
  value,
  onChange,
  format = String,
  disabled = false,
}) {
  const [lo, hi] = value;
  const span = max - min || 1;
  const pct = (v) => ((Math.min(Math.max(v, min), max) - min) / span) * 100;

  // Handles can't cross: each is clamped against the other rather than
  // swapping, so dragging one past the other parks it instead of jumping.
  const setLo = (next) => onChange([Math.min(next, hi), hi]);
  const setHi = (next) => onChange([lo, Math.max(next, lo)]);

  // When both handles sit on the same value, the last-rendered input wins
  // every grab. Lifting whichever handle is at the far end keeps both
  // reachable at the extremes.
  const loOnTop = lo === hi && hi === max;

  return (
    <div className={disabled ? "opacity-55" : undefined}>
      <div className="mb-[6px] flex items-baseline justify-between gap-3">
        <span className="text-xs font-semibold tracking-[0.06em] text-faint uppercase">{label}</span>
        <span className="text-[13px] font-semibold text-ink">
          {disabled ? "—" : `${format(lo)} – ${format(hi)}`}
        </span>
      </div>
      <div className="range-slider">
        <span className="rail" />
        <span className="fill" style={{ left: `${pct(lo)}%`, right: `${100 - pct(hi)}%` }} />
        <input
          type="range"
          aria-label={`${label}, minimum`}
          min={min}
          max={max}
          step={step}
          value={lo}
          disabled={disabled}
          style={loOnTop ? { zIndex: 4 } : undefined}
          onChange={(e) => setLo(Number(e.target.value))}
        />
        <input
          type="range"
          aria-label={`${label}, maximum`}
          min={min}
          max={max}
          step={step}
          value={hi}
          disabled={disabled}
          onChange={(e) => setHi(Number(e.target.value))}
        />
      </div>
    </div>
  );
}
