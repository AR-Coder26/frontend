import type { Metadata } from 'next';
import Link from 'next/link';
import { InfoPage } from '@/components/seo/InfoPage';
import { LegalSection } from '@/components/legal/LegalPage';
import { buildPageMetadata } from '@/lib/seo';
import { buildStoreWhatsAppLink } from '@/lib/whatsapp';
import { getPublicStoreSettings } from '@/lib/api/storeSettings';
import { RETURN_REPORT_WINDOW_DAYS } from '@/lib/legal';

export const metadata: Metadata = buildPageMetadata({
  title: 'Contact Brandox | WhatsApp & Email',
  description:
    'Contact Brandox on WhatsApp or email for help with an order, sizes or delivery. Order updates are sent on WhatsApp.',
  path: '/contact',
});

export default async function ContactPage() {
  const whatsappLink = buildStoreWhatsAppLink('Hello Brandox, I have a question.');

  let email: string | null = null;
  try {
    email = (await getPublicStoreSettings()).email || null;
  } catch {
    email = null;
  }

  return (
    <InfoPage
      title="Contact Us"
      intro="The fastest way to reach us is WhatsApp. We use it for order updates, cancellations and defect reports."
    >
      <LegalSection title="WhatsApp">
        {whatsappLink ? (
          <p>
            <a
              href={whatsappLink}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              Chat with us on WhatsApp
            </a>
            . Please keep your order number and the phone number used for the order ready.
          </p>
        ) : (
          <p>WhatsApp contact is not available right now. Please use email below.</p>
        )}
      </LegalSection>

      {email && (
        <LegalSection title="Email">
          <p>
            <a href={`mailto:${email}`} className="text-primary hover:underline">
              {email}
            </a>
          </p>
        </LegalSection>
      )}

      <LegalSection title="Orders, returns and delivery">
        <p>
          Check an order on the{' '}
          <Link href="/track-order" className="text-primary hover:underline">
            Track an order
          </Link>{' '}
          page. Cancellation and return requests go through WhatsApp; defective or incorrect items
          must be reported within {RETURN_REPORT_WINDOW_DAYS} days of delivery. Full details are in
          our{' '}
          <Link href="/refund-policy" className="text-primary hover:underline">
            Return &amp; Refund Policy
          </Link>
          . For delivery charges and areas, see{' '}
          <Link href="/karachi" className="text-primary hover:underline">
            Karachi delivery
          </Link>
          .
        </p>
      </LegalSection>
    </InfoPage>
  );
}
