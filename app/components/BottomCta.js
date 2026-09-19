import Link from "next/link";

export default function BottomCta({ title, body, primary, secondary }) {
  return (
    <section className="bg-ink text-[#b9c3d6]">
      <div className="wrap grid grid-cols-[repeat(auto-fit,minmax(280px,1fr))] items-center gap-9 py-[66px]">
        <div>
          <h2 className="h-sec text-white">{title}</h2>
          <p className="lede max-w-[48ch] text-[#b9c3d6]">{body}</p>
        </div>
        <div className="flex flex-col items-start gap-3">
          <Link className="btn btn-green" href={primary.href}>{primary.label}</Link>
          {secondary && (
            <Link className="text-[15px] text-[#b9c3d6] hover:text-white" href={secondary.href}>
              {secondary.label}
            </Link>
          )}
        </div>
      </div>
    </section>
  );
}
