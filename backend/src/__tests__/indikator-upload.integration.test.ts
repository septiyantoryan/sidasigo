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
    fs.rmSync(tmpDir, { recursive: true, force: true });
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

  it("accepts .doc upload", async () => {
    // OLE2 container magic bytes
    const docBuf = Buffer.from([0xd0, 0xcf, 0x11, 0xe0, 0xa1, 0xb1, 0x1a, 0xe1]);
    const docPath = path.join(tmpDir, "test.doc");
    fs.writeFileSync(docPath, docBuf);

    const response = await request(app)
      .post("/api/upload/single")
      .set("x-test-role", "OPD")
      .set("x-test-user-id", userId)
      .attach("file", docPath);

    expect(response.status).toBe(200);
    expect(response.body.data.path).toBeTruthy();
  });

  it("accepts .docx upload", async () => {
    // ZIP container magic bytes
    const docxBuf = Buffer.from([0x50, 0x4b, 0x03, 0x04, 0x00, 0x00, 0x00, 0x00]);
    const docxPath = path.join(tmpDir, "test.docx");
    fs.writeFileSync(docxPath, docxBuf);

    const response = await request(app)
      .post("/api/upload/single")
      .set("x-test-role", "OPD")
      .set("x-test-user-id", userId)
      .attach("file", docxPath);

    expect(response.status).toBe(200);
    expect(response.body.data.path).toBeTruthy();
  });

  it("creates attachment records via indikator endpoint", async () => {
    const attPath = path.join(tmpDir, `att-${Date.now()}.pdf`);
    fs.writeFileSync(attPath, "attachment-data");

    const response = await request(app)
      .put(`/api/inovasi-daerah/${inovasiId}/indikator`)
      .set("x-test-role", "OPD")
      .set("x-test-user-id", userId)
      .send({
        attachments: [{ field: "regulasi", path: attPath }],
      });

    expect(response.status).toBe(200);

    // Verify attachment was created
    const atts = await prisma.indikatorAttachment.findMany({
      where: { inovasiDaerahId: inovasiId },
    });
    expect(atts.length).toBeGreaterThan(0);
    expect(atts.some((a) => a.field === "regulasi")).toBe(true);
  });
});
