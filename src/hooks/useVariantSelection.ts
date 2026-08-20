import { useMemo, useState } from 'react';
import { SIZES } from '@/lib/constants';
import type { FabricStatus, ImageAsset, Product, ProductVariant, Size } from '@/types';

export interface VariantSelection {
  colors: string[];
  sizes: Size[];
  fabricStatuses: FabricStatus[];
  selectedColor: string;
  selectedSize: Size;
  selectedFabricStatus: FabricStatus;
  setSelectedColor: (color: string) => void;
  setSelectedSize: (size: Size) => void;
  setSelectedFabricStatus: (status: FabricStatus) => void;
  selectedVariant: ProductVariant | undefined;
  isColorAvailable: (color: string) => boolean;
  isSizeAvailable: (size: Size) => boolean;
  isFabricStatusAvailable: (status: FabricStatus) => boolean;
  displayImages: ImageAsset[];
}

/**
 * Owns the color/size/stitching selection for a Product Detail Page and resolves it to the
 * exact matching variant (or undefined, if that exact combination doesn't exist). Also
 * computes which OTHER options stay pickable given the current selection, so the UI can grey
 * out combinations that don't exist e.g. "Red" only comes in S/M, not L/XL — instead of
 * letting someone land on an impossible combination.
 *
 * Two layers of filtering, and they matter differently:
 * - OUTER (colors/sizes/fabricStatuses below): only ever lists options THIS PRODUCT offers
 *   in at least one variant — never the global SIZES/FABRIC_STATUSES from constants.ts,
 *   which are for the LISTING page's filter chips, a completely different concern.
 * - INNER (isColorAvailable etc.): given the CURRENTLY selected other two axes, is this
 *   specific option still reachable? This is what greys out "L" after picking "Red" if Red
 *   only exists in S/M.
 */
export function useVariantSelection(product: Product): VariantSelection {
  const { variants } = product;

  const colors = useMemo(() => Array.from(new Set(variants.map((v) => v.color))), [variants]);
  const sizes = useMemo(
    () => SIZES.filter((size) => variants.some((v) => v.size === size)),
    [variants]
  );
  const fabricStatuses = useMemo(
    () => Array.from(new Set(variants.map((v) => v.fabricStatus))),
    [variants]
  );

  // Default to the first IN-STOCK variant if one exists, otherwise just the first variant —
  // so price/stock show something real on first paint instead of a blank "pick an option"
  // state.
  const defaultVariant = useMemo(
    () => variants.find((v) => v.stock > 0) ?? variants[0],
    [variants]
  );

  const [selectedColor, setSelectedColor] = useState(defaultVariant?.color ?? colors[0] ?? '');
  const [selectedSize, setSelectedSize] = useState<Size>(defaultVariant?.size ?? sizes[0] ?? 'S');
  const [selectedFabricStatus, setSelectedFabricStatus] = useState<FabricStatus>(
    defaultVariant?.fabricStatus ?? fabricStatuses[0] ?? 'unstitched'
  );

  const selectedVariant = useMemo(
    () =>
      variants.find(
        (v) =>
          v.color === selectedColor &&
          v.size === selectedSize &&
          v.fabricStatus === selectedFabricStatus
      ),
    [variants, selectedColor, selectedSize, selectedFabricStatus]
  );

  const isColorAvailable = (color: string) =>
    variants.some(
      (v) => v.color === color && v.size === selectedSize && v.fabricStatus === selectedFabricStatus
    );
  const isSizeAvailable = (size: Size) =>
    variants.some(
      (v) => v.color === selectedColor && v.size === size && v.fabricStatus === selectedFabricStatus
    );
  const isFabricStatusAvailable = (status: FabricStatus) =>
    variants.some(
      (v) => v.color === selectedColor && v.size === selectedSize && v.fabricStatus === status
    );

  const displayImages =
    selectedVariant && selectedVariant.images.length > 0 ? selectedVariant.images : product.images;

  return {
    colors,
    sizes,
    fabricStatuses,
    selectedColor,
    selectedSize,
    selectedFabricStatus,
    setSelectedColor,
    setSelectedSize,
    setSelectedFabricStatus,
    selectedVariant,
    isColorAvailable,
    isSizeAvailable,
    isFabricStatusAvailable,
    displayImages,
  };
}