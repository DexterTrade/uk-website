import Link from "next/link";
import { signOutAction } from "./actions";

// What a manager sees instead of the full panel: they may take bookings and
// nothing else, so there is nothing to list, filter or edit here. This is
// presentation only — the real restriction is the RLS policies, which is what
// stops a manager reaching the same data by any other route.
export default function ManagerHome({ fullName }) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-bg-soft px-5 py-16">
      <div className="w-full max-w-[460px] rounded-xl border border-line bg-white p-9 text-center shadow-[0_18px_40px_-34px_rgba(22,35,60,0.45)]">
        <span className="flex h-[52px] w-[52px] mx-auto items-center justify-center rounded-md bg-bg-soft">
          <img className="h-9 w-9 object-contain" src="/assets/logo-mark.svg" alt="PAK Cargo" />
        </span>
        <h1 className="mt-5 font-head text-[22px] font-extrabold text-ink">
          {fullName ? `Hello, ${fullName}` : "Bookings"}
        </h1>
        <p className="mt-2 text-[15px] leading-[1.6] text-muted">
          Take a new booking — the customer, shipment and invoice are created together.
        </p>

        <Link className="btn btn-green mt-7 w-full" href="/admin/new-booking">
          + New booking
        </Link>

        <form action={signOutAction}>
          <button type="submit" className="btn btn-ghost mt-3 w-full">
            Sign out
          </button>
        </form>
      </div>
    </main>
  );
}
