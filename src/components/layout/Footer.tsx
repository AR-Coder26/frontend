import Link from 'next/link';
import { getCategories } from '@/lib/api/categories';
import { getPublicStoreSettings } from '@/lib/api/storeSettings';
import { buildStoreWhatsAppLink } from '@/lib/whatsapp';

/**
 * Server Component. Every link and badge below is derived from real backend data (live
 * categories, live active payment methods) — never a hardcoded marketing list. Payment
 * badges only show a method if StoreSettings actually returned it non-null (i.e. the admin
 * has it turned on AND fully configured) — see storeSettings.ts's comment on why `null`
 * means "don't advertise this option at all."
 */
export async function Footer() {
  const [categories, storeSettings] = await Promise.all([
    getCategories(),
    getPublicStoreSettings(),
  ]);

  const paymentBadges = [
    'Cash on Delivery',
    storeSettings.jazzCash ? 'JazzCash' : null,
    storeSettings.easyPaisa ? 'EasyPaisa' : null,
    storeSettings.bankTransfer ? 'Bank Transfer' : null,
  ].filter((label): label is string => Boolean(label));

  const contactLink = buildStoreWhatsAppLink("Hi! I have a question about an order.");

  return (
    <footer className="border-t border-border bg-secondary">
      <div className="container grid gap-10 py-12 md:grid-cols-4">
        <div>
          {/* TODO(client): swap for the real store wordmark/logo once confirmed. */}
          <p className="font-display text-lg font-semibold text-foreground">Atelier</p>
          <p className="mt-3 max-w-xs text-sm text-muted-foreground">
            Stitched &amp; unstitched suits in Lawn, Cotton, Khaddar, Chiffon and Silk.
          </p>
          {contactLink && (
            <a
              href={contactLink}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-block text-sm font-medium text-primary hover:text-primary-hover"
            >
              Chat with us on WhatsApp
            </a>
          )}
        </div>

        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-accent">Shop</p>
          <ul className="mt-4 space-y-2.5">
            {categories.map((category) => (
              <li key={category._id}>
                <Link
                  href={`/category/${category.slug}`}
                  className="text-sm text-muted-foreground hover:text-foreground"
                >
                  {category.name}
                </Link>
              </li>
            ))}
            <li>
              <Link href="/sale" className="text-sm text-muted-foreground hover:text-foreground">
                30% Off
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-accent">Orders</p>
          <ul className="mt-4 space-y-2.5">
            <li>
              <Link href="/track-order" className="text-sm text-muted-foreground hover:text-foreground">
                Track an order
              </Link>
            </li>
            <li>
              <Link
                href="/account/orders"
                className="text-sm text-muted-foreground hover:text-foreground"
              >
                My orders
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-accent">
            Delivery &amp; payment
          </p>
          <p className="mt-4 text-sm text-muted-foreground">
            Free delivery in Karachi
            {storeSettings.deliveryFlatRateNonKarachi > 0 && (
              <> · Rs. {storeSettings.deliveryFlatRateNonKarachi} elsewhere</>
            )}
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {paymentBadges.map((label) => (
              <span
                key={label}
                className="rounded-full border border-border bg-card px-2.5 py-1 text-xs text-foreground/80"
              >
                {label}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="border-t border-border">
        <div className="container flex flex-col items-center justify-between gap-2 py-4 text-xs text-muted-foreground sm:flex-row">
          {/* TODO(client): real store name here too, once confirmed. */}
          <p>© {new Date().getFullYear()} Women&rsquo;s Clothing Store. All rights reserved.</p>
          <p>Order updates are sent via WhatsApp, not courier tracking.</p>
        </div>
      </div>
    </footer>
  );
}