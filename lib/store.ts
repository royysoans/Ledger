import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export interface CartItem {
  id: string;
  name: string;
  category: string;
  price: number;
  quantity: number;
}

export interface FilterState {
  searchQuery: string;
  category: string;
  minAmount: number;
  sortBy: "date-desc" | "date-asc" | "amount-desc" | "amount-asc";
}

interface AppStoreState {
  cart: CartItem[];
  isCartOpen: boolean;
  filters: FilterState;
  
  addItem: (item: Omit<CartItem, "quantity">) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, delta: number) => void;
  clearCart: () => void;
  setCartOpen: (open: boolean) => void;
  toggleCart: () => void;
  setFilter: <K extends keyof FilterState>(key: K, value: FilterState[K]) => void;
  resetFilters: () => void;
}

const initialFilters: FilterState = {
  searchQuery: "",
  category: "ALL",
  minAmount: 0,
  sortBy: "date-desc",
};

export const useAppStore = create<AppStoreState>()(
  persist(
    (set) => ({
      cart: [
        {
          id: "item-1",
          name: "Enterprise Compute Cluster",
          category: "Cloud Infrastructure",
          price: 240.0,
          quantity: 1,
        },
        {
          id: "item-2",
          name: "Zero-Trust Security Gateway",
          category: "Security",
          price: 180.0,
          quantity: 2,
        },
      ],
      isCartOpen: false,
      filters: initialFilters,

      addItem: (item) =>
        set((state) => {
          const existing = state.cart.find((i) => i.id === item.id);
          if (existing) {
            return {
              cart: state.cart.map((i) =>
                i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
              ),
            };
          }
          return { cart: [...state.cart, { ...item, quantity: 1 }] };
        }),

      removeItem: (id) =>
        set((state) => ({
          cart: state.cart.filter((item) => item.id !== id),
        })),

      updateQuantity: (id, delta) =>
        set((state) => ({
          cart: state.cart
            .map((item) => {
              if (item.id === id) {
                const newQty = item.quantity + delta;
                return newQty > 0 ? { ...item, quantity: newQty } : null;
              }
              return item;
            })
            .filter((item): item is CartItem => item !== null),
        })),

      clearCart: () => set({ cart: [] }),

      setCartOpen: (open) => set({ isCartOpen: open }),

      toggleCart: () => set((state) => ({ isCartOpen: !state.isCartOpen })),

      setFilter: (key, value) =>
        set((state) => ({
          filters: { ...state.filters, [key]: value },
        })),

      resetFilters: () => set({ filters: initialFilters }),
    }),
    {
      name: "fst-enterprise-store",
      storage: createJSONStorage(() =>
        typeof window !== "undefined"
          ? localStorage
          : {
              getItem: () => null,
              setItem: () => {},
              removeItem: () => {},
            }
      ),
      partialize: (state) => ({
        cart: state.cart,
        filters: state.filters,
      }),
    }
  )
);

export const useCartCount = () =>
  useAppStore((state) => state.cart.reduce((acc, item) => acc + item.quantity, 0));

export const useCartTotal = () =>
  useAppStore((state) =>
    state.cart.reduce((acc, item) => acc + item.price * item.quantity, 0)
  );

export const useCartItems = () => useAppStore((state) => state.cart);

export const useIsCartOpen = () => useAppStore((state) => state.isCartOpen);

export const useCartActions = () => {
  const addItem = useAppStore((state) => state.addItem);
  const removeItem = useAppStore((state) => state.removeItem);
  const updateQuantity = useAppStore((state) => state.updateQuantity);
  const clearCart = useAppStore((state) => state.clearCart);
  const setCartOpen = useAppStore((state) => state.setCartOpen);
  const toggleCart = useAppStore((state) => state.toggleCart);

  return {
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    setCartOpen,
    toggleCart,
  };
};

export const useFilterStore = () => {
  const filters = useAppStore((state) => state.filters);
  const setFilter = useAppStore((state) => state.setFilter);
  const resetFilters = useAppStore((state) => state.resetFilters);

  return {
    filters,
    setFilter,
    resetFilters,
  };
};
