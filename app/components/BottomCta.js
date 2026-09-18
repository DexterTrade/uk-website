import Link from "next/link";

export default function BottomCta({ title, body, primary, secondary }) {
  return (
    <section className="band-dark">
      <div className="wrap portal-cta">
        <div>
          <h2 className="h-sec" style={{ color: "#fff" }}>{title}</h2>
          <p className="lede" style={{ maxWidth: "48ch" }}>{body}</p>
        </div>
        <div className="links">
          <Link className="btn btn-green" href={primary.href}>{primary.label}</Link>
          {secondary && <Link className="quiet" href={secondary.href}>{secondary.label}</Link>}
        </div>
      </div>
    </section>
  );
}
