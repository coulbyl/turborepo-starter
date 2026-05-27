import "dotenv/config";
import { randomBytes, scryptSync } from "node:crypto";
import { prisma } from "./client";

const SCRYPT_KEYLEN = 64;
const SCRYPT_N = 32768;
const SCRYPT_R = 8;
const SCRYPT_P = 1;
const SCRYPT_MAXMEM = 128 * SCRYPT_N * SCRYPT_R * SCRYPT_P * 2;

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

const BUILT_IN_SECTORS = [
  "FINTECH",
  "MICROFINANCE / IMF",
  "IMMOBILIER",
  "BANQUE",
  "ASSURANCE",
];

async function seedSectors() {
  for (const label of BUILT_IN_SECTORS) {
    await prisma.sector.upsert({
      where: { label },
      update: { builtIn: true },
      create: { label, builtIn: true },
    });
  }
  console.log(`[db:seed] ${BUILT_IN_SECTORS.length} built-in sectors ensured`);
}

async function seedAdminUser() {
  const email = normalizeIdentifier(
    process.env.SEED_ADMIN_EMAIL ?? "admin@identis.ci",
  );
  const fullName = (process.env.SEED_ADMIN_FULL_NAME ?? "Identis Admin").trim();
  const password = process.env.SEED_ADMIN_PASSWORD;

  const existing = await prisma.user.findUnique({
    where: { email },
    select: { id: true, role: true },
  });

  if (existing) {
    await prisma.user.update({
      where: { id: existing.id },
      data: {
        fullName,
        role: "ADMIN",
        emailVerified: true,
        ...(password?.trim() ? { passwordHash: hashPassword(password) } : {}),
      },
    });
    console.log(`[db:seed] admin user ensured: ${email}`);
    return;
  }

  if (!password?.trim()) {
    console.log(
      "[db:seed] admin user skipped: set SEED_ADMIN_PASSWORD to create it",
    );
    return;
  }

  await prisma.user.create({
    data: {
      email,
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
  await seedSectors();
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
