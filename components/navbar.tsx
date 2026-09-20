import Link from "next/link";
import { ThemeToggle } from "@/components/theme-toggle";
import { CartTrigger } from "@/components/cart-sheet";
import { RoleSwitcher } from "@/components/role-switcher";
import { getSession } from "@/lib/session";
import { Wallet, Activity, ShieldCheck } from "lucide-react";

export async function Navbar() {
  const session = await getSession();

  return (
    <header className="sticky top-0 z-40 w-full border-b border-zinc-200 bg-white/95 backdrop-blur-md dark:border-zinc-800 dark:bg-black/95">
      <div className="mx-auto flex h-15 max-w-6xl items-center justify-between px-4 sm:px-6">
        <div className="flex items-center gap-8">
          <Link
            href="/"
            className="flex items-center gap-2.5 transition-opacity hover:opacity-90"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-black text-white shadow-xs dark:bg-white dark:text-black">
              <Wallet className="h-4 w-4" />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-semibold tracking-tight text-black dark:text-white leading-none">
                LedgerCraft
              </span>
              <span className="text-[10px] text-zinc-500 font-mono mt-0.5">
                Financial Core
              </span>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-1 text-xs font-medium text-zinc-600 dark:text-zinc-400">
            <Link
              href="/"
              className="rounded-md px-3 py-1.5 transition-colors hover:bg-zinc-100 hover:text-black dark:hover:bg-zinc-900 dark:hover:text-white"
            >
              Overview
            </Link>
            <Link
              href="/dashboard"
              className="flex items-center gap-1.5 rounded-md px-3 py-1.5 transition-colors hover:bg-zinc-100 hover:text-black dark:hover:bg-zinc-900 dark:hover:text-white"
            >
              <Activity className="h-3.5 w-3.5 text-zinc-400" />
              <span>Operations & Logs</span>
            </Link>
            <Link
              href="/dashboard/admin"
              className="flex items-center gap-1.5 rounded-md px-3 py-1.5 transition-colors hover:bg-zinc-100 hover:text-black dark:hover:bg-zinc-900 dark:hover:text-white"
            >
              <ShieldCheck className="h-3.5 w-3.5 text-zinc-400" />
              <span>Admin Gate</span>
            </Link>
          </nav>
        </div>

        <div className="flex items-center gap-3">
          <RoleSwitcher currentRole={session.role} />
          <div className="h-4 w-px bg-zinc-200 dark:border-zinc-800" />
          <CartTrigger />
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
