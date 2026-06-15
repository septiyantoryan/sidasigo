import fs from "node:fs";
import path from "node:path";
import request from "supertest";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { JenisInovasi, Role, Status } from "@prisma/client";
import { createApp } from "../app";
import { createPrismaClient } from "../lib/prisma";

const prisma = createPrismaClient();

describe("file download integration", () => {
  const app = createApp();
  const uploadRoot = path.join(process.cwd(), "uploads");
  const fileName = `download-test-${Date.now()}.txt`;
  const filePath = path.join(uploadRoot, fileName);
  let ownerId = "";
  let otherId = "";
  let inovasiId = "";

  beforeAll(async () => {
    fs.mkdirSync(uploadRoot, { recursive: true });
    fs.writeFileSync(filePath, "hello");

    const owner = await prisma.user.create({
      data: {
        email: `file-owner-${Date.now()}@test.local`,
        username: `file-owner-${Date.now()}`,
        name: "File Owner",
        role: Role.OPD,
      },
    });
    ownerId = owner.id;

    const other = await prisma.user.create({
      data: {
        email: `file-other-${Date.now()}@test.local`,
        username: `file-other-${Date.now()}`,
        name: "File Other",
        role: Role.OPD,
      },
    });
    otherId = other.id;

    // Owner references the file via an indikator on their InovasiDaerah.
    const inovasi = await prisma.inovasiDaerah.create({
      data: {
        userId: ownerId,
        namaInovasi: "File Owner Inovasi",
        inisiator: "Dinas",
        jenisInovasi: JenisInovasi.Digital,
        bentukInovasi: "Aplikasi",
        tglUjiCoba: new Date("2024-01-01"),
        tglPenerapan: new Date("2024-02-01"),
        rancangBangun: "rb",
        tujuan: "t",
        manfaat: "m",
        hasil: "h",
        status: Status.Disetujui,
        indikator: { create: { regulasi: fileName } },
      },
    });
    inovasiId = inovasi.id;
  });

  afterAll(async () => {
    fs.rmSync(filePath, { force: true });
    await prisma.inovasiDaerah.deleteMany({ where: { id: inovasiId } });
    await prisma.user.deleteMany({ where: { id: { in: [ownerId, otherId] } } });
    await prisma.$disconnect();
  });

  it("requires authentication", async () => {
    const response = await request(app).get(`/api/files/${fileName}`);
    expect(response.status).toBe(401);
  });

  it("serves an existing file to its owner", async () => {
    const response = await request(app)
      .get(`/api/files/${fileName}`)
      .set("x-test-role", "OPD")
      .set("x-test-user-id", ownerId);

    expect(response.status).toBe(200);
    expect(response.text).toBe("hello");
  });

  it("serves any file to an admin", async () => {
    const response = await request(app)
      .get(`/api/files/${fileName}`)
      .set("x-test-role", "Admin")
      .set("x-test-user-id", "admin-test");

    expect(response.status).toBe(200);
    expect(response.text).toBe("hello");
  });

  it("forbids a non-owner from accessing the file", async () => {
    const response = await request(app)
      .get(`/api/files/${fileName}`)
      .set("x-test-role", "OPD")
      .set("x-test-user-id", otherId);

    expect(response.status).toBe(403);
    expect(response.body.error.code).toBe("FORBIDDEN");
  });

  it("returns 404 for a missing file (admin)", async () => {
    const response = await request(app)
      .get(`/api/files/does-not-exist-${Date.now()}.pdf`)
      .set("x-test-role", "Admin")
      .set("x-test-user-id", "admin-test");

    expect(response.status).toBe(404);
    expect(response.body.error.code).toBe("NOT_FOUND");
  });

  it("rejects path traversal attempts", async () => {
    const response = await request(app)
      .get("/api/files/..%2F..%2Fpackage.json")
      .set("x-test-role", "OPD")
      .set("x-test-user-id", ownerId);

    expect(response.status).toBe(400);
    expect(response.body.error.code).toBe("BAD_REQUEST");
  });

  it("returns standardized JSON for unknown routes", async () => {
    const response = await request(app).get("/api/this-route-does-not-exist");
    expect(response.status).toBe(404);
    expect(response.body).toEqual({
      success: false,
      error: {
        code: "NOT_FOUND",
        message: expect.any(String),
        details: expect.any(Array),
      },
    });
  });
});
