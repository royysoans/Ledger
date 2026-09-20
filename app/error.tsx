"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertCircle, RotateCcw, Home } from "lucide-react";

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="mx-auto max-w-xl px-4 py-16 text-center space-y-6">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100 dark:bg-red-950/50 text-red-600 dark:text-red-400">
        <AlertCircle className="h-6 w-6" />
      </div>

      <div className="space-y-2">
        <h2 className="text-xl font-bold tracking-tight text-black dark:text-white">
          Application Notice
        </h2>
        <p className="text-xs text-zinc-500 max-w-md mx-auto">
          {error.message || "An unexpected error occurred while processing this view."}
        </p>
      </div>

      <div className="flex items-center justify-center gap-3">
        <button
          onClick={() => reset()}
          className="inline-flex items-center gap-1.5 rounded-lg bg-black px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200 transition-colors"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          <span>Retry</span>
        </button>

        <Link
          href="/"
          className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-200 bg-white px-4 py-2 text-xs font-semibold text-black shadow-xs hover:bg-zinc-50 dark:border-zinc-800 dark:bg-black dark:text-white dark:hover:bg-zinc-900 transition-colors"
        >
          <Home className="h-3.5 w-3.5" />
          <span>Return to Ledger</span>
        </Link>
      </div>
    </div>
  );
}
