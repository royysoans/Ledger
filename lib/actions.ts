"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { db } from "@/lib/db";
import { transactionSchema, ActionResponse, RoleType } from "@/lib/schemas";
import { getSession, hasPermission } from "@/lib/session";
import { dispatchTransactionNotification } from "@/lib/email";

export async function createTransactionMutation(
  formData: unknown
): Promise<ActionResponse<{ id: string; amount: number; recipient: string }>> {
  try {
    const session = await getSession();

    if (!hasPermission(session.role, "MEMBER")) {
      return {
        success: false,
        message: "Insufficient permissions. Guests cannot create transactions.",
      };
    }

    const validated = transactionSchema.safeParse(formData);

    if (!validated.success) {
      const formattedErrors: Record<string, string[]> = {};
      for (const issue of validated.error.issues) {
        const field = issue.path[0]?.toString() || "form";
        if (!formattedErrors[field]) formattedErrors[field] = [];
        formattedErrors[field].push(issue.message);
      }
      return {
        success: false,
        message: "Validation failed on payload sanitization.",
        errors: formattedErrors,
      };
    }

    const payload = validated.data;

    let user = await db.user.findUnique({
      where: { email: payload.userEmail },
    });

    if (!user) {
      const defaultRole = await db.role.findFirst({
        where: { name: "MEMBER" },
      });
      user = await db.user.create({
        data: {
          email: payload.userEmail,
          name: payload.recipient,
          roleId: defaultRole?.id || "",
        },
      });
    }

    const transaction = await db.transaction.create({
      data: {
        amount: payload.amount,
        currency: "USD",
        status: "COMPLETED",
        recipient: payload.recipient,
        category: payload.category,
        reference: payload.reference || `REF-${Math.random().toString(36).substring(2, 9).toUpperCase()}`,
        userId: user.id,
      },
    });

    await db.auditLog.create({
      data: {
        action: "TRANSACTION_CREATED",
        details: JSON.stringify({
          transactionId: transaction.id,
          amount: payload.amount,
          category: payload.category,
          initiatedBy: session.email,
        }),
        ipAddress: "127.0.0.1",
        userId: user.id,
      },
    });

    await dispatchTransactionNotification({
      recipientEmail: payload.userEmail,
      recipientName: payload.recipient,
      amount: payload.amount,
      category: payload.category,
      reference: transaction.reference ?? undefined,
      userId: user.id,
    });

    revalidatePath("/");
    revalidatePath("/dashboard");

    return {
      success: true,
      message: `Transaction for $${payload.amount.toFixed(2)} processed and logged.`,
      data: {
        id: transaction.id,
        amount: transaction.amount,
        recipient: transaction.recipient,
      },
    };
  } catch (error) {
    const errMessage = error instanceof Error ? error.message : "Internal Server Error";
    return {
      success: false,
      message: `Server Action mutation failed: ${errMessage}`,
    };
  }
}

export async function setSessionRoleAction(role: RoleType): Promise<ActionResponse> {
  const cookieStore = await cookies();

  let targetUser = await db.user.findFirst({
    where: { role: { name: role } },
    include: { role: true },
  });

  if (!targetUser) {
    targetUser = await db.user.findFirst({
      include: { role: true },
    });
  }

  const sessionData = {
    userId: targetUser?.id || "fallback-id",
    email: targetUser?.email || `${role.toLowerCase()}@enterprise.dev`,
    name: targetUser?.name || `${role} Operator`,
    role,
  };

  cookieStore.set("fst_session", JSON.stringify(sessionData), {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });

  revalidatePath("/");
  revalidatePath("/dashboard");

  return {
    success: true,
    message: `Active session swapped to ${role}`,
    data: sessionData,
  };
}
