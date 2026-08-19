'use client';

import { motion } from 'framer-motion';
import { MessageCircle } from 'lucide-react';
import { buildStoreWhatsAppLink } from '@/lib/whatsapp';

export function WhatsAppFAB() {
  const href = buildStoreWhatsAppLink("Hi! I'd like to ask about a product.");

  // No NEXT_PUBLIC_STORE_WHATSAPP_NUMBER configured yet -> render nothing, never a dead link.
  if (!href) return null;

  return (
    <motion.a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat with us on WhatsApp"
      initial={{ opacity: 0, scale: 0.6, y: 12 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ delay: 0.4, duration: 0.35, ease: 'easeOut' }}
      whileHover={{ scale: 1.06 }}
      whileTap={{ scale: 0.94 }}
      // #25D366 is WhatsApp's own brand green, used deliberately here (like a payment-logo
      // color) rather than the site's maroon/gold — it's what makes the FAB instantly
      // recognizable as "this opens WhatsApp" at a glance.
      className="fixed bottom-5 right-5 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg shadow-black/20 sm:bottom-6 sm:right-6"
    >
      <MessageCircle className="h-7 w-7" fill="currentColor" strokeWidth={0} />
    </motion.a>
  );
}