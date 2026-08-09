import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Product, ProductVariant, CartItem } from '@/types';

interface CartStore {
  items: CartItem[];
  isOpen: boolean;
  couponCode: string | null;
  discountAmount: number;
  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;
  setIsOpen: (isOpen: boolean) => void;
  addItem: (product: Product, quantity?: number, selectedSize?: string, selectedColor?: string, variant?: ProductVariant) => void;
  removeItem: (id?: string) => void;
  updateQuantity: (id?: string, quantity?: number) => void;
  applyCoupon: (code: string, discount: number) => void;
  removeCoupon: () => void;
  clearCart: () => void;
  getTotalItems: () => number;
  getSubtotal: () => number;
  getTotal: () => number;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,
      couponCode: null,
      discountAmount: 0,

      openCart: () => set({ isOpen: true }),
      closeCart: () => set({ isOpen: false }),
      toggleCart: () => set((state) => ({ isOpen: !state.isOpen })),
      setIsOpen: (isOpen) => set({ isOpen }),

      addItem: (product, quantity = 1, selectedSize, selectedColor, variant) => {
        const items = get().items;
        const itemId = `${product.id}-${selectedSize || 'default'}-${selectedColor || 'default'}`;

        const existingIndex = items.findIndex(
          (item) => (item.id || `${item.product.id}-${item.selectedSize || 'default'}-${item.selectedColor || 'default'}`) === itemId
        );

        if (existingIndex > -1) {
          const updatedItems = [...items];
          updatedItems[existingIndex].quantity += quantity;
          set({ items: updatedItems, isOpen: true });
        } else {
          set({
            items: [
              ...items,
              {
                id: itemId,
                product,
                variant,
                quantity,
                selectedSize,
                selectedColor,
              },
            ],
            isOpen: true,
          });
        }
      },

      removeItem: (id) => {
        if (!id) return;
        set({
          items: get().items.filter((item) => item.id !== id && `${item.product.id}-${item.selectedSize || 'default'}-${item.selectedColor || 'default'}` !== id),
        });
      },

      updateQuantity: (id, quantity = 1) => {
        if (!id || quantity <= 0) return;
        set({
          items: get().items.map((item) =>
            (item.id === id || `${item.product.id}-${item.selectedSize || 'default'}-${item.selectedColor || 'default'}` === id)
              ? { ...item, quantity }
              : item
          ),
        });
      },

      applyCoupon: (code, discount) => set({ couponCode: code, discountAmount: discount }),
      removeCoupon: () => set({ couponCode: null, discountAmount: 0 }),

      clearCart: () => set({ items: [], couponCode: null, discountAmount: 0 }),

      getTotalItems: () => {
        return get().items.reduce((total, item) => total + item.quantity, 0);
      },

      getSubtotal: () => {
        return get().items.reduce((total, item) => {
          const price = item.variant?.sale_price || item.variant?.price || item.product.sale_price || item.product.regular_price;
          return total + price * item.quantity;
        }, 0);
      },

      getTotal: () => {
        const subtotal = get().getSubtotal();
        return Math.max(0, subtotal - get().discountAmount);
      },
    }),
    {
      name: 'imanis-cart-storage',
    }
  )
);
