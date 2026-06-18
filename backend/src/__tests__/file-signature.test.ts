import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { validateFileSignature } from "../middleware/file-signature";

function makeReqRes(filePath: string) {
  const calls: { status?: number; body?: unknown } = {};
  const request = { file: { path: filePath } } as never;
  const response = {
    status(code: number) {
      calls.status = code;
      return this;
    },
    json(payload: unknown) {
      calls.body = payload;
      return this;
    },
  } as never;
  return { request, response, calls };
}

describe("validateFileSignature WebP", () => {
  const tmp: string[] = [];

  afterEach(() => {
    for (const f of tmp) fs.rmSync(f, { force: true });
    tmp.length = 0;
  });

  function writeTmp(bytes: number[]): string {
    const p = path.join(os.tmpdir(), `sig-${Date.now()}-${Math.random()}.bin`);
    fs.writeFileSync(p, Buffer.from(bytes));
    tmp.push(p);
    return p;
  }

  it("accepts a valid RIFF....WEBP header", async () => {
    // "RIFF" + 4 size bytes + "WEBP"
    const p = writeTmp([
      0x52, 0x49, 0x46, 0x46, 0x00, 0x00, 0x00, 0x00, 0x57, 0x45, 0x42, 0x50,
    ]);
    const mw = validateFileSignature(["image/webp"]);
    const { request, response, calls } = makeReqRes(p);
    let nextCalled = false;
    await mw(request, response, () => {
      nextCalled = true;
    });
    expect(nextCalled).toBe(true);
    expect(calls.status).toBeUndefined();
  });

  it("rejects a RIFF container without WEBP fourcc (e.g. AVI/WAV)", async () => {
    // "RIFF" + size + "AVI " — should be rejected and file removed.
    const p = writeTmp([
      0x52, 0x49, 0x46, 0x46, 0x00, 0x00, 0x00, 0x00, 0x41, 0x56, 0x49, 0x20,
    ]);
    const mw = validateFileSignature(["image/webp"]);
    const { request, response, calls } = makeReqRes(p);
    let nextCalled = false;
    await mw(request, response, () => {
      nextCalled = true;
    });
    expect(nextCalled).toBe(false);
    expect(calls.status).toBe(400);
    expect(fs.existsSync(p)).toBe(false);
  });
});

describe("validateFileSignature Word documents", () => {
  const tmp: string[] = [];

  afterEach(() => {
    for (const f of tmp) fs.rmSync(f, { force: true });
    tmp.length = 0;
  });

  function writeTmp(bytes: number[]): string {
    const p = path.join(os.tmpdir(), `sig-${Date.now()}-${Math.random()}.bin`);
    fs.writeFileSync(p, Buffer.from(bytes));
    tmp.push(p);
    return p;
  }

  it("accepts a valid .doc (OLE2) signature", async () => {
    // OLE2 container header: D0 CF 11 E0 A1 B1 1A E1
    const p = writeTmp([
      0xd0, 0xcf, 0x11, 0xe0, 0xa1, 0xb1, 0x1a, 0xe1, 0x00, 0x00, 0x00, 0x00,
    ]);
    const mw = validateFileSignature(["application/msword"]);
    const { request, response, calls } = makeReqRes(p);
    let nextCalled = false;
    await mw(request, response, () => { nextCalled = true; });
    expect(nextCalled).toBe(true);
    expect(calls.status).toBeUndefined();
  });

  it("accepts a valid .docx (ZIP) signature", async () => {
    // ZIP container header: PK\x03\x04
    const p = writeTmp([
      0x50, 0x4b, 0x03, 0x04, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
    ]);
    const mw = validateFileSignature(["application/vnd.openxmlformats-officedocument.wordprocessingml.document"]);
    const { request, response, calls } = makeReqRes(p);
    let nextCalled = false;
    await mw(request, response, () => { nextCalled = true; });
    expect(nextCalled).toBe(true);
    expect(calls.status).toBeUndefined();
  });

  it("accepts both doc and docx with combined allowed list", async () => {
    // Test docx (ZIP) with both MIME types allowed
    const p = writeTmp([0x50, 0x4b, 0x03, 0x04, 0x00, 0x00, 0x00, 0x00]);
    const mw = validateFileSignature(["application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"]);
    const { request, response, calls } = makeReqRes(p);
    let nextCalled = false;
    await mw(request, response, () => { nextCalled = true; });
    expect(nextCalled).toBe(true);
    expect(calls.status).toBeUndefined();
  });

  it("rejects a non-document header", async () => {
    // Random bytes that don't match any signature
    const p = writeTmp([0x00, 0x01, 0x02, 0x03, 0x04, 0x05, 0x06, 0x07]);
    const mw = validateFileSignature(["application/msword"]);
    const { request, response, calls } = makeReqRes(p);
    let nextCalled = false;
    await mw(request, response, () => { nextCalled = true; });
    expect(nextCalled).toBe(false);
    expect(calls.status).toBe(400);
    expect(fs.existsSync(p)).toBe(false);
  });
});
