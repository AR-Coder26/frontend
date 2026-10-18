import type { Metadata, Viewport } from 'next';
import { Fraunces, Manrope } from 'next/font/google';
import { MotionConfig } from 'framer-motion';
import { ThemeProvider } from '@/components/theme/ThemeProvider';
import { ThemedToaster } from '@/components/theme/ThemedToaster';
import { JsonLd } from '@/components/seo/JsonLd';
import { THEME_INIT_SCRIPT } from '@/lib/theme';
import { LOGO_URL, SITE_NAME, SITE_URL } from '@/lib/seo';
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

// NOTE: do NOT add `alternates.canonical` here — it would be inherited by every page that
// does not set its own. Each page sets its own canonical (see src/lib/seo.ts).
export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  applicationName: SITE_NAME,
  title: {
    default: 'Brandox | Women\u2019s Clothing in Pakistan',
    template: '%s | Brandox',
  },
  description:
    'Brandox — stitched & unstitched suits in Lawn, Cotton, Khaddar, Chiffon and Silk — 1, 2 & 3-piece. Cash on Delivery, JazzCash, EasyPaisa and Bank Transfer accepted.',
  openGraph: {
    type: 'website',
    siteName: SITE_NAME,
    locale: 'en_PK',
  },
  twitter: { card: 'summary' },
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

// Organization + WebSite structured data, rendered once for the whole site.
const whatsappDigits = process.env.NEXT_PUBLIC_STORE_WHATSAPP_NUMBER?.replace(/\D/g, '');

const siteJsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Organization',
      '@id': `${SITE_URL}/#organization`,
      name: SITE_NAME,
      url: SITE_URL,
      logo: LOGO_URL,
      ...(whatsappDigits
        ? {
            contactPoint: [
              {
                '@type': 'ContactPoint',
                telephone: `+${whatsappDigits}`,
                contactType: 'customer service',
                areaServed: 'PK',
                availableLanguage: ['English', 'Urdu'],
              },
            ],
          }
        : {}),
    },
    {
      '@type': 'WebSite',
      '@id': `${SITE_URL}/#website`,
      url: SITE_URL,
      name: SITE_NAME,
      inLanguage: 'en-PK',
      publisher: { '@id': `${SITE_URL}/#organization` },
      potentialAction: {
        '@type': 'SearchAction',
        target: {
          '@type': 'EntryPoint',
          urlTemplate: `${SITE_URL}/products?search={search_term_string}`,
        },
        'query-input': 'required name=search_term_string',
      },
    },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    // suppressHydrationWarning is required on <html>: the inline script below adds the `dark`
    // class and `color-scheme` style before React hydrates, so the server markup and the live
    // element legitimately differ. It only silences warnings for this one element's attributes.
    <html lang="en-PK" className={`${fraunces.variable} ${manrope.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
      </head>
      <body className="min-h-screen bg-background font-sans text-foreground antialiased">
        <JsonLd data={siteJsonLd} />
        <ThemeProvider>
          <MotionConfig reducedMotion="user">{children}</MotionConfig>
          <ThemedToaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
