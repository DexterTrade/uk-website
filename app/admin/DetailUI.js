// Presentational pieces shared by the shipment, invoice and customer detail
// pages. Server components — no client JS, no state.

import Link from "next/link";

export function DetailShell({ back, eyebrow, title, badge, actions, children }) {
  return (
    <main className="min-h-screen bg-bg-soft pb-16">
      <div className="border-b border-line bg-white print:hidden-force">
        <div className="mx-auto flex max-w-[980px] flex-wrap items-start justify-between gap-4 px-5 py-5">
          <div>
            <Link className="text-[13px] font-semibold text-soft hover:text-ink" href={back.href}>
              &larr; {back.label}
            </Link>
            {eyebrow && (
              <p className="mt-2 text-xs font-semibold tracking-[0.08em] text-faint uppercase">{eyebrow}</p>
            )}
            <h1 className="mt-1 flex flex-wrap items-center gap-3 font-head text-[26px] font-extrabold text-ink">
              {title}
              {badge}
            </h1>
          </div>
          {actions && <div className="flex flex-wrap gap-[10px]">{actions}</div>}
        </div>
      </div>
      <div className="mx-auto max-w-[980px] px-5 py-7">{children}</div>
    </main>
  );
}

export function Panel({ title, action, children, padded = true }) {
  return (
    <section className="mb-5 overflow-hidden rounded-xl border border-line bg-white">
      {(title || action) && (
        <header className="flex flex-wrap items-center justify-between gap-3 border-b border-[#eef1f7] px-[22px] py-[15px] max-[520px]:px-4">
          <h2 className="font-head text-[15px] font-bold text-ink">{title}</h2>
          {action}
        </header>
      )}
      <div className={padded ? "px-[22px] py-[20px] max-[520px]:px-4" : ""}>{children}</div>
    </section>
  );
}

// Label/value pairs. A value of "" or null renders as an em dash rather than
// collapsing the row, so a missing optional field is visibly missing.
export function DataList({ rows }) {
  return (
    <dl className="grid grid-cols-[repeat(auto-fit,minmax(220px,1fr))] gap-x-8 gap-y-[18px]">
      {rows.map(([label, value]) => (
        <div key={label}>
          <dt className="text-xs font-semibold tracking-[0.06em] text-faint uppercase">{label}</dt>
          <dd className="mt-[5px] text-[15px] leading-[1.5] text-ink">{value || "—"}</dd>
        </div>
      ))}
    </dl>
  );
}

export function formatDate(dateStr) {
  if (!dateStr) return "";
  return new Date(`${dateStr}T00:00:00Z`).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function weightLabel(parcels, weightKg) {
  return `${parcels} ${parcels === 1 ? "parcel" : "parcels"} · ${Number(weightKg)} kg`;
}

export const modeLabel = (mode) => (mode === "air" ? "Air cargo" : "Sea cargo");
