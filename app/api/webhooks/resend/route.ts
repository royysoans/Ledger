import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { resendWebhookSchema } from "@/lib/schemas";

export async function POST(request: Request) {
  try {
    const rawBody = await request.json();
    const parsed = resendWebhookSchema.safeParse(rawBody);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid webhook payload", issues: parsed.error.issues },
        { status: 400 }
      );
    }

    const { type, data } = parsed.data;
    const recipient = data.to?.[0] || "unknown@enterprise.dev";
    const resendId = data.id;

    let targetStatus = "SENT";
    if (type === "email.delivered") targetStatus = "DELIVERED";
    if (type === "email.bounced") targetStatus = "BOUNCED";
    if (type === "email.complained") targetStatus = "COMPLAINED";

    const existingLog = await db.emailLog.findFirst({
      where: { resendId },
    });

    let updatedRecord;
    if (existingLog) {
      updatedRecord = await db.emailLog.update({
        where: { id: existingLog.id },
        data: {
          status: targetStatus,
          updatedAt: new Date(),
        },
      });
    } else {
      updatedRecord = await db.emailLog.create({
        data: {
          recipient,
          subject: data.subject || "Webhook Notification",
          status: targetStatus,
          resendId,
        },
      });
    }

    const adminUser = await db.user.findFirst({
      where: { role: { name: "ADMIN" } },
    });

    if (adminUser) {
      await db.auditLog.create({
        data: {
          action: `WEBHOOK_${type.toUpperCase().replace(".", "_")}`,
          details: JSON.stringify({
            resendId,
            recipient,
            status: targetStatus,
          }),
          userId: adminUser.id,
        },
      });
    }

    return NextResponse.json({
      success: true,
      event: type,
      recordId: updatedRecord.id,
      status: targetStatus,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Webhook parsing error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
