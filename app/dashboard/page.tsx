import { db } from "@/lib/db";
import { getSession } from "@/lib/session";
import { WebhookSimulator } from "@/components/webhook-simulator";
import { Mail, Shield, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default async function DashboardPage() {
  const session = await getSession();

  const [auditLogs, emailLogs] = await Promise.all([
    db.auditLog.findMany({
      take: 10,
      orderBy: { createdAt: "desc" },
      include: { user: true },
    }),
    db.emailLog.findMany({
      take: 10,
      orderBy: { createdAt: "desc" },
      include: { user: true },
    }),
  ]);

  const sampleResendId = emailLogs[0]?.resendId || undefined;

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 space-y-6">
      <div className="flex flex-col gap-3 border-b border-zinc-200 pb-6 dark:border-zinc-800 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-bold tracking-tight text-black dark:text-white">
              Operations & Webhooks
            </h1>
            <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
              {session.role}
            </span>
          </div>
          <p className="text-xs text-zinc-500 mt-1">
            Automated email dispatches, incoming Resend webhook events, and audit logs.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <WebhookSimulator sampleResendId={sampleResendId} />
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-xs font-medium text-black shadow-xs transition-colors hover:bg-zinc-50 dark:border-zinc-800 dark:bg-black dark:text-white dark:hover:bg-zinc-900"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Overview</span>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-xs dark:border-zinc-800 dark:bg-black">
          <div className="flex items-center gap-2.5 border-b border-zinc-100 pb-4 dark:border-zinc-800">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-zinc-100 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400">
              <Mail className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-sm font-semibold tracking-tight text-black dark:text-white">
                Transactional Email Dispatches
              </h2>
              <p className="text-[11px] text-zinc-500">
                Triggered via React Email & Resend API
              </p>
            </div>
          </div>

          <div className="mt-4 divide-y divide-zinc-100 text-xs dark:divide-zinc-800">
            {emailLogs.length === 0 ? (
              <p className="py-10 text-center text-zinc-400">No email records found.</p>
            ) : (
              emailLogs.map((log) => (
                <div key={log.id} className="flex items-center justify-between py-3">
                  <div className="space-y-0.5">
                    <div className="font-semibold text-black dark:text-white">
                      {log.subject}
                    </div>
                    <div className="text-[11px] text-zinc-500 font-mono">
                      To: {log.recipient} {log.resendId ? `[${log.resendId.slice(0, 16)}...]` : ""}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-[11px] text-zinc-400">
                      {new Date(log.createdAt).toLocaleTimeString()}
                    </span>
                    <span
                      className={`text-xs font-medium ${
                        log.status === "DELIVERED"
                          ? "text-emerald-600 dark:text-emerald-400"
                          : log.status === "BOUNCED"
                          ? "text-red-600 dark:text-red-400"
                          : "text-zinc-600 dark:text-zinc-400"
                      }`}
                    >
                      {log.status === "DELIVERED"
                        ? "Delivered"
                        : log.status === "BOUNCED"
                        ? "Bounced"
                        : log.status}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-xs dark:border-zinc-800 dark:bg-black">
          <div className="flex items-center gap-2.5 border-b border-zinc-100 pb-4 dark:border-zinc-800">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-zinc-100 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400">
              <Shield className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-sm font-semibold tracking-tight text-black dark:text-white">
                Security & Audit Ledger
              </h2>
              <p className="text-[11px] text-zinc-500">
                Immutable lifecycle events stored in Prisma
              </p>
            </div>
          </div>

          <div className="mt-4 divide-y divide-zinc-100 text-xs dark:divide-zinc-800">
            {auditLogs.length === 0 ? (
              <p className="py-10 text-center text-zinc-400">No audit events recorded.</p>
            ) : (
              auditLogs.map((audit) => (
                <div key={audit.id} className="flex items-center justify-between py-3">
                  <div className="space-y-0.5">
                    <div className="font-mono text-xs font-semibold text-black dark:text-white">
                      {audit.action}
                    </div>
                    <div className="text-[11px] text-zinc-500 font-mono">
                      Initiated by: {audit.user.email}
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="font-mono text-[11px] text-zinc-400">
                      {new Date(audit.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
