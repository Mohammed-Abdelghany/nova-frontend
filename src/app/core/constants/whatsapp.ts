// TODO: replace with Nova's real WhatsApp business number (international format, digits only, no leading + or 0).
export const WHATSAPP_NUMBER = '201000000000';

export const WHATSAPP_DEFAULT_MESSAGE = 'مرحبًا، حابة أسأل عن منتجات Nova';

export function buildWhatsAppLink(message: string = WHATSAPP_DEFAULT_MESSAGE): string {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}
