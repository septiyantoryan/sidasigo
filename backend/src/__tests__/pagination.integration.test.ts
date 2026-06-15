import request from "supertest";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { JenisInovasi, Role, Status, StatusPelaku } from "@prisma/client";
import { createApp } from "../app";
import { createPrismaClient } from "../lib/prisma";

const prisma = createPrismaClient();

describe("pagination integration", () => {
  const app = createApp();

  let opdId = "";
  let masyarakatId = "";

  const seedInovasiIds: string[] = [];
  const seedKrenovaIds: string[] = [];

  beforeAll(async () => {
    const opd = await prisma.user.create({
      data: {
        email: `pagination-opd-${Date.now()}@test.local`,
        username: `pagination-opd-${Date.now()}`,
        name: "Pagination OPD",
        role: Role.OPD,
      },
    });
    opdId = opd.id;

    const masyarakat = await prisma.user.create({
      data: {
        email: `pagination-masyarakat-${Date.now()}@test.local`,
        username: `pagination-masyarakat-${Date.now()}`,
        name: "Pagination Masyarakat",
        role: Role.Masyarakat,
      },
    });
    masyarakatId = masyarakat.id;

    for (let i = 0; i < 15; i += 1) {
      const inovasi = await prisma.inovasiDaerah.create({
        data: {
          userId: opdId,
          namaInovasi: `Inovasi Pagination ${i}`,
          inisiator: "OPD",
          jenisInovasi: i % 2 === 0 ? JenisInovasi.Digital : JenisInovasi.Non_Digital,
          bentukInovasi: "App",
          tglUjiCoba: new Date(`2025-01-${String((i % 28) + 1).padStart(2, "0")}`),
          tglPenerapan: new Date(`2025-02-${String((i % 28) + 1).padStart(2, "0")}`),
          rancangBangun: "x".repeat(320),
          tujuan: "Tujuan",
          manfaat: "Manfaat",
          hasil: "Hasil",
          status: Status.Disetujui,
          createdAt: new Date(2025, 0, i + 1, 0, 0, 0),
        },
      });
      seedInovasiIds.push(inovasi.id);
    }

    for (let i = 0; i < 12; i += 1) {
      const krenova = await prisma.krenova.create({
        data: {
          userId: masyarakatId,
          judulInovasi: `Krenova Pagination ${i}`,
          jenisInovasi: i % 2 === 0 ? JenisInovasi.Digital : JenisInovasi.Non_Digital,
          waktuUjiCoba: new Date(`2025-01-${String((i % 28) + 1).padStart(2, "0")}`),
          waktuPenerapan: new Date(`2025-02-${String((i % 28) + 1).padStart(2, "0")}`),
          tahapInovasi: "Implementasi",
          statusPelaku: i % 3 === 0 ? StatusPelaku.Pelajar : StatusPelaku.Umum,
          namaInovator1: `Inovator ${i}`,
          alamat: "Alamat",
          nomorHp: "08123456789",
          dokumenProposal: "proposal.pdf",
          lampiranOriginalitas: "ori.pdf",
          lampiranIdentitas: "id.pdf",
          status: i % 4 === 0 ? Status.Pending : Status.Disetujui,
          createdAt: new Date(2025, 0, i + 1, 0, 0, 0),
        },
      });
      seedKrenovaIds.push(krenova.id);
    }
  });

  afterAll(async () => {
    await prisma.inovasiDaerah.deleteMany({
      where: { id: { in: seedInovasiIds } },
    });
    await prisma.krenova.deleteMany({ where: { id: { in: seedKrenovaIds } } });
    await prisma.user.deleteMany({ where: { id: { in: [opdId, masyarakatId] } } });
    await prisma.$disconnect();
  });

  it("paginates public inovasi daerah", async () => {
    const responsePage1 = await request(app)
      .get("/api/inovasi-daerah")
      .query({ page: 1, pageSize: 10 });

    expect(responsePage1.status).toBe(200);
    expect(responsePage1.body.data.items.length).toBe(10);
    expect(responsePage1.body.data.total).toBeGreaterThanOrEqual(15);
    expect(responsePage1.body.data.pageCount).toBeGreaterThanOrEqual(2);
    expect(responsePage1.body.data.page).toBe(1);
    expect(responsePage1.body.data.pageSize).toBe(10);

    const responsePage2 = await request(app)
      .get("/api/inovasi-daerah")
      .query({ page: 2, pageSize: 10 });

    expect(responsePage2.status).toBe(200);
    expect(responsePage2.body.data.page).toBe(2);
    expect(responsePage2.body.data.items.length).toBeGreaterThan(0);
  });

  it("filters inovasi by jenis and search", async () => {
    const responseDigital = await request(app)
      .get("/api/inovasi-daerah")
      .query({ pageSize: 50, jenis: "Digital" });

    expect(responseDigital.status).toBe(200);
    for (const item of responseDigital.body.data.items as Array<{
      jenisInovasi: string;
    }>) {
      expect(item.jenisInovasi).toBe("Digital");
    }

    const responseSearch = await request(app)
      .get("/api/inovasi-daerah")
      .query({ pageSize: 50, search: "Pagination 7" });

    expect(responseSearch.status).toBe(200);
    expect(responseSearch.body.data.items.length).toBeGreaterThan(0);
    for (const item of responseSearch.body.data.items as Array<{
      namaInovasi: string;
    }>) {
      expect(item.namaInovasi).toMatch(/Pagination 7/);
    }
  });

  it("sorts inovasi oldest-first when requested", async () => {
    const response = await request(app)
      .get("/api/inovasi-daerah")
      .query({ pageSize: 50, sort: "oldest" });

    expect(response.status).toBe(200);
    const dates = (
      response.body.data.items as Array<{ createdAt: string }>
    ).map((item) => new Date(item.createdAt).getTime());

    for (let i = 1; i < dates.length; i += 1) {
      expect(dates[i]).toBeGreaterThanOrEqual(dates[i - 1]);
    }
  });

  it("paginates public krenova and filters statusPelaku", async () => {
    const response = await request(app)
      .get("/api/krenova")
      .query({ pageSize: 50, statusPelaku: "Pelajar" });

    expect(response.status).toBe(200);
    for (const item of response.body.data.items as Array<{
      statusPelaku: string;
      status: string;
    }>) {
      expect(item.statusPelaku).toBe("Pelajar");
      expect(item.status).toBe("Disetujui");
    }
  });

  it("admin submissions filter by type", async () => {
    const responseInovasi = await request(app)
      .get("/api/admin/submissions")
      .query({ type: "InovasiDaerah", pageSize: 5 })
      .set("x-test-role", "Admin")
      .set("x-test-user-id", "admin-test");

    expect(responseInovasi.status).toBe(200);
    for (const item of responseInovasi.body.data.items as Array<{
      type: string;
    }>) {
      expect(item.type).toBe("InovasiDaerah");
    }

    const responseKrenova = await request(app)
      .get("/api/admin/submissions")
      .query({ type: "Krenova", pageSize: 5 })
      .set("x-test-role", "Admin")
      .set("x-test-user-id", "admin-test");

    expect(responseKrenova.status).toBe(200);
    for (const item of responseKrenova.body.data.items as Array<{
      type: string;
    }>) {
      expect(item.type).toBe("Krenova");
    }
  });

  it("admin users filter by role and search", async () => {
    const responseAll = await request(app)
      .get("/api/admin/users")
      .query({ pageSize: 50, role: "OPD" })
      .set("x-test-role", "Admin")
      .set("x-test-user-id", "admin-test");

    expect(responseAll.status).toBe(200);
    expect(responseAll.body.data.items.length).toBeGreaterThan(0);
    for (const item of responseAll.body.data.items as Array<{ role: string }>) {
      expect(item.role).toBe("OPD");
    }

    const responseSearch = await request(app)
      .get("/api/admin/users")
      .query({ pageSize: 50, search: "Pagination OPD" })
      .set("x-test-role", "Admin")
      .set("x-test-user-id", "admin-test");

    expect(responseSearch.status).toBe(200);
    expect(responseSearch.body.data.items.length).toBeGreaterThan(0);
  });
});
