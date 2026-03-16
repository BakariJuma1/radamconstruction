import { useContext } from "react";
import { MessageCircle } from "lucide-react";
import { buildWhatsAppLink } from "../config";
import { SiteSettingsContext } from "../SiteSettingsContext";

const defaultMessage =
  "Hello Radamjaribu Builders, I would like to ask about a construction project quotation.";

export default function WhatsAppButton({
  message = defaultMessage,
  label,
  className = "",
  floating = false,
  light = false,
}) {
  const { settings } = useContext(SiteSettingsContext);
  const href = buildWhatsAppLink(message, settings?.whatsapp_number);
  const resolvedLabel =
    label || (floating ? "Request Quote on WhatsApp" : "Chat on WhatsApp");

  const sharedClasses = floating
    ? "fixed bottom-6 right-6 z-50 inline-flex items-center gap-3 rounded-full bg-green-600 px-5 py-3 text-sm font-semibold text-white shadow-xl transition hover:bg-green-700"
    : light
      ? "inline-flex items-center gap-2 rounded-lg bg-white px-4 py-3 font-semibold text-emerald-700 transition hover:bg-emerald-50"
      : "inline-flex items-center gap-2 rounded-lg bg-green-600 px-4 py-3 font-semibold text-white transition hover:bg-green-700";

  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className={`${sharedClasses} ${className}`.trim()}
    >
      <MessageCircle size={18} />
      <span>{resolvedLabel}</span>
    </a>
  );
}
