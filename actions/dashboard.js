"use server";

import { db } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";

const serializeTransaction = (obj) => {
    const serialized = { ...obj };
    if (obj.balance) {
        serialized.balance = obj.balance.toNumber();
    }
    if (obj.amount) {
        serialized.amount = obj.amount.toNumber();
    }
    return serialized;
};
export async function createAccount(data) {
    try {
        const { userId } = await auth();

        if (!userId) {
            throw new Error("User not authenticated");
        }

        const user = await db.user.findUnique({
            where: { clerkUserId: userId },
        });

        if (!user) {
            throw new Error("User not found");
        }

        //convert balance to float before saving
        const balaceFloat = parseFloat(data.balance);

        if (isNaN(balaceFloat)) {
            throw new Error("Invalid balance");
        }

        // Check this is user first account , then it will be the default account
        const existingAccount = await db.account.findMany({
            where: { userId: user.id },
        });

        const shouldBeDefault = existingAccount.length === 0 ? true : data.isDefault;

        // If this acc is default, set all other accounts to not default
        if (shouldBeDefault) {
            await db.account.updateMany({
                where: { userId: user.id, isDefault: true },
                data: { isDefault: false },
            });
        }

        // Create the account
        const account = await db.account.create({
            data: {
                ...data,
                userId: user.id,
                balance: balaceFloat,
                isDefault: shouldBeDefault,
            },
        });

        // next js does not support decimal values , we need to serialize it.
        // Serialize the account before returning
        const serializedAccount = serializeTransaction(account);

        revalidatePath("/dashboard");
        return {
            success: true,
            message: "Account created successfully",
            account: serializedAccount,
        }
    } catch (error) {
        console.error("Error creating account:", error);
        throw new Error("Failed to create account");

    }

}

export async function getUserAccounts() {
    const { userId } = await auth();

    if (!userId) {
        throw new Error("User not authenticated");
    }
    const user = await db.user.findUnique({
        where: { clerkUserId: userId },
    });

    if (!user) {
        throw new Error("User not found");
    }

    const accounts = await db.account.findMany({
        where: { userId: user.id },
        orderBy: { createdAt: "desc" },
        include: {
            _count: {
                select: {
                    transactions: true
                },
            },
        }
    });

    // Serialize the accounts before returning
    const serializedAccounts = accounts.map(serializeTransaction);
    return serializedAccounts;
}