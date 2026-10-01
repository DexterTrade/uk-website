// "2026-10-14" → "14 October 2026". Read as UTC so the date never shifts a day
// either side of the BST/GMT change.
export function formatPostDate(iso) {
  return new Date(`${iso}T00:00:00Z`).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
}
