import "dotenv/config";
import { randomBytes, scryptSync } from "node:crypto";
import { prisma } from "./client";

const SCRYPT_KEYLEN = 64;
const SCRYPT_N = 32768;
const SCRYPT_R = 8;
const SCRYPT_P = 1;
const SCRYPT_MAXMEM = 128 * SCRYPT_N * SCRYPT_R * SCRYPT_P * 2; // 64 MB

function normalizeIdentifier(value: string): string {
  return value.trim().toLowerCase();
}

function hashPassword(password: string): string {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, SCRYPT_KEYLEN, {
    N: SCRYPT_N,
    r: SCRYPT_R,
    p: SCRYPT_P,
    maxmem: SCRYPT_MAXMEM,
  }).toString("hex");
  return `${SCRYPT_N}:${SCRYPT_R}:${SCRYPT_P}:${salt}:${hash}`;
}

async function seedAdminUser() {
  const email = normalizeIdentifier(
    process.env.SEED_ADMIN_EMAIL ?? "admin@starter.local",
  );
  const username = normalizeIdentifier(
    process.env.SEED_ADMIN_USERNAME ?? "admin",
  );
  const fullName = (process.env.SEED_ADMIN_FULL_NAME ?? "Starter Admin").trim();
  const password = process.env.SEED_ADMIN_PASSWORD;

  const matchingUsers = await prisma.user.findMany({
    where: { OR: [{ email }, { username }] },
    select: {
      id: true,
      email: true,
      username: true,
      role: true,
    },
  });

  if (matchingUsers.length > 1) {
    throw new Error(
      `[db:seed] admin seed is ambiguous for email=${email} username=${username}`,
    );
  }

  if (matchingUsers.length === 1) {
    const user = matchingUsers[0];

    if (!user) {
      throw new Error("[db:seed] unexpected missing admin candidate");
    }

    await prisma.user.update({
      where: { id: user.id },
      data: {
        email,
        username,
        fullName,
        role: "ADMIN",
        emailVerified: true,
        ...(password && password.trim() !== ""
          ? { passwordHash: hashPassword(password) }
          : {}),
      },
    });

    console.log(`[db:seed] admin user ensured: ${email}`);
    return;
  }

  if (!password || password.trim() === "") {
    console.log(
      "[db:seed] admin user skipped: set SEED_ADMIN_PASSWORD to create it",
    );
    return;
  }

  await prisma.user.create({
    data: {
      email,
      username,
      fullName,
      passwordHash: hashPassword(password),
      role: "ADMIN",
      emailVerified: true,
    },
    select: { id: true },
  });

  console.log(`[db:seed] admin user created: ${email}`);
}

async function main() {
  await seedAdminUser();
}

main()
  .catch((error) => {
    console.error("[db:seed] failed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
