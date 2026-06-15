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
