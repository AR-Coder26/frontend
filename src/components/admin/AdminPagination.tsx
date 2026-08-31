'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';

interface AdminPaginationProps {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export function AdminPagination({ page, totalPages, onPageChange }: AdminPaginationProps) {
  if (totalPages <= 1) return null;

  return (
    <div className="mt-4 flex items-center justify-center gap-3">
      <button
        type="button"
        disabled={page <= 1}
        onClick={() => onPageChange(page - 1)}
        className="flex items-center gap-1 rounded-md border border-neutral-300 px-3 py-1.5 text-xs font-medium text-neutral-700 hover:bg-neutral-100 disabled:cursor-not-allowed disabled:opacity-40"
      >
        <ChevronLeft className="h-3.5 w-3.5" /> Previous
      </button>
      <span className="text-xs text-neutral-500">
        Page {page} of {totalPages}
      </span>
      <button
        type="button"
        disabled={page >= totalPages}
        onClick={() => onPageChange(page + 1)}
        className="flex items-center gap-1 rounded-md border border-neutral-300 px-3 py-1.5 text-xs font-medium text-neutral-700 hover:bg-neutral-100 disabled:cursor-not-allowed disabled:opacity-40"
      >
        Next <ChevronRight className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}
