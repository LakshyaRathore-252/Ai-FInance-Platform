import { PrismaClient } from "./generated/prisma";

let db;

if (process.env.NODE_ENV === "production") {
    db = new PrismaClient();
} else {
    if (!globalThis.prisma) {
        globalThis.prisma = new PrismaClient();
    }
    db = globalThis.prisma;
}

export { db };
