"use client";

import * as React from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { CheckCircle2, AlertTriangle, Loader2 } from "lucide-react";

export function WebhookSimulator({ sampleResendId }: { sampleResendId?: string }) {
  const [loadingType, setLoadingType] = React.useState<string | null>(null);
  const router = useRouter();

  const simulateEvent = async (type: "email.delivered" | "email.bounced") => {
    setLoadingType(type);
    try {
      const res = await fetch("/api/webhooks/resend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type,
          created_at: new Date().toISOString(),
          data: {
            id: sampleResendId || `sim_msg_${Date.now()}`,
            to: ["admin@ledgercraft.dev"],
            subject: "Simulated Webhook Lifecycle Dispatch",
          },
        }),
      });

      const json = await res.json();
      if (res.ok) {
        toast.success(`Resend Webhook logged: ${type}`);
        router.refresh();
      } else {
        toast.error(`Webhook error: ${json.error || "Unknown"}`);
      }
    } catch {
      toast.error("Network failed during webhook trigger");
    } finally {
      setLoadingType(null);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <button
        disabled={!!loadingType}
        onClick={() => simulateEvent("email.delivered")}
        className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-xs font-medium text-zinc-800 shadow-xs transition-colors hover:bg-zinc-50 disabled:opacity-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800"
      >
        {loadingType === "email.delivered" ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin text-zinc-400" />
        ) : (
          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
        )}
        <span>Simulate Delivery</span>
      </button>

      <button
        disabled={!!loadingType}
        onClick={() => simulateEvent("email.bounced")}
        className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-xs font-medium text-zinc-800 shadow-xs transition-colors hover:bg-zinc-50 disabled:opacity-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800"
      >
        {loadingType === "email.bounced" ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin text-zinc-400" />
        ) : (
          <AlertTriangle className="h-3.5 w-3.5 text-amber-600" />
        )}
        <span>Simulate Bounce</span>
      </button>
    </div>
  );
}
