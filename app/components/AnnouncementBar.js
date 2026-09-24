import { createClient } from "@/lib/supabase/server";

// A bold, sliding ticker above the header announcing the next sea container
// -- reads the same rates.next_dispatch_date (mode "sea") that drives the
// NextDispatch poster on /sea-cargo, so there is one date to edit in /admin
// and it propagates here too. Renders nothing once that date has passed,
// same rule NextDispatch already uses, so a stale date never lingers.
export default async function AnnouncementBar() {
  const supabase = await createClient();
  const { data: seaRate } = await supabase
    .from("rates")
    .select("next_dispatch_date")
    .eq("mode", "sea")
    .maybeSingle();

  const date = seaRate?.next_dispatch_date;
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

  const message = "Next container Insha’Allah";

  return (
    <div
      className="overflow-hidden border-b border-black/10 bg-green py-[7px]"
      role="status"
      aria-label={`${message} ${formatted}`}
    >
      <div className="flex w-max animate-announcement-marquee">
        {[0, 1].map((group) => (
          <div className="flex flex-none items-center" key={group} aria-hidden="true">
            {Array.from({ length: 6 }).map((_, i) => (
              <span
                key={i}
                className="mx-6 flex flex-none items-center gap-2 text-[13px] font-extrabold tracking-[0.01em] text-white uppercase whitespace-nowrap md:text-[14.5px]"
              >
                {message}
                <span className="rounded-full bg-white/20 px-2.5 py-[3px] text-[12px] font-bold normal-case tracking-normal md:text-[13px]">
                  {formatted}
                </span>
              </span>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
