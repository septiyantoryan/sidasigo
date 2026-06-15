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

describe("user change username integration", () => {
  const app = createApp();
  const suffix = Date.now();
  let selfId = "";
  let adminId = "";
  let targetId = "";
  let occupiedUsername = "";

  beforeAll(async () => {
    const self = await createUserWithPassword({
      email: `cu-self-${suffix}@test.local`,
      username: `cuself${suffix}`,
      name: "Self User",
      role: Role.OPD,
      password: "SelfPass123!",
    });
    selfId = self.id;

    const admin = await createUserWithPassword({
      email: `cu-admin-${suffix}@test.local`,
      username: `cuadmin${suffix}`,
      name: "Admin User",
      role: Role.Admin,
      password: "AdminPass123!",
    });
    adminId = admin.id;

    const target = await createUserWithPassword({
      email: `cu-target-${suffix}@test.local`,
      username: `cutarget${suffix}`,
      name: "Target User",
      role: Role.OPD,
      password: "TargetPass123!",
    });
    targetId = target.id;
    occupiedUsername = `cuadmin${suffix}`;
  });

  afterAll(async () => {
    const ids = [selfId, adminId, targetId];
    await prisma.account.deleteMany({ where: { userId: { in: ids } } });
    await prisma.user.deleteMany({ where: { id: { in: ids } } });
    await prisma.$disconnect();
  });

  // --- Self change username ---

  it("rejects unauthenticated self change with 401", async () => {
    const response = await request(app)
      .put("/api/auth/user/change-username")
      .send({ password: "SelfPass123!", username: `cunew${suffix}` });

    expect(response.status).toBe(401);
  });

  it("rejects wrong password with 401", async () => {
    const response = await request(app)
      .put("/api/auth/user/change-username")
      .set("x-test-role", "OPD")
      .set("x-test-user-id", selfId)
      .send({ password: "WrongPass1!", username: `cunew${suffix}` });

    expect(response.status).toBe(401);
  });

  it("rejects username already taken with 409", async () => {
    const response = await request(app)
      .put("/api/auth/user/change-username")
      .set("x-test-role", "OPD")
      .set("x-test-user-id", selfId)
      .send({ password: "SelfPass123!", username: occupiedUsername });

    expect(response.status).toBe(409);
    expect(response.body.error.code).toBe("CONFLICT");
  });

  it("changes own username with correct password", async () => {
    const newUsername = `cuselfnew${suffix}`;
    const response = await request(app)
      .put("/api/auth/user/change-username")
      .set("x-test-role", "OPD")
      .set("x-test-user-id", selfId)
      .send({ password: "SelfPass123!", username: newUsername });

    expect(response.status).toBe(200);

    const user = await prisma.user.findUnique({ where: { id: selfId } });
    expect(user?.username).toBe(newUsername);
  });

  // --- Admin change username ---

  it("rejects non-admin admin-change with 403", async () => {
    const response = await request(app)
      .put(`/api/admin/users/${targetId}/change-username`)
      .set("x-test-role", "OPD")
      .set("x-test-user-id", selfId)
      .send({ username: `cutargetx${suffix}` });

    expect(response.status).toBe(403);
  });

  it("rejects admin-change to taken username with 409", async () => {
    const response = await request(app)
      .put(`/api/admin/users/${targetId}/change-username`)
      .set("x-test-role", "Admin")
      .set("x-test-user-id", adminId)
      .send({ username: occupiedUsername });

    expect(response.status).toBe(409);
    expect(response.body.error.code).toBe("CONFLICT");
  });

  it("admin changes target username without password", async () => {
    const newUsername = `cutargetnew${suffix}`;
    const response = await request(app)
      .put(`/api/admin/users/${targetId}/change-username`)
      .set("x-test-role", "Admin")
      .set("x-test-user-id", adminId)
      .send({ username: newUsername });

    expect(response.status).toBe(200);

    const user = await prisma.user.findUnique({ where: { id: targetId } });
    expect(user?.username).toBe(newUsername);
  });
});
