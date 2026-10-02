'use client';

import { useCallback, useEffect, useId, useLayoutEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { computeVisibleCount } from '@/lib/overflowNav';

export interface OverflowNavLink {
  label: string;
  href: string;
}

interface OverflowNavProps {
  /** Links that may move into the "More" menu when the bar runs out of room. */
  links: OverflowNavLink[];
  /** Links that always stay in the bar (e.g. the "30% Off" promotion). */
  pinnedLinks?: OverflowNavLink[];
  'aria-label'?: string;
}

// Shared by the real links and the invisible measuring copies, so measured widths are the
// widths the visible row actually uses.
const itemTextClass = 'shrink-0 whitespace-nowrap py-2 text-sm';
const linkClass = `group relative ${itemTextClass} text-foreground/80 transition-colors hover:text-foreground`;

// Signature interaction: a thread of gold draws in under the label on hover — a nod to the
// zari/gota trim on the fabrics this store actually sells, not a generic underline.
const threadClass =
  'absolute inset-x-0 -bottom-px h-px origin-left scale-x-0 bg-accent transition-transform duration-300 ease-out group-hover:scale-x-100';

/**
 * Desktop category bar that adapts to however many categories the backend returns.
 *
 * It measures real rendered widths and shows as many links as fit; the rest go into a
 * "More" disclosure menu. Nothing here depends on a category COUNT: few categories -> all
 * shown and no "More"; many -> some in the bar plus "More"; very many -> the menu scrolls.
 * It re-measures on resize and when web fonts finish loading.
 *
 * Before the first client-side measurement (server render), every link is rendered in a
 * single clipped row so the header can never wrap or grow taller.
 */
export function OverflowNav({ links, pinnedLinks = [], 'aria-label': ariaLabel }: OverflowNavProps) {
  const pathname = usePathname();
  const panelId = useId();
  const navRef = useRef<HTMLElement>(null);
  const sizerRef = useRef<HTMLDivElement>(null);
  const moreWrapRef = useRef<HTMLDivElement>(null);
  const moreButtonRef = useRef<HTMLButtonElement>(null);

  // null = not measured yet (show everything, clipped).
  const [visibleCount, setVisibleCount] = useState<number | null>(null);
  const [open, setOpen] = useState(false);

  const measure = useCallback(() => {
    const nav = navRef.current;
    const sizer = sizerRef.current;
    if (!nav || !sizer) return;

    // 0 while the bar is display:none (below the md breakpoint) — nothing to lay out then.
    const available = nav.clientWidth;
    if (available === 0) return;

    const widthsOf = (selector: string) =>
      Array.from(sizer.querySelectorAll<HTMLElement>(selector)).map(
        (el) => el.getBoundingClientRect().width
      );

    const next = computeVisibleCount({
      linkWidths: widthsOf('[data-sizer="link"]'),
      pinnedWidths: widthsOf('[data-sizer="pinned"]'),
      moreWidth: widthsOf('[data-sizer="more"]')[0] ?? 0,
      gap: parseFloat(getComputedStyle(sizer).columnGap) || 0,
      available,
    });
    setVisibleCount((previous) => (previous === next ? previous : next));
  }, []);

  const signature = [...links, ...pinnedLinks].map((link) => link.label).join('\u0000');

  // Measure before paint whenever the set of labels changes…
  useLayoutEffect(() => {
    measure();
  }, [measure, signature]);

  // …and again whenever the bar or the measuring row changes size (window resize, fonts).
  useEffect(() => {
    const nav = navRef.current;
    const sizer = sizerRef.current;
    if (!nav || !sizer) return;

    const observer = new ResizeObserver(() => measure());
    observer.observe(nav);
    observer.observe(sizer);

    let cancelled = false;
    void document.fonts?.ready.then(() => {
      if (!cancelled) measure();
    });

    return () => {
      cancelled = true;
      observer.disconnect();
    };
  }, [measure]);

  const shown = visibleCount === null ? links : links.slice(0, visibleCount);
  const overflow = visibleCount === null ? [] : links.slice(visibleCount);
  const hasOverflow = overflow.length > 0;
  const isOpen = open && hasOverflow;

  const isActive = (href: string) => pathname === href || pathname.startsWith(`${href}/`);
  const overflowIsActive = overflow.some((link) => isActive(link.href));

  // Navigating (from the menu or anywhere else) closes the menu.
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!isOpen) return;

    const onPointerDown = (event: PointerEvent) => {
      if (!moreWrapRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const onFocusIn = (event: FocusEvent) => {
      if (!moreWrapRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpen(false);
        moreButtonRef.current?.focus();
      }
    };

    document.addEventListener('pointerdown', onPointerDown);
    document.addEventListener('focusin', onFocusIn);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('pointerdown', onPointerDown);
      document.removeEventListener('focusin', onFocusIn);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [isOpen]);

  const renderLink = (link: OverflowNavLink) => (
    <Link
      key={link.href}
      href={link.href}
      aria-current={isActive(link.href) ? 'page' : undefined}
      className={linkClass}
    >
      {link.label}
      <span className={threadClass} />
    </Link>
  );

  return (
    <nav
      ref={navRef}
      aria-label={ariaLabel}
      className="relative hidden min-w-0 flex-1 justify-center md:flex"
    >
      {/* Invisible measuring copy of every item. `invisible` removes it from the tab order
          and accessibility tree; spans (not links) so crawlers never see duplicates. The
          overflow-hidden wrapper stops this wide row from creating a horizontal page scrollbar
          — clipping never changes the widths we measure. */}
      <div aria-hidden="true" className="pointer-events-none invisible absolute inset-0 overflow-hidden">
        <div ref={sizerRef} className="absolute left-0 top-0 flex w-max gap-7">
          {links.map((link) => (
            <span key={link.href} data-sizer="link" className={itemTextClass}>
              {link.label}
            </span>
          ))}
          <span data-sizer="more" className={cn(itemTextClass, 'inline-flex items-center gap-1')}>
            More
            <ChevronDown className="h-3.5 w-3.5" />
          </span>
          {pinnedLinks.map((link) => (
            <span key={link.href} data-sizer="pinned" className={itemTextClass}>
              {link.label}
            </span>
          ))}
        </div>
      </div>

      <div className={cn('flex min-w-0 max-w-full items-center gap-7', visibleCount === null && 'overflow-hidden')}>
        {shown.map(renderLink)}

        {hasOverflow && (
          <div ref={moreWrapRef} className="relative shrink-0">
            <button
              ref={moreButtonRef}
              type="button"
              onClick={() => setOpen((value) => !value)}
              aria-expanded={isOpen}
              aria-controls={isOpen ? panelId : undefined}
              className={cn(
                linkClass,
                'inline-flex items-center gap-1',
                (isOpen || overflowIsActive) && 'text-foreground'
              )}
            >
              More
              <ChevronDown
                className={cn('h-3.5 w-3.5 transition-transform duration-200', isOpen && 'rotate-180')}
                aria-hidden="true"
              />
              <span className={threadClass} />
            </button>

            {isOpen && (
              <div
                id={panelId}
                className="absolute right-0 top-full z-50 mt-2 max-h-[min(24rem,calc(100dvh-8rem))] w-60 max-w-[calc(100vw-2rem)] overflow-y-auto rounded-md border border-border bg-background p-1 shadow-lg"
              >
                <ul className="flex flex-col">
                  {overflow.map((link) => (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        onClick={() => setOpen(false)}
                        aria-current={isActive(link.href) ? 'page' : undefined}
                        className="block rounded-sm px-3 py-2 text-sm text-foreground/80 hover:bg-secondary hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {pinnedLinks.map(renderLink)}
      </div>
    </nav>
  );
}