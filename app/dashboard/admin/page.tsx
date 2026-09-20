import { db } from "@/lib/db";
import { getSession } from "@/lib/session";
import { redirect } from "next/navigation";
import { Users, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default async function AdminGatePage() {
  const session = await getSession();

  if (session.role !== "ADMIN") {
    redirect("/?error=admin_required");
  }

  let users: any[] = [];
  try {
    users = await db.user.findMany({
      include: {
        role: true,
        _count: {
          select: {
            transactions: true,
            auditLogs: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });
  } catch (error) {
    console.error(error);
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 space-y-6">
      <div className="flex flex-col gap-3 border-b border-zinc-200 pb-6 dark:border-zinc-800 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-bold tracking-tight text-black dark:text-white">
              Admin Access Gate
            </h1>
            <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
              ADMIN ONLY
            </span>
          </div>
          <p className="text-xs text-zinc-500 mt-1">
            Protected by Next.js Edge Middleware proxy validation and server-side RBAC session enforcement.
          </p>
        </div>

        <Link
          href="/"
          className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-xs font-medium text-black shadow-xs transition-colors hover:bg-zinc-50 dark:border-zinc-800 dark:bg-black dark:text-white dark:hover:bg-zinc-900"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Overview</span>
        </Link>
      </div>

      <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-xs dark:border-zinc-800 dark:bg-black">
        <div className="flex items-center gap-2.5 border-b border-zinc-100 pb-4 dark:border-zinc-800">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-zinc-100 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400">
            <Users className="h-4 w-4" />
          </div>
          <div>
            <h2 className="text-sm font-semibold tracking-tight text-black dark:text-white">
              Registered Principals & Access Control ({users.length})
            </h2>
            <p className="text-[11px] text-zinc-500">
              Relational entities linked in database with foreign-key cascades
            </p>
          </div>
        </div>

        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-zinc-100 text-[11px] font-semibold text-zinc-400 uppercase tracking-wider dark:border-zinc-800">
                <th className="pb-3">User</th>
                <th className="pb-3">Email Address</th>
                <th className="pb-3">Role Tier</th>
                <th className="pb-3">Transactions</th>
                <th className="pb-3">Audit Events</th>
                <th className="pb-3 text-right">Joined</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
              {users.map((u) => (
                <tr key={u.id} className="transition-colors hover:bg-zinc-50/70 dark:hover:bg-zinc-900/40">
                  <td className="py-3.5 font-semibold text-black dark:text-white">
                    {u.name}
                  </td>
                  <td className="py-3.5 font-mono text-zinc-500 dark:text-zinc-400">
                    {u.email}
                  </td>
                  <td className="py-3.5 font-medium text-black dark:text-white">
                    {u.role.name}
                  </td>
                  <td className="py-3.5 font-mono font-medium text-black dark:text-white">{u._count.transactions}</td>
                  <td className="py-3.5 font-mono font-medium text-black dark:text-white">{u._count.auditLogs}</td>
                  <td className="py-3.5 text-right font-mono text-[11px] text-zinc-400">
                    {new Date(u.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
