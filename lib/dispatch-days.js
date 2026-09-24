// Recurring weekly dispatch days (e.g. "air freight flies Tuesdays and
// Fridays"), stored as rates.dispatch_days -- an array of weekday numbers in
// JS Date.getDay() convention (0 = Sunday .. 6 = Saturday). From that, the
// next matching calendar date is computed at read time on the detail page,
// so admin sets the recurring days once instead of updating a single date
// by hand every week.
//
// Weekday-of-date is timezone-independent once you already have the correct
// London calendar date string, so today's date is resolved in Europe/London
// (not UTC -- see lib/server-time.js for why that matters near midnight)
// and the day-of-week arithmetic below is done in plain UTC on that string.

const LONDON_TZ = "Europe/London";

const FULL_NAMES = {
  0: "Sunday",
  1: "Monday",
  2: "Tuesday",
  3: "Wednesday",
  4: "Thursday",
  5: "Friday",
  6: "Saturday",
};

// Mon -> Sun order for display, independent of the 0=Sun storage convention.
export const WEEKDAYS = [
  { value: 1, label: "Mon" },
  { value: 2, label: "Tue" },
  { value: 3, label: "Wed" },
  { value: 4, label: "Thu" },
  { value: 5, label: "Fri" },
  { value: 6, label: "Sat" },
  { value: 0, label: "Sun" },
];

function londonTodayISO() {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: LONDON_TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

function addDaysISO(iso, days) {
  const d = new Date(`${iso}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

function weekdayOfISO(iso) {
  return new Date(`${iso}T00:00:00Z`).getUTCDay();
}

export function sanitizeDispatchDays(days) {
  if (!Array.isArray(days)) return [];
  return [...new Set(days.filter((d) => Number.isInteger(d) && d >= 0 && d <= 6))].sort((a, b) => a - b);
}

// The next date (today included) that falls on one of the given weekdays,
// or null if no days are set. Looks no further than one week ahead since
// every weekday recurs within 7 days.
export function nextDispatchDate(dispatchDays) {
  const days = sanitizeDispatchDays(dispatchDays);
  if (days.length === 0) return null;
  const set = new Set(days);
  const start = londonTodayISO();
  for (let i = 0; i < 7; i++) {
    const iso = addDaysISO(start, i);
    if (set.has(weekdayOfISO(iso))) return iso;
  }
  return null;
}

// A human label for the selected days, e.g. "Flights depart every Tuesday &
// Friday" -- used as the departure poster's note when staff haven't typed
// their own.
export function dispatchDaysLabel(dispatchDays) {
  const days = sanitizeDispatchDays(dispatchDays);
  if (days.length === 0) return "";
  const ordered = WEEKDAYS.filter((d) => days.includes(d.value)).map((d) => `${FULL_NAMES[d.value]}s`);
  if (ordered.length === 1) return `Flights depart every ${ordered[0]}`;
  return `Flights depart every ${ordered.slice(0, -1).join(", ")} & ${ordered[ordered.length - 1]}`;
}
