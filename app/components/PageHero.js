import Link from "next/link";

export default function PageHero({ eyebrow, title, intro, stats, ctas }) {
  return (
    <section className="border-b border-[#e6eaf2] bg-[linear-gradient(180deg,#f4f8f6_0%,#ffffff_100%)]">
      <div className="wrap pt-14 pb-12 max-[640px]:pt-9 max-[640px]:pb-8">
        {eyebrow && <span className="eyebrow">{eyebrow}</span>}
        <h1 className="mt-[18px] mb-4 max-w-[22ch] text-[clamp(30px,4.5vw,48px)] leading-[1.1] font-extrabold max-[640px]:max-w-full">
          {title}
        </h1>
        {intro && <p className="max-w-[62ch] text-[18px] leading-[1.6] text-muted">{intro}</p>}
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
