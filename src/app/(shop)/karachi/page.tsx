import type { Metadata } from 'next';
import { Breadcrumbs } from '@/components/seo/Breadcrumbs';
import { JsonLd } from '@/components/seo/JsonLd';
import { FaqSection, SeoCopy } from '@/components/seo/SeoCopy';
import { buildFaqJsonLd, buildPageMetadata, fillCopy, formatPaymentMethods } from '@/lib/seo';
import { KARACHI_FAQ, KARACHI_SEO } from '@/lib/seoContent';
import { getCopyVars } from '@/lib/seoCopyVars';
import { getPublicStoreSettings } from '@/lib/api/storeSettings';

// The meta description lists only the payment methods that are actually switched on.
export async function generateMetadata(): Promise<Metadata> {
  let description = KARACHI_SEO.description;
  try {
    const settings = await getPublicStoreSettings();
    description = `Order lawn, cotton and khaddar suits online in Karachi with free delivery. Pay by ${formatPaymentMethods(settings)}.`;
  } catch {
    // keep the static description
  }
  return buildPageMetadata({ title: KARACHI_SEO.title, description, path: '/karachi' });
}

export default async function KarachiPage() {
  const vars = await getCopyVars();
  const faqJsonLd = buildFaqJsonLd(
    KARACHI_FAQ.map((item) => ({
      question: item.question,
      answer: fillCopy(item.answer, vars),
    }))
  );

  return (
    <div className="container py-8">
      <JsonLd data={faqJsonLd} />
      <Breadcrumbs items={[{ name: 'Karachi', href: '/karachi' }]} />
      <h1 className="font-display text-3xl text-foreground">{KARACHI_SEO.h1}</h1>

      <SeoCopy
        blocks={KARACHI_SEO.blocks}
        vars={vars}
        className="mt-8 max-w-3xl space-y-8"
      />

      <div className="mt-10 max-w-3xl">
        <FaqSection items={KARACHI_FAQ} vars={vars} heading="Karachi Delivery FAQ" />
      </div>
    </div>
  );
}
