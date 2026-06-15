import request from "supertest";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { JenisInovasi, Role, Status, StatusPelaku } from "@prisma/client";
import { createApp } from "../app";
import { createPrismaClient } from "../lib/prisma";

const prisma = createPrismaClient();

describe("admin dashboard integration", () => {
  const app = createApp();
  let userId = "";

  beforeAll(async () => {
    const user = await prisma.user.create({
      data: {
        email: `dashboard-seed-${Date.now()}@test.local`,
        username: `dashboard-seed-${Date.now()}`,
        name: "Dashboard User",
        role: Role.OPD,
      },
    });

    userId = user.id;

    await prisma.inovasiDaerah.create({
      data: {
        userId,
        namaInovasi: "Pending Inovasi Dashboard",
        inisiator: "OPD",
        jenisInovasi: JenisInovasi.Digital,
        bentukInovasi: "App",
        tglUjiCoba: new Date("2025-01-01"),
        tglPenerapan: new Date("2025-02-01"),
        rancangBangun: "x".repeat(320),
        tujuan: "Tujuan",
        manfaat: "Manfaat",
        hasil: "Hasil",
        status: Status.Pending,
      },
    });

    await prisma.krenova.create({
      data: {
        userId,
        judulInovasi: "Pending Krenova Dashboard",
        jenisInovasi: JenisInovasi.Non_Digital,
        waktuUjiCoba: new Date("2025-01-01"),
        waktuPenerapan: new Date("2025-02-01"),
        tahapInovasi: "Rancang",
        statusPelaku: StatusPelaku.Umum,
        namaInovator1: "Inovator",
        alamat: "Alamat",
        nomorHp: "08123456789",
        dokumenProposal: "proposal.pdf",
        lampiranOriginalitas: "ori.pdf",
        lampiranIdentitas: "id.pdf",
        status: Status.Pending,
      },
    });
  });

  afterAll(async () => {
    await prisma.indikatorInovasiDaerah.deleteMany({ where: { inovasiDaerah: { userId } } });
    await prisma.inovasiDaerah.deleteMany({ where: { userId } });
    await prisma.krenova.deleteMany({ where: { userId } });
    await prisma.user.deleteMany({ where: { id: userId } });
    await prisma.$disconnect();
  });

  it("returns status breakdown and totals", async () => {
    const response = await request(app)
      .get("/api/admin/dashboard")
      .set("x-test-role", "Admin")
      .set("x-test-user-id", "admin-test");

    expect(response.status).toBe(200);
    expect(response.body.data).toEqual(
      expect.objectContaining({
        totalUsers: expect.any(Number),
        totalInovasiDaerah: expect.any(Number),
        totalKrenova: expect.any(Number),
        pendingTotal: expect.any(Number),
      }),
    );
  });

  it("returns pending submissions merged from inovasi and krenova", async () => {
    const response = await request(app)
      .get("/api/admin/submissions")
      .set("x-test-role", "Admin")
      .set("x-test-user-id", "admin-test");

    expect(response.status).toBe(200);
    expect(response.body.data.items.length).toBeGreaterThanOrEqual(2);
  });
});
