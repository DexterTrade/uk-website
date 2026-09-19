import Link from "next/link";

export default function PageHero({ eyebrow, title, intro, stats, ctas }) {
  return (
    <section className="hero">
      <div className="wrap page-hero-inner">
        {eyebrow && <span className="eyebrow">{eyebrow}</span>}
        <h1 className="page-hero-title">{title}</h1>
        {intro && <p className="intro page-hero-intro">{intro}</p>}
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
