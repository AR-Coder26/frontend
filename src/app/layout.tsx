import type { Metadata } from 'next';
import { Fraunces, Manrope } from 'next/font/google';
import { Toaster } from 'sonner';
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
  // TODO(client): this is placeholder SITE METADATA only (not product data — no mock-data
  // rule violation here), and needs the real store name/domain before launch.
  title: {
    default: 'Women\u2019s Clothing Store | Pakistan',
    template: '%s | Women\u2019s Clothing Store',
  },
  description:
    'Stitched & unstitched suits in Lawn, Cotton, Khaddar, Chiffon and Silk — 1, 2 & 3-piece. Cash on Delivery, JazzCash and EasyPaisa accepted.',
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${fraunces.variable} ${manrope.variable}`}>
      <body className="min-h-screen bg-background font-sans text-foreground antialiased">
        {children}
        <Toaster richColors closeButton position="top-center" />
      </body>
    </html>
  );
}