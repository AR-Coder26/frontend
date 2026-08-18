import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

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
  size: 'S' | 'M' | 'L' | 'XL';
  fabricStatus: 'stitched' | 'unstitched';
  unitPrice: number;
  comparePrice: number | null;
  quantity: number;
  /** variant.stock at the moment this was added — caps quantity client-side as a UX nicety.
   *  The server independently re-validates real stock at checkout via an atomic
   *  findOneAndUpdate with a $gte guard (see order.controller.js), so this is never the
   *  actual security boundary — just prevents an obviously-doomed checkout attempt. */
  maxStock: number;
}

interface CartState {
  items: CartItem[];
  isDrawerOpen: boolean;
  addItem: (item: Omit<CartItem, 'quantity'>, quantity?: number) => void;
  removeItem: (variantId: string) => void;
  updateQuantity: (variantId: string, quantity: number) => void;
  clearCart: () => void;
  openDrawer: () => void;
  closeDrawer: () => void;
  getSubtotal: () => number;
  getTotalItems: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      isDrawerOpen: false,

      addItem: (item, quantity = 1) => {
        set((state) => {
          const existing = state.items.find((i) => i.variantId === item.variantId);

          if (existing) {
            const nextQuantity = Math.min(existing.quantity + quantity, existing.maxStock);
            return {
              items: state.items.map((i) =>
                i.variantId === item.variantId ? { ...i, quantity: nextQuantity } : i
              ),
              isDrawerOpen: true,
            };
          }

          const cappedQuantity = Math.max(1, Math.min(quantity, item.maxStock));
          return {
            items: [...state.items, { ...item, quantity: cappedQuantity }],
            isDrawerOpen: true,
          };
        });
      },

      removeItem: (variantId) => {
        set((state) => ({ items: state.items.filter((i) => i.variantId !== variantId) }));
      },

      updateQuantity: (variantId, quantity) => {
        if (quantity <= 0) {
          get().removeItem(variantId);
          return;
        }
        set((state) => ({
          items: state.items.map((i) =>
            i.variantId === variantId ? { ...i, quantity: Math.min(quantity, i.maxStock) } : i
          ),
        }));
      },

      clearCart: () => set({ items: [] }),
      openDrawer: () => set({ isDrawerOpen: true }),
      closeDrawer: () => set({ isDrawerOpen: false }),

      getSubtotal: () => get().items.reduce((sum, i) => sum + i.unitPrice * i.quantity, 0),
      getTotalItems: () => get().items.reduce((sum, i) => sum + i.quantity, 0),
    }),
    {
      name: 'cart-storage',
      storage: createJSONStorage(() => localStorage),
      // The drawer's open/closed state is a UI ripple, not data worth surviving a
      // refresh — only `items` gets written to localStorage.
      partialize: (state) => ({ items: state.items }),
    }
  )
);