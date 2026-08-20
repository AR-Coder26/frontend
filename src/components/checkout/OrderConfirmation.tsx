import Link from 'next/link';
import { CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { buildStoreWhatsAppLink } from '@/lib/whatsapp';
import { formatPKR } from '@/lib/utils';
import type { Order, PaymentMethod } from '@/types';

interface OrderConfirmationProps {
  order: Order;
}

const MANUAL_PAYMENT_METHODS: PaymentMethod[] = ['JazzCash', 'EasyPaisa', 'BankTransfer'];

export function OrderConfirmation({ order }: OrderConfirmationProps) {
  const isManualPayment = MANUAL_PAYMENT_METHODS.includes(order.paymentMethod);
  const screenshotLink = buildStoreWhatsAppLink(
    `Hi! I've placed order #${order.orderNumber} via ${order.paymentMethod} and I'm sending my payment screenshot.`
  );

  return (
    <div className="mx-auto max-w-lg text-center">
      <CheckCircle2 className="mx-auto h-12 w-12 text-success" />
      <h1 className="mt-4 font-display text-2xl text-foreground">Order placed!</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Order <span className="font-medium text-foreground">#{order.orderNumber}</span> —
        we&rsquo;ll call you at {order.customer.phone} to confirm.
      </p>

      <div className="mt-6 rounded-md border border-border p-5 text-left text-sm">
        <div className="flex justify-between py-1">
          <span className="text-muted-foreground">Payment method</span>
          <span className="text-foreground">{order.paymentMethod}</span>
        </div>
        <div className="flex justify-between py-1">
          <span className="text-muted-foreground">Total</span>
          <span className="font-display text-base text-foreground">
            {formatPKR(order.pricing.totalAmount)}
          </span>
        </div>
      </div>

      {isManualPayment && screenshotLink && (
        <div className="mt-4 rounded-md border border-accent/40 bg-accent/5 p-4 text-left">
          <p className="text-sm font-medium text-foreground">Send your payment screenshot</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Complete your {order.paymentMethod} transfer, then send us a screenshot on
            WhatsApp so we can confirm your order.
          </p>
          <a
            href={screenshotLink}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-2 inline-block text-sm font-medium text-primary hover:text-primary-hover"
          >
            Send screenshot on WhatsApp
          </a>
        </div>
      )}

      <p className="mt-6 text-xs text-muted-foreground">
        Order updates are sent via WhatsApp. You can look up this order any time using your order number and phone number.
      </p>

      <Button asChild size="lg" className="mt-6">
        <Link href="/products">Continue Shopping</Link>
      </Button>
    </div>
  );
}