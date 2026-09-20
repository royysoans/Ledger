import { NextResponse } from "next/server";
import { getSession, hasPermission } from "@/lib/session";
import { db } from "@/lib/db";

export async function GET() {
  const session = await getSession();

  if (!hasPermission(session.role, "MEMBER")) {
    return NextResponse.json(
      { error: "Unauthorized", message: "Member authorization required" },
      { status: 403 }
    );
  }

  const [auditLogs, totalVolume, emailLogs] = await Promise.all([
    db.auditLog.findMany({
      take: 10,
      orderBy: { createdAt: "desc" },
      include: { user: { select: { email: true, name: true } } },
    }),
    db.transaction.aggregate({
      _sum: { amount: true },
      _count: { id: true },
    }),
    db.emailLog.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
    }),
  ]);

  return NextResponse.json({
    status: "authorized",
    session,
    metrics: {
      totalTransactions: totalVolume._count.id,
      grossAmount: totalVolume._sum.amount ?? 0,
      recentAuditsCount: auditLogs.length,
    },
    data: {
      auditLogs,
      emailLogs,
    },
  });
}
