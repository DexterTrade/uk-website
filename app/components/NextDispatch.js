import Link from "next/link";

const MODE_COPY = {
  sea: { label: "Next sea cargo departure", photo: "/assets/photos/sea-cargo.jpg", alt: "Container ship at port" },
  air: { label: "Next air cargo departure", photo: "/assets/photos/air-cargo.jpg", alt: "Cargo aircraft on the tarmac" },
};

export default function NextDispatch({ mode = "sea", date, note }) {
  if (!date) return null;

  const target = new Date(`${date}T00:00:00`);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const diffDays = Math.round((target - today) / 86400000);

  if (diffDays < 0) return null;

  const formatted = target.toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const copy = MODE_COPY[mode] || MODE_COPY.sea;

  return (
    <div className="wrap">
      <div className="relative mt-10 overflow-hidden rounded-[18px] shadow-[0_24px_54px_-30px_rgba(22,35,60,0.45)]">
        <img
          src={copy.photo}
          alt={copy.alt}
          className="h-[220px] w-full object-cover md:h-[280px]"
        />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(16,23,40,0.15)_0%,rgba(16,23,40,0.55)_55%,rgba(16,23,40,0.85)_100%)]" />

        <div className="absolute inset-0 flex flex-col justify-end p-5 md:p-8">
          <div className="flex flex-wrap items-end justify-between gap-5">
            <div className="max-w-[46ch]">
              <span className="inline-block rounded bg-green px-[10px] py-1 text-xs font-bold tracking-[0.06em] text-white uppercase">
                {copy.label}
              </span>
              <h3 className="mt-2 text-2xl leading-tight font-extrabold text-white md:text-[32px]">{formatted}</h3>
              {note && <p className="mt-1.5 text-sm text-white/85">{note}</p>}
            </div>

            <div className="flex flex-none items-center gap-4">
              <div className="flex h-[72px] w-[72px] flex-none flex-col items-center justify-center rounded-full border-2 border-white/70 bg-black/25 text-center text-white backdrop-blur-sm">
                {diffDays === 0 ? (
                  <span className="text-[13px] leading-none font-extrabold">Today</span>
                ) : (
                  <>
                    <span className="font-head text-2xl leading-none font-extrabold">{diffDays}</span>
                    <span className="mt-[3px] text-[9.5px] tracking-[0.05em] uppercase opacity-90">
                      {diffDays === 1 ? "day left" : "days left"}
                    </span>
                  </>
                )}
              </div>
              <Link className="btn btn-green" href="/contact-us">
                Book your space
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
