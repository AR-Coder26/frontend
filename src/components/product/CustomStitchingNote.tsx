import { buildStoreWhatsAppLink } from '@/lib/whatsapp';

interface CustomStitchingNoteProps {
  productName: string;
}

/**
 * `isCustomStitchingAvailable` is a plain informational flag on the Product model — there is
 * NO field anywhere in the Order schema to record "customer wants custom stitching" for a
 * specific order. So this is deliberately NOT a selectable checkbox that would silently do
 * nothing at checkout (that would be inventing backend behavior that doesn't exist). It's an
 * honest "message us" prompt instead, matching exactly what the backend can actually act on.
 */
export function CustomStitchingNote({ productName }: CustomStitchingNoteProps) {
  const href = buildStoreWhatsAppLink(
    `Hi! I'd like custom stitching for "${productName}". Here are my measurements: `
  );

  if (!href) return null;

  return (
    <div className="mt-6 rounded-md border border-accent/40 bg-accent/5 p-4">
      <p className="text-sm font-medium text-foreground">Custom stitching available</p>
      <p className="mt-1 text-sm text-muted-foreground">
        Message us your measurements on WhatsApp after placing your order and we&rsquo;ll
        stitch it for you.
      </p>
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-2 inline-block text-sm font-medium text-primary hover:text-primary-hover"
      >
        Message us on WhatsApp
      </a>
    </div>
  );
}