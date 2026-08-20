'use client';

import { motion } from 'framer-motion';
import type { ReactNode } from 'react';

// One deliberate reveal per homepage section, not a per-card stagger — matches the design
// mandate's "premium and restrained, never gimmicky." Respects prefers-reduced-motion
// automatically via the root layout's <MotionConfig reducedMotion="user">.
export function RevealOnScroll({ children }: { children: ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
    >
      {children}
    </motion.div>
  );
}