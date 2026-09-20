"use client";

import * as React from "react";
import { useFilterStore, useCartActions } from "@/lib/store";
import { Search, RotateCcw, Plus, Check } from "lucide-react";

export interface TransactionRecord {
  id: string;
  amount: number;
  currency: string;
  status: string;
  recipient: string;
  category: string;
  reference: string | null;
  createdAt: string;
  user: {
    name: string;
    email: string;
  };
}

interface TransactionsTableProps {
  initialTransactions: TransactionRecord[];
}

export function TransactionsTable({ initialTransactions }: TransactionsTableProps) {
  const [mounted, setMounted] = React.useState(false);
  const { filters, setFilter, resetFilters } = useFilterStore();
  const { addItem } = useCartActions();
  const [addedIds, setAddedIds] = React.useState<Record<string, boolean>>({});

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const activeFilters = mounted
    ? filters
    : { searchQuery: "", category: "ALL", minAmount: 0, sortBy: "date-desc" as const };

  const filtered = React.useMemo(() => {
    return initialTransactions.filter((item) => {
      const matchesSearch =
        activeFilters.searchQuery === "" ||
        item.recipient.toLowerCase().includes(activeFilters.searchQuery.toLowerCase()) ||
        item.category.toLowerCase().includes(activeFilters.searchQuery.toLowerCase()) ||
        (item.reference && item.reference.toLowerCase().includes(activeFilters.searchQuery.toLowerCase()));

      const matchesCategory =
        activeFilters.category === "ALL" || item.category === activeFilters.category;

      return matchesSearch && matchesCategory;
    });
  }, [initialTransactions, activeFilters.searchQuery, activeFilters.category]);

  const handleAddToCart = (tx: TransactionRecord) => {
    addItem({
      id: tx.id,
      name: `${tx.category} (${tx.recipient})`,
      category: tx.category,
      price: tx.amount,
    });
    setAddedIds((prev) => ({ ...prev, [tx.id]: true }));
    setTimeout(() => {
      setAddedIds((prev) => ({ ...prev, [tx.id]: false }));
    }, 1200);
  };

  const categories = ["ALL", "Cloud Infrastructure", "API Billing", "Payroll", "Security", "Hardware", "SaaS Licensing"];

  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-xs dark:border-zinc-800 dark:bg-black">
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-zinc-100 pb-4 dark:border-zinc-800">
        <div>
          <h2 className="text-base font-semibold tracking-tight text-black dark:text-white">
            Transaction Ledger
          </h2>
          <p className="text-xs text-zinc-500 mt-0.5">
            Synchronized relational records with persistent filters.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-zinc-400" />
            <input
              value={activeFilters.searchQuery}
              onChange={(e) => setFilter("searchQuery", e.target.value)}
              placeholder="Search recipient..."
              className="h-8.5 w-36 sm:w-44 rounded-lg border border-zinc-200 bg-white pl-8 pr-2.5 text-xs text-black transition-colors focus:border-zinc-400 focus:outline-none dark:border-zinc-800 dark:bg-black dark:text-white dark:focus:border-zinc-600"
            />
          </div>

          <select
            value={activeFilters.category}
            onChange={(e) => setFilter("category", e.target.value)}
            className="h-8.5 rounded-lg border border-zinc-200 bg-white px-2.5 text-xs font-medium text-black transition-colors focus:border-zinc-400 focus:outline-none dark:border-zinc-800 dark:bg-black dark:text-white dark:focus:border-zinc-600"
          >
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat === "ALL" ? "All Categories" : cat}
              </option>
            ))}
          </select>

          <button
            onClick={resetFilters}
            className="h-8.5 rounded-lg border border-zinc-200 px-2.5 text-xs text-zinc-600 hover:bg-zinc-50 dark:border-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-900"
            title="Reset Filters"
          >
            <RotateCcw className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-zinc-100 text-[11px] font-semibold text-zinc-400 uppercase tracking-wider dark:border-zinc-800">
              <th className="pb-3 pl-1">Entity / Recipient</th>
              <th className="pb-3">Category</th>
              <th className="pb-3">Status</th>
              <th className="pb-3">Amount</th>
              <th className="pb-3 text-right pr-1">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-12 text-center text-zinc-400 text-xs">
                  No transaction records match the current filters.
                </td>
              </tr>
            ) : (
              filtered.map((tx) => (
                <tr
                  key={tx.id}
                  className="transition-colors hover:bg-zinc-50/70 dark:hover:bg-zinc-900/40"
                >
                  <td className="py-3.5 pl-1">
                    <div className="font-semibold text-black dark:text-white">
                      {tx.recipient}
                    </div>
                    <div className="text-[11px] text-zinc-400 mt-0.5">
                      {tx.user.name} • {new Date(tx.createdAt).toLocaleDateString()}
                    </div>
                  </td>
                  <td className="py-3.5 text-zinc-500 dark:text-zinc-400">
                    {tx.category}
                  </td>
                  <td className="py-3.5">
                    <span
                      className={`text-xs font-medium ${
                        tx.status === "COMPLETED"
                          ? "text-emerald-600 dark:text-emerald-400"
                          : tx.status === "PENDING"
                          ? "text-amber-600 dark:text-amber-400"
                          : "text-zinc-600 dark:text-zinc-400"
                      }`}
                    >
                      {tx.status === "COMPLETED"
                        ? "Completed"
                        : tx.status === "PENDING"
                        ? "Pending"
                        : tx.status}
                    </span>
                  </td>
                  <td className="py-3.5 font-mono text-sm font-semibold text-black dark:text-white">
                    ₹{tx.amount.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </td>
                  <td className="py-3.5 text-right pr-1">
                    <button
                      onClick={() => handleAddToCart(tx)}
                      className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-medium transition-all shadow-xs ${
                        addedIds[tx.id]
                          ? "border border-emerald-300 bg-white text-emerald-600 dark:border-emerald-800 dark:bg-black dark:text-emerald-400"
                          : "border border-zinc-200 bg-white text-black hover:bg-zinc-50 dark:border-zinc-800 dark:bg-black dark:text-white dark:hover:bg-zinc-900"
                      }`}
                    >
                      {addedIds[tx.id] ? (
                        <>
                          <Check className="h-3 w-3" />
                          <span>Added</span>
                        </>
                      ) : (
                        <>
                          <Plus className="h-3 w-3 text-zinc-400" />
                          <span>Cart</span>
                        </>
                      )}
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
