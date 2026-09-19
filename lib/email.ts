import { Resend } from "resend";
import { db } from "@/lib/db";
import { TransactionAlertEmail } from "@/components/email/transaction-alert";

const resendApiKey = process.env.RESEND_API_KEY || "re_test_placeholder";
const resend = new Resend(resendApiKey);

interface DispatchTransactionNotificationParams {
  recipientEmail: string;
  recipientName: string;
  amount: number;
  category: string;
  reference?: string;
  userId?: string;
}

export async function dispatchTransactionNotification({
  recipientEmail,
  recipientName,
  amount,
  category,
  reference,
  userId,
}: DispatchTransactionNotificationParams) {
  const subject = `Transaction Confirmation - $${amount.toFixed(2)}`;
  let resendId: string | null = null;
  let status = "SENT";

  try {
    if (process.env.RESEND_API_KEY && process.env.RESEND_API_KEY !== "re_test_placeholder") {
      const { data, error } = await resend.emails.send({
        from: "FST1 Core <notifications@resend.dev>",
        to: [recipientEmail],
        subject,
        react: TransactionAlertEmail({
          recipient: recipientName,
          amount,
          category,
          reference,
          timestamp: new Date().toISOString(),
        }),
      });

      if (error) {
        status = "BOUNCED";
      } else if (data) {
        resendId = data.id;
        status = "DELIVERED";
      }
    } else {
      resendId = `sim_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
      status = "DELIVERED";
    }
  } catch {
    status = "FAILED";
  }

  const emailRecord = await db.emailLog.create({
    data: {
      recipient: recipientEmail,
      subject,
      status,
      resendId,
      userId: userId ?? null,
    },
  });

  return { emailRecord, resendId, status };
}
