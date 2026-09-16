import type { Metadata } from 'next';
import { LegalPage, LegalSection, LegalList } from '@/components/legal/LegalPage';
import { buildStoreWhatsAppLink } from '@/lib/whatsapp';
import { STORE_LEGAL_NAME, STORE_JURISDICTION_LINE, LEGAL_EFFECTIVE_DATE } from '@/lib/legal';

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: `How ${STORE_LEGAL_NAME} collects, uses, and protects your personal information.`,
};

export default function PrivacyPolicyPage() {
  const contactLink = buildStoreWhatsAppLink('Hi! I have a question about your Privacy Policy.');

  return (
    <LegalPage
      title="Privacy Policy"
      effectiveDate={LEGAL_EFFECTIVE_DATE}
      intro={
        <>
          This Privacy Policy explains what personal information {STORE_LEGAL_NAME} collects when
          you use this site or place an order, why we collect it, and the choices you have. {' '}
          {STORE_JURISDICTION_LINE}
        </>
      }
    >
      <LegalSection title="1. Information you give us">
        <p>When you browse, register, or place an order, you may give us:</p>
        <LegalList
          items={[
            'Contact details: your name, phone number, WhatsApp number, and email address (email is optional for guest checkout).',
            'Delivery details: your address, city, and postal code.',
            'Account details: a password (stored in encrypted/hashed form, never in plain text), and any saved addresses.',
            'Order details: the items you buy, quantities, sizes, colors, and your chosen payment method.',
            'Payment verification screenshots: for JazzCash, EasyPaisa, and Bank Transfer orders, a screenshot of your payment confirmation, which we process using automated text-recognition (OCR) technology to help verify it matches your order, and store as part of your order record.',
          ]}
        />
      </LegalSection>

      <LegalSection title="2. Information collected automatically">
        <p>
          For security and fraud-prevention purposes, we may automatically log limited technical
          information such as IP addresses and browser/device information when you interact with
          account login or checkout. We do not currently run any third-party analytics or
          advertising trackers (such as Google Analytics or Meta Pixel) on this site. If that
          changes in the future, we will update this policy accordingly.
        </p>
      </LegalSection>

      <LegalSection title="3. How we use your information">
        <LegalList
          items={[
            'To process, confirm, and deliver your order.',
            'To verify payment for JazzCash, EasyPaisa, and Bank Transfer orders.',
            'To contact you about your order — primarily by phone call and WhatsApp, which are our main communication channels. We don\u2019t send marketing emails and don\u2019t use your email to send order confirmations.',
            'To maintain your account and saved addresses, if you register.',
            'To detect and prevent fraud, abuse, or misuse of the site.',
            'To meet our own legal and recordkeeping obligations.',
          ]}
        />
      </LegalSection>

      <LegalSection title="4. Who we share information with">
        <p>We don&apos;t sell your personal information. We do share limited information with
          the service providers that help us run the site:</p>
        <LegalList
          items={[
            'Cloudinary (image hosting) — stores product images and the payment/order-confirmation screenshots you upload.',
            'Google / Gmail — we use Gmail to send ourselves an internal notification whenever a new order is placed, so our team can review and confirm it.',
          ]}
        />
        <p>
          We may also disclose information where required by law, or to protect our rights, our
          customers, or the public.
        </p>
      </LegalSection>

      <LegalSection title="5. Cookies and local storage">
        <p>
          If you log in to an account, we use a secure, essential session cookie to keep you
          signed in — this cookie can&apos;t be read by scripts on the page. Your shopping cart
          and wishlist are saved locally in your own browser&apos;s storage rather than on our
          servers, and are never shared with anyone. We don&apos;t use non-essential cookies for
          advertising or cross-site tracking, so we don&apos;t run a cookie-consent banner at this
          time.
        </p>
      </LegalSection>

      <LegalSection title="6. Data retention">
        <p>
          We keep order and account information for as long as reasonably necessary to fulfil
          the purposes described above, including any recordkeeping we&apos;re required to keep.
          You can ask us to delete your account information at any time, subject to any orders we
          need to retain records of.
        </p>
      </LegalSection>

      <LegalSection title="7. How we protect your information">
        <p>
          We use industry-standard measures to protect your information, including encrypted
          password storage, secure transmission, and server-level protections against common web
          attacks. No online system is 100% secure, but we take reasonable steps to protect your
          data against unauthorized access.
        </p>
      </LegalSection>

      <LegalSection title="8. Your choices and rights">
        <p>
          You can review and update your account details and saved addresses at any time by
          logging in. You can ask us — via WhatsApp — to access, correct, or delete the personal
          information we hold about you, and we&apos;ll respond as required by applicable law.
          Where our data protection obligations differ by region (for example, under the GDPR for
          EU residents or the CCPA for California residents), we&apos;ll honor requests consistent
          with those frameworks to the extent they apply to you; in practice, we currently sell
          and ship only within Pakistan.
        </p>
      </LegalSection>

      <LegalSection title="9. International data storage">
        <p>
          Some of our service providers (such as Cloudinary and Google) may store or process
          data on servers located outside Pakistan. By using this site, you understand that your
          information may be processed in a country other than your own, with data protection
          laws that may differ from those in your country.
        </p>
      </LegalSection>

      <LegalSection title="10. Children's privacy">
        <p>
          This site is not directed at children, and we don&apos;t knowingly collect personal
          information from anyone under 18. If you believe a minor has provided us with personal
          information, please contact us so we can remove it.
        </p>
      </LegalSection>

      <LegalSection title="11. Changes to this policy">
        <p>
          We may update this Privacy Policy from time to time, for example as we add new
          features or service providers. The &ldquo;Effective&rdquo; date at the top of this page
          will always reflect the latest version.
        </p>
      </LegalSection>

      <LegalSection title="12. Contact us">
        <p>
          For any privacy questions or requests, reach us{' '}
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
