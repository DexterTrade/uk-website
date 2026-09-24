// Shared by the shipments list and the booking form, which both send a
// customer their invoice link.

// WhatsApp wants a bare international number: no plus, no spaces, no leading
// zero. Sender numbers are stored in UK national form (07…), so the trunk 0
// becomes the 44 country code. Anything that isn't a UK mobile returns empty,
// which callers treat as "can't message this number" rather than opening a
// broken chat.
export function toWhatsAppNumber(phone) {
  const digits = String(phone || "").replace(/\D/g, "");
  if (/^07\d{9}$/.test(digits)) return `44${digits.slice(1)}`;
  if (/^447\d{9}$/.test(digits)) return digits;
  return "";
}

// Desktop and laptop are the same case — a computer — and both get WhatsApp
// Web, which reuses the session the browser is already signed in to.
// web.whatsapp.com does not work on a phone or tablet, though: it tells you to
// use the app instead. So handheld devices get the wa.me link, which opens the
// installed app directly.
function isHandheld() {
  if (typeof navigator === "undefined") return false;
  if (navigator.userAgentData) return Boolean(navigator.userAgentData.mobile);
  const ua = navigator.userAgent || "";
  // iPadOS reports a desktop UA, so it is identified by being a touch "Mac".
  const iPadOS = /Macintosh/.test(ua) && navigator.maxTouchPoints > 1;
  return /Android|iPhone|iPod|iPad|Mobile|Tablet|Silk|Kindle|Opera Mini|IEMobile/i.test(ua) || iPadOS;
}

export function whatsAppSendUrl(number, message) {
  const text = encodeURIComponent(message);
  return isHandheld()
    ? `https://wa.me/${number}?text=${text}`
    : `https://web.whatsapp.com/send?phone=${number}&text=${text}`;
}
