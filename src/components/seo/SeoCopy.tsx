import Link from 'next/link';
import type { ReactNode } from 'react';
import { fillCopy, type FaqItem } from '@/lib/seo';
import type { CopyBlock } from '@/lib/seoContent';

const LINK_CLASS = 'text-primary underline-offset-2 hover:underline';

/** Turns "[label](/path)" in a string into <Link>s; everything else stays plain text. */
export function renderInline(text: string): ReactNode[] {
  const nodes: ReactNode[] = [];
  const pattern = /\[([^\]]+)\]\((\/[^)\s]*)\)/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = pattern.exec(text)) !== null) {
    if (match.index > lastIndex) nodes.push(text.slice(lastIndex, match.index));
    nodes.push(
      <Link key={`${match.index}-${match[2]}`} href={match[2]} className={LINK_CLASS}>
        {match[1]}
      </Link>
    );
    lastIndex = match.index + match[0].length;
  }
  if (lastIndex < text.length) nodes.push(text.slice(lastIndex));
  return nodes;
}

interface SeoCopyProps {
  blocks: CopyBlock[];
  vars: Record<string, string>;
  className?: string;
}

/** Below-the-grid body copy: one <h2> per block, paragraphs with internal links. */
export function SeoCopy({ blocks, vars, className }: SeoCopyProps) {
  return (
    <div className={className ?? 'mt-12 max-w-3xl space-y-8 border-t border-border pt-10'}>
      {blocks.map((block) => (
        <section key={block.heading}>
          <h2 className="font-display text-xl text-foreground">{block.heading}</h2>
          <div className="mt-3 space-y-3 text-sm leading-relaxed text-foreground/90">
            {block.paragraphs.map((paragraph) => (
              <p key={paragraph}>{renderInline(fillCopy(paragraph, vars))}</p>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}

interface FaqSectionProps {
  items: FaqItem[];
  vars: Record<string, string>;
  heading?: string;
}

/** Visible FAQ block (uses <details> so it is collapsible but still fully crawlable). */
export function FaqSection({ items, vars, heading = 'Frequently Asked Questions' }: FaqSectionProps) {
  return (
    <section>
      <h2 className="font-display text-xl text-foreground">{heading}</h2>
      <div className="mt-3 divide-y divide-border border-y border-border">
        {items.map((item) => (
          <details key={item.question} className="group py-3">
            <summary className="cursor-pointer list-none text-sm font-medium text-foreground">
              {fillCopy(item.question, vars)}
            </summary>
            <p className="mt-2 text-sm leading-relaxed text-foreground/90">
              {renderInline(fillCopy(item.answer, vars))}
            </p>
          </details>
        ))}
      </div>
    </section>
  );
}
