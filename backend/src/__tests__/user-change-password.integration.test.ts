import request from "supertest";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import crypto from "node:crypto";
import bcrypt from "bcryptjs";
import { Role } from "@prisma/client";
import { createApp } from "../app";
import { createPrismaClient } from "../lib/prisma";

const prisma = createPrismaClient();

async function createUserWithPassword(input: {
  email: string;
  username: string;
  name: string;
  role: Role;
  password: string;
}) {
  const user = await prisma.user.create({
    data: {
      email: input.email,
      username: input.username,
      name: input.name,
      role: input.role,
      emailVerified: true,
    },
  });
  await prisma.account.create({
    data: {
      id: crypto.randomUUID(),
      accountId: input.email,
      providerId: "credential",
      userId: user.id,
      password: bcrypt.hashSync(input.password, 10),
    },
  });
  return user;
}

describe("user change password integration", () => {
  const app = createApp();
  const suffix = Date.now();
  let selfId = "";
  let adminId = "";
  let targetId = "";

  beforeAll(async () => {
    const self = await createUserWithPassword({
      email: `cp-self-${suffix}@test.local`,
      username: `cp-self-${suffix}`,
      name: "Self User",
      role: Role.OPD,
      password: "OldPass123!",
    });
    selfId = self.id;

    const admin = await createUserWithPassword({
      email: `cp-admin-${suffix}@test.local`,
      username: `cp-admin-${suffix}`,
      name: "Admin User",
      role: Role.Admin,
      password: "AdminPass123!",
    });
    adminId = admin.id;

    const target = await createUserWithPassword({
      email: `cp-target-${suffix}@test.local`,
      username: `cp-target-${suffix}`,
      name: "Target User",
      role: Role.OPD,
      password: "TargetPass123!",
    });
    targetId = target.id;
  });

  afterAll(async () => {
    const ids = [selfId, adminId, targetId];
    await prisma.account.deleteMany({ where: { userId: { in: ids } } });
    await prisma.user.deleteMany({ where: { id: { in: ids } } });
    await prisma.$disconnect();
  });

  // --- Self change password ---

  it("rejects unauthenticated self change with 401", async () => {
    const response = await request(app)
      .put("/api/auth/user/change-password")
      .send({ oldPassword: "OldPass123!", newPassword: "NewPass123!" });

    expect(response.status).toBe(401);
  });

  it("rejects wrong old password with 401", async () => {
    const response = await request(app)
      .put("/api/auth/user/change-password")
      .set("x-test-role", "OPD")
      .set("x-test-user-id", selfId)
      .send({ oldPassword: "WrongPass1!", newPassword: "NewPass123!" });

    expect(response.status).toBe(401);
  });

  it("rejects weak new password with 400", async () => {
    const response = await request(app)
      .put("/api/auth/user/change-password")
      .set("x-test-role", "OPD")
      .set("x-test-user-id", selfId)
      .send({ oldPassword: "OldPass123!", newPassword: "lemah" });

    expect(response.status).toBe(400);
    expect(response.body.error.code).toBe("VALIDATION_ERROR");
  });

  it("changes own password with correct old password", async () => {
    const response = await request(app)
      .put("/api/auth/user/change-password")
      .set("x-test-role", "OPD")
      .set("x-test-user-id", selfId)
      .send({ oldPassword: "OldPass123!", newPassword: "BrandNew123!" });

    expect(response.status).toBe(200);

    // verify new hash stored
    const account = await prisma.account.findFirst({
      where: { userId: selfId, providerId: "credential" },
    });
    expect(account?.password).toBeTruthy();
    expect(bcrypt.compareSync("BrandNew123!", account!.password!)).toBe(true);
  });

  // --- Admin change password ---

  it("rejects non-admin admin-change with 403", async () => {
    const response = await request(app)
      .put(`/api/admin/users/${targetId}/change-password`)
      .set("x-test-role", "OPD")
      .set("x-test-user-id", selfId)
      .send({ newPassword: "AdminSet123!" });

    expect(response.status).toBe(403);
  });

  it("rejects unauthenticated admin-change with 401", async () => {
    const response = await request(app)
      .put(`/api/admin/users/${targetId}/change-password`)
      .send({ newPassword: "AdminSet123!" });

    expect(response.status).toBe(401);
  });

  it("rejects weak password on admin-change with 400", async () => {
    const response = await request(app)
      .put(`/api/admin/users/${targetId}/change-password`)
      .set("x-test-role", "Admin")
      .set("x-test-user-id", adminId)
      .send({ newPassword: "lemah" });

    expect(response.status).toBe(400);
    expect(response.body.error.code).toBe("VALIDATION_ERROR");
  });

  it("admin changes target password without old password", async () => {
    const response = await request(app)
      .put(`/api/admin/users/${targetId}/change-password`)
      .set("x-test-role", "Admin")
      .set("x-test-user-id", adminId)
      .send({ newPassword: "AdminSet123!" });

    expect(response.status).toBe(200);

    const account = await prisma.account.findFirst({
      where: { userId: targetId, providerId: "credential" },
    });
    expect(bcrypt.compareSync("AdminSet123!", account!.password!)).toBe(true);
  });
});
