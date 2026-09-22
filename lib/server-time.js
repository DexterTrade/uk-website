// The collection date is always "today" and is never taken from the browser.
//
// Two separate problems are being solved here:
//
// 1. Whose clock decides. A date computed in the browser is whatever the
//    machine's clock says, and a disabled input is no protection at all --
//    a Server Action is a public HTTP endpoint, so anything can be posted to
//    it directly. Every caller of this module runs on the server, and the
//    Server Actions overwrite collection_date with this value rather than
//    trusting what arrives in the payload.
//
// 2. Which calendar day it is. UTC is not the answer for a UK business: for
//    most of the year Europe/London is an hour ahead, so between 23:00 and
//    midnight BST the UTC date is still yesterday. The instant is resolved
//    first, then formatted as a London calendar date.
//
// The network lookup is belt-and-braces over the host's own clock, which on
// Vercel is NTP-synced and not reachable by anyone using the admin panel. It
// is cached for five minutes, given a short timeout, and falls back through
// two more sources -- a booking must never fail because a time API is down.

const TIMEZONE = "Europe/London";
const FETCH_TIMEOUT_MS = 1500;

// Cached in module scope rather than through fetch's `next: { revalidate }`:
// the booking page is force-dynamic, which Next turns into `cache: 'no-store'`
// on every fetch in the segment, so relying on the fetch cache would mean
// calling an external API on every single page load.
const HIT_TTL_MS = 5 * 60 * 1000;
// A failure is cached too, briefly, so an outage doesn't mean two timed-out
// requests on every render — but not so long that it stays degraded.
const MISS_TTL_MS = 60 * 1000;

let cached = null;

const pad = (n) => String(n).padStart(2, "0");

// An absolute instant -> the calendar date in London, as YYYY-MM-DD.
// en-CA is the shortest locale that formats in ISO order.
function londonDate(instant) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: TIMEZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(instant);
}

// A time service that answers in the zone we want, so no conversion is needed.
async function fromTimeApi() {
  const res = await fetch(
    `https://timeapi.io/api/Time/current/zone?timeZone=${encodeURIComponent(TIMEZONE)}`,
    { signal: AbortSignal.timeout(FETCH_TIMEOUT_MS), cache: "no-store" }
  );
  if (!res.ok) return null;
  const body = await res.json();
  if (!Number.isInteger(body?.year) || !Number.isInteger(body?.month) || !Number.isInteger(body?.day)) {
    return null;
  }
  return `${body.year}-${pad(body.month)}-${pad(body.day)}`;
}

// Fallback: every HTTP response carries a Date header in GMT, so any reliable
// host doubles as a clock. No response shape to depend on.
async function fromHttpDateHeader() {
  const res = await fetch("https://www.cloudflare.com/cdn-cgi/trace", {
    signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
    cache: "no-store",
  });
  const header = res.headers.get("date");
  if (!header) return null;
  const instant = new Date(header);
  return Number.isNaN(instant.getTime()) ? null : londonDate(instant);
}

// Both sources race rather than running in sequence, so one hanging service
// doesn't add its whole timeout to the other's. The whole race is then capped
// by a wall clock as well: AbortSignal.timeout only bites if the request
// honours it, and a booking form must never hang waiting for a clock.
async function resolveFromNetwork() {
  const attempts = [fromTimeApi(), fromHttpDateHeader()].map((p) =>
    p.then((date) => {
      if (!date) throw new Error("no date");
      return date;
    })
  );
  const ceiling = new Promise((resolve) => setTimeout(() => resolve(null), FETCH_TIMEOUT_MS + 250));
  try {
    return await Promise.race([Promise.any(attempts), ceiling]);
  } catch {
    return null;
  }
}

export async function getTodayISO() {
  if (cached && cached.expiresAt > Date.now()) return cached.date;

  const networkDate = await resolveFromNetwork();
  const date = networkDate ?? londonDate(new Date());

  cached = { date, expiresAt: Date.now() + (networkDate ? HIT_TTL_MS : MISS_TTL_MS) };
  return date;
}
