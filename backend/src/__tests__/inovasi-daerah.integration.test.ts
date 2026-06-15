import request from "supertest";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { JenisInovasi, Role, Status } from "@prisma/client";
import { createApp } from "../app";
import { createPrismaClient } from "../lib/prisma";

const prisma = createPrismaClient();

describe("inovasi daerah integration", () => {
  const app = createApp();

  let ownerId = "";
  let otherUserId = "";
  let approvedId = "";
  let inovasiId = "";

  beforeAll(async () => {
    const owner = await prisma.user.create({
      data: {
        email: `opd-owner-${Date.now()}@test.local`,
        username: `opd-owner-${Date.now()}`,
        name: "Owner",
        role: Role.OPD,
      },
    });

    const other = await prisma.user.create({
      data: {
        email: `opd-other-${Date.now()}@test.local`,
        username: `opd-other-${Date.now()}`,
        name: "Other",
        role: Role.OPD,
      },
    });

    ownerId = owner.id;
    otherUserId = other.id;

    const approved = await prisma.inovasiDaerah.create({
      data: {
        userId: ownerId,
        namaInovasi: "Approved Inovasi",
        inisiator: "OPD A",
        jenisInovasi: JenisInovasi.Digital,
        bentukInovasi: "Aplikasi",
        tglUjiCoba: new Date("2025-01-01"),
        tglPenerapan: new Date("2025-02-01"),
        rancangBangun: "x".repeat(320),
        tujuan: "Tujuan",
        manfaat: "Manfaat",
        hasil: "Hasil",
        status: Status.Disetujui,
        indikator: { create: { regulasi: "regulasi-secret.pdf" } },
      },
    });

    const pending = await prisma.inovasiDaerah.create({
      data: {
        userId: ownerId,
        namaInovasi: "Pending Inovasi",
        inisiator: "OPD A",
        jenisInovasi: JenisInovasi.Non_Digital,
        bentukInovasi: "SOP",
        tglUjiCoba: new Date("2025-01-01"),
        tglPenerapan: new Date("2025-02-01"),
        rancangBangun: "x".repeat(320),
        tujuan: "Tujuan",
        manfaat: "Manfaat",
        hasil: "Hasil",
        status: Status.Pending,
      },
    });

    approvedId = approved.id;
    inovasiId = pending.id;

    expect(approved.status).toBe(Status.Disetujui);
  });

  afterAll(async () => {
    await prisma.indikatorInovasiDaerah.deleteMany({
      where: { inovasiDaerah: { userId: { in: [ownerId, otherUserId] } } },
    });
    await prisma.inovasiDaerah.deleteMany({
      where: { userId: { in: [ownerId, otherUserId] } },
    });
    await prisma.user.deleteMany({ where: { id: { in: [ownerId, otherUserId] } } });
    await prisma.$disconnect();
  });

  it("public list returns only Disetujui", async () => {
    const response = await request(app).get("/api/inovasi-daerah");

    expect(response.status).toBe(200);
    const names = response.body.data.items.map((item: { namaInovasi: string }) => item.namaInovasi);
    expect(names).toContain("Approved Inovasi");
    expect(names).not.toContain("Pending Inovasi");
  });

  it("public list omits owner id", async () => {
    const response = await request(app).get("/api/inovasi-daerah");

    expect(response.status).toBe(200);
    const item = response.body.data.items.find(
      (row: { namaInovasi: string }) => row.namaInovasi === "Approved Inovasi",
    );
    expect(item).toBeDefined();
    expect(item.userId).toBeUndefined();
  });

  it("public detail hides pending inovasi", async () => {
    const response = await request(app).get(`/api/inovasi-daerah/${inovasiId}`);

    expect(response.status).toBe(404);
  });

  it("public detail omits owner email", async () => {
    const response = await request(app).get(`/api/inovasi-daerah/${approvedId}`);

    expect(response.status).toBe(200);
    expect(response.body.data.user).toBeUndefined();
    expect(response.body.data.userId).toBeUndefined();
  });

  it("public detail omits private indikator", async () => {
    const response = await request(app).get(`/api/inovasi-daerah/${approvedId}`);

    expect(response.status).toBe(200);
    expect(response.body.data.indikator).toBeUndefined();
  });

  it("admin detail includes indikator", async () => {
    const response = await request(app)
      .get(`/api/inovasi-daerah/${approvedId}`)
      .set("x-test-role", "Admin")
      .set("x-test-user-id", "admin-test");

    expect(response.status).toBe(200);
    expect(response.body.data.indikator).toBeDefined();
    expect(response.body.data.indikator.regulasi).toBe("regulasi-secret.pdf");
  });

  it("authenticated non-owner detail omits owner metadata", async () => {
    const response = await request(app)
      .get(`/api/inovasi-daerah/${approvedId}`)
      .set("x-test-role", "OPD")
      .set("x-test-user-id", otherUserId);

    expect(response.status).toBe(200);
    expect(response.body.data.user).toBeUndefined();
    expect(response.body.data.userId).toBeUndefined();
  });

  it("OPD cannot update other OPD inovasi", async () => {
    const response = await request(app)
      .put(`/api/inovasi-daerah/${inovasiId}`)
      .set("x-test-role", "OPD")
      .set("x-test-user-id", otherUserId)
      .send({ namaInovasi: "Updated" });

    expect(response.status).toBe(403);
  });

  it("admin can approve pending inovasi", async () => {
    const response = await request(app)
      .put(`/api/inovasi-daerah/${inovasiId}/approve`)
      .set("x-test-role", "Admin")
      .set("x-test-user-id", "admin-test");

    expect(response.status).toBe(200);
    expect(response.body.data.status).toBe("Disetujui");
  });
});
