"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { transactionSchema, TransactionInput } from "@/lib/schemas";
import { createTransactionMutation } from "@/lib/actions";
import { toast } from "sonner";
import { Send, DollarSign, Building2, Mail, Tag, Hash, Loader2 } from "lucide-react";

interface TransactionFormProps {
  defaultEmail?: string;
  onSuccess?: () => void;
}

export function TransactionForm({ defaultEmail, onSuccess }: TransactionFormProps) {
  const [isPending, startTransition] = React.useTransition();
  const [statusNote, setStatusNote] = React.useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<TransactionInput>({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      userEmail: defaultEmail || "roystonsoans3@gmail.com",
      category: "Cloud Infrastructure",
      amount: 150.0,
      recipient: "",
      reference: "",
    },
  });

  const onSubmit = (data: TransactionInput) => {
    setStatusNote("Submitting Server Action...");

    startTransition(async () => {
      try {
        const response = await createTransactionMutation(data);

        if (response.success) {
          toast.success(response.message);
          setStatusNote(null);
          reset();
          onSuccess?.();
        } else {
          toast.error(response.message);
          setStatusNote(null);
        }
      } catch {
        toast.error("Error submitting transaction");
        setStatusNote(null);
      }
    });
  };

  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-xs dark:border-zinc-800 dark:bg-black">
      <div className="mb-5 flex items-center justify-between border-b border-zinc-100 pb-4 dark:border-zinc-800">
        <div>
          <h2 className="text-base font-semibold tracking-tight text-black dark:text-white">
            Create Transaction
          </h2>
          <p className="text-xs text-zinc-500 mt-0.5">
            Type-safe Server Action mutation with backend Zod validation.
          </p>
        </div>
        <span className="text-xs font-mono text-zinc-500">
          Server Action
        </span>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-1.5">
          <label className="flex items-center gap-1.5 text-xs font-medium text-black dark:text-white">
            <Mail className="h-3.5 w-3.5 text-zinc-400" />
            <span>Sender Email</span>
          </label>
          <input
            {...register("userEmail")}
            placeholder="admin@ledgercraft.dev"
            className="w-full h-9.5 rounded-lg border border-zinc-200 bg-white px-3 text-xs text-black shadow-xs transition-colors focus:border-zinc-400 focus:outline-none dark:border-zinc-800 dark:bg-black dark:text-white dark:focus:border-zinc-600"
          />
          {errors.userEmail && (
            <p className="text-[11px] text-red-500 font-medium">
              {errors.userEmail.message}
            </p>
          )}
        </div>

        <div className="space-y-1.5">
          <label className="flex items-center gap-1.5 text-xs font-medium text-black dark:text-white">
            <Building2 className="h-3.5 w-3.5 text-zinc-400" />
            <span>Recipient Entity</span>
          </label>
          <input
            {...register("recipient")}
            placeholder="e.g. Acme Cloud Corp"
            className="w-full h-9.5 rounded-lg border border-zinc-200 bg-white px-3 text-xs text-black shadow-xs transition-colors focus:border-zinc-400 focus:outline-none dark:border-zinc-800 dark:bg-black dark:text-white dark:focus:border-zinc-600"
          />
          {errors.recipient && (
            <p className="text-[11px] text-red-500 font-medium">
              {errors.recipient.message}
            </p>
          )}
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="space-y-1.5">
            <label className="flex items-center gap-1.5 text-xs font-medium text-black dark:text-white">
              <DollarSign className="h-3.5 w-3.5 text-zinc-400" />
              <span>Amount (USD)</span>
            </label>
            <input
              type="number"
              step="0.01"
              {...register("amount")}
              placeholder="0.00"
              className="w-full h-9.5 rounded-lg border border-zinc-200 bg-white px-3 font-mono text-xs text-black shadow-xs transition-colors focus:border-zinc-400 focus:outline-none dark:border-zinc-800 dark:bg-black dark:text-white dark:focus:border-zinc-600"
            />
            {errors.amount && (
              <p className="text-[11px] text-red-500 font-medium">
                {errors.amount.message}
              </p>
            )}
          </div>

          <div className="space-y-1.5">
            <label className="flex items-center gap-1.5 text-xs font-medium text-black dark:text-white">
              <Tag className="h-3.5 w-3.5 text-zinc-400" />
              <span>Category</span>
            </label>
            <select
              {...register("category")}
              className="w-full h-9.5 rounded-lg border border-zinc-200 bg-white px-2.5 text-xs text-black shadow-xs transition-colors focus:border-zinc-400 focus:outline-none dark:border-zinc-800 dark:bg-black dark:text-white dark:focus:border-zinc-600"
            >
              <option value="Cloud Infrastructure">Cloud Infrastructure</option>
              <option value="API Billing">API Billing</option>
              <option value="Payroll">Payroll</option>
              <option value="Security">Security</option>
              <option value="Hardware">Hardware</option>
              <option value="SaaS Licensing">SaaS Licensing</option>
            </select>
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="flex items-center gap-1.5 text-xs font-medium text-black dark:text-white">
            <Hash className="h-3.5 w-3.5 text-zinc-400" />
            <span>Reference ID (Optional)</span>
          </label>
          <input
            {...register("reference")}
            placeholder="e.g. REF-DEV-88"
            className="w-full h-9.5 rounded-lg border border-zinc-200 bg-white px-3 font-mono text-xs uppercase text-black shadow-xs transition-colors focus:border-zinc-400 focus:outline-none dark:border-zinc-800 dark:bg-black dark:text-white dark:focus:border-zinc-600"
          />
        </div>

        {statusNote && (
          <div className="flex items-center gap-2 rounded-lg bg-zinc-50 p-2.5 text-xs text-zinc-600 dark:bg-zinc-900 dark:text-zinc-400">
            <Loader2 className="h-3.5 w-3.5 animate-spin text-zinc-500" />
            <span>{statusNote}</span>
          </div>
        )}

        <button
          type="submit"
          disabled={isPending}
          className="w-full h-10 flex items-center justify-center gap-2 rounded-lg bg-black text-xs font-medium text-white shadow-sm transition-all hover:bg-zinc-800 disabled:opacity-50 dark:bg-white dark:text-black dark:hover:bg-zinc-200"
        >
          {isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Send className="h-3.5 w-3.5" />
          )}
          <span>{isPending ? "Executing Mutation..." : "Dispatch Transaction"}</span>
        </button>
      </form>
    </div>
  );
}
