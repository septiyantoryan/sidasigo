import request from "supertest";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { Role } from "@prisma/client";
import { createApp } from "../app";
import { createPrismaClient } from "../lib/prisma";

const prisma = createPrismaClient();

describe("settings hero-image upload guards", () => {
  const app = createApp();
  const suffix = Date.now();
  let adminId = "";
  let opdId = "";

  beforeAll(async () => {
    const admin = await prisma.user.create({
      data: {
        email: `hero-admin-${suffix}@test.local`,
        username: `hero-admin-${suffix}`,
        name: "Hero Admin",
        role: Role.Admin,
      },
    });
    adminId = admin.id;

    const opd = await prisma.user.create({
      data: {
        email: `hero-opd-${suffix}@test.local`,
        username: `hero-opd-${suffix}`,
        name: "Hero OPD",
        role: Role.OPD,
      },
    });
    opdId = opd.id;
  });

  afterAll(async () => {
    await prisma.user.deleteMany({ where: { id: { in: [adminId, opdId] } } });
    await prisma.$disconnect();
  });

  it("rejects unauthenticated upload with 401", async () => {
    const response = await request(app).post("/api/admin/settings/hero-image");
    expect(response.status).toBe(401);
  });

  it("rejects non-admin upload with 403", async () => {
    const response = await request(app)
      .post("/api/admin/settings/hero-image")
      .set("x-test-role", "OPD")
      .set("x-test-user-id", opdId);

    expect(response.status).toBe(403);
  });

  it("rejects admin upload without file with 400", async () => {
    const response = await request(app)
      .post("/api/admin/settings/hero-image")
      .set("x-test-role", "Admin")
      .set("x-test-user-id", adminId);

    expect(response.status).toBe(400);
    expect(response.body.error.code).toBe("VALIDATION_ERROR");
  });

  it("accepts admin upload with valid PNG and stores path", async () => {
    // Minimal valid PNG: signature + IHDR-ish header bytes.
    const png = Buffer.from([
      0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00, 0x00, 0x00, 0x0d,
    ]);

    const response = await request(app)
      .post("/api/admin/settings/hero-image")
      .set("x-test-role", "Admin")
      .set("x-test-user-id", adminId)
      .attach("file", png, "hero.png");

    expect(response.status).toBe(201);
    expect(response.body.data.path).toMatch(/^\/api\/public-files\//);
  });
});
