import request from "supertest";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { JenisInovasi, Role, Status, StatusPelaku } from "@prisma/client";
import { createApp } from "../app";
import { createPrismaClient } from "../lib/prisma";

const prisma = createPrismaClient();

describe("reject reason integration", () => {
  const app = createApp();
  let opdId = "";
  let masyarakatId = "";
  let inovasiId = "";
  let krenovaId = "";

  beforeAll(async () => {
    const opd = await prisma.user.create({
      data: {
        email: `reject-opd-${Date.now()}@test.local`,
        username: `reject-opd-${Date.now()}`,
        name: "Reject OPD",
        role: Role.OPD,
      },
    });
    opdId = opd.id;

    const masyarakat = await prisma.user.create({
      data: {
        email: `reject-masy-${Date.now()}@test.local`,
        username: `reject-masy-${Date.now()}`,
        name: "Reject Masyarakat",
        role: Role.Masyarakat,
      },
    });
    masyarakatId = masyarakat.id;

    const inovasi = await prisma.inovasiDaerah.create({
      data: {
        userId: opdId,
        namaInovasi: "Reject Inovasi",
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
    inovasiId = inovasi.id;

    const krenova = await prisma.krenova.create({
      data: {
        userId: masyarakatId,
        judulInovasi: "Reject Krenova",
        jenisInovasi: JenisInovasi.Digital,
        waktuUjiCoba: new Date("2025-01-01"),
        waktuPenerapan: new Date("2025-02-01"),
        tahapInovasi: "Tahap Asli",
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
    krenovaId = krenova.id;
  });

  afterAll(async () => {
    await prisma.inovasiDaerah.deleteMany({ where: { id: inovasiId } });
    await prisma.krenova.deleteMany({ where: { id: krenovaId } });
    await prisma.user.deleteMany({ where: { id: { in: [opdId, masyarakatId] } } });
    await prisma.$disconnect();
  });

  it("stores alasanPenolakan on inovasi reject", async () => {
    const response = await request(app)
      .put(`/api/inovasi-daerah/${inovasiId}/reject`)
      .set("x-test-role", "Admin")
      .set("x-test-user-id", "admin-test")
      .send({ reason: "Dokumen kurang" });

    expect(response.status).toBe(200);
    expect(response.body.data.status).toBe("Ditolak");
    expect(response.body.data.alasanPenolakan).toBe("Dokumen kurang");
  });

  it("preserves tahapInovasi and stores alasanPenolakan on krenova reject", async () => {
    const response = await request(app)
      .put(`/api/krenova/${krenovaId}/reject`)
      .set("x-test-role", "Admin")
      .set("x-test-user-id", "admin-test")
      .send({ reason: "Belum lengkap" });

    expect(response.status).toBe(200);
    expect(response.body.data.status).toBe("Ditolak");
    expect(response.body.data.alasanPenolakan).toBe("Belum lengkap");
    expect(response.body.data.tahapInovasi).toBe("Tahap Asli");
  });
});
