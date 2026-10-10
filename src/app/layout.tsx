import type { Metadata, Viewport } from 'next';
import { Fraunces, Manrope } from 'next/font/google';
import { MotionConfig } from 'framer-motion';
import { ThemeProvider } from '@/components/theme/ThemeProvider';
import { ThemedToaster } from '@/components/theme/ThemedToaster';
import { THEME_INIT_SCRIPT } from '@/lib/theme';
import './globals.css';

// Display face: Fraunces — a warm, high-contrast serif with real optical-size and italic
// variants. Used ONLY for headings, prices, and eyebrow labels (via font-display in
// tailwind.config.ts) so it keeps its editorial "fashion catalog" impact instead of getting
// diluted by appearing in body copy too.
const fraunces = Fraunces({
  subsets: ['latin'],
  variable: '--font-display',
  weight: ['400', '500', '600'],
  style: ['normal', 'italic'],
  display: 'swap',
});

// Body face: Manrope — geometric but warm, holds up at small sizes on mobile product grids
// and filter chips, and doesn't compete with Fraunces for attention.
const manrope = Manrope({
  subsets: ['latin'],
  variable: '--font-sans',
  weight: ['400', '500', '600', '700'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    default: 'Brandox | Women\u2019s Clothing in Pakistan',
    template: '%s | Brandox',
  },
  description:
    'Brandox — stitched & unstitched suits in Lawn, Cotton, Khaddar, Chiffon and Silk — 1, 2 & 3-piece. Cash on Delivery, JazzCash, EasyPaisa and Bank Transfer accepted.',
};

// Colors the browser's own chrome (mobile address bar). These follow the OS setting; a manual
// override made with the in-page toggle cannot change a static <meta>, which is a known and
// accepted limitation. Values match --background in globals.css (#FAF6F0 / #171312).
export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#FAF6F0' },
    { media: '(prefers-color-scheme: dark)', color: '#171312' },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    // suppressHydrationWarning is required on <html>: the inline script below adds the `dark`
    // class and `color-scheme` style before React hydrates, so the server markup and the live
    // element legitimately differ. It only silences warnings for this one element's attributes.
    <html lang="en" className={`${fraunces.variable} ${manrope.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
      </head>
      <body className="min-h-screen bg-background font-sans text-foreground antialiased">
        <ThemeProvider>
          <MotionConfig reducedMotion="user">{children}</MotionConfig>
          <ThemedToaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
