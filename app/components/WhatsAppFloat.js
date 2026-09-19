import { BUSINESS } from "@/lib/seo";
import { WhatsAppIcon } from "./contact-icons";

export default function WhatsAppFloat() {
  return (
    <a
      className="whatsapp-float"
      href={BUSINESS.whatsapp}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`Quick response on WhatsApp: ${BUSINESS.whatsappDisplay}`}
      title="Quick response on WhatsApp"
    >
      <WhatsAppIcon width="30" height="30" fill="#fff" />
    </a>
  );
}
