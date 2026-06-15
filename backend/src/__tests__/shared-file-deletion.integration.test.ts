import fs from "node:fs";
import path from "node:path";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { createPrismaClient } from "../lib/prisma";
import { deleteDownload } from "../modules/download/download.service";
import { publicUploadRoot } from "../utils/file";

const prisma = createPrismaClient();

describe("shared public-file deletion guard (download)", () => {
  const fileName = `shared-${Date.now()}.pdf`;
  const sharedPath = `/api/public-files/${fileName}`;
  const diskPath = path.join(publicUploadRoot, fileName);
  let idA = "";
  let idB = "";

  beforeAll(async () => {
    fs.mkdirSync(publicUploadRoot, { recursive: true });
    fs.writeFileSync(diskPath, "%PDF-1.4");

    const a = await prisma.download.create({
      data: { judul: "Doc A", filePath: sharedPath },
    });
    const b = await prisma.download.create({
      data: { judul: "Doc B", filePath: sharedPath },
    });
    idA = a.id;
    idB = b.id;
  });

  afterAll(async () => {
    await prisma.download.deleteMany({ where: { id: { in: [idA, idB] } } });
    fs.rmSync(diskPath, { force: true });
    await prisma.$disconnect();
  });

  it("keeps the file on disk while another record still references it", async () => {
    await deleteDownload(idA);
    expect(fs.existsSync(diskPath)).toBe(true);
  });

  it("deletes the file once the last referencing record is removed", async () => {
    await deleteDownload(idB);
    expect(fs.existsSync(diskPath)).toBe(false);
  });
});
