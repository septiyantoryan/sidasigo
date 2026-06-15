import fs from "node:fs";
import path from "node:path";
import request from "supertest";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { JenisInovasi, Role } from "@prisma/client";
import { createApp } from "../app";
import { createPrismaClient } from "../lib/prisma";
import { createOrUpdateIndikator } from "../modules/inovasi-daerah/inovasi-daerah.service";

const prisma = createPrismaClient();

describe("indikator upload integration", () => {
  const app = createApp();
  const tmpDir = path.join(process.cwd(), "uploads", "test-temp");
  let inovasiId = "";
  let userId = "";

  beforeAll(async () => {
    fs.mkdirSync(tmpDir, { recursive: true });

    const user = await prisma.user.create({
      data: {
        email: `indikator-user-${Date.now()}@test.local`,
        username: `indikator-user-${Date.now()}`,
        name: "Indikator User",
        role: Role.OPD,
      },
    });
    userId = user.id;

    const inovasi = await prisma.inovasiDaerah.create({
      data: {
        userId,
        namaInovasi: "Upload Test",
        inisiator: "OPD",
        jenisInovasi: JenisInovasi.Digital,
        bentukInovasi: "App",
        tglUjiCoba: new Date("2025-01-01"),
        tglPenerapan: new Date("2025-02-01"),
        rancangBangun: "x".repeat(320),
        tujuan: "Tujuan",
        manfaat: "Manfaat",
        hasil: "Hasil",
      },
    });
    inovasiId = inovasi.id;
  });

  afterAll(async () => {
    await prisma.indikatorInovasiDaerah.deleteMany({ where: { inovasiDaerahId: inovasiId } });
    await prisma.inovasiDaerah.deleteMany({ where: { id: inovasiId } });
    await prisma.user.deleteMany({ where: { id: userId } });
    fs.rmSync(path.join(process.cwd(), "uploads"), { recursive: true, force: true });
    await prisma.$disconnect();
  });

  it("upserts indikator and deletes replaced file", async () => {
    const oldPath = path.join(tmpDir, "old.pdf");
    const newPath = path.join(tmpDir, "new.pdf");
    fs.writeFileSync(oldPath, "old");
    fs.writeFileSync(newPath, "new");

    await createOrUpdateIndikator(inovasiId, { regulasi: oldPath });
    const result = await createOrUpdateIndikator(inovasiId, { regulasi: newPath });

    expect(result.regulasi).toBe(newPath);
    expect(fs.existsSync(oldPath)).toBe(false);
  });

  it("rejects invalid file type", async () => {
    const txtPath = path.join(tmpDir, "invalid.txt");
    fs.writeFileSync(txtPath, "invalid");

    const response = await request(app)
      .post("/api/upload/single")
      .set("x-test-role", "OPD")
      .set("x-test-user-id", userId)
      .attach("file", txtPath);

    expect(response.status).toBe(400);
    expect(response.body.error.code).toBe("FILE_TYPE_INVALID");
  });
});
