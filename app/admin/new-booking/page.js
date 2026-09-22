import BookingForm from "../BookingForm";
import { getTodayISO } from "@/lib/server-time";

export const metadata = {
  title: "New booking",
  robots: { index: false, follow: false },
};

// Rendered per request so the displayed collection date can't be a stale
// "today" served from a cache the morning after it was built.
export const dynamic = "force-dynamic";

export default async function NewBookingPage() {
  // Resolved on the server, from a network time source, in Europe/London —
  // never from the browser's clock. See lib/server-time.js.
  const today = await getTodayISO();
  return <BookingForm today={today} />;
}
