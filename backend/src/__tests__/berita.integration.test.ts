import request from "supertest";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { Role } from "@prisma/client";
import { createApp } from "../app";
import { createPrismaClient } from "../lib/prisma";

const prisma = createPrismaClient();

describe("berita integration", () => {
  const app = createApp();
  let adminId = "";
  let opdId = "";
  let beritaId = "";

  beforeAll(async () => {
    const admin = await prisma.user.create({
      data: {
        email: `berita-admin-${Date.now()}@test.local`,
        username: `berita-admin-${Date.now()}`,
        name: "Berita Admin",
        role: Role.Admin,
      },
    });
    adminId = admin.id;

    const opd = await prisma.user.create({
      data: {
        email: `berita-opd-${Date.now()}@test.local`,
        username: `berita-opd-${Date.now()}`,
        name: "Berita OPD",
        role: Role.OPD,
      },
    });
    opdId = opd.id;

    const berita = await prisma.berita.create({
      data: {
        posterPath: "/api/public-files/berita-test.jpg",
        caption: "Caption Berita Uji Integrasi",
      },
    });
    beritaId = berita.id;
  });

  afterAll(async () => {
    await prisma.berita.deleteMany({ where: { id: beritaId } });
    await prisma.berita.deleteMany({ where: { caption: "Caption Berita Baru Admin" } });
    await prisma.berita.deleteMany({ where: { caption: "Caption Berita Baru Admin (Edit)" } });
    await prisma.user.deleteMany({ where: { id: { in: [adminId, opdId] } } });
    await prisma.$disconnect();
  });

  it("public list returns berita", async () => {
    const response = await request(app).get("/api/berita");

    expect(response.status).toBe(200);
    const captions = response.body.data.items.map((i: { caption: string }) => i.caption);
    expect(captions).toContain("Caption Berita Uji Integrasi");
  });

  it("public list searches by caption", async () => {
    const response = await request(app).get("/api/berita?search=Uji Integrasi");

    expect(response.status).toBe(200);
    const captions = response.body.data.items.map((i: { caption: string }) => i.caption);
    expect(captions).toContain("Caption Berita Uji Integrasi");
  });

  it("public detail returns fields", async () => {
    const response = await request(app).get(`/api/berita/${beritaId}`);

    expect(response.status).toBe(200);
    expect(response.body.data.caption).toBe("Caption Berita Uji Integrasi");
    expect(response.body.data.posterPath).toBeTruthy();
  });

  it("public detail returns 404 for unknown id", async () => {
    const response = await request(app).get("/api/berita/non-existent-id");

    expect(response.status).toBe(404);
  });

  it("rejects unauthenticated create with 401", async () => {
    const response = await request(app).post("/api/admin/berita").send({
      posterPath: "/api/public-files/x.jpg",
      caption: "Y",
    });

    expect(response.status).toBe(401);
  });

  it("rejects non-admin create with 403", async () => {
    const response = await request(app)
      .post("/api/admin/berita")
      .set("x-test-role", "OPD")
      .set("x-test-user-id", opdId)
      .send({
        posterPath: "/api/public-files/x.jpg",
        caption: "Y",
      });

    expect(response.status).toBe(403);
  });

  it("rejects invalid payload with 400", async () => {
    const response = await request(app)
      .post("/api/admin/berita")
      .set("x-test-role", "Admin")
      .set("x-test-user-id", adminId)
      .send({
        posterPath: "",
        caption: "",
      });

    expect(response.status).toBe(400);
    expect(response.body.error.code).toBe("VALIDATION_ERROR");
  });

  it("admin can create, update, and delete berita", async () => {
    const create = await request(app)
      .post("/api/admin/berita")
      .set("x-test-role", "Admin")
      .set("x-test-user-id", adminId)
      .send({
        posterPath: "/api/public-files/baru.jpg",
        caption: "Caption Berita Baru Admin",
      });

    expect(create.status).toBe(201);
    const newId = create.body.data.id;
    expect(newId).toBeTruthy();

    const update = await request(app)
      .put(`/api/admin/berita/${newId}`)
      .set("x-test-role", "Admin")
      .set("x-test-user-id", adminId)
      .send({ caption: "Caption Berita Baru Admin (Edit)" });

    expect(update.status).toBe(200);
    expect(update.body.data.caption).toBe("Caption Berita Baru Admin (Edit)");

    const remove = await request(app)
      .delete(`/api/admin/berita/${newId}`)
      .set("x-test-role", "Admin")
      .set("x-test-user-id", adminId);

    expect(remove.status).toBe(200);

    const detail = await request(app).get(`/api/berita/${newId}`);
    expect(detail.status).toBe(404);
  });
});
