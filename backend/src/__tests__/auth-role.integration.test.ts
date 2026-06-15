import request from "supertest";
import { describe, expect, it } from "vitest";
import { createApp } from "../app";

describe("auth and role middleware", () => {
  it("rejects anonymous access to protected endpoint", async () => {
    const app = createApp();
    const response = await request(app).get("/api/admin/dashboard");

    expect(response.status).toBe(401);
  });

  it("rejects non-admin role on admin endpoint", async () => {
    const app = createApp();
    const response = await request(app)
      .get("/api/admin/dashboard")
      .set("x-test-role", "Masyarakat")
      .set("x-test-user-id", "u-1");

    expect(response.status).toBe(403);
  });
});
