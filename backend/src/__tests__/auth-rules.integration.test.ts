import request from "supertest";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { Role } from "@prisma/client";
import { auth } from "../lib/auth";
import { createApp } from "../app";
import { createPrismaClient } from "../lib/prisma";

const prisma = createPrismaClient();

describe("auth rules integration", () => {
  const app = createApp();

  const opdUsername = `authrulesopd${Date.now()}`;
  const opdEmail = `${opdUsername}@test.local`;
  const opdPassword = "OpdSecret123";

  const masyarakatEmail = `auth-rules-mas-${Date.now()}@test.local`;
  const masyarakatPassword = "MasSecret123";

  let opdId = "";
  let masyarakatId = "";

  beforeAll(async () => {
    await auth.api.signUpEmail({
      body: {
        email: opdEmail,
        password: opdPassword,
        name: "Auth Rules OPD",
      },
    });

    const opdUser = await prisma.user.findUnique({ where: { email: opdEmail } });
    if (!opdUser) throw new Error("Failed to create OPD test user");
    opdId = opdUser.id;
    await prisma.user.update({
      where: { id: opdId },
      data: { role: Role.OPD, username: opdUsername, emailVerified: true },
    });

    await auth.api.signUpEmail({
      body: {
        email: masyarakatEmail,
        password: masyarakatPassword,
        name: "Auth Rules Masyarakat",
      },
    });
    const masyarakatUser = await prisma.user.findUnique({
      where: { email: masyarakatEmail },
    });
    if (!masyarakatUser) throw new Error("Failed to create masyarakat test user");
    masyarakatId = masyarakatUser.id;
    await prisma.user.update({
      where: { id: masyarakatId },
      data: { role: Role.Masyarakat, emailVerified: true },
    });
  });

  afterAll(async () => {
    await prisma.user.deleteMany({
      where: { id: { in: [opdId, masyarakatId] } },
    });
    await prisma.$disconnect();
  });

  it("OPD can sign in with username and password", async () => {
    const response = await request(app)
      .post("/api/auth/sign-in/username")
      .send({ username: opdUsername, password: opdPassword });

    expect(response.status).toBe(200);
    expect(response.body.user?.id).toBe(opdId);
  });

  it("rejects invalid password for OPD", async () => {
    const response = await request(app)
      .post("/api/auth/sign-in/username")
      .send({ username: opdUsername, password: "wrong-password" });

    expect(response.status).toBeGreaterThanOrEqual(400);
  });

  it("blocks Masyarakat sign-in via email/password", async () => {
    const response = await request(app)
      .post("/api/auth/sign-in/email")
      .send({ email: masyarakatEmail, password: masyarakatPassword });

    expect(response.status).toBe(403);
  });
});
