import Link from "next/link";

export default function NextDispatch({ date, note }) {
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

  return (
    <div className="wrap">
      <div className="mt-10 flex flex-wrap items-center gap-7 rounded-[14px] border-[1.5px] border-green bg-white px-[30px] py-[26px] shadow-[0_14px_34px_-24px_rgba(1,161,89,0.35)] max-[560px]:flex-col max-[560px]:px-5 max-[560px]:py-6 max-[560px]:text-center">
        <div className="flex h-[88px] w-[88px] flex-none flex-col items-center justify-center rounded-full bg-green text-center text-white">
          {diffDays === 0 ? (
            <span className="font-head text-[17px] leading-none font-extrabold">Today</span>
          ) : (
            <>
              <span className="font-head text-[30px] leading-none font-extrabold">{diffDays}</span>
              <span className="mt-[3px] text-[10.5px] tracking-[0.05em] uppercase opacity-90">
                {diffDays === 1 ? "day left" : "days left"}
              </span>
            </>
          )}
        </div>
        <div className="flex-[1_1_240px]">
          <span className="mb-2 inline-block rounded bg-green-soft px-[10px] py-1 text-xs font-bold tracking-[0.06em] text-green-ink uppercase">
            Next sea cargo departure
          </span>
          <h3 className="text-xl font-bold">{formatted}</h3>
          {note && <p className="mt-1 text-sm text-muted">{note}</p>}
        </div>
        <Link className="btn btn-green" href="/contact-us">Book your space</Link>
      </div>
    </div>
  );
}
