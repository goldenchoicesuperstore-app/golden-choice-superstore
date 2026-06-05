import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { CartItem } from '../types';

interface CartState {
  items: CartItem[];
  subtotal: number;
  deliveryFee: number;
  tax: number;
  total: number;
  itemCount: number;
  
  addItem: (item: CartItem) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
}

const calculateTotals = (items: CartItem[]) => {
  const subtotal = items.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const itemCount = items.reduce((acc, item) => acc + item.quantity, 0);
  
  // Delivery fee is free above ₦50,000, else ₦1,500. Empty cart has 0 delivery fee.
  const deliveryFee = subtotal === 0 ? 0 : subtotal > 50000 ? 0 : 1500;
  
  // 7.5% tax
  const tax = subtotal * 0.075;
  
  const total = subtotal + deliveryFee + tax;
  
  return { subtotal, itemCount, deliveryFee, tax, total };
};

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      subtotal: 0,
      deliveryFee: 0,
      tax: 0,
      total: 0,
      itemCount: 0,

      addItem: (item) => set((state) => {
        const existingItem = state.items.find((i) => i.productId === item.productId);
        let newItems;
        
        if (existingItem) {
          newItems = state.items.map((i) =>
            i.productId === item.productId
              ? { 
                  ...i, 
                  quantity: Math.min(i.quantity + item.quantity, i.maxQuantity || Infinity) 
                }
              : i
          );
        } else {
          newItems = [...state.items, item];
        }
        
        return { items: newItems, ...calculateTotals(newItems) };
      }),

      removeItem: (productId) => set((state) => {
        const newItems = state.items.filter((i) => i.productId !== productId);
        return { items: newItems, ...calculateTotals(newItems) };
      }),

      updateQuantity: (productId, quantity) => set((state) => {
        const newItems = state.items.map((i) => {
          if (i.productId === productId) {
            // Ensure quantity doesn't exceed maxQuantity and doesn't go below 1
            const safeQuantity = Math.max(1, Math.min(quantity, i.maxQuantity || Infinity));
            return { ...i, quantity: safeQuantity };
          }
          return i;
        });
        
        return { items: newItems, ...calculateTotals(newItems) };
      }),

      clearCart: () => set({ 
        items: [], 
        subtotal: 0, 
        deliveryFee: 0, 
        tax: 0, 
        total: 0, 
        itemCount: 0 
      })
    }),
    {
      name: 'cart-storage',
    }
  )
);
