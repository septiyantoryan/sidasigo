import request from "supertest";
import { afterAll, describe, expect, it } from "vitest";
import { Role } from "@prisma/client";
import { createApp } from "../app";
import { createPrismaClient } from "../lib/prisma";

const prisma = createPrismaClient();

describe("system settings integration", () => {
  const app = createApp();
  let adminId = "";
  let opdId = "";

  afterAll(async () => {
    await prisma.user.deleteMany({ where: { id: { in: [adminId, opdId] } } });
    await prisma.$disconnect();
  });

  it("returns default settings on public GET", async () => {
    const response = await request(app).get("/api/settings");

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data.id).toBe("singleton");
    expect(response.body.data.siteTitle).toBeTruthy();
  });

  it("allows admin to update settings and reflects in public GET", async () => {
    const admin = await prisma.user.create({
      data: {
        email: `settings-admin-${Date.now()}@test.local`,
        username: `settings-admin-${Date.now()}`,
        name: "Settings Admin",
        role: Role.Admin,
      },
    });
    adminId = admin.id;

    const update = await request(app)
      .put("/api/admin/settings")
      .set("x-test-role", "Admin")
      .set("x-test-user-id", adminId)
      .send({
        siteTitle: "SIDASI-GO Updated",
        journalUrl: "https://jurnal.example.com",
        contactEmail: "kontak@grobogan.go.id",
      });

    expect(update.status).toBe(200);
    expect(update.body.data.siteTitle).toBe("SIDASI-GO Updated");
    expect(update.body.data.journalUrl).toBe("https://jurnal.example.com");

    const publicGet = await request(app).get("/api/settings");
    expect(publicGet.body.data.siteTitle).toBe("SIDASI-GO Updated");
    expect(publicGet.body.data.contactEmail).toBe("kontak@grobogan.go.id");
  });

  it("rejects non-admin updates with 403", async () => {
    const opd = await prisma.user.create({
      data: {
        email: `settings-opd-${Date.now()}@test.local`,
        username: `settings-opd-${Date.now()}`,
        name: "Settings OPD",
        role: Role.OPD,
      },
    });
    opdId = opd.id;

    const response = await request(app)
      .put("/api/admin/settings")
      .set("x-test-role", "OPD")
      .set("x-test-user-id", opdId)
      .send({ siteTitle: "Hacked" });

    expect(response.status).toBe(403);
    expect(response.body.error.code).toBe("FORBIDDEN");
  });

  it("returns empty hero images array on public GET", async () => {
    const response = await request(app).get("/api/settings/hero-images");

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(Array.isArray(response.body.data)).toBe(true);
  });
});
