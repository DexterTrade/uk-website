import { createClient } from "@/lib/supabase/server";
import AnnouncementTicker from "./AnnouncementTicker";

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

  return <AnnouncementTicker message="Next container Insha’Allah" date={formatted} />;
}
