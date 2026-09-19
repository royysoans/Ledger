import { z } from "zod";

export const RoleEnum = z.enum(["ADMIN", "MEMBER", "GUEST"]);
export type RoleType = z.infer<typeof RoleEnum>;

export const transactionSchema = z.object({
  amount: z
    .coerce
    .number({ invalid_type_error: "Amount must be a valid number" })
    .positive("Amount must be greater than zero")
    .max(100000, "Amount cannot exceed $100,000"),
  recipient: z
    .string()
    .min(2, "Recipient name must have at least 2 characters")
    .max(100, "Recipient name is too long"),
  category: z
    .string()
    .min(1, "Please select an operational category"),
  reference: z
    .string()
    .max(64, "Reference ID cannot exceed 64 characters")
    .optional(),
  userEmail: z
    .string()
    .email("A valid email address is required"),
});

export type TransactionInput = z.infer<typeof transactionSchema>;

export const resendWebhookSchema = z.object({
  type: z.enum([
    "email.sent",
    "email.delivered",
    "email.bounced",
    "email.complained",
  ]),
  created_at: z.string().optional(),
  data: z.object({
    id: z.string(),
    from: z.string().optional(),
    to: z.array(z.string()),
    subject: z.string().optional(),
  }),
});

export type ResendWebhookPayload = z.infer<typeof resendWebhookSchema>;

export interface ActionResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
  errors?: Record<string, string[]>;
}
