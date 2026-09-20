import { cookies, headers } from "next/headers";
import { db } from "@/lib/db";
import { RoleType } from "@/lib/schemas";

export interface SessionData {
  userId: string;
  email: string;
  name: string;
  role: RoleType;
}

const DEFAULT_SESSION: SessionData = {
  userId: "admin-default",
  email: "roystonsoans3@gmail.com",
  name: "Royston Soans",
  role: "ADMIN",
};

export async function getSession(): Promise<SessionData> {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get("fst_session")?.value;

  if (sessionCookie) {
    try {
      const parsed = JSON.parse(decodeURIComponent(sessionCookie));
      if (parsed.email && parsed.role) {
        return parsed as SessionData;
      }
    } catch {}
  }

  const headerList = await headers();
  const headerRole = headerList.get("x-user-role") as RoleType | null;
  const headerEmail = headerList.get("x-user-email");

  if (headerRole && ["ADMIN", "MEMBER", "GUEST"].includes(headerRole)) {
    return {
      userId: "header-user",
      email: headerEmail || `${headerRole.toLowerCase()}@enterprise.dev`,
      name: `${headerRole.charAt(0) + headerRole.slice(1).toLowerCase()} User`,
      role: headerRole,
    };
  }

  const primaryUser = await db.user.findFirst({
    where: { role: { name: "ADMIN" } },
    include: { role: true },
  });

  if (primaryUser) {
    return {
      userId: primaryUser.id,
      email: primaryUser.email,
      name: primaryUser.name,
      role: primaryUser.role.name as RoleType,
    };
  }

  return DEFAULT_SESSION;
}

export function hasPermission(userRole: RoleType, requiredRole: RoleType): boolean {
  const hierarchy: Record<RoleType, number> = {
    ADMIN: 3,
    MEMBER: 2,
    GUEST: 1,
  };

  return (hierarchy[userRole] ?? 0) >= (hierarchy[requiredRole] ?? 0);
}
