import request from "supertest";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { Role } from "@prisma/client";
import { createApp } from "../app";
import { createPrismaClient } from "../lib/prisma";

const prisma = createPrismaClient();

describe("admin delete user protection", () => {
  const app = createApp();
  const suffix = Date.now();
  let adminId = "";
  let otherAdminId = "";
  let opdId = "";

  beforeAll(async () => {
    const admin = await prisma.user.create({
      data: {
        email: `del-admin-${suffix}@test.local`,
        username: `del-admin-${suffix}`,
        name: "Del Admin",
        role: Role.Admin,
      },
    });
    adminId = admin.id;

    const otherAdmin = await prisma.user.create({
      data: {
        email: `del-admin2-${suffix}@test.local`,
        username: `del-admin2-${suffix}`,
        name: "Other Admin",
        role: Role.Admin,
      },
    });
    otherAdminId = otherAdmin.id;

    const opd = await prisma.user.create({
      data: {
        email: `del-opd-${suffix}@test.local`,
        username: `del-opd-${suffix}`,
        name: "Del OPD",
        role: Role.OPD,
      },
    });
    opdId = opd.id;
  });

  afterAll(async () => {
    await prisma.user.deleteMany({ where: { id: { in: [adminId, otherAdminId, opdId] } } });
    await prisma.$disconnect();
  });

  it("forbids deleting own account", async () => {
    const response = await request(app)
      .delete(`/api/admin/users/${adminId}`)
      .set("x-test-role", "Admin")
      .set("x-test-user-id", adminId);

    expect(response.status).toBe(403);
  });

  it("forbids deleting another Admin", async () => {
    const response = await request(app)
      .delete(`/api/admin/users/${otherAdminId}`)
      .set("x-test-role", "Admin")
      .set("x-test-user-id", adminId);

    expect(response.status).toBe(403);
  });

  it("allows deleting an OPD user", async () => {
    const response = await request(app)
      .delete(`/api/admin/users/${opdId}`)
      .set("x-test-role", "Admin")
      .set("x-test-user-id", adminId);

    expect(response.status).toBe(200);
    const gone = await prisma.user.findUnique({ where: { id: opdId } });
    expect(gone).toBeNull();
  });
});
