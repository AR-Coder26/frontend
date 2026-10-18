import type { Metadata } from 'next';
import Link from 'next/link';
import { InfoPage } from '@/components/seo/InfoPage';
import { LegalSection } from '@/components/legal/LegalPage';
import { renderInline } from '@/components/seo/SeoCopy';
import { buildPageMetadata } from '@/lib/seo';
import { getCopyVars } from '@/lib/seoCopyVars';
import { STORE_JURISDICTION_LINE } from '@/lib/legal';

export const metadata: Metadata = buildPageMetadata({
  title: 'About Brandox | Women’s Suits Online in Pakistan',
  description:
    'Brandox sells stitched and unstitched lawn, cotton and khaddar suits for women across Pakistan, with Cash on Delivery and free delivery in Karachi.',
  path: '/about',
});

export default async function AboutPage() {
  const vars = await getCopyVars();

  return (
    <InfoPage
      title="About Brandox"
      intro="Brandox is an online store for women's suits in Pakistan — stitched and unstitched, in lawn, cotton, khaddar, chiffon and silk."
    >
      <LegalSection title="What we sell">
        <p>
          {renderInline(
            'You can shop 1-, 2- and 3-piece sets in [lawn](/fabric/lawn), [khaddar](/fabric/khaddar), [cotton](/fabric/cotton), [chiffon](/fabric/chiffon) and [silk](/fabric/silk). Choose [stitched suits](/category/stitched) in sizes S to XL, or [unstitched suits](/category/unstitched-suits) to have tailored.'
          )}
        </p>
      </LegalSection>

      <LegalSection title="How ordering works">
        <p>
          You can pay by {vars.PAYMENTS}. Delivery in Karachi is free, and it is {vars.DELIVERY_RATE}{' '}
          to the rest of Pakistan. We send order updates on WhatsApp. Read how delivery works on our{' '}
          <Link href="/karachi" className="text-primary hover:underline">
            Karachi delivery page
          </Link>
          , and see our{' '}
          <Link href="/refund-policy" className="text-primary hover:underline">
            Return &amp; Refund Policy
          </Link>{' '}
          before you order.
        </p>
      </LegalSection>

      <LegalSection title="Where we operate">
        <p>{STORE_JURISDICTION_LINE}</p>
      </LegalSection>

      <LegalSection title="Get in touch">
        <p>
          Questions about a product or an order? Visit our{' '}
          <Link href="/contact" className="text-primary hover:underline">
            Contact page
          </Link>
          .
        </p>
      </LegalSection>
    </InfoPage>
  );
}
