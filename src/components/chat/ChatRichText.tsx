// frontend/src/components/chat/ChatRichText.tsx
import type { ReactNode } from 'react';

// The assistant may use **bold** and "- " bullet lines. This renders just those two things as
// real elements (React escapes everything else) — no markdown library and no raw HTML.
function renderInline(line: string): ReactNode[] {
  return line.split(/(\*\*[^*\n]+\*\*)/g).map((part, i) =>
    part.length > 4 && part.startsWith('**') && part.endsWith('**') ? (
      <strong key={i} className="font-semibold">
        {part.slice(2, -2)}
      </strong>
    ) : (
      part.replace(/\*+/g, '')
    )
  );
}

export function ChatRichText({ text }: { text: string }) {
  const nodes: ReactNode[] = [];
  let bullets: string[] = [];

  const flushBullets = (key: string) => {
    if (bullets.length === 0) return;
    nodes.push(
      <ul key={key} className="ml-4 list-disc space-y-0.5">
        {bullets.map((item, i) => (
          <li key={i}>{renderInline(item)}</li>
        ))}
      </ul>
    );
    bullets = [];
  };

  text.split('\n').forEach((raw, i) => {
    const line = raw.trim();
    const bullet = /^[-*•]\s+(.*)$/.exec(line);
    if (bullet) {
      bullets.push(bullet[1] ?? '');
      return;
    }
    flushBullets(`ul-${i}`);
    if (line) nodes.push(<p key={`p-${i}`}>{renderInline(line)}</p>);
  });
  flushBullets('ul-end');

  return <div className="space-y-2">{nodes}</div>;
}
