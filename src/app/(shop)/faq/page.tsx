import type { Metadata } from 'next';
import { InfoPage } from '@/components/seo/InfoPage';
import { JsonLd } from '@/components/seo/JsonLd';
import { FaqSection } from '@/components/seo/SeoCopy';
import { buildFaqJsonLd, buildPageMetadata, fillCopy, type FaqItem } from '@/lib/seo';
import { getCopyVars } from '@/lib/seoCopyVars';
import { RETURN_REPORT_WINDOW_DAYS } from '@/lib/legal';

export const metadata: Metadata = buildPageMetadata({
  title: 'FAQ | Payments, Delivery & Returns | Brandox',
  description:
    'Answers about paying by Cash on Delivery, delivery charges, order tracking, sizes and returns at Brandox.',
  path: '/faq',
});

const FAQ_ITEMS: FaqItem[] = [
  {
    question: 'What payment methods do you accept?',
    answer: 'You can pay by {PAYMENTS}.',
  },
  {
    question: 'How much is delivery?',
    answer: 'Delivery in Karachi is free. Elsewhere in Pakistan it is {DELIVERY_RATE}. See the [Karachi delivery page](/karachi).',
  },
  {
    question: 'How do I track my order?',
    answer:
      'We send order updates on WhatsApp, and the [Track an order](/track-order) page shows the status. We do not provide courier tracking.',
  },
  {
    question: 'Are your suits stitched or unstitched?',
    answer:
      'Both. See [stitched suits](/category/stitched) in sizes S to XL, or [unstitched suits](/category/unstitched-suits) to have tailored. Each product page says which options are available.',
  },
  {
    question: 'How do I choose a size?',
    answer: 'See the [size guide](/size-guide) for how to measure, or ask us on WhatsApp for the measurements of a design.',
  },
  {
    question: 'Can I return or exchange an order?',
    answer: `We do not offer change-of-mind returns or exchanges after delivery. If an item arrives defective, damaged or different from what you ordered, tell us within ${RETURN_REPORT_WINDOW_DAYS} days of delivery on WhatsApp. You can cancel an order free of charge before it is marked as Delivered. See the [Return & Refund Policy](/refund-policy).`,
  },
];

export default async function FaqPage() {
  const vars = await getCopyVars();
  const jsonLd = buildFaqJsonLd(
    FAQ_ITEMS.map((item) => ({ question: item.question, answer: fillCopy(item.answer, vars) }))
  );

  return (
    <InfoPage title="Frequently Asked Questions">
      <JsonLd data={jsonLd} />
      <FaqSection items={FAQ_ITEMS} vars={vars} heading="Orders, Delivery and Returns" />
    </InfoPage>
  );
}
