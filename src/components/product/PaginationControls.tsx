'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface PaginationControlsProps {
  page: number;
  totalPages: number;
}

export function PaginationControls({ page, totalPages }: PaginationControlsProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function goToPage(nextPage: number) {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', String(nextPage));
    router.push(`${pathname}?${params.toString()}`);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  return (
    <div className="mt-10 flex items-center justify-center gap-4">
      <Button
        variant="outline"
        size="sm"
        disabled={page <= 1}
        onClick={() => goToPage(page - 1)}
        aria-label="Previous page"
      >
        <ChevronLeft className="h-4 w-4" />
        Previous
      </Button>
      <span className="text-sm text-muted-foreground">
        Page {page} of {totalPages}
      </span>
      <Button
        variant="outline"
        size="sm"
        disabled={page >= totalPages}
        onClick={() => goToPage(page + 1)}
        aria-label="Next page"
      >
        Next
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  );
}