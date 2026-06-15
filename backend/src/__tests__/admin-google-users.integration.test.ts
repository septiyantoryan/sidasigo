import request from "supertest";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import crypto from "node:crypto";
import { Role } from "@prisma/client";
import { createApp } from "../app";
import { createPrismaClient } from "../lib/prisma";

const prisma = createPrismaClient();

describe("admin google users integration", () => {
  const app = createApp();
  const suffix = Date.now();
  let googleUserId = "";
  let credentialUserId = "";
  let opdId = "";

  beforeAll(async () => {
    // User registered via Google.
    const googleUser = await prisma.user.create({
      data: {
        email: `g-user-${suffix}@gmail.com`,
        name: "Google User Test",
        role: Role.Masyarakat,
        emailVerified: true,
      },
    });
    googleUserId = googleUser.id;
    await prisma.account.create({
      data: {
        id: crypto.randomUUID(),
        accountId: `google-acc-${suffix}`,
        providerId: "google",
        userId: googleUser.id,
      },
    });

    // User registered via credential (should NOT appear).
    const credUser = await prisma.user.create({
      data: {
        email: `c-user-${suffix}@test.local`,
        username: `c-user-${suffix}`,
        name: "Credential User Test",
        role: Role.Masyarakat,
        emailVerified: true,
      },
    });
    credentialUserId = credUser.id;
    await prisma.account.create({
      data: {
        id: crypto.randomUUID(),
        accountId: credUser.email,
        providerId: "credential",
        userId: credUser.id,
        password: "hashed",
      },
    });

    const opd = await prisma.user.create({
      data: {
        email: `g-opd-${suffix}@test.local`,
        username: `g-opd-${suffix}`,
        name: "OPD User",
        role: Role.OPD,
      },
    });
    opdId = opd.id;
  });

  afterAll(async () => {
    await prisma.account.deleteMany({
      where: { userId: { in: [googleUserId, credentialUserId] } },
    });
    await prisma.user.deleteMany({
      where: { id: { in: [googleUserId, credentialUserId, opdId] } },
    });
    await prisma.$disconnect();
  });

  it("rejects unauthenticated request with 401", async () => {
    const response = await request(app).get("/api/admin/google-users");
    expect(response.status).toBe(401);
  });

  it("rejects non-admin with 403", async () => {
    const response = await request(app)
      .get("/api/admin/google-users")
      .set("x-test-role", "OPD")
      .set("x-test-user-id", opdId);
    expect(response.status).toBe(403);
  });

  it("lists google users but not credential users", async () => {
    const response = await request(app)
      .get("/api/admin/google-users")
      .set("x-test-role", "Admin")
      .set("x-test-user-id", "admin-test");

    expect(response.status).toBe(200);
    const emails = response.body.data.items.map((i: { email: string }) => i.email);
    expect(emails).toContain(`g-user-${suffix}@gmail.com`);
    expect(emails).not.toContain(`c-user-${suffix}@test.local`);
  });

  it("searches google users by name", async () => {
    const response = await request(app)
      .get("/api/admin/google-users?search=Google User Test")
      .set("x-test-role", "Admin")
      .set("x-test-user-id", "admin-test");

    expect(response.status).toBe(200);
    const names = response.body.data.items.map((i: { name: string }) => i.name);
    expect(names).toContain("Google User Test");
  });

  it("does not leak username or role fields", async () => {
    const response = await request(app)
      .get("/api/admin/google-users")
      .set("x-test-role", "Admin")
      .set("x-test-user-id", "admin-test");

    const item = response.body.data.items.find(
      (i: { email: string }) => i.email === `g-user-${suffix}@gmail.com`,
    );
    expect(item).toBeDefined();
    expect(item.name).toBe("Google User Test");
    expect(item.username).toBeUndefined();
    expect(item.role).toBeUndefined();
  });
});
