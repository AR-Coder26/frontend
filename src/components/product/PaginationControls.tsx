'use client';

import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface PaginationControlsProps {
  page: number;
  totalPages: number;
}

/**
 * Prev/Next are real <a href> links (via next/link), not click handlers, so Googlebot can
 * follow them to page 2, 3 ... The "disabled" ends stay plain disabled buttons.
 */
export function PaginationControls({ page, totalPages }: PaginationControlsProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function hrefFor(targetPage: number): string {
    const params = new URLSearchParams(searchParams.toString());
    if (targetPage <= 1) {
      params.delete('page'); // page 1 is the clean URL — no ?page=1 duplicate
    } else {
      params.set('page', String(targetPage));
    }
    const query = params.toString();
    return query ? `${pathname}?${query}` : pathname;
  }

  return (
    <nav aria-label="Pagination" className="mt-10 flex items-center justify-center gap-4">
      {page <= 1 ? (
        <Button variant="outline" size="sm" disabled aria-label="Previous page">
          <ChevronLeft className="h-4 w-4" />
          Previous
        </Button>
      ) : (
        <Button variant="outline" size="sm" asChild>
          <Link href={hrefFor(page - 1)} rel="prev" aria-label="Previous page">
            <ChevronLeft className="h-4 w-4" />
            Previous
          </Link>
        </Button>
      )}

      <span className="text-sm text-muted-foreground">
        Page {page} of {totalPages}
      </span>

      {page >= totalPages ? (
        <Button variant="outline" size="sm" disabled aria-label="Next page">
          Next
          <ChevronRight className="h-4 w-4" />
        </Button>
      ) : (
        <Button variant="outline" size="sm" asChild>
          <Link href={hrefFor(page + 1)} rel="next" aria-label="Next page">
            Next
            <ChevronRight className="h-4 w-4" />
          </Link>
        </Button>
      )}
    </nav>
  );
}
