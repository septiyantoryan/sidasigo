import fs from "node:fs";
import path from "node:path";
import request from "supertest";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { JenisInovasi, Role, Status, StatusPelaku } from "@prisma/client";
import { createApp } from "../app";
import { createPrismaClient } from "../lib/prisma";

const prisma = createPrismaClient();

describe("delete rules integration", () => {
  const app = createApp();

  let opdId = "";
  let masyarakatId = "";
  let pendingInovasiId = "";
  let approvedInovasiId = "";
  let pendingKrenovaId = "";
  let approvedKrenovaId = "";

  const uploadRoot = path.join(process.cwd(), "uploads");
  let pendingProposalName = "";
  let pendingProposalPath = "";

  afterAll(async () => {
    // Clean up test file.
    if (pendingProposalPath && fs.existsSync(pendingProposalPath)) {
      fs.unlinkSync(pendingProposalPath);
    }
    await prisma.$disconnect();
  });

  beforeAll(async () => {
    fs.mkdirSync(uploadRoot, { recursive: true });

    const opd = await prisma.user.create({
      data: {
        email: `delete-opd-${Date.now()}@test.local`,
        username: `delete-opd-${Date.now()}`,
        name: "Delete OPD",
        role: Role.OPD,
      },
    });
    opdId = opd.id;

    const masyarakat = await prisma.user.create({
      data: {
        email: `delete-masyarakat-${Date.now()}@test.local`,
        username: `delete-masyarakat-${Date.now()}`,
        name: "Delete Masyarakat",
        role: Role.Masyarakat,
      },
    });
    masyarakatId = masyarakat.id;

    const pendingInovasi = await prisma.inovasiDaerah.create({
      data: {
        userId: opdId,
        namaInovasi: "Pending Inovasi Delete",
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
    pendingInovasiId = pendingInovasi.id;

    const approvedInovasi = await prisma.inovasiDaerah.create({
      data: {
        userId: opdId,
        namaInovasi: "Approved Inovasi Delete",
        inisiator: "OPD",
        jenisInovasi: JenisInovasi.Digital,
        bentukInovasi: "App",
        tglUjiCoba: new Date("2025-01-01"),
        tglPenerapan: new Date("2025-02-01"),
        rancangBangun: "x".repeat(320),
        tujuan: "Tujuan",
        manfaat: "Manfaat",
        hasil: "Hasil",
        status: Status.Disetujui,
      },
    });
    approvedInovasiId = approvedInovasi.id;

    pendingProposalName = `pending-proposal-${Date.now()}.pdf`;
    pendingProposalPath = path.join(uploadRoot, pendingProposalName);
    fs.writeFileSync(pendingProposalPath, "pending");

    const pendingKrenova = await prisma.krenova.create({
      data: {
        userId: masyarakatId,
        judulInovasi: "Pending Krenova Delete",
        jenisInovasi: JenisInovasi.Digital,
        waktuUjiCoba: new Date("2025-01-01"),
        waktuPenerapan: new Date("2025-02-01"),
        tahapInovasi: "Uji",
        statusPelaku: StatusPelaku.Umum,
        namaInovator1: "Inovator",
        alamat: "Alamat",
        nomorHp: "08123456789",
        dokumenProposal: pendingProposalName,
        lampiranOriginalitas: "ori.pdf",
        lampiranIdentitas: "id.pdf",
        status: Status.Pending,
      },
    });
    pendingKrenovaId = pendingKrenova.id;

    const approvedKrenova = await prisma.krenova.create({
      data: {
        userId: masyarakatId,
        judulInovasi: "Approved Krenova Delete",
        jenisInovasi: JenisInovasi.Digital,
        waktuUjiCoba: new Date("2025-01-01"),
        waktuPenerapan: new Date("2025-02-01"),
        tahapInovasi: "Uji",
        statusPelaku: StatusPelaku.Umum,
        namaInovator1: "Inovator",
        alamat: "Alamat",
        nomorHp: "08123456789",
        dokumenProposal: "approved.pdf",
        lampiranOriginalitas: "ori.pdf",
        lampiranIdentitas: "id.pdf",
        status: Status.Disetujui,
      },
    });
    approvedKrenovaId = approvedKrenova.id;
  });

  afterAll(async () => {
    await prisma.inovasiDaerah.deleteMany({
      where: { id: { in: [pendingInovasiId, approvedInovasiId] } },
    });
    await prisma.krenova.deleteMany({
      where: { id: { in: [pendingKrenovaId, approvedKrenovaId] } },
    });
    await prisma.user.deleteMany({ where: { id: { in: [opdId, masyarakatId] } } });
    await prisma.$disconnect();
  });

  it("rejects owner trying to delete approved inovasi", async () => {
    const response = await request(app)
      .delete(`/api/inovasi-daerah/${approvedInovasiId}`)
      .set("x-test-role", "OPD")
      .set("x-test-user-id", opdId);

    expect(response.status).toBe(403);
    expect(response.body.error.code).toBe("FORBIDDEN");
  });

  it("admin can delete approved inovasi", async () => {
    const response = await request(app)
      .delete(`/api/inovasi-daerah/${approvedInovasiId}`)
      .set("x-test-role", "Admin")
      .set("x-test-user-id", "admin-test");

    expect(response.status).toBe(200);
    const exists = await prisma.inovasiDaerah.findUnique({
      where: { id: approvedInovasiId },
    });
    expect(exists).toBeNull();
  });

  it("owner can delete pending krenova and lampiran files are removed", async () => {
    expect(fs.existsSync(pendingProposalPath)).toBe(true);

    const response = await request(app)
      .delete(`/api/krenova/${pendingKrenovaId}`)
      .set("x-test-role", "Masyarakat")
      .set("x-test-user-id", masyarakatId);

    expect(response.status).toBe(200);
    expect(fs.existsSync(pendingProposalPath)).toBe(false);

    const exists = await prisma.krenova.findUnique({
      where: { id: pendingKrenovaId },
    });
    expect(exists).toBeNull();
  });

  it("rejects masyarakat deleting approved krenova", async () => {
    const response = await request(app)
      .delete(`/api/krenova/${approvedKrenovaId}`)
      .set("x-test-role", "Masyarakat")
      .set("x-test-user-id", masyarakatId);

    expect(response.status).toBe(403);
  });
});
