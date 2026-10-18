// frontend/src/components/blog/ArticleBody.tsx
import { renderInline } from '@/components/seo/SeoCopy';
import { fillCopy } from '@/lib/seo';
import type { ArticleBlock } from '@/content/blog/types';

interface ArticleBodyProps {
  blocks: ArticleBlock[];
  vars: Record<string, string>;
}

/** Renders article blocks with real headings, lists and internal links. */
export function ArticleBody({ blocks, vars }: ArticleBodyProps) {
  const text = (value: string) => renderInline(fillCopy(value, vars));

  return (
    <div className="space-y-4 text-[15px] leading-relaxed text-foreground/90">
      {blocks.map((block, index) => {
        const key = `${block.type}-${index}`;
        switch (block.type) {
          case 'h2':
            return (
              <h2 key={key} className="pt-6 font-display text-2xl text-foreground">
                {block.text}
              </h2>
            );
          case 'h3':
            return (
              <h3 key={key} className="pt-2 font-display text-lg text-foreground">
                {block.text}
              </h3>
            );
          case 'p':
            return <p key={key}>{text(block.text)}</p>;
          case 'ul':
            return (
              <ul key={key} className="list-disc space-y-2 pl-6">
                {block.items.map((item) => (
                  <li key={item}>{text(item)}</li>
                ))}
              </ul>
            );
          case 'ol':
            return (
              <ol key={key} className="list-decimal space-y-2 pl-6">
                {block.items.map((item) => (
                  <li key={item}>{text(item)}</li>
                ))}
              </ol>
            );
        }
      })}
    </div>
  );
}
