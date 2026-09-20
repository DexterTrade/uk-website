import BookingForm from "./BookingForm";

export const metadata = {
  title: "New booking",
  robots: { index: false, follow: false },
};

export default function NewBookingPage() {
  // Passed down rather than computed inside the client component: the server
  // renders in UTC and the browser in local time, so a useState initializer
  // calling new Date() can disagree across midnight and trip hydration.
  const today = new Date().toISOString().slice(0, 10);
  return <BookingForm today={today} />;
}
