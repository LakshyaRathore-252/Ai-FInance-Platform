import { z } from 'zod';

export const accountSchema = z.object({
    name: z.string().min(1, { message: "Name is required" }),
    type: z.enum(["CURRENT", "SAVINGS"]),
    balance: z.string().min(1, { message: "Balance is required" }),
    isDefault: z.boolean().default(false),
});

export const transitionSchema = z.object({
    type: z.enum(["INCOME", "EXPENSE"]),
    amount: z.string().min(1, { message: "Amount is required" }),
    description: z.string().min(1, { message: "Description is required" }),
    date: z.string().min(1, { message: "Date is required" }),
    accountId: z.string().min(1, { message: "Account is required" }),
    category: z.string().min(1, { message: "Category is required" }),
    isRecurring: z.boolean().default(false),
    recurringInterval: z
        .enum(["DAILY", "WEEKLY", "MONTHLY", "YEARLY"])
        .optional(),
}).superRefine((data, ctx) => {
        if (data.isRecurring && !data.recurringInterval) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: "Recurring interval is required for recurring transactions",
                path: ["recurringInterval"],
            });
        }
    });