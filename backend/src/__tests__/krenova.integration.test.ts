import request from "supertest";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { JenisInovasi, Role, Status, StatusPelaku } from "@prisma/client";
import { createApp } from "../app";
import { createPrismaClient } from "../lib/prisma";

const prisma = createPrismaClient();

describe("krenova integration", () => {
  const app = createApp();
  let masyarakatId = "";
  let otherMasyarakatId = "";
  let approvedId = "";
  let pendingId = "";

  beforeAll(async () => {
    const masyarakat = await prisma.user.create({
      data: {
        email: `masyarakat-${Date.now()}@test.local`,
        username: `masyarakat-${Date.now()}`,
        name: "Masyarakat",
        role: Role.Masyarakat,
      },
    });

    masyarakatId = masyarakat.id;

    const otherMasyarakat = await prisma.user.create({
      data: {
        email: `masyarakat-other-${Date.now()}@test.local`,
        username: `masyarakat-other-${Date.now()}`,
        name: "Other Masyarakat",
        role: Role.Masyarakat,
      },
    });

    otherMasyarakatId = otherMasyarakat.id;

    const approved = await prisma.krenova.create({
      data: {
        userId: masyarakatId,
        judulInovasi: "Approved Krenova",
        jenisInovasi: JenisInovasi.Digital,
        waktuUjiCoba: new Date("2025-01-01"),
        waktuPenerapan: new Date("2025-02-01"),
        tahapInovasi: "Implementasi",
        statusPelaku: StatusPelaku.Umum,
        namaInovator1: "A",
        alamat: "Alamat",
        nomorHp: "08123456789",
        dokumenProposal: "proposal.pdf",
        lampiranOriginalitas: "ori.pdf",
        lampiranIdentitas: "ktp.pdf",
        status: Status.Disetujui,
      },
    });

    approvedId = approved.id;

    const pending = await prisma.krenova.create({
      data: {
        userId: masyarakatId,
        judulInovasi: "Pending Krenova",
        jenisInovasi: JenisInovasi.Non_Digital,
        waktuUjiCoba: new Date("2025-01-01"),
        waktuPenerapan: new Date("2025-02-01"),
        tahapInovasi: "Rancang",
        statusPelaku: StatusPelaku.Pelajar,
        namaInovator1: "B",
        alamat: "Alamat",
        nomorHp: "08123456789",
        dokumenProposal: "proposal.pdf",
        lampiranOriginalitas: "ori.pdf",
        lampiranIdentitas: "pelajar.pdf",
        status: Status.Pending,
      },
    });

    pendingId = pending.id;
  });

  afterAll(async () => {
    await prisma.krenova.deleteMany({ where: { userId: masyarakatId } });
    await prisma.user.deleteMany({ where: { id: { in: [masyarakatId, otherMasyarakatId] } } });
    await prisma.$disconnect();
  });

  it("masyarakat can create krenova", async () => {
    const response = await request(app)
      .post("/api/krenova")
      .set("x-test-role", "Masyarakat")
      .set("x-test-user-id", masyarakatId)
      .send({
        judulInovasi: "Baru",
        jenisInovasi: "Digital",
        waktuUjiCoba: "2025-01-01",
        waktuPenerapan: "2025-02-01",
        tahapInovasi: "Uji",
        statusPelaku: "Umum",
        namaInovator1: "C",
        alamat: "Alamat",
        nomorHp: "08123456789",
        dokumenProposal: "proposal.pdf",
        lampiranOriginalitas: "ori.pdf",
        lampiranIdentitas: "id.pdf",
      });

    expect(response.status).toBe(201);
  });

  it("public list returns only Disetujui krenova", async () => {
    const response = await request(app).get("/api/krenova");

    expect(response.status).toBe(200);
    const names = response.body.data.items.map((item: { judulInovasi: string }) => item.judulInovasi);
    expect(names).toContain("Approved Krenova");
    expect(names).not.toContain("Pending Krenova");
  });

  it("public list omits private applicant fields", async () => {
    const response = await request(app).get("/api/krenova");

    expect(response.status).toBe(200);
    const item = response.body.data.items.find(
      (row: { judulInovasi: string }) => row.judulInovasi === "Approved Krenova",
    );
    expect(item).toBeDefined();
    expect(item.userId).toBeUndefined();
    expect(item.alamat).toBeUndefined();
    expect(item.nomorHp).toBeUndefined();
    expect(item.dokumenProposal).toBeUndefined();
    expect(item.lampiranOriginalitas).toBeUndefined();
    expect(item.lampiranIdentitas).toBeUndefined();
  });

  it("public detail hides pending krenova", async () => {
    const response = await request(app).get(`/api/krenova/${pendingId}`);

    expect(response.status).toBe(404);
  });

  it("public detail omits private applicant fields", async () => {
    const response = await request(app).get(`/api/krenova/${approvedId}`);

    expect(response.status).toBe(200);
    expect(response.body.data.user).toBeUndefined();
    expect(response.body.data.userId).toBeUndefined();
    expect(response.body.data.alamat).toBeUndefined();
    expect(response.body.data.nomorHp).toBeUndefined();
    expect(response.body.data.dokumenProposal).toBeUndefined();
    expect(response.body.data.lampiranOriginalitas).toBeUndefined();
    expect(response.body.data.lampiranIdentitas).toBeUndefined();
  });

  it("authenticated non-owner detail omits private applicant fields", async () => {
    const response = await request(app)
      .get(`/api/krenova/${approvedId}`)
      .set("x-test-role", "Masyarakat")
      .set("x-test-user-id", otherMasyarakatId);

    expect(response.status).toBe(200);
    expect(response.body.data.user).toBeUndefined();
    expect(response.body.data.userId).toBeUndefined();
    expect(response.body.data.alamat).toBeUndefined();
    expect(response.body.data.nomorHp).toBeUndefined();
    expect(response.body.data.dokumenProposal).toBeUndefined();
    expect(response.body.data.lampiranOriginalitas).toBeUndefined();
    expect(response.body.data.lampiranIdentitas).toBeUndefined();
  });

  it("public list does not search private address", async () => {
    const response = await request(app).get("/api/krenova?search=Alamat");

    expect(response.status).toBe(200);
    const names = response.body.data.items.map((item: { judulInovasi: string }) => item.judulInovasi);
    expect(names).not.toContain("Approved Krenova");
  });

  it("admin can reject with reason", async () => {
    const response = await request(app)
      .put(`/api/krenova/${pendingId}/reject`)
      .set("x-test-role", "Admin")
      .set("x-test-user-id", "admin-test")
      .send({ reason: "Belum lengkap" });

    expect(response.status).toBe(200);
    expect(response.body.data.status).toBe("Ditolak");
  });
});
