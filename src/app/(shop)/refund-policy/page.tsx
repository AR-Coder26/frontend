import type { Metadata } from 'next';
import Link from 'next/link';
import { LegalPage, LegalSection, LegalList } from '@/components/legal/LegalPage';
import { buildStoreWhatsAppLink } from '@/lib/whatsapp';
import { STORE_LEGAL_NAME, LEGAL_EFFECTIVE_DATE, RETURN_REPORT_WINDOW_DAYS } from '@/lib/legal';

export const metadata: Metadata = {
  title: 'Return & Refund Policy',
  description: `Our order cancellation, return, and refund rules at ${STORE_LEGAL_NAME}.`,
};

export default function RefundPolicyPage() {
  const contactLink = buildStoreWhatsAppLink('Hi! I\u2019d like to cancel/return an order.');

  const ContactLinkText = ({ children }: { children: string }) =>
    contactLink ? (
      <a
        href={contactLink}
        target="_blank"
        rel="noopener noreferrer"
        className="text-primary underline-offset-2 hover:underline"
      >
        {children}
      </a>
    ) : (
      <>{children}</>
    );

  return (
    <LegalPage
      title="Return & Refund Policy"
      effectiveDate={LEGAL_EFFECTIVE_DATE}
      intro={
        <>
          This policy explains how order cancellations, returns, and refunds work at{' '}
          {STORE_LEGAL_NAME}. It works alongside our{' '}
          <Link href="/terms-of-service" className="text-primary underline-offset-2 hover:underline">
            Terms of Service
          </Link>
          .
        </>
      }
    >
      <LegalSection title="1. Cancelling before delivery">
        <p>
          You can cancel your order free of charge at any time before it is marked as
          &ldquo;Delivered&rdquo; — this includes orders that have already been confirmed or
          dispatched for delivery. To cancel, contact us on{' '}
          <ContactLinkText>WhatsApp</ContactLinkText> or by phone with your order number and the
          phone number used to place the order. If you&apos;ve already paid via JazzCash,
          EasyPaisa, or Bank Transfer, we&apos;ll refund you as described in Section 4 below.
        </p>
      </LegalSection>

      <LegalSection title="2. Returns and exchanges after delivery">
        <p>
          Once an order is delivered, we don&apos;t offer general &ldquo;change of mind&rdquo;
          returns or exchanges. The one exception is if your item arrives defective, damaged, or
          different from what you ordered (wrong item, size, or color) — see Section 3.
        </p>
      </LegalSection>

      <LegalSection title="3. Defective or incorrect items">
        <p>
          If your item arrives defective, damaged, or doesn&apos;t match what you ordered, let us
          know within <strong>{RETURN_REPORT_WINDOW_DAYS} days</strong> of delivery by contacting
          us on <ContactLinkText>WhatsApp</ContactLinkText> with your order number and a photo or
          video showing the issue. To be eligible, the item should be unused, unworn, unwashed,
          and in its original packaging with tags attached. Once we confirm the issue, we&apos;ll
          arrange a pickup and, depending on your preference and stock availability, offer a
          replacement, an exchange, or a refund.
        </p>
      </LegalSection>

      <LegalSection title="4. Return shipping and refund method">
        <LegalList
          items={[
            'For defective, damaged, or incorrect items confirmed under Section 3, we cover the return shipping cost.',
            'Refunds are issued to the original payment method where possible (JazzCash, EasyPaisa, or bank transfer back to the account you paid from). For Cash on Delivery orders that are cancelled before dispatch, no payment has been taken, so there\u2019s nothing to refund.',
            'Refunds are processed within a reasonable time after we receive and inspect the returned item, or after a pre-delivery cancellation is confirmed.',
          ]}
        />
      </LegalSection>

      <LegalSection title="5. How to request a cancellation, return, or refund">
        <p>
          All cancellation and return requests go through{' '}
          <ContactLinkText>WhatsApp</ContactLinkText> — we don&apos;t process these over email.
          Please have your order number and the phone number used for the order ready; for
          defective/incorrect items, please also include a photo or video of the issue so we can
          resolve it quickly.
        </p>
      </LegalSection>

      <LegalSection title="6. Changes to this policy">
        <p>
          We may update this Return &amp; Refund Policy from time to time. The
          &ldquo;Effective&rdquo; date at the top of this page will always reflect the latest
          version.
        </p>
      </LegalSection>
    </LegalPage>
  );
}
