import { db } from "@/lib/db";
import { getSession } from "@/lib/session";
import { WebhookSimulator } from "@/components/webhook-simulator";
import { EmailDispatchesList } from "@/components/email-dispatches-list";
import { Mail, Shield, ArrowLeft, Info } from "lucide-react";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const session = await getSession();

  let auditLogs: any[] = [];
  let emailLogs: any[] = [];

  try {
    const results = await Promise.all([
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
    auditLogs = results[0];
    emailLogs = results[1];
  } catch (error) {
    console.error(error);
  }

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

      <div className="rounded-xl border border-blue-200/80 bg-blue-50/40 p-4 text-xs dark:border-blue-900/40 dark:bg-blue-950/20 text-blue-900 dark:text-blue-200 flex items-start gap-3">
        <Info className="h-4 w-4 shrink-0 mt-0.5 text-blue-600 dark:text-blue-400" />
        <div className="space-y-1">
          <span className="font-semibold block">How Delivery & Bounce Webhooks Work:</span>
          <p className="text-zinc-600 dark:text-zinc-300">
            Resend webhooks are server callbacks. In production, when an email reaches an inbox or gets rejected by the recipient mail server, Resend pings this application. Clicking <strong>Mark Bounced</strong> or <strong>Mark Delivered</strong> tests that workflow: it flips the dispatch status badge and logs an immutable audit event in the Security Ledger below.
          </p>
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

          <div className="mt-4">
            <EmailDispatchesList emails={emailLogs} />
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
              auditLogs.map((audit) => {
                const isBounce = audit.action === "WEBHOOK_EMAIL_BOUNCED";
                const isDelivery = audit.action === "WEBHOOK_EMAIL_DELIVERED";

                return (
                  <div key={audit.id} className="flex items-center justify-between py-3">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2 font-mono text-xs font-semibold text-black dark:text-white">
                        <span>{audit.action}</span>
                        {isBounce && (
                          <span className="rounded bg-red-100 px-1.5 py-0.5 text-[10px] font-medium text-red-700 dark:bg-red-950 dark:text-red-300">
                            Bounced
                          </span>
                        )}
                        {isDelivery && (
                          <span className="rounded bg-emerald-100 px-1.5 py-0.5 text-[10px] font-medium text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                            Delivered
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-zinc-500 font-mono">
                        Initiated by: {audit.user.email}
                      </div>
                    </div>
                    <div className="text-right font-mono text-[11px] text-zinc-400">
                      <div>{new Date(audit.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })}</div>
                      <div className="text-[10px] text-zinc-500">{new Date(audit.createdAt).toLocaleDateString()}</div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
