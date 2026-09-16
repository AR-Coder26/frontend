import type { ReactNode } from 'react';

interface LegalPageProps {
  title: string;
  effectiveDate: string;
  intro?: ReactNode;
  children: ReactNode;
}

export function LegalPage({ title, effectiveDate, intro, children }: LegalPageProps) {
  return (
    <div className="container py-12">
      <article className="mx-auto max-w-3xl">
        <header className="border-b border-border pb-6">
          <h1 className="font-display text-3xl text-foreground">{title}</h1>
          <p className="mt-2 text-sm text-muted-foreground">Effective: {effectiveDate}</p>
          {intro && <p className="mt-4 text-sm leading-relaxed text-foreground/90">{intro}</p>}
        </header>
        <div className="mt-8 space-y-8">{children}</div>
      </article>
    </div>
  );
}

export function LegalSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section>
      <h2 className="font-display text-lg text-foreground">{title}</h2>
      <div className="mt-2.5 space-y-3 text-sm leading-relaxed text-foreground/90">{children}</div>
    </section>
  );
}

export function LegalList({ items }: { items: ReactNode[] }) {
  return (
    <ul className="list-disc space-y-1.5 pl-5">
      {items.map((item, index) => (
        <li key={index}>{item}</li>
      ))}
    </ul>
  );
}
