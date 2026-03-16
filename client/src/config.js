export const API_BASE_URL = "https://radamconstruction.onrender.com";
export const DEFAULT_WHATSAPP_NUMBER = "254700123456";

export const buildWhatsAppLink = (message, whatsappNumber) => {
  const targetNumber = whatsappNumber || DEFAULT_WHATSAPP_NUMBER;

  if (!targetNumber) {
    return null;
  }
  const encodedMessage = encodeURIComponent(message);
  return `https://wa.me/${targetNumber}?text=${encodedMessage}`;
};
