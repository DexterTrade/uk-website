import { BUSINESS } from "@/lib/seo";
import { WhatsAppIcon } from "./contact-icons";

export default function WhatsAppFloat() {
  return (
    <a
      className="fixed right-5 bottom-[calc(20px_+_env(safe-area-inset-bottom,0px))] z-[60] flex h-[58px] w-[58px] items-center justify-center rounded-full bg-[#25d366] shadow-[0_10px_26px_-6px_rgba(22,35,60,0.45)] transition duration-150 ease-out hover:-translate-y-0.5 hover:scale-105 hover:shadow-[0_14px_30px_-6px_rgba(22,35,60,0.5)] max-[480px]:right-3.5 max-[480px]:bottom-[calc(14px_+_env(safe-area-inset-bottom,0px))] max-[480px]:h-[52px] max-[480px]:w-[52px] print:hidden"
      href={BUSINESS.whatsapp}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`Quick response on WhatsApp: ${BUSINESS.whatsappDisplay}`}
      title="Quick response on WhatsApp"
    >
      <WhatsAppIcon className="h-[30px] w-[30px] max-[480px]:h-[26px] max-[480px]:w-[26px]" fill="#fff" />
    </a>
  );
}
