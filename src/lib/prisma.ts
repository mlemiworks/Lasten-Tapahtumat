// src/lib/prisma.ts
import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
// In Prisma 7, PrismaClient is imported from the locally generated folder,
// not from the @prisma/client package. The path is relative to this file's location.
import { PrismaClient } from '../generated/prisma';

declare global {
  var prisma: PrismaClient | undefined;
}

function createPrismaClient() {
  const adapter = new PrismaPg({
    connectionString: process.env.DATABASE_URL,
    // pg has no connect timeout by default, so an unreachable host hangs until the OS gives up (~22 s on Windows).
    connectionTimeoutMillis: 5000,
  });
  return new PrismaClient({ adapter });
}

const prisma = global.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== 'production') {
  global.prisma = prisma;
}

export default prisma;
