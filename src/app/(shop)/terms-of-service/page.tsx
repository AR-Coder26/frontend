import type { Metadata } from 'next';
import Link from 'next/link';
import { LegalPage, LegalSection, LegalList } from '@/components/legal/LegalPage';
import { buildStoreWhatsAppLink } from '@/lib/whatsapp';
import { STORE_LEGAL_NAME, STORE_JURISDICTION_LINE, LEGAL_EFFECTIVE_DATE } from '@/lib/legal';

export const metadata: Metadata = {
  title: 'Terms of Service',
  description: `The terms and conditions that govern your use of ${STORE_LEGAL_NAME} and any order you place with us.`,
};

export default function TermsOfServicePage() {
  const contactLink = buildStoreWhatsAppLink('Hi! I have a question about your Terms of Service.');

  return (
    <LegalPage
      title="Terms of Service"
      effectiveDate={LEGAL_EFFECTIVE_DATE}
      intro={
        <>
          These Terms of Service (&ldquo;Terms&rdquo;) govern your access to and use of the{' '}
          {STORE_LEGAL_NAME} website, and any order you place with us. By browsing this site or
          placing an order, you agree to these Terms. Please read them carefully.
        </>
      }
    >
      <LegalSection title="1. Who we are">
        <p>{STORE_JURISDICTION_LINE} Throughout these Terms, &ldquo;we,&rdquo; &ldquo;us,&rdquo;
          and &ldquo;our&rdquo; refer to {STORE_LEGAL_NAME}, and &ldquo;you&rdquo; refers to
          anyone browsing this site or placing an order with us.</p>
      </LegalSection>

      <LegalSection title="2. Eligibility and accounts">
        <p>
          You must be able to form a legally binding contract to place an order with us. If you
          create an account, you&apos;re responsible for keeping your login details confidential
          and for all activity that happens under your account. Let us know right away if you
          believe your account has been accessed without your permission.
        </p>
        <p>
          You can also check out as a guest without creating an account. Either way, you agree to
          provide accurate, current information — particularly your name, phone number, and
          delivery address — since we rely on these to fulfil and confirm your order.
        </p>
      </LegalSection>

      <LegalSection title="3. Products, pricing and availability">
        <LegalList
          items={[
            'All prices are listed in Pakistani Rupees (PKR) and may change at any time without prior notice. The price charged is the one displayed at the time you place your order.',
            'We try to display product colors, fabric texture, and sizing as accurately as possible, but slight variations can occur due to lighting, photography, and individual screen/device display settings — this is a normal characteristic of fabric and dyeing, not a defect.',
            'Stock is not guaranteed until your order is confirmed. In rare cases where an item sells out before we can confirm your order, we will contact you to offer an alternative, a partial order, or a full cancellation.',
          ]}
        />
      </LegalSection>

      <LegalSection title="4. Placing an order and payment">
        <p>
          We currently accept Cash on Delivery, JazzCash, EasyPaisa, and Bank Transfer. For
          JazzCash, EasyPaisa, and Bank Transfer payments, you&apos;ll be asked to upload a
          screenshot of your payment as proof; we use this, together with automated text
          verification, to confirm that your payment matches your order before it is dispatched.
          Submitting a false, altered, or unrelated payment screenshot may result in your order
          being cancelled and, where appropriate, reported to the relevant authorities.
        </p>
        <p>
          Every order is followed up by a phone call and/or WhatsApp message to confirm the
          details before it is marked &ldquo;Confirmed&rdquo; and prepared for dispatch. We do
          not send order confirmations by email.
        </p>
      </LegalSection>

      <LegalSection title="5. Our right to refuse or cancel an order">
        <p>
          We may refuse, limit, or cancel any order — before or after confirmation — at our
          discretion, including where: the item is out of stock, we suspect fraud or a fake
          payment screenshot, we&apos;re unable to reach you to confirm the order after
          reasonable attempts, or the delivery address falls outside the areas we currently
          serve. Where we cancel an order you&apos;ve already paid for, we will refund you in
          line with the Refund Method &amp; Timeline described in our{' '}
          <Link href="/refund-policy" className="text-primary underline-offset-2 hover:underline">
            Refund Policy
          </Link>
          .
        </p>
      </LegalSection>

      <LegalSection title="6. Cancelling your order">
        <p>
          You may cancel your order any time before it is marked as &ldquo;Delivered&rdquo; —
          including after it has already been confirmed or dispatched — by contacting us on
          WhatsApp or phone with your order number and the phone number used to place the order.
          There is no cancellation fee. Once an order is marked &ldquo;Delivered,&rdquo; further
          changes are handled under our{' '}
          <Link href="/refund-policy" className="text-primary underline-offset-2 hover:underline">
            Refund Policy
          </Link>
          {' '}rather than as a cancellation.
        </p>
      </LegalSection>

      <LegalSection title="7. Delivery">
        <p>
          Delivery is free within Karachi; a flat delivery charge applies outside Karachi, shown
          to you at checkout. Delivery timeframes we provide are estimates, not guarantees — they
          can be affected by courier delays, weather, public holidays, or other circumstances
          outside our reasonable control. Risk in the goods passes to you once the order is
          delivered to the address you provided.
        </p>
      </LegalSection>

      <LegalSection title="8. Returns, exchanges and refunds">
        <p>
          Returns, exchanges, and refunds are handled separately from cancellations — see our{' '}
          <Link href="/refund-policy" className="text-primary underline-offset-2 hover:underline">
            Refund Policy
          </Link>
          {' '}for full details on eligibility, timeframes, and how to request one.
        </p>
      </LegalSection>

      <LegalSection title="9. Intellectual property and trademarks">
        <p>
          Everything on this site — including the {STORE_LEGAL_NAME} name and logo, product
          photography, page layouts, graphics, and written content — is owned by {STORE_LEGAL_NAME}
          or used with permission, and is protected by applicable intellectual property laws. You
          may not copy, reproduce, republish, or use any of it commercially without our prior
          written consent.
        </p>
        <p>
          Names and logos of third-party services referenced on this site — including JazzCash,
          EasyPaisa, bank names, and WhatsApp — are trademarks of their respective owners. Their
          appearance here indicates that we support them as payment or contact methods; it does
          not imply any sponsorship, partnership, or endorsement by those companies.
        </p>
      </LegalSection>

      <LegalSection title="10. Acceptable use">
        <p>
          You agree not to misuse this site — for example, by attempting to interfere with its
          normal operation, submitting fraudulent orders or payment proofs, scraping or copying
          our content or pricing for a competing use, or attempting to gain unauthorized access
          to any account or system.
        </p>
      </LegalSection>

      <LegalSection title="11. Disclaimer">
        <p>
          This site and its content are provided &ldquo;as is&rdquo; and &ldquo;as
          available,&rdquo; for general shopping purposes. While we take reasonable care to keep
          product, pricing, and delivery information accurate and up to date, we don&apos;t
          guarantee that the site will always be error-free, uninterrupted, or perfectly
          accurate, and we don&apos;t provide any professional, medical, or fabric-care advice
          beyond general product descriptions.
        </p>
      </LegalSection>

      <LegalSection title="12. Limitation of liability">
        <p>
          To the fullest extent permitted by law, {STORE_LEGAL_NAME} will not be liable for any
          indirect, incidental, or consequential loss arising from your use of this site or an
          order placed through it. Where liability cannot be excluded, our total liability to you
          for any single order is limited to the amount you paid for that order.
        </p>
      </LegalSection>

      <LegalSection title="13. Third-party services">
        <p>
          We rely on third-party services to run parts of this site and fulfil your order —
          including image hosting, JazzCash/EasyPaisa/bank payment rails, and WhatsApp for
          communication. We aren&apos;t responsible for the availability, security, or terms of
          those third-party services, which are governed by their own respective terms.
        </p>
      </LegalSection>

      <LegalSection title="14. Governing law and disputes">
        <p>
          These Terms are governed by the laws of Pakistan. Any dispute arising from these Terms
          or your use of this site will be subject to the exclusive jurisdiction of the courts of
          Karachi, Pakistan.
        </p>
      </LegalSection>

      <LegalSection title="15. Changes to these Terms">
        <p>
          We may update these Terms from time to time, for example as our policies, payment
          options, or delivery areas change. The &ldquo;Effective&rdquo; date at the top of this
          page will always reflect the latest version. Continuing to use the site after an update
          means you accept the revised Terms.
        </p>
      </LegalSection>

      <LegalSection title="16. Contact us">
        <p>
          Questions about these Terms? Reach us{' '}
          {contactLink ? (
            <a
              href={contactLink}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary underline-offset-2 hover:underline"
            >
              on WhatsApp
            </a>
          ) : (
            'via WhatsApp'
          )}
          .
        </p>
      </LegalSection>
    </LegalPage>
  );
}
