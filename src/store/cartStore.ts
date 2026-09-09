import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

// One saleable unit in the cart is a PRODUCT + VARIANT combination, never just a product —
// price, stock, and SKU all live on the variant (see Product.model.js). `productId` and
// `variantId` are the exact Mongo ObjectId strings POST /api/orders expects in its
// `items[]` array; everything else here is a display snapshot so the cart UI/drawer never
// needs a network round-trip just to render itself.
export interface CartItem {
  productId: string;
  variantId: string;
  productSlug: string;
  productName: string;
  image: string | null;
  color: string;
  size: "S" | "M" | "L" | "XL";
  fabricStatus: "stitched" | "unstitched";
  unitPrice: number;
  comparePrice: number | null;
  quantity: number;
  maxStock: number;
  isSelected: boolean;
}

interface CartState {
  items: CartItem[];
  isDrawerOpen: boolean;
  addItem: (
    item: Omit<CartItem, "quantity" | "isSelected">,
    quantity?: number,
  ) => void;
  removeItem: (variantId: string) => void;
  removeItems: (variantIds: string[]) => void;
  updateQuantity: (variantId: string, quantity: number) => void;
  clearCart: () => void;
  openDrawer: () => void;
  closeDrawer: () => void;
  toggleSelected: (variantId: string) => void;
  selectAll: () => void;
  deselectAll: () => void;
  /** Selects exactly one item and deselects every other item in the cart — this is what
   *  "Buy Now" uses so it always isolates to just the item just added, regardless of what
   *  was already selected/sitting in the cart before. */
  selectOnly: (variantId: string) => void;
  getSubtotal: () => number;
  getTotalItems: () => number;
  getSelectedItems: () => CartItem[];
  getSelectedSubtotal: () => number;
  getSelectedCount: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      isDrawerOpen: false,

      addItem: (item, quantity = 1) => {
        set((state) => {
          const existing = state.items.find(
            (i) => i.variantId === item.variantId,
          );

          if (existing) {
            const nextQuantity = Math.min(
              existing.quantity + quantity,
              existing.maxStock,
            );
            return {
              items: state.items.map((i) =>
                i.variantId === item.variantId
                  ? { ...i, quantity: nextQuantity }
                  : i,
              ),
              isDrawerOpen: true,
            };
          }

          const cappedQuantity = Math.max(1, Math.min(quantity, item.maxStock));
          return {
            items: [
              ...state.items,
              { ...item, quantity: cappedQuantity, isSelected: true },
            ],
            isDrawerOpen: true,
          };
        });
      },

      removeItem: (variantId) => {
        set((state) => ({
          items: state.items.filter((i) => i.variantId !== variantId),
        }));
      },

      removeItems: (variantIds) => {
        const idsToRemove = new Set(variantIds);
        set((state) => ({
          items: state.items.filter((i) => !idsToRemove.has(i.variantId)),
        }));
      },

      updateQuantity: (variantId, quantity) => {
        if (quantity <= 0) {
          get().removeItem(variantId);
          return;
        }
        set((state) => ({
          items: state.items.map((i) =>
            i.variantId === variantId
              ? { ...i, quantity: Math.min(quantity, i.maxStock) }
              : i,
          ),
        }));
      },

      clearCart: () => set({ items: [] }),
      openDrawer: () => set({ isDrawerOpen: true }),
      closeDrawer: () => set({ isDrawerOpen: false }),

      toggleSelected: (variantId) => {
        set((state) => ({
          items: state.items.map((i) =>
            i.variantId === variantId ? { ...i, isSelected: !i.isSelected } : i,
          ),
        }));
      },

      selectAll: () => {
        set((state) => ({
          items: state.items.map((i) => ({ ...i, isSelected: true })),
        }));
      },

      deselectAll: () => {
        set((state) => ({
          items: state.items.map((i) => ({ ...i, isSelected: false })),
        }));
      },

      selectOnly: (variantId) => {
        set((state) => ({
          items: state.items.map((i) => ({
            ...i,
            isSelected: i.variantId === variantId,
          })),
        }));
      },

      getSubtotal: () =>
        get().items.reduce((sum, i) => sum + i.unitPrice * i.quantity, 0),
      getTotalItems: () => get().items.reduce((sum, i) => sum + i.quantity, 0),

      getSelectedItems: () => get().items.filter((i) => i.isSelected),
      getSelectedSubtotal: () =>
        get()
          .items.filter((i) => i.isSelected)
          .reduce((sum, i) => sum + i.unitPrice * i.quantity, 0),
      getSelectedCount: () =>
        get()
          .items.filter((i) => i.isSelected)
          .reduce((sum, i) => sum + i.quantity, 0),
    }),
    {
      name: "cart-storage",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ items: state.items }),
      version: 1,
      migrate: (persistedState, version) => {
        const state = persistedState as { items?: Array<Partial<CartItem>> };
        if (version < 1 && Array.isArray(state?.items)) {
          state.items = state.items.map((item) => ({
            ...item,
            isSelected: item.isSelected ?? true,
          }));
        }
        return state as CartState;
      },
    },
  ),
);
