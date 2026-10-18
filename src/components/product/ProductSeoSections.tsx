// frontend/src/components/product/ProductSeoSections.tsx
import { FaqSection, renderInline } from '@/components/seo/SeoCopy';
import { JsonLd } from '@/components/seo/JsonLd';
import { buildFaqJsonLd, fillCopy, type FaqItem } from '@/lib/seo';
import { RETURN_REPORT_WINDOW_DAYS } from '@/lib/legal';
import type { Product } from '@/types';

interface ProductSeoSectionsProps {
  product: Product;
  vars: Record<string, string>;
}

/** Builds the product FAQ strictly from the product's own data + the store's real policies. */
export function buildProductFaq(product: Product): FaqItem[] {
  const stitchingOptions = new Set(product.variants.map((variant) => variant.fabricStatus));
  const hasStitched = stitchingOptions.has('stitched');
  const hasUnstitched = stitchingOptions.has('unstitched');

  let stitchingAnswer: string;
  if (hasStitched && hasUnstitched) {
    stitchingAnswer = 'Both options are available. Choose stitched or unstitched on this page before adding it to your cart.';
  } else if (hasStitched) {
    stitchingAnswer = 'This suit is sold stitched (ready to wear). Pick your size on this page.';
  } else {
    stitchingAnswer = 'This suit is sold unstitched, as fabric for you to have tailored.';
  }
  if (product.isCustomStitchingAvailable) {
    stitchingAnswer += ' Custom stitching is available for this product.';
  }

  return [
    {
      question: 'What is included in this set?',
      answer: `This is a ${product.pieceCount}-piece ${product.fabricType} suit. Choose your size and stitching option on this page before adding it to your cart.`,
    },
    {
      question: 'Is this suit stitched or unstitched?',
      answer: stitchingAnswer,
    },
    {
      question: 'Can I pay on delivery?',
      answer: 'Yes, Cash on Delivery is available. Accepted payment methods: {PAYMENTS}.',
    },
    {
      question: 'Is delivery free?',
      answer: 'Delivery in Karachi is free. Elsewhere in Pakistan it is {DELIVERY_RATE}.',
    },
    {
      question: 'Can I return this suit?',
      answer: `We do not offer change-of-mind returns. If your item arrives defective, damaged or different from what you ordered, tell us within ${RETURN_REPORT_WINDOW_DAYS} days of delivery on WhatsApp. See the [Return & Refund Policy](/refund-policy).`,
    },
    {
      question: 'How will I get order updates?',
      answer:
        'Updates come by WhatsApp, and the [Track an order](/track-order) page shows the status.',
    },
  ];
}

export function ProductSeoSections({ product, vars }: ProductSeoSectionsProps) {
  const faq = buildProductFaq(product);
  const resolvedFaq = faq.map((item) => ({
    question: fillCopy(item.question, vars),
    answer: fillCopy(item.answer, vars),
  }));

  return (
    <div className="mt-12 max-w-3xl space-y-8 border-t border-border pt-10">
      <JsonLd data={buildFaqJsonLd(resolvedFaq)} />

      <section>
        <h2 className="font-display text-xl text-foreground">Delivery and Payment</h2>
        <p className="mt-3 text-sm leading-relaxed text-foreground/90">
          {renderInline(
            fillCopy(
              'Delivery in Karachi is free, and it is {DELIVERY_RATE} to the rest of Pakistan. Pay by {PAYMENTS}. See the [Karachi delivery page](/karachi) for details.',
              vars
            )
          )}
        </p>
      </section>

      <FaqSection items={faq} vars={vars} />
    </div>
  );
}
