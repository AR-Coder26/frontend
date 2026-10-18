import type { Metadata } from 'next';
import Link from 'next/link';
import { InfoPage } from '@/components/seo/InfoPage';
import { LegalList, LegalSection } from '@/components/legal/LegalPage';
import { buildPageMetadata } from '@/lib/seo';
import { buildStoreWhatsAppLink } from '@/lib/whatsapp';

export const metadata: Metadata = buildPageMetadata({
  title: 'Size Guide | How to Measure for a Suit | Brandox',
  description:
    'How to measure for a stitched or unstitched suit at Brandox. Sizes run S to XL. Ask us on WhatsApp for the measurements of any design.',
  path: '/size-guide',
});

export default function SizeGuidePage() {
  const whatsappLink = buildStoreWhatsAppLink('Hello Brandox, could you share the measurements for a suit?');

  return (
    <InfoPage
      title="Size Guide"
      intro="Our stitched suits come in sizes S, M, L and XL. Here is how to pick the right one, and how to measure if you are having an unstitched suit tailored."
    >
      <LegalSection title="Stitched suits (S to XL)">
        <p>
          Each product page shows which sizes are available for that design. Measure yourself with a
          soft tape and compare with the measurements for the design you like. Not sure? Ask us on
          WhatsApp
          {whatsappLink ? (
            <>
              {' '}
              (
              <a
                href={whatsappLink}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                message us here
              </a>
              )
            </>
          ) : null}{' '}
          before ordering — we can share the measurements of any design.
        </p>
      </LegalSection>

      <LegalSection title="How to measure">
        <LegalList
          items={[
            'Bust: around the fullest part of your chest, keeping the tape level.',
            'Waist: around the narrowest part of your waist.',
            'Hips: around the fullest part of your hips.',
            'Shirt length: from the top of your shoulder down to where you want the kameez to end.',
            'Trouser length: from your waist to your ankle.',
          ]}
        />
      </LegalSection>

      <LegalSection title="Unstitched suits and custom stitching">
        <p>
          Unstitched suits are sold as fabric, so give your tailor your own measurements. Where a
          product offers custom stitching, it is shown on the product page. Browse{' '}
          <Link href="/category/stitched" className="text-primary hover:underline">
            stitched suits
          </Link>{' '}
          or{' '}
          <Link href="/category/unstitched-suits" className="text-primary hover:underline">
            unstitched suits
          </Link>
          .
        </p>
      </LegalSection>
    </InfoPage>
  );
}
