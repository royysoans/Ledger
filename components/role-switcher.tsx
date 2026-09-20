"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { RoleType } from "@/lib/schemas";
import { setSessionRoleAction } from "@/lib/actions";
import { toast } from "sonner";
import { UserCheck } from "lucide-react";

interface RoleSwitcherProps {
  currentRole: RoleType;
}

export function RoleSwitcher({ currentRole }: RoleSwitcherProps) {
  const [isPending, startTransition] = React.useTransition();
  const router = useRouter();

  const handleRoleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const nextRole = e.target.value as RoleType;
    startTransition(async () => {
      const res = await setSessionRoleAction(nextRole);
      if (res.success) {
        toast.success(`Active profile set to ${nextRole}`);
        router.refresh();
      } else {
        toast.error("Failed to switch profile");
      }
    });
  };

  return (
    <div className="flex items-center gap-1.5 px-2 py-1 text-xs">
      <UserCheck className="h-3.5 w-3.5 text-zinc-500" />
      <span className="text-[11px] font-medium text-zinc-500 hidden sm:inline">Role:</span>
      <select
        value={currentRole}
        onChange={handleRoleChange}
        disabled={isPending}
        aria-label="Active user role"
        className="cursor-pointer bg-transparent text-xs font-semibold text-black focus:outline-none dark:text-white"
      >
        <option value="ADMIN">ADMIN</option>
        <option value="MEMBER">MEMBER</option>
        <option value="GUEST">GUEST</option>
      </select>
    </div>
  );
}
