'use client';

import { useState } from 'react';
import { SlidersHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { FilterPanel } from './FilterPanel';
import type { Brand } from '@/types';

interface ProductFiltersProps {
  brands: Brand[];
}

export function ProductFilters({ brands }: ProductFiltersProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      {/* Desktop: persistent sidebar column. */}
      <aside className="hidden w-56 shrink-0 md:block">
        <FilterPanel brands={brands} />
      </aside>

      {/* Mobile: a trigger button opening the same panel in a bottom Sheet, so the "filter
          panel transition" the design mandate calls for is a real slide-up, not a plain
          inline block pushing the grid down on a small screen. */}
      <div className="mb-4 md:hidden">
        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetTrigger asChild>
            <Button variant="outline" size="sm">
              <SlidersHorizontal className="h-4 w-4" />
              Filters
            </Button>
          </SheetTrigger>
          <SheetContent side="bottom" className="max-h-[85vh] overflow-y-auto rounded-t-xl">
            <SheetHeader>
              <SheetTitle>Filters</SheetTitle>
            </SheetHeader>
            <div className="mt-4">
              <FilterPanel brands={brands} />
            </div>
            <Button className="mt-6 w-full" onClick={() => setMobileOpen(false)}>
              Show results
            </Button>
          </SheetContent>
        </Sheet>
      </div>
    </>
  );
}