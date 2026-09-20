"use client";

import * as React from "react";
import {
  useCartItems,
  useCartTotal,
  useCartCount,
  useIsCartOpen,
  useCartActions,
} from "@/lib/store";
import { ShoppingBag, Plus, Minus, Trash2, X, ArrowRight } from "lucide-react";

export function CartSheet() {
  const [mounted, setMounted] = React.useState(false);
  const isOpen = useIsCartOpen();
  const items = useCartItems();
  const total = useCartTotal();
  const count = useCartCount();
  const { updateQuantity, removeItem, clearCart, setCartOpen } = useCartActions();

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || !isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/30 backdrop-blur-xs transition-opacity duration-200">
      <div className="flex h-full w-full max-w-md flex-col bg-white shadow-2xl transition-transform dark:bg-black sm:border-l sm:border-zinc-200 dark:sm:border-zinc-800">
        <div className="flex items-center justify-between border-b border-zinc-100 px-6 py-4 dark:border-zinc-800">
          <div className="flex items-center gap-2.5">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-zinc-100 dark:bg-zinc-900">
              <ShoppingBag className="h-3.5 w-3.5 text-black dark:text-white" />
            </div>
            <div>
              <h2 className="text-sm font-semibold tracking-tight text-black dark:text-white">
                Persistent Cart
              </h2>
              <p className="text-[11px] text-zinc-500">
                {count} {count === 1 ? "item" : "items"} saved in browser storage
              </p>
            </div>
          </div>
          <button
            onClick={() => setCartOpen(false)}
            aria-label="Close cart"
            className="rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-100 hover:text-black dark:hover:bg-zinc-900 dark:hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-3">
          {items.length === 0 ? (
            <div className="flex h-64 flex-col items-center justify-center text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-zinc-100 dark:bg-zinc-900 mb-3">
                <ShoppingBag className="h-5 w-5 text-zinc-400" />
              </div>
              <p className="text-xs font-medium text-black dark:text-white">Your cart is empty</p>
              <p className="text-[11px] text-zinc-500 mt-1 max-w-xs">
                Add ledger items from the table to test persistent Zustand state across page refreshes.
              </p>
            </div>
          ) : (
            items.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between rounded-xl border border-zinc-200 bg-white p-3 text-xs dark:border-zinc-800 dark:bg-black"
              >
                <div className="space-y-1">
                  <div className="font-semibold text-black dark:text-white">{item.name}</div>
                  <div className="text-[10px] text-zinc-500">{item.category}</div>
                  <div className="font-mono text-xs font-bold text-black dark:text-white">
                    ₹{(item.price * item.quantity).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="flex items-center rounded-lg border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-black">
                    <button
                      onClick={() => updateQuantity(item.id, -1)}
                      className="p-1.5 text-zinc-500 hover:text-black dark:hover:text-white"
                      aria-label="Decrease quantity"
                    >
                      <Minus className="h-3 w-3" />
                    </button>
                    <span className="w-6 text-center text-xs font-mono font-medium">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.id, 1)}
                      className="p-1.5 text-zinc-500 hover:text-black dark:hover:text-white"
                      aria-label="Increase quantity"
                    >
                      <Plus className="h-3 w-3" />
                    </button>
                  </div>
                  <button
                    onClick={() => removeItem(item.id)}
                    className="rounded-lg p-1.5 text-zinc-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/30 dark:hover:text-red-400"
                    aria-label="Remove item"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {items.length > 0 && (
          <div className="border-t border-zinc-100 p-6 space-y-3 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/30">
            <div className="flex justify-between items-baseline">
              <span className="text-xs text-zinc-500">Subtotal Amount</span>
              <span className="font-mono text-base font-bold text-black dark:text-white">
                ₹{total.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>
            <div className="flex gap-2 pt-1">
              <button
                onClick={clearCart}
                className="w-1/3 h-9 rounded-lg border border-zinc-200 bg-white text-xs font-medium text-black shadow-xs hover:bg-zinc-50 dark:border-zinc-800 dark:bg-black dark:text-white dark:hover:bg-zinc-900"
              >
                Clear Cart
              </button>
              <button
                onClick={() => {
                  alert(`Checkout completed for ₹${total.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}!`);
                  setCartOpen(false);
                }}
                className="w-2/3 h-9 flex items-center justify-center gap-1.5 rounded-lg bg-black text-xs font-medium text-white shadow-sm hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200"
              >
                <span>Checkout (₹{total.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })})</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export function CartTrigger() {
  const [mounted, setMounted] = React.useState(false);
  const count = useCartCount();
  const { toggleCart } = useCartActions();

  React.useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <button
      onClick={toggleCart}
      type="button"
      className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-zinc-200 bg-white px-3 text-xs font-medium text-black shadow-xs transition-colors hover:bg-zinc-50 dark:border-zinc-800 dark:bg-black dark:text-white dark:hover:bg-zinc-900"
    >
      <ShoppingBag className="h-3.5 w-3.5 text-zinc-500" />
      <span>Cart ({mounted ? count : 0})</span>
    </button>
  );
}
