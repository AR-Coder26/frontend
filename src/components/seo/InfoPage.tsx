import type { ReactNode } from 'react';

interface InfoPageProps {
  title: string;
  intro?: ReactNode;
  children: ReactNode;
}

/** Same look as LegalPage but without the "Effective" date — for About, Contact, FAQ etc. */
export function InfoPage({ title, intro, children }: InfoPageProps) {
  return (
    <div className="container py-12">
      <article className="mx-auto max-w-3xl">
        <header className="border-b border-border pb-6">
          <h1 className="font-display text-3xl text-foreground">{title}</h1>
          {intro && <p className="mt-4 text-sm leading-relaxed text-foreground/90">{intro}</p>}
        </header>
        <div className="mt-8 space-y-8">{children}</div>
      </article>
    </div>
  );
}
