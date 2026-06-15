import request from "supertest";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { JenisRiset, Role } from "@prisma/client";
import { createApp } from "../app";
import { createPrismaClient } from "../lib/prisma";

const prisma = createPrismaClient();

describe("riset integration", () => {
  const app = createApp();
  let adminId = "";
  let opdId = "";
  let risetId = "";
  let kajianId = "";

  beforeAll(async () => {
    const admin = await prisma.user.create({
      data: {
        email: `riset-admin-${Date.now()}@test.local`,
        username: `riset-admin-${Date.now()}`,
        name: "Riset Admin",
        role: Role.Admin,
      },
    });
    adminId = admin.id;

    const opd = await prisma.user.create({
      data: {
        email: `riset-opd-${Date.now()}@test.local`,
        username: `riset-opd-${Date.now()}`,
        name: "Riset OPD",
        role: Role.OPD,
      },
    });
    opdId = opd.id;

    const riset = await prisma.riset.create({
      data: {
        judulKajian: "Riset Uji Integrasi",
        timPeneliti: "Peneliti A, Peneliti B",
        tahunPublikasi: 2024,
        abstrak: "Abstrak riset uji.",
        filePath: "/api/public-files/riset-test.pdf",
        jenis: JenisRiset.RisetKajian,
      },
    });
    risetId = riset.id;

    const kajian = await prisma.riset.create({
      data: {
        judulKajian: "Kajian Uji Integrasi",
        timPeneliti: "Peneliti C",
        tahunPublikasi: 2023,
        abstrak: "Abstrak kajian uji.",
        filePath: "/api/public-files/kajian-test.pdf",
        jenis: JenisRiset.Penelitian,
      },
    });
    kajianId = kajian.id;
  });

  afterAll(async () => {
    await prisma.riset.deleteMany({
      where: { id: { in: [risetId, kajianId] } },
    });
    await prisma.riset.deleteMany({ where: { judulKajian: "Riset Baru Admin" } });
    await prisma.user.deleteMany({ where: { id: { in: [adminId, opdId] } } });
    await prisma.$disconnect();
  });

  it("public list returns riset and kajian", async () => {
    const response = await request(app).get("/api/riset");

    expect(response.status).toBe(200);
    const titles = response.body.data.items.map((i: { judulKajian: string }) => i.judulKajian);
    expect(titles).toContain("Riset Uji Integrasi");
    expect(titles).toContain("Kajian Uji Integrasi");
  });

  it("public list filters by jenis", async () => {
    const response = await request(app).get("/api/riset?jenis=RisetKajian");

    expect(response.status).toBe(200);
    const allRiset = response.body.data.items.every(
      (i: { jenis: string }) => i.jenis === "RisetKajian",
    );
    expect(allRiset).toBe(true);
  });

  it("public list searches by judul", async () => {
    const response = await request(app).get("/api/riset?search=Kajian Uji");

    expect(response.status).toBe(200);
    const titles = response.body.data.items.map((i: { judulKajian: string }) => i.judulKajian);
    expect(titles).toContain("Kajian Uji Integrasi");
  });

  it("public detail returns fields", async () => {
    const response = await request(app).get(`/api/riset/${risetId}`);

    expect(response.status).toBe(200);
    expect(response.body.data.judulKajian).toBe("Riset Uji Integrasi");
    expect(response.body.data.timPeneliti).toBe("Peneliti A, Peneliti B");
    expect(response.body.data.tahunPublikasi).toBe(2024);
    expect(response.body.data.filePath).toBeTruthy();
    expect(response.body.data.jenis).toBe("RisetKajian");
  });

  it("public detail returns 404 for unknown id", async () => {
    const response = await request(app).get("/api/riset/non-existent-id");

    expect(response.status).toBe(404);
  });

  it("rejects unauthenticated create with 401", async () => {
    const response = await request(app).post("/api/admin/riset").send({
      judulKajian: "X",
      timPeneliti: "Y",
      tahunPublikasi: 2024,
      abstrak: "Z",
      filePath: "/api/public-files/x.pdf",
      jenis: "RisetKajian",
    });

    expect(response.status).toBe(401);
  });

  it("rejects non-admin create with 403", async () => {
    const response = await request(app)
      .post("/api/admin/riset")
      .set("x-test-role", "OPD")
      .set("x-test-user-id", opdId)
      .send({
        judulKajian: "X",
        timPeneliti: "Y",
        tahunPublikasi: 2024,
        abstrak: "Z",
        filePath: "/api/public-files/x.pdf",
        jenis: "RisetKajian",
      });

    expect(response.status).toBe(403);
  });

  it("rejects invalid payload with 400", async () => {
    const response = await request(app)
      .post("/api/admin/riset")
      .set("x-test-role", "Admin")
      .set("x-test-user-id", adminId)
      .send({
        judulKajian: "",
        timPeneliti: "Y",
        tahunPublikasi: "bukan-angka",
        abstrak: "Z",
        filePath: "/api/public-files/x.pdf",
        jenis: "RisetKajian",
      });

    expect(response.status).toBe(400);
    expect(response.body.error.code).toBe("VALIDATION_ERROR");
  });

  it("admin can create, update, and delete riset", async () => {
    const create = await request(app)
      .post("/api/admin/riset")
      .set("x-test-role", "Admin")
      .set("x-test-user-id", adminId)
      .send({
        judulKajian: "Riset Baru Admin",
        timPeneliti: "Peneliti Baru",
        tahunPublikasi: 2025,
        abstrak: "Abstrak baru.",
        filePath: "/api/public-files/baru.pdf",
        jenis: "Penelitian",
      });

    expect(create.status).toBe(201);
    const newId = create.body.data.id;
    expect(newId).toBeTruthy();

    const update = await request(app)
      .put(`/api/admin/riset/${newId}`)
      .set("x-test-role", "Admin")
      .set("x-test-user-id", adminId)
      .send({ judulKajian: "Riset Baru Admin (Edit)" });

    expect(update.status).toBe(200);
    expect(update.body.data.judulKajian).toBe("Riset Baru Admin (Edit)");

    const remove = await request(app)
      .delete(`/api/admin/riset/${newId}`)
      .set("x-test-role", "Admin")
      .set("x-test-user-id", adminId);

    expect(remove.status).toBe(200);

    const detail = await request(app).get(`/api/riset/${newId}`);
    expect(detail.status).toBe(404);
  });
});
