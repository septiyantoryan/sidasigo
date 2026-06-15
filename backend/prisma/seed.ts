import { Role } from "@prisma/client";
import bcrypt from "bcryptjs";
import crypto from "node:crypto";
import { createPrismaClient } from "../src/lib/prisma";

const prisma = createPrismaClient();

async function ensureUser(input: {
  email: string;
  username: string;
  password: string;
  name: string;
  role: Role;
}) {
  const existing = await prisma.user.findUnique({
    where: { email: input.email },
    include: { accounts: { where: { providerId: "credential" } } },
  });

  if (existing) {
    const hashed = bcrypt.hashSync(input.password, 10);
    const credAccount = existing.accounts[0];

    if (credAccount) {
      await prisma.account.update({
        where: { id: credAccount.id },
        data: { password: hashed },
      });
    } else {
      await prisma.account.create({
        data: {
          id: crypto.randomUUID(),
          accountId: input.email,
          providerId: "credential",
          userId: existing.id,
          password: hashed,
        },
      });
    }

    await prisma.user.update({
      where: { id: existing.id },
      data: {
        role: input.role,
        name: input.name,
        username: input.username,
        emailVerified: true,
      },
    });

    return existing;
  }

  await prisma.user.create({
    data: {
      email: input.email,
      name: input.name,
      role: input.role,
      username: input.username,
      emailVerified: true,
    },
  });

  const created = await prisma.user.findUnique({ where: { email: input.email } });
  if (!created) throw new Error(`Failed to create user ${input.email}`);

  await prisma.account.create({
    data: {
      id: crypto.randomUUID(),
      accountId: input.email,
      providerId: "credential",
      userId: created.id,
      password: bcrypt.hashSync(input.password, 10),
    },
  });

  return created;
}

async function backfillUsernames() {
  const usersWithoutUsername = await prisma.user.findMany({
    where: {
      username: null,
      role: { in: [Role.Admin, Role.OPD] },
    },
    select: { id: true, email: true },
  });

  for (const user of usersWithoutUsername) {
    if (!user.email) continue;
    const candidate = user.email.split("@")[0];
    if (!candidate) continue;

    const collision = await prisma.user.findUnique({
      where: { username: candidate },
    });
    if (collision) continue;

    await prisma.user.update({
      where: { id: user.id },
      data: { username: candidate },
    });
  }
}

async function main() {
  await backfillUsernames();

  await prisma.systemSetting.upsert({
    where: { id: "singleton" },
    create: {
      id: "singleton",
      siteTitle: "SIDASIGO",
      siteSubtitle: "Sistem Data Inovasi Kabupaten Grobogan",
      heroWelcomeText: "Selamat datang di SIDASIGO",
    },
    update: {},
  });

  await ensureUser({
    email: "admin@admin.com",
    username: "admin",
    password: "Admin_123",
    name: "Administrator",
    role: Role.Admin,
  });

  await ensureUser({
    email: "opd@opd.com",
    username: "opd",
    password: "Opd_123",
    name: "Operator OPD",
    role: Role.OPD,
  });

  console.log("Seed complete. Login dengan username + password:");
  console.log("Admin: admin / Admin_123");
  console.log("OPD:   opd  / Opd_123");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
