import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const srcDir = join(process.cwd(), "src");
const modulesDir = join(srcDir, "modules");

function listFiles(dir: string): string[] {
  return readdirSync(dir).flatMap((entry) => {
    const path = join(dir, entry);
    return statSync(path).isDirectory() ? listFiles(path) : [path];
  });
}

describe("backend module architecture", () => {
  it("uses feature modules instead of global layer folders", () => {
    expect(existsSync(modulesDir)).toBe(true);
    expect(existsSync(join(srcDir, "controllers"))).toBe(false);
    expect(existsSync(join(srcDir, "routes"))).toBe(false);
    expect(existsSync(join(srcDir, "services"))).toBe(false);
    expect(existsSync(join(srcDir, "validators"))).toBe(false);
  });

  it("keeps Prisma calls inside repositories", () => {
    const serviceFiles = listFiles(modulesDir).filter((file) => file.endsWith(".service.ts"));
    const offenders = serviceFiles.filter((file) => readFileSync(file, "utf8").includes("prisma."));

    expect(offenders).toEqual([]);
  });
});
