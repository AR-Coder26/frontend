const STORE_WHATSAPP_NUMBER = process.env.NEXT_PUBLIC_STORE_WHATSAPP_NUMBER;

/**
 * Builds a wa.me link to the store's own number with a pre-filled message.
 * Returns null if NEXT_PUBLIC_STORE_WHATSAPP_NUMBER isn't set — every caller must handle
 * that (e.g. don't render the button) rather than ever pointing a "Chat with us" link at
 * nothing.
 */
export function buildStoreWhatsAppLink(message: string): string | null {
  if (!STORE_WHATSAPP_NUMBER) return null;
  return `https://wa.me/${STORE_WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}