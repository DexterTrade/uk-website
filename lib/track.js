// dataLayer events for GTM / GA4. The tag configuration lives in GTM (set up
// outside this repo); the site's only job is to push consistently named
// events with enough context to tell which part of the page drove them.
export function track(event, params = {}) {
  if (typeof window === "undefined") return;
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({ event, ...params });
}

// The section a click came from: the nearest ancestor carrying
// data-location, or the page path when the link sits outside any marked
// section, so every event still says where it happened.
export function linkLocation(element) {
  const marked = element.closest("[data-location]");
  if (marked) return marked.getAttribute("data-location");
  const path = window.location.pathname.replace(/^\/|\/$/g, "");
  return path || "home";
}
