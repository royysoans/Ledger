import { Suspense } from "react";
import { db } from "@/lib/db";
import { getSession } from "@/lib/session";
import { HydrationDemo } from "@/components/hydration-demo";
import { TransactionForm } from "@/components/transaction-form";
import { TransactionsTable, TransactionRecord } from "@/components/transactions-table";
import { Skeleton } from "@/components/ui/skeleton";
import { DollarSign, Layers, ShieldCheck, ArrowRight } from "lucide-react";
import Link from "next/link";

interface PageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function HomePage({ searchParams }: PageProps) {
  const params = await searchParams;
  const session = await getSession();

  let transactionsCount = 0;
  let activeUsersCount = 1;
  let rawTransactions: any[] = [];
  let totalVolume: { _sum: { amount: number | null } } = { _sum: { amount: 0 } };

  try {
    const results = await Promise.all([
      db.transaction.count(),
      db.user.count(),
      db.transaction.findMany({
        take: 12,
        orderBy: { createdAt: "desc" },
        include: {
          user: {
            select: {
              name: true,
              email: true,
            },
          },
        },
      }),
      db.transaction.aggregate({
        _sum: { amount: true },
      }),
    ]);
    transactionsCount = results[0];
    activeUsersCount = results[1];
    rawTransactions = results[2];
    totalVolume = results[3];
  } catch (error) {
    console.error(error);
  }

  const transactions: TransactionRecord[] = rawTransactions.map((tx) => ({
    id: tx.id,
    amount: tx.amount,
    currency: tx.currency,
    status: tx.status,
    recipient: tx.recipient,
    category: tx.category,
    reference: tx.reference,
    createdAt: tx.createdAt.toISOString(),
    user: {
      name: tx.user.name,
      email: tx.user.email,
    },
  }));

  const serializedProps = {
    serverTimestamp: new Date().toISOString(),
    totalTransactions: transactionsCount,
    activeUsersCount,
    databaseEngine: "SQLite + Prisma ORM",
    serverRole: session.role,
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 space-y-6">
      {params.error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-xs text-red-800 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-300 flex items-center justify-between shadow-xs">
          <span>
            Access Restricted: Your active profile ({session.role}) does not have permission for that destination.
          </span>
          <span className="font-mono text-[10px] uppercase font-bold text-red-600 dark:text-red-400">
            Protected Gate
          </span>
        </div>
      )}

      <div className="flex flex-col gap-3 border-b border-zinc-200 pb-6 dark:border-zinc-800 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-black dark:text-white">
            Ledger Overview
          </h1>
          <p className="text-xs text-zinc-500 mt-1 max-w-xl">
            Execute type-safe Server Actions, manage persistent client cart state, and inspect real-time database records.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-xs font-medium text-black shadow-xs transition-colors hover:bg-zinc-50 dark:border-zinc-800 dark:bg-black dark:text-white dark:hover:bg-zinc-900"
          >
            <span>Operations & Webhooks</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-xs transition-shadow hover:shadow-sm dark:border-zinc-800 dark:bg-black">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-zinc-500">Gross Volume</span>
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-zinc-100 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400">
              <DollarSign className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 font-mono text-2xl font-bold tracking-tight text-black dark:text-white">
            ${(totalVolume._sum.amount ?? 0).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className="mt-1 text-[11px] text-zinc-400">Aggregated from Prisma database</div>
        </div>

        <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-xs transition-shadow hover:shadow-sm dark:border-zinc-800 dark:bg-black">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-zinc-500">Total Transactions</span>
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-zinc-100 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400">
              <Layers className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 font-mono text-2xl font-bold tracking-tight text-black dark:text-white">
            {transactionsCount}
          </div>
          <div className="mt-1 text-[11px] text-zinc-400">Seeded with Faker relations</div>
        </div>

        <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-xs transition-shadow hover:shadow-sm dark:border-zinc-800 dark:bg-black">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-zinc-500">Current Role</span>
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-zinc-100 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400">
              <ShieldCheck className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 font-mono text-2xl font-bold tracking-tight text-black dark:text-white">
            {session.role}
          </div>
          <div className="mt-1 text-[11px] text-zinc-400 truncate">{session.email}</div>
        </div>
      </div>

      <HydrationDemo serializedProps={serializedProps} />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <div className="lg:col-span-5">
          <Suspense fallback={<Skeleton className="h-96 w-full rounded-xl" />}>
            <TransactionForm defaultEmail={session.email} />
          </Suspense>
        </div>

        <div className="lg:col-span-7">
          <Suspense fallback={<Skeleton className="h-96 w-full rounded-xl" />}>
            <TransactionsTable initialTransactions={transactions} />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
