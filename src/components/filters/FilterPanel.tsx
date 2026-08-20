// frontend/src/components/filters/FilterPanel.tsx
'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { FABRIC_STATUSES, FABRIC_TYPES, SIZES } from '@/lib/constants';
import { Button } from '@/components/ui/button';
import type { Brand } from '@/types';

interface FilterPanelProps {
  brands: Brand[];
}

// Deliberately covers exactly the filter set named in the business rules — Fabric, Brand,
// Size, Stitched/Unstitched — plus a Sort control (a very standard e-commerce affordance the
// backend already supports via ?sort=). Category is handled by primary nav (Header), and the
// "30% OFF" view is its own dedicated /sale route — neither is repeated here as a chip.
export function FilterPanel({ brands }: FilterPanelProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function updateParam(key: string, value: string | null) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    params.delete('page'); // any filter change resets pagination back to page 1
    router.push(`${pathname}?${params.toString()}`);
  }

  const activeFabricType = searchParams.get('fabricType');
  const activeBrand = searchParams.get('brand');
  const activeFabricStatus = searchParams.get('fabricStatus');
  const activeSize = searchParams.get('size');
  const activeSort = searchParams.get('sort') ?? 'newest';

  const hasActiveFilters = Boolean(
    activeFabricType || activeBrand || activeFabricStatus || activeSize
  );

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-medium uppercase tracking-wider text-accent">Fabric</p>
        <div className="mt-2 flex flex-wrap gap-2">
          {FABRIC_TYPES.map((type) => (
            <button
              key={type}
              type="button"
              onClick={() => updateParam('fabricType', activeFabricType === type ? null : type)}
              className={`rounded-full border px-3 py-1 text-xs transition-colors ${
                activeFabricType === type
                  ? 'border-primary bg-primary text-primary-foreground'
                  : 'border-border text-foreground/80 hover:border-primary'
              }`}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      {brands.length > 0 && (
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-accent">Brand</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {brands.map((brand) => (
              <button
                key={brand._id}
                type="button"
                onClick={() => updateParam('brand', activeBrand === brand.slug ? null : brand.slug)}
                className={`rounded-full border px-3 py-1 text-xs transition-colors ${
                  activeBrand === brand.slug
                    ? 'border-primary bg-primary text-primary-foreground'
                    : 'border-border text-foreground/80 hover:border-primary'
                }`}
              >
                {brand.name}
              </button>
            ))}
          </div>
        </div>
      )}

      <div>
        <p className="text-xs font-medium uppercase tracking-wider text-accent">Stitching</p>
        <div className="mt-2 flex flex-wrap gap-2">
          {FABRIC_STATUSES.map((status) => (
            <button
              key={status}
              type="button"
              onClick={() =>
                updateParam('fabricStatus', activeFabricStatus === status ? null : status)
              }
              className={`rounded-full border px-3 py-1 text-xs capitalize transition-colors ${
                activeFabricStatus === status
                  ? 'border-primary bg-primary text-primary-foreground'
                  : 'border-border text-foreground/80 hover:border-primary'
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      <div>
        <p className="text-xs font-medium uppercase tracking-wider text-accent">Size</p>
        <div className="mt-2 flex flex-wrap gap-2">
          {SIZES.map((size) => (
            <button
              key={size}
              type="button"
              onClick={() => updateParam('size', activeSize === size ? null : size)}
              className={`flex h-9 w-9 items-center justify-center rounded-full border text-xs transition-colors ${
                activeSize === size
                  ? 'border-primary bg-primary text-primary-foreground'
                  : 'border-border text-foreground/80 hover:border-primary'
              }`}
            >
              {size}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label htmlFor="sort" className="text-xs font-medium uppercase tracking-wider text-accent">
          Sort by
        </label>
        <select
          id="sort"
          value={activeSort}
          onChange={(event) => updateParam('sort', event.target.value)}
          className="mt-2 w-full rounded-md border border-input bg-card px-3 py-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <option value="newest">Newest</option>
          <option value="oldest">Oldest</option>
        </select>
      </div>

      {hasActiveFilters && (
        <Button variant="ghost" size="sm" onClick={() => router.push(pathname)}>
          Clear filters
        </Button>
      )}
    </div>
  );
}
