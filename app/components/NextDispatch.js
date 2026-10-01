import Image from "next/image";
import Link from "next/link";
import seaPhoto from "@/public/assets/photos/sea-cargo.jpg";
import airPhoto from "@/public/assets/photos/air-cargo.jpg";

const MODE_COPY = {
  sea: {
    label: "Next sea cargo departure",
    photo: seaPhoto,
    alt: "Sea cargo container ship shipping from the UK to Pakistan",
    fallbackTransit: "8–10 weeks",
  },
  air: {
    label: "Next air cargo departure",
    photo: airPhoto,
    alt: "Air cargo plane loading shipment to Pakistan",
    fallbackTransit: "8–10 days",
  },
};

export default function NextDispatch({ mode = "sea", date, note, estimatedTime }) {
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

  const daysAway = diffDays === 0 ? "today" : diffDays === 1 ? "in 1 day" : `in ${diffDays} days`;
  const copy = MODE_COPY[mode] || MODE_COPY.sea;

  return (
    <div className="wrap">
      <div className="mt-10 overflow-hidden rounded-[18px] border border-line bg-white shadow-[0_18px_40px_-28px_rgba(22,35,60,0.3)]">
        {/* The first thing on the page, so usually its largest paint: fetched
            eagerly at high priority rather than lazily. */}
        <Image
          src={copy.photo}
          alt={copy.alt}
          sizes="(max-width: 1180px) 100vw, 1132px"
          loading="eager"
          fetchPriority="high"
          className="h-[190px] w-full object-cover md:h-[230px]"
        />

        <div className="flex flex-wrap items-center justify-between gap-6 p-6 md:p-7">
          <div>
            <span className="eyebrow">{copy.label}</span>
            {/* Not a heading: this sits above the page's H1. */}
            <p className="mt-2 font-head text-xl font-extrabold text-ink md:text-2xl">
              {formatted}
              <span className="ml-2 text-base font-semibold text-green">({daysAway})</span>
            </p>
            {note && <p className="mt-1 text-sm text-muted">{note}</p>}
          </div>

          <div className="flex flex-wrap items-center gap-6">
            <div>
              <div className="text-[11px] font-semibold tracking-[0.08em] text-faint uppercase">Estimated time</div>
              <div className="font-head text-lg font-bold text-green">{estimatedTime || copy.fallbackTransit}</div>
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
