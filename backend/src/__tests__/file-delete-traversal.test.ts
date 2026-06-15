import fs from "node:fs";
import path from "node:path";
import { afterAll, describe, expect, it } from "vitest";
import { deleteFile, uploadRoot } from "../utils/file";

describe("deleteFile path traversal guard", () => {
  const insideName = `del-inside-${Date.now()}.txt`;
  const insidePath = path.join(uploadRoot, insideName);
  const outsidePath = path.join(process.cwd(), `del-outside-${Date.now()}.txt`);

  afterAll(() => {
    fs.rmSync(insidePath, { force: true });
    fs.rmSync(outsidePath, { force: true });
  });

  it("deletes a file inside the upload root", async () => {
    fs.mkdirSync(uploadRoot, { recursive: true });
    fs.writeFileSync(insidePath, "x");
    await deleteFile(insideName);
    expect(fs.existsSync(insidePath)).toBe(false);
  });

  it("does NOT delete a file outside uploads via absolute path", async () => {
    fs.writeFileSync(outsidePath, "secret");
    await deleteFile(outsidePath);
    expect(fs.existsSync(outsidePath)).toBe(true);
  });

  it("does NOT delete via traversal sequences", async () => {
    fs.writeFileSync(outsidePath, "secret");
    await deleteFile("../" + path.basename(outsidePath));
    expect(fs.existsSync(outsidePath)).toBe(true);
  });

  it("ignores empty value", async () => {
    await expect(deleteFile("")).resolves.toBeUndefined();
  });
});
