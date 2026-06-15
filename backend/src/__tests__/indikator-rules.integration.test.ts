import request from "supertest";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { JenisInovasi, Role, Status } from "@prisma/client";
import { createApp } from "../app";
import { createPrismaClient } from "../lib/prisma";

const prisma = createPrismaClient();

describe("indikator rules integration", () => {
  const app = createApp();
  let opdId = "";
  let pendingId = "";
  let approvedId = "";

  beforeAll(async () => {
    const opd = await prisma.user.create({
      data: {
        email: `indik-opd-${Date.now()}@test.local`,
        username: `indik-opd-${Date.now()}`,
        name: "Indikator OPD",
        role: Role.OPD,
      },
    });
    opdId = opd.id;

    const baseData = {
      userId: opdId,
      inisiator: "OPD",
      jenisInovasi: JenisInovasi.Digital,
      bentukInovasi: "App",
      tglUjiCoba: new Date("2025-01-01"),
      tglPenerapan: new Date("2025-02-01"),
      rancangBangun: "x".repeat(320),
      tujuan: "Tujuan",
      manfaat: "Manfaat",
      hasil: "Hasil",
    };

    const pending = await prisma.inovasiDaerah.create({
      data: { ...baseData, namaInovasi: "Pending Indikator", status: Status.Pending },
    });
    pendingId = pending.id;

    const approved = await prisma.inovasiDaerah.create({
      data: { ...baseData, namaInovasi: "Approved Indikator", status: Status.Disetujui },
    });
    approvedId = approved.id;
  });

  afterAll(async () => {
    await prisma.indikatorInovasiDaerah.deleteMany({
      where: { inovasiDaerahId: { in: [pendingId, approvedId] } },
    });
    await prisma.inovasiDaerah.deleteMany({
      where: { id: { in: [pendingId, approvedId] } },
    });
    await prisma.user.deleteMany({ where: { id: opdId } });
    await prisma.$disconnect();
  });

  it("allows owner to save indikator while pending", async () => {
    const response = await request(app)
      .put(`/api/inovasi-daerah/${pendingId}/indikator`)
      .set("x-test-role", "OPD")
      .set("x-test-user-id", opdId)
      .send({ regulasi: "regulasi.pdf" });

    expect(response.status).toBe(200);
    expect(response.body.data.regulasi).toBe("regulasi.pdf");
  });

  it("rejects unknown fields with 400", async () => {
    const response = await request(app)
      .put(`/api/inovasi-daerah/${pendingId}/indikator`)
      .set("x-test-role", "OPD")
      .set("x-test-user-id", opdId)
      .send({ inovasiDaerahId: "hacked", bogusField: "x" });

    expect(response.status).toBe(400);
    expect(response.body.error.code).toBe("VALIDATION_ERROR");
  });

  it("blocks indikator changes once approved", async () => {
    const response = await request(app)
      .put(`/api/inovasi-daerah/${approvedId}/indikator`)
      .set("x-test-role", "OPD")
      .set("x-test-user-id", opdId)
      .send({ regulasi: "regulasi.pdf" });

    expect(response.status).toBe(403);
    expect(response.body.error.code).toBe("FORBIDDEN");
  });
});
