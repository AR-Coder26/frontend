export interface OverflowLayoutInput {
  /** Rendered width (px) of every overflowable link, in display order. */
  linkWidths: number[];
  /** Rendered width (px) of links that must always stay visible (never moved into "More"). */
  pinnedWidths: number[];
  /** Rendered width (px) of the "More" trigger button. */
  moreWidth: number;
  /** Horizontal gap (px) between adjacent items in the row. */
  gap: number;
  /** Width (px) available to the whole row. */
  available: number;
}

// Leaves a sliver of slack so sub-pixel rounding never pushes the last item past the edge.
const SAFETY_PX = 1;

/**
 * How many of the overflowable links fit inline, given real measured widths.
 *
 * - Returns `linkWidths.length` when everything fits: no "More" button is needed.
 * - Otherwise returns the largest k such that `k links + More + pinned links` fit; the
 *   remaining links belong in the "More" menu. May return 0 on very narrow rows.
 *
 * Purely width-driven: it never looks at how MANY categories exist, so 3 categories, 10
 * categories and 40 categories are handled by the same rule.
 */
export function computeVisibleCount({
  linkWidths,
  pinnedWidths,
  moreWidth,
  gap,
  available,
}: OverflowLayoutInput): number {
  const budget = available - SAFETY_PX;
  const sum = (values: number[]) => values.reduce((total, value) => total + value, 0);

  const itemCount = linkWidths.length + pinnedWidths.length;
  const fullWidth = sum(linkWidths) + sum(pinnedWidths) + gap * Math.max(0, itemCount - 1);
  if (fullWidth <= budget) return linkWidths.length;

  // Row = k links + More + pinned links  =>  (k + 1 + pinned) items, (k + pinned) gaps.
  let used = moreWidth + sum(pinnedWidths) + gap * pinnedWidths.length;
  let visible = 0;
  for (const width of linkWidths) {
    const next = used + width + gap;
    if (next > budget) break;
    used = next;
    visible += 1;
  }
  return visible;
}

export type MenuNavKey = 'ArrowDown' | 'ArrowUp' | 'Home' | 'End';

export function isMenuNavKey(key: string): key is MenuNavKey {
  return key === 'ArrowDown' || key === 'ArrowUp' || key === 'Home' || key === 'End';
}

/**
 * Which menu item should get focus after `key`, given the currently focused index
 * (-1 = none). Arrow keys wrap around, as in the WAI-ARIA menu/disclosure patterns.
 * Returns -1 only when the menu is empty.
 */
export function nextMenuIndex(current: number, count: number, key: MenuNavKey): number {
  if (count <= 0) return -1;
  switch (key) {
    case 'Home':
      return 0;
    case 'End':
      return count - 1;
    case 'ArrowDown':
      return current < 0 ? 0 : (current + 1) % count;
    case 'ArrowUp':
      return current < 0 ? count - 1 : (current - 1 + count) % count;
  }
}

/**
 * Type-ahead: the next label (after `current`, wrapping) that starts with the typed
 * character, case-insensitively. Returns -1 when nothing matches. Lets a keyboard user jump
 * to "Silk" in a long category list by pressing S.
 */
export function typeaheadIndex(labels: string[], current: number, character: string): number {
  const count = labels.length;
  const needle = character.toLowerCase();
  for (let step = 1; step <= count; step += 1) {
    const index = (((current + step) % count) + count) % count;
    if (labels[index]?.toLowerCase().startsWith(needle)) return index;
  }
  return -1;
}
