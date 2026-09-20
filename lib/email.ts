import { Resend } from "resend";
import { db } from "@/lib/db";
import { TransactionAlertEmail } from "@/components/email/transaction-alert";

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

  const apiKey = process.env.RESEND_API_KEY;

  try {
    if (apiKey && !apiKey.includes("dummy") && !apiKey.includes("placeholder")) {
      const resend = new Resend(apiKey);
      const { data, error } = await resend.emails.send({
        from: "LedgerCraft <onboarding@resend.dev>",
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
