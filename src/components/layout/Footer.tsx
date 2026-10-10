
import Link from 'next/link';
import Image from 'next/image';

import { getCategories } from '@/lib/api/categories';
import { getPublicStoreSettings } from '@/lib/api/storeSettings';
import { getSocialLinks } from '@/lib/api/socialLinks';
import { buildStoreWhatsAppLink } from '@/lib/whatsapp';
import { SocialIcon } from '@/lib/socialIcons';
import { STORE_LEGAL_NAME } from '@/lib/legal';

export async function Footer() {
  const [categories, storeSettings, socialLinks] = await Promise.all([
    getCategories(),
    getPublicStoreSettings(),
    getSocialLinks().catch(() => []),
  ]);

  const paymentBadges = [
    'Cash on Delivery',
    storeSettings.jazzCash ? 'JazzCash' : null,
    storeSettings.easyPaisa ? 'EasyPaisa' : null,
    storeSettings.bankTransfer ? 'Bank Transfer' : null,
  ].filter((label): label is string => Boolean(label));

  const contactLink = buildStoreWhatsAppLink(
    'Hi! I have a question about an order.'
  );

  const storeEmail = storeSettings.email || 'support@brandox.pk';

  return (
    <footer className="border-t border-border bg-secondary">
      {/* Main Footer */}
      <div
        className="
          container grid grid-cols-1 gap-y-8 py-10
          md:grid-cols-2
          lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.95fr)_minmax(0,0.95fr)_minmax(0,1fr)]
          lg:gap-x-8
          xl:gap-x-10 xl:py-12
        "
      >
        {/* Brand Information + Follow Us */}
        <div
          className="
            contents
            lg:col-start-1 lg:row-start-1
            lg:flex lg:flex-col lg:gap-8
          "
        >
          {/* 1. Brand Logo + Description */}
          <div className="order-1 min-w-0 lg:order-none">
            <Image
              src="/Assets/logo/Brand-logo.svg"
              alt={STORE_LEGAL_NAME}
              width={120}
              height={28}
              className="h-12 w-auto"
            />

            <p className="mt-3 max-w-sm text-[14px] leading-6 text-muted-foreground xl:text-[15px]">
              Premium Pakistani women&apos;s fashion brand offering stitched
              &amp; unstitched suits in Lawn, Cotton, Khaddar, Chiffon, Silk,
              and Organza. Designed with high-quality fabrics, intricate
              embroideries, and modern cuts for every season.
            </p>
          </div>

          {/* 4. Follow Us */}
          {socialLinks.length > 0 && (
            <div className="order-4 min-w-0 lg:order-none">
              <p className="text-xs font-medium uppercase tracking-wider text-accent xl:text-[13px]">
                Follow Us
              </p>

              <div className="mt-3 flex flex-wrap items-center gap-2.5">
                {socialLinks.map((link) => (
                  <a
                    key={link._id}
                    href={link.targetUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={link.platformName}
                    className="
                      flex h-9 w-9 items-center justify-center
                      rounded-full border border-border bg-card
                      text-foreground/70
                      transition-all duration-150
                      hover:-translate-y-0.5 hover:border-primary
                      hover:text-primary hover:shadow-sm
                    "
                  >
                    {link.logo?.url ? (
                      <Image
                        src={link.logo.url}
                        alt={link.platformName}
                        width={18}
                        height={18}
                        className="h-[18px] w-[18px] object-contain"
                      />
                    ) : (
                      <SocialIcon
                        name={link.iconName}
                        className="h-4 w-4"
                      />
                    )}
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* 2. Shop */}
        <div
          className="
            order-2 min-w-0
            lg:col-start-2 lg:row-start-1 lg:order-none
          "
        >
          <p className="text-xs font-medium uppercase tracking-wider text-accent xl:text-[13px]">
            Shop
          </p>

          <ul className="mt-4 space-y-2.5">
            {categories.map((category) => (
              <li key={category._id}>
                <Link
                  href={`/category/${category.slug}`}
                  className="
                    text-[14px] leading-5 text-muted-foreground
                    transition-colors hover:text-foreground
                    xl:text-[15px]
                  "
                >
                  {category.name}
                </Link>
              </li>
            ))}

            <li>
              <Link
                href="/sale"
                className="
                  text-[14px] leading-5 text-muted-foreground
                  transition-colors hover:text-foreground
                  xl:text-[15px]
                "
              >
                30% Off
              </Link>
            </li>
          </ul>
        </div>

        {/* 3. Orders */}
        <div
          className="
            order-3 min-w-0
            lg:col-start-3 lg:row-start-1 lg:order-none
          "
        >
          <p className="text-xs font-medium uppercase tracking-wider text-accent xl:text-[13px]">
            Orders
          </p>

          <ul className="mt-4 space-y-2.5">
            <li>
              <Link
                href="/track-order"
                className="
                  text-[14px] leading-5 text-muted-foreground
                  transition-colors hover:text-foreground
                  xl:text-[15px]
                "
              >
                Track an order
              </Link>
            </li>

            <li>
              <Link
                href="/account/orders"
                className="
                  text-[14px] leading-5 text-muted-foreground
                  transition-colors hover:text-foreground
                  xl:text-[15px]
                "
              >
                My orders
              </Link>
            </li>
          </ul>
        </div>

        {/* 5. Contact Us + 6. Delivery & Payment */}
        <div
          className="
            order-5 min-w-0
            lg:col-start-4 lg:row-start-1 lg:order-none
          "
        >
          {/* Contact Us */}
          <section aria-labelledby="footer-contact-heading">
            <p
              id="footer-contact-heading"
              className="text-xs font-medium uppercase tracking-wider text-accent xl:text-[13px]"
            >
              Contact Us
            </p>

            <ul className="mt-4 space-y-3">
              {contactLink && (
                <li>
                  <a
                    href={contactLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="
                      flex min-w-0 items-center gap-2.5
                      text-[14px] leading-5 text-muted-foreground
                      transition-colors hover:text-foreground
                      xl:text-[15px]
                    "
                  >
                    <Image
                      src="/Assets/contact/whatsapp.png"
                      alt="WhatsApp"
                      width={20}
                      height={20}
                      className="h-5 w-5 shrink-0 object-contain"
                    />

                    <span>WhatsApp</span>
                  </a>
                </li>
              )}

              <li>
                <a
                  href={`mailto:${storeEmail}`}
                  className="
                    flex min-w-0 items-center gap-2.5
                    text-[14px] leading-5 text-muted-foreground
                    transition-colors hover:text-foreground
                    xl:text-[15px]
                  "
                >
                  <Image
                    src="/Assets/contact/email-us.png"
                    alt="Email Us"
                    width={20}
                    height={20}
                    className="h-5 w-5 shrink-0 object-contain"
                  />

                  <span>Email Us</span>
                </a>
              </li>
            </ul>
          </section>

          {/* Delivery & Payment */}
          <section
            aria-labelledby="footer-delivery-heading"
            className="mt-6"
          >
            <p
              id="footer-delivery-heading"
              className="text-xs font-medium uppercase tracking-wider text-accent xl:text-[13px]"
            >
              Delivery &amp; Payment
            </p>

            <p className="mt-2 text-sm leading-5 text-muted-foreground">
              Free delivery in Karachi
              {storeSettings.deliveryFlatRateNonKarachi > 0 && (
                <>
                  {' '}
                  · Rs. {storeSettings.deliveryFlatRateNonKarachi} elsewhere
                </>
              )}
            </p>

            <div className="mt-2.5 flex flex-wrap gap-1.5">
              {paymentBadges.map((label) => (
                <span
                  key={label}
                  className="
                    rounded-full border border-border bg-card
                    px-2 py-0.5 text-[12px] leading-4
                    text-foreground/80
                  "
                >
                  {label}
                </span>
              ))}
            </div>
          </section>
        </div>
      </div>

      {/* Copyright + Legal Links + Admin */}
      <div className="border-t border-border">
        <div
          className="
            container flex flex-col items-center gap-3 py-4
            text-xs leading-5 text-muted-foreground
            sm:flex-row sm:flex-wrap sm:justify-between sm:gap-x-4
            xl:text-[13px]
          "
        >
          <p className="text-center sm:text-left">
            © {new Date().getFullYear()} {STORE_LEGAL_NAME}. All rights reserved.
          </p>

          <nav
            aria-label="Legal"
            className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1"
          >
            <Link
              href="/terms-of-service"
              className="transition-colors hover:text-foreground"
            >
              Terms of Service
            </Link>

            <Link
              href="/privacy-policy"
              className="transition-colors hover:text-foreground"
            >
              Privacy Policy
            </Link>

            <Link
              href="/refund-policy"
              className="transition-colors hover:text-foreground"
            >
              Refund Policy
            </Link>
          </nav>

          <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2">
            <p className="text-center sm:text-left">
              Order updates are sent via WhatsApp, not courier tracking.
            </p>

            <Link
              href="/admin/login"
              className="text-muted-foreground/60 transition-colors hover:text-muted-foreground"
            >
              Admin
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
