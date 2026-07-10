import request from "supertest";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { Role } from "@prisma/client";
import { createApp } from "../app";
import { createPrismaClient } from "../lib/prisma";

const prisma = createPrismaClient();

describe("download integration", () => {
  const app = createApp();
  let adminId = "";
  let opdId = "";
  let downloadId = "";

  beforeAll(async () => {
    const admin = await prisma.user.create({
      data: {
        email: `download-admin-${Date.now()}@test.local`,
        username: `download-admin-${Date.now()}`,
        name: "Download Admin",
        role: Role.Admin,
      },
    });
    adminId = admin.id;

    const opd = await prisma.user.create({
      data: {
        email: `download-opd-${Date.now()}@test.local`,
        username: `download-opd-${Date.now()}`,
        name: "Download OPD",
        role: Role.OPD,
      },
    });
    opdId = opd.id;

    const download = await prisma.download.create({
      data: {
        judul: "Dokumen Uji Integrasi",
        filePath: "/api/public-files/download-test.pdf",
      },
    });
    downloadId = download.id;
  });

  afterAll(async () => {
    await prisma.download.deleteMany({ where: { id: downloadId } });
    await prisma.download.deleteMany({ where: { judul: "Dokumen Baru Admin" } });
    await prisma.download.deleteMany({ where: { judul: "Dokumen Baru Admin (Edit)" } });
    await prisma.user.deleteMany({ where: { id: { in: [adminId, opdId] } } });
    await prisma.$disconnect();
  });

  it("public list returns download docs", async () => {
    const response = await request(app).get("/api/download");

    expect(response.status).toBe(200);
    const juduls = response.body.data.items.map((i: { judul: string }) => i.judul);
    expect(juduls).toContain("Dokumen Uji Integrasi");
  });

  it("public list searches by judul", async () => {
    const response = await request(app).get("/api/download?search=Uji Integrasi");

    expect(response.status).toBe(200);
    const juduls = response.body.data.items.map((i: { judul: string }) => i.judul);
    expect(juduls).toContain("Dokumen Uji Integrasi");
  });

  it("rejects unauthenticated create with 401", async () => {
    const response = await request(app).post("/api/admin/download").send({
      judul: "Y",
      filePath: "/api/public-files/x.pdf",
    });

    expect(response.status).toBe(401);
  });

  it("rejects non-admin create with 403", async () => {
    const response = await request(app)
      .post("/api/admin/download")
      .set("x-test-role", "OPD")
      .set("x-test-user-id", opdId)
      .send({
        judul: "Y",
        filePath: "/api/public-files/x.pdf",
      });

    expect(response.status).toBe(403);
  });

  it("rejects invalid payload with 400", async () => {
    const response = await request(app)
      .post("/api/admin/download")
      .set("x-test-role", "Admin")
      .set("x-test-user-id", adminId)
      .send({
        judul: "",
        filePath: "",
      });

    expect(response.status).toBe(400);
    expect(response.body.error.code).toBe("VALIDATION_ERROR");
  });

  it("accepts admin DOCX upload", async () => {
    const docx = Buffer.from([0x50, 0x4b, 0x03, 0x04, 0x14, 0x00, 0x00, 0x00]);

    const response = await request(app)
      .post("/api/admin/download/upload")
      .set("x-test-role", "Admin")
      .set("x-test-user-id", adminId)
      .attach("file", docx, {
        filename: "dokumen.docx",
        contentType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      });

    expect(response.status).toBe(201);
    expect(response.body.data.path).toMatch(/\.docx$/);
  });

  it("accepts admin document upload larger than 10MB and up to 25MB", async () => {
    const pdf = Buffer.alloc(11 * 1024 * 1024, 0);
    pdf.write("%PDF", 0, "ascii");

    const response = await request(app)
      .post("/api/admin/download/upload")
      .set("x-test-role", "Admin")
      .set("x-test-user-id", adminId)
      .attach("file", pdf, {
        filename: "dokumen-besar.pdf",
        contentType: "application/pdf",
      });

    expect(response.status).toBe(201);
    expect(response.body.data.path).toMatch(/\.pdf$/);
  });

  it("admin can create, update, and delete download", async () => {
    const create = await request(app)
      .post("/api/admin/download")
      .set("x-test-role", "Admin")
      .set("x-test-user-id", adminId)
      .send({
        judul: "Dokumen Baru Admin",
        filePath: "/api/public-files/baru.pdf",
      });

    expect(create.status).toBe(201);
    const newId = create.body.data.id;
    expect(newId).toBeTruthy();

    const detail = await request(app)
      .get(`/api/admin/download/${newId}`)
      .set("x-test-role", "Admin")
      .set("x-test-user-id", adminId);
    expect(detail.status).toBe(200);
    expect(detail.body.data.judul).toBe("Dokumen Baru Admin");

    const update = await request(app)
      .put(`/api/admin/download/${newId}`)
      .set("x-test-role", "Admin")
      .set("x-test-user-id", adminId)
      .send({ judul: "Dokumen Baru Admin (Edit)" });

    expect(update.status).toBe(200);
    expect(update.body.data.judul).toBe("Dokumen Baru Admin (Edit)");

    const remove = await request(app)
      .delete(`/api/admin/download/${newId}`)
      .set("x-test-role", "Admin")
      .set("x-test-user-id", adminId);

    expect(remove.status).toBe(200);

    const detailAfter = await request(app)
      .get(`/api/admin/download/${newId}`)
      .set("x-test-role", "Admin")
      .set("x-test-user-id", adminId);
    expect(detailAfter.status).toBe(404);
  });
});
