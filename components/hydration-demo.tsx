"use client";

import * as React from "react";
import { ChevronDown, ChevronUp, Layers, CheckCircle2, Server, Cpu } from "lucide-react";

interface HydrationAuditProps {
  serializedProps: {
    serverTimestamp: string;
    totalTransactions: number;
    activeUsersCount: number;
    databaseEngine: string;
    serverRole: string;
  };
}

export function HydrationDemo({ serializedProps }: HydrationAuditProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [clientHydratedAt, setClientHydratedAt] = React.useState<string | null>(null);

  React.useEffect(() => {
    setClientHydratedAt(new Date().toLocaleTimeString());
  }, []);

  return (
    <div className="rounded-xl border border-zinc-200 bg-white shadow-xs transition-all dark:border-zinc-800 dark:bg-black">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-4 text-left transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-900 rounded-xl"
      >
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-100 dark:bg-zinc-900 text-black dark:text-white">
            <Layers className="h-4 w-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-black dark:text-white">
                React Server Component (RSC) Hydration Boundary
              </span>
              <span className="text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
                Verified
              </span>
            </div>
            <p className="text-[11px] text-zinc-500 mt-0.5">
              Click to inspect props serialization from server to client runtime
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs font-medium text-zinc-500">
          <span>{isOpen ? "Hide Inspection" : "Inspect Props"}</span>
          {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </div>
      </button>

      {isOpen && (
        <div className="border-t border-zinc-100 p-5 space-y-4 dark:border-zinc-800 bg-zinc-50/40 dark:bg-zinc-950">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="rounded-lg border border-zinc-200 bg-white p-4 shadow-xs dark:border-zinc-800 dark:bg-black">
              <div className="flex items-center gap-2 font-semibold text-black dark:text-white mb-3">
                <Server className="h-4 w-4 text-zinc-500" />
                <span>Server-Rendered Phase (RSC)</span>
              </div>
              <div className="space-y-1.5 font-mono text-[11px] text-zinc-600 dark:text-zinc-400">
                <div className="flex justify-between">
                  <span className="text-zinc-500">Timestamp:</span>
                  <span className="font-semibold text-black dark:text-white">{serializedProps.serverTimestamp}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500">Engine:</span>
                  <span className="font-semibold text-black dark:text-white">{serializedProps.databaseEngine}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500">Session Role:</span>
                  <span className="font-semibold text-black dark:text-white">{serializedProps.serverRole}</span>
                </div>
              </div>
            </div>

            <div className="rounded-lg border border-zinc-200 bg-white p-4 shadow-xs dark:border-zinc-800 dark:bg-black">
              <div className="flex items-center gap-2 font-semibold text-black dark:text-white mb-3">
                <Cpu className="h-4 w-4 text-zinc-500" />
                <span>Client Hydrated Phase ('use client')</span>
              </div>
              <div className="space-y-1.5 font-mono text-[11px] text-zinc-600 dark:text-zinc-400">
                <div className="flex justify-between">
                  <span className="text-zinc-500">Hydrated At:</span>
                  <span className="font-semibold text-black dark:text-white">{clientHydratedAt || "Hydrating..."}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500">Ledger Count:</span>
                  <span className="font-semibold text-black dark:text-white">{serializedProps.totalTransactions} items</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500">Active Principals:</span>
                  <span className="font-semibold text-black dark:text-white">{serializedProps.activeUsersCount} users</span>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-zinc-200 bg-zinc-950 p-3 font-mono text-[11px] text-zinc-300 dark:border-zinc-800">
            <div className="text-[10px] uppercase font-bold text-zinc-500 mb-1.5">Serialized Boundary Payload</div>
            <pre className="overflow-x-auto whitespace-pre-wrap text-xs text-emerald-400">{JSON.stringify(serializedProps, null, 2)}</pre>
          </div>
        </div>
      )}
    </div>
  );
}
