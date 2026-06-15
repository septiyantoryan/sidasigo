import request from "supertest";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { Role } from "@prisma/client";
import { createApp } from "../app";
import { createPrismaClient } from "../lib/prisma";

const prisma = createPrismaClient();

describe("admin sub-routes auth (nested riset/berita/download)", () => {
  const app = createApp();
  const suffix = Date.now();
  let opdId = "";

  beforeAll(async () => {
    const opd = await prisma.user.create({
      data: {
        email: `sub-opd-${suffix}@test.local`,
        username: `sub-opd-${suffix}`,
        name: "Sub OPD",
        role: Role.OPD,
      },
    });
    opdId = opd.id;
  });

  afterAll(async () => {
    await prisma.user.deleteMany({ where: { id: opdId } });
    await prisma.$disconnect();
  });

  const subPaths = ["/api/admin/riset", "/api/admin/berita", "/api/admin/download"];

  for (const p of subPaths) {
    it(`requires auth for ${p}`, async () => {
      const response = await request(app).get(p);
      expect(response.status).toBe(401);
    });

    it(`forbids non-admin for ${p}`, async () => {
      const response = await request(app)
        .get(p)
        .set("x-test-role", "OPD")
        .set("x-test-user-id", opdId);
      expect(response.status).toBe(403);
    });

    it(`allows admin for ${p}`, async () => {
      const response = await request(app)
        .get(p)
        .set("x-test-role", "Admin")
        .set("x-test-user-id", "admin-test");
      expect(response.status).toBe(200);
    });
  }
});
