import request from "supertest";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { Role } from "@prisma/client";
import { createApp } from "../app";
import { createPrismaClient } from "../lib/prisma";

const prisma = createPrismaClient();

describe("create OPD user conflict integration", () => {
  const app = createApp();
  const suffix = Date.now();
  const username = `dupopd${suffix}`;
  const email = `dup-opd-${suffix}@test.local`;
  let seedUserId = "";

  beforeAll(async () => {
    const user = await prisma.user.create({
      data: {
        email,
        username,
        name: "Existing OPD",
        role: Role.OPD,
      },
    });
    seedUserId = user.id;
  });

  afterAll(async () => {
    await prisma.user.deleteMany({ where: { id: seedUserId } });
    await prisma.$disconnect();
  });

  it("returns 409 when username already exists", async () => {
    const response = await request(app)
      .post("/api/admin/users")
      .set("x-test-role", "Admin")
      .set("x-test-user-id", "admin-test")
      .send({
        name: "New OPD",
        username,
        email: `other-${suffix}@test.local`,
        password: "Secret123!",
      });

    expect(response.status).toBe(409);
    expect(response.body.error.code).toBe("CONFLICT");
  });

  it("returns 409 when email already exists", async () => {
    const response = await request(app)
      .post("/api/admin/users")
      .set("x-test-role", "Admin")
      .set("x-test-user-id", "admin-test")
      .send({
        name: "New OPD",
        username: `other${suffix}`,
        email,
        password: "Secret123!",
      });

    expect(response.status).toBe(409);
    expect(response.body.error.code).toBe("CONFLICT");
  });
});
