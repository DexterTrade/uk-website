import Link from "next/link";

export default function PageHero({ eyebrow, title, intro, stats, ctas }) {
  return (
    <section className="hero">
      <div className="wrap" style={{ padding: "56px 0 48px" }}>
        {eyebrow && <span className="eyebrow">{eyebrow}</span>}
        <h1 style={{ fontSize: "clamp(32px,4.5vw,48px)", lineHeight: 1.08, fontWeight: 800, margin: "18px 0 16px", maxWidth: "22ch" }}>
          {title}
        </h1>
        {intro && (
          <p className="intro" style={{ fontSize: 18, lineHeight: 1.6, color: "var(--muted)", maxWidth: "62ch" }}>
            {intro}
          </p>
        )}
        {ctas && (
          <div className="cta-row">
            {ctas.map((c) => (
              <Link key={c.label} className={`btn ${c.variant || "btn-navy"}`} href={c.href}>
                {c.label}
              </Link>
            ))}
          </div>
        )}
        {stats && (
          <div className="stats">
            {stats.map((s) => (
              <div key={s.l}>
                <div className="n">{s.n}</div>
                <div className="l">{s.l}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
