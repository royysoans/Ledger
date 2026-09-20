"use client";

import * as React from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { CheckCircle2, AlertTriangle, Loader2, Mail } from "lucide-react";
import { sendLiveTestEmailAction } from "@/lib/actions";

export function WebhookSimulator({ sampleResendId }: { sampleResendId?: string }) {
  const [loadingType, setLoadingType] = React.useState<string | null>(null);
  const router = useRouter();

  const handleSendLiveEmail = async () => {
    setLoadingType("live_send");
    try {
      const res = await sendLiveTestEmailAction();
      if (res.success) {
        toast.success(res.message);
        router.refresh();
      } else {
        toast.error(res.message);
      }
    } catch {
      toast.error("Failed to trigger live test email");
    } finally {
      setLoadingType(null);
    }
  };

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
            to: ["roystonsoans3@gmail.com"],
            subject: "Transaction Confirmation - ₹14,500.00",
          },
        }),
      });

      const json = await res.json();
      if (res.ok) {
        if (type === "email.bounced") {
          toast.success("Simulated Bounce: Updated email status to Bounced & logged to Audit Ledger");
        } else {
          toast.success("Simulated Delivery: Updated email status to Delivered");
        }
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
    <div className="flex flex-wrap items-center gap-2">
      <button
        disabled={!!loadingType}
        onClick={handleSendLiveEmail}
        className="inline-flex items-center gap-1.5 rounded-lg bg-black px-3 py-1.5 text-xs font-medium text-white shadow-xs transition-colors hover:bg-zinc-800 disabled:opacity-50 dark:bg-white dark:text-black dark:hover:bg-zinc-200"
      >
        {loadingType === "live_send" ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
        ) : (
          <Mail className="h-3.5 w-3.5" />
        )}
        <span>Send Live Test Email</span>
      </button>

      <button
        disabled={!!loadingType}
        onClick={() => simulateEvent("email.delivered")}
        className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-xs font-medium text-black shadow-xs transition-colors hover:bg-zinc-50 disabled:opacity-50 dark:border-zinc-800 dark:bg-black dark:text-white dark:hover:bg-zinc-900"
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
        className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-xs font-medium text-black shadow-xs transition-colors hover:bg-zinc-50 disabled:opacity-50 dark:border-zinc-800 dark:bg-black dark:text-white dark:hover:bg-zinc-900"
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
