"use client";

import * as React from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { CheckCircle2, AlertTriangle, Clock, RefreshCw } from "lucide-react";
import { simulateWebhookEventAction } from "@/lib/actions";

interface EmailLogItem {
  id: string;
  recipient: string;
  subject: string;
  status: string;
  resendId: string | null;
  createdAt: Date | string;
}

export function EmailDispatchesList({ emails }: { emails: EmailLogItem[] }) {
  const router = useRouter();
  const [isPending, startTransition] = React.useTransition();
  const [activeId, setActiveId] = React.useState<string | null>(null);

  const handleToggleStatus = (targetResendId: string | null, type: "email.delivered" | "email.bounced") => {
    setActiveId(targetResendId || "unknown");
    startTransition(async () => {
      try {
        const res = await simulateWebhookEventAction(type, targetResendId || undefined);
        if (res.success) {
          toast.success(res.message);
          router.refresh();
        } else {
          toast.error(res.message);
        }
      } catch {
        toast.error("Failed to update status");
      } finally {
        setActiveId(null);
      }
    });
  };

  if (emails.length === 0) {
    return <p className="py-10 text-center text-zinc-400">No email records found.</p>;
  }

  return (
    <div className="divide-y divide-zinc-100 text-xs dark:divide-zinc-800">
      {emails.map((log) => {
        const isBounced = log.status === "BOUNCED";
        const isDelivered = log.status === "DELIVERED";
        const isLoadingThis = isPending && activeId === log.resendId;

        return (
          <div key={log.id} className="flex flex-col sm:flex-row sm:items-center justify-between py-3.5 gap-3 transition-colors hover:bg-zinc-50/50 dark:hover:bg-zinc-900/40 rounded-lg px-2">
            <div className="space-y-1 min-w-0">
              <div className="font-semibold text-black dark:text-white truncate">
                {log.subject}
              </div>
              <div className="text-[11px] text-zinc-500 font-mono">
                To: {log.recipient} {log.resendId ? `[${log.resendId.slice(0, 16)}...]` : ""}
              </div>
              <div className="text-[10px] text-zinc-400 flex items-center gap-1.5 font-mono">
                <Clock className="h-3 w-3 inline" />
                {new Date(log.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
              </div>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <span
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${
                  isDelivered
                    ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800"
                    : isBounced
                    ? "bg-red-50 text-red-700 border-red-200 dark:bg-red-950/40 dark:text-red-300 dark:border-red-800"
                    : "bg-zinc-100 text-zinc-700 border-zinc-200 dark:bg-zinc-900 dark:text-zinc-300 dark:border-zinc-700"
                }`}
              >
                {isDelivered && <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />}
                {isBounced && <AlertTriangle className="h-3.5 w-3.5 text-red-600 dark:text-red-400" />}
                {log.status === "DELIVERED" ? "Delivered" : log.status === "BOUNCED" ? "Bounced" : log.status}
              </span>

              <div className="flex items-center gap-1.5 border-l border-zinc-200 pl-3 dark:border-zinc-800">
                <button
                  type="button"
                  disabled={isLoadingThis || isBounced}
                  onClick={() => handleToggleStatus(log.resendId, "email.bounced")}
                  className="rounded px-2 py-1 text-[11px] font-medium transition-colors border border-red-200 text-red-600 hover:bg-red-50 disabled:opacity-40 disabled:hover:bg-transparent dark:border-red-900 dark:text-red-400 dark:hover:bg-red-950"
                  title="Simulate Resend bounce webhook on this dispatch"
                >
                  {isLoadingThis && !isBounced ? (
                    <RefreshCw className="h-3 w-3 animate-spin" />
                  ) : (
                    "Mark Bounced"
                  )}
                </button>
                <button
                  type="button"
                  disabled={isLoadingThis || isDelivered}
                  onClick={() => handleToggleStatus(log.resendId, "email.delivered")}
                  className="rounded px-2 py-1 text-[11px] font-medium transition-colors border border-emerald-200 text-emerald-600 hover:bg-emerald-50 disabled:opacity-40 disabled:hover:bg-transparent dark:border-emerald-900 dark:text-emerald-400 dark:hover:bg-emerald-950"
                  title="Simulate Resend delivery webhook on this dispatch"
                >
                  {isLoadingThis && isBounced ? (
                    <RefreshCw className="h-3 w-3 animate-spin" />
                  ) : (
                    "Mark Delivered"
                  )}
                </button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
