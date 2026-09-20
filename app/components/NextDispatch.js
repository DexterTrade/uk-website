import Link from "next/link";

const MODE_COPY = {
  sea: {
    label: "Next sea cargo departure",
    photo: "/assets/photos/sea-cargo.jpg",
    alt: "Container ship at port",
    transit: "8–10 weeks",
  },
  air: {
    label: "Next air cargo departure",
    photo: "/assets/photos/air-cargo.jpg",
    alt: "Cargo aircraft on the tarmac",
    transit: "8–10 days",
  },
};

export default function NextDispatch({ mode = "sea", date, note }) {
  if (!date) return null;

  const target = new Date(`${date}T00:00:00`);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (target < today) return null;

  const formatted = target.toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const copy = MODE_COPY[mode] || MODE_COPY.sea;

  return (
    <div className="wrap">
      <div className="mt-10 overflow-hidden rounded-[18px] border border-line bg-white shadow-[0_18px_40px_-28px_rgba(22,35,60,0.3)]">
        <img src={copy.photo} alt={copy.alt} className="h-[190px] w-full object-cover md:h-[230px]" />

        <div className="flex flex-wrap items-center justify-between gap-6 p-6 md:p-7">
          <div>
            <span className="eyebrow">{copy.label}</span>
            <h3 className="mt-2 text-xl font-extrabold md:text-2xl">{formatted}</h3>
            {note && <p className="mt-1 text-sm text-muted">{note}</p>}
          </div>

          <div className="flex flex-wrap items-center gap-6">
            <div>
              <div className="text-[11px] font-semibold tracking-[0.08em] text-faint uppercase">Estimated time</div>
              <div className="font-head text-lg font-bold text-green">{copy.transit}</div>
            </div>
            <Link className="btn btn-green" href="/contact-us">
              Book your space
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
