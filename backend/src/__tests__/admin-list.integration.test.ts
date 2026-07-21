import request from "supertest";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { JenisInovasi, Role, Status, StatusPelaku } from "@prisma/client";
import { createApp } from "../app";
import { createPrismaClient } from "../lib/prisma";

const prisma = createPrismaClient();

describe("admin list integration", () => {
  const app = createApp();

  let opdId = "";
  let masyarakatId = "";
  const inovasiIds: string[] = [];
  const krenovaIds: string[] = [];

  beforeAll(async () => {
    const opd = await prisma.user.create({
      data: {
        email: `admin-list-opd-${Date.now()}@test.local`,
        username: `admin-list-opd-${Date.now()}`,
        name: "Admin List OPD",
        role: Role.OPD,
      },
    });
    opdId = opd.id;

    const masyarakat = await prisma.user.create({
      data: {
        email: `admin-list-mas-${Date.now()}@test.local`,
        username: `admin-list-mas-${Date.now()}`,
        name: "Admin List Masyarakat",
        role: Role.Masyarakat,
      },
    });
    masyarakatId = masyarakat.id;

    const inovasiStatuses = [Status.Pending, Status.Disetujui, Status.Ditolak];
    for (const status of inovasiStatuses) {
      const row = await prisma.inovasiDaerah.create({
        data: {
          userId: opdId,
          namaInovasi: `Inovasi Admin ${status}`,
          inisiator: "OPD",
          jenisInovasi: JenisInovasi.Digital,
          bentukInovasi: "App",
          tglUjiCoba: new Date("2025-01-01"),
          tglPenerapan: new Date("2025-02-01"),
          rancangBangun: "x".repeat(320),
          tujuan: "Tujuan",
          manfaat: "Manfaat",
          hasil: "Hasil",
          status,
        },
      });
      inovasiIds.push(row.id);
    }

    for (const inisiator of ["  Badan Riset  ", "Badan Riset", "", "Dinas Kominfo"]) {
      const row = await prisma.inovasiDaerah.create({
        data: {
          userId: opdId,
          namaInovasi: `Filter Inisiator ${inisiator || "Kosong"}`,
          inisiator,
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
      inovasiIds.push(row.id);
    }

    const krenovaStatuses = [Status.Pending, Status.Disetujui, Status.Ditolak];
    for (const status of krenovaStatuses) {
      const row = await prisma.krenova.create({
        data: {
          userId: masyarakatId,
          judulInovasi: `Krenova Admin ${status}`,
          jenisInovasi: JenisInovasi.Digital,
          waktuUjiCoba: new Date("2025-01-01"),
          waktuPenerapan: new Date("2025-02-01"),
          tahapInovasi: "Uji",
          statusPelaku: StatusPelaku.Umum,
          namaInovator1: "Inovator",
          alamat: "Alamat",
          nomorHp: "08123456789",
          dokumenProposal: "proposal.pdf",
          lampiranOriginalitas: "ori.pdf",
          lampiranIdentitas: "id.pdf",
          status,
        },
      });
      krenovaIds.push(row.id);
    }
  });

  afterAll(async () => {
    await prisma.inovasiDaerah.deleteMany({ where: { id: { in: inovasiIds } } });
    await prisma.krenova.deleteMany({ where: { id: { in: krenovaIds } } });
    await prisma.user.deleteMany({ where: { id: { in: [opdId, masyarakatId] } } });
    await prisma.$disconnect();
  });

  it("admin can list inovasi-daerah of all statuses", async () => {
    const response = await request(app)
      .get("/api/admin/inovasi-daerah")
      .query({ pageSize: 50, search: "Inovasi Admin" })
      .set("x-test-role", "Admin")
      .set("x-test-user-id", "admin-test");

    expect(response.status).toBe(200);
    const titles = response.body.data.items.map((item: { namaInovasi: string }) => item.namaInovasi);
    expect(titles).toEqual(
      expect.arrayContaining([
        "Inovasi Admin Pending",
        "Inovasi Admin Disetujui",
        "Inovasi Admin Ditolak",
      ]),
    );
  });

  it("admin can filter inovasi by status", async () => {
    const response = await request(app)
      .get("/api/admin/inovasi-daerah")
      .query({ pageSize: 50, status: "Pending", search: "Inovasi Admin" })
      .set("x-test-role", "Admin")
      .set("x-test-user-id", "admin-test");

    expect(response.status).toBe(200);
    for (const item of response.body.data.items as Array<{ status: string }>) {
      expect(item.status).toBe("Pending");
    }
  });

  it("admin filters inovasi by exact inisiator with existing filters", async () => {
    const response = await request(app)
      .get("/api/admin/inovasi-daerah")
      .query({ pageSize: 50, inisiator: "Badan Riset", status: "Pending", search: "Filter Inisiator" })
      .set("x-test-role", "Admin")
      .set("x-test-user-id", "admin-test");

    expect(response.status).toBe(200);
    expect(response.body.data.items).toHaveLength(1);
    expect(response.body.data.items[0].inisiator).toBe("Badan Riset");
  });

  it("admin gets trimmed unique sorted inisiator options", async () => {
    const response = await request(app)
      .get("/api/admin/inovasi-daerah/inisiators")
      .set("x-test-role", "Admin")
      .set("x-test-user-id", "admin-test");

    expect(response.status).toBe(200);
    expect(response.body.data).toEqual(expect.arrayContaining(["Badan Riset", "Dinas Kominfo"]));
    expect(response.body.data).not.toContain("");
    expect(response.body.data.filter((value: string) => value === "Badan Riset")).toHaveLength(1);
    expect(response.body.data).toEqual([...response.body.data].sort((a: string, b: string) => a.localeCompare(b)));
  });

  it("non admin cannot access admin list or inisiator options", async () => {
    const [list, options] = await Promise.all([
      request(app).get("/api/admin/inovasi-daerah").set("x-test-role", "OPD").set("x-test-user-id", opdId),
      request(app).get("/api/admin/inovasi-daerah/inisiators").set("x-test-role", "OPD").set("x-test-user-id", opdId),
    ]);

    expect(list.status).toBe(403);
    expect(options.status).toBe(403);
  });

  it("admin can list krenova of all statuses", async () => {
    const response = await request(app)
      .get("/api/admin/krenova")
      .query({ pageSize: 50, search: "Krenova Admin" })
      .set("x-test-role", "Admin")
      .set("x-test-user-id", "admin-test");

    expect(response.status).toBe(200);
    const titles = response.body.data.items.map((item: { judulInovasi: string }) => item.judulInovasi);
    expect(titles).toEqual(
      expect.arrayContaining([
        "Krenova Admin Pending",
        "Krenova Admin Disetujui",
        "Krenova Admin Ditolak",
      ]),
    );
  });
});
