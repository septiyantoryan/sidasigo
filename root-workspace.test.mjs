import { existsSync, readFileSync } from "node:fs";
import test from "node:test";
import assert from "node:assert/strict";

test("root turborepo workspace is configured", () => {
  assert.equal(existsSync("package.json"), true);
  assert.equal(existsSync("turbo.json"), true);
  assert.equal(existsSync("pnpm-workspace.yaml"), true);

  const pkg = JSON.parse(readFileSync("package.json", "utf8"));
  assert.equal(pkg.scripts.dev, "turbo dev --parallel");
  assert.equal(pkg.scripts.test, "turbo test --concurrency=1");
  assert.equal(pkg.devDependencies.turbo.startsWith("^"), true);

  const workspace = readFileSync("pnpm-workspace.yaml", "utf8");
  assert.match(workspace, /client/);
  assert.match(workspace, /server/);
});
