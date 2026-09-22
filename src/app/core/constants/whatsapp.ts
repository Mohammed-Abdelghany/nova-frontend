export const WHATSAPP_NUMBER = '201026734959';

export const WHATSAPP_DEFAULT_MESSAGE = 'مرحبًا، حابة أسأل عن منتجات Nova';

export function buildWhatsAppLink(message: string = WHATSAPP_DEFAULT_MESSAGE): string {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}
