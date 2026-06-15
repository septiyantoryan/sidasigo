import express from "express";
import request from "supertest";
import { describe, expect, it } from "vitest";
import { z } from "zod";
import { validate } from "../middleware/validate";

describe("error response contract", () => {
  it("returns standardized VALIDATION_ERROR payload", async () => {
    const app = express();
    app.use(express.json());

    app.post(
      "/validation",
      validate(
        z.object({
          name: z.string().min(1),
        }),
      ),
      (_req, res) => {
        res.status(201).json({ success: true });
      },
    );

    const response = await request(app).post("/validation").send({ name: "" });

    expect(response.status).toBe(400);
    expect(response.body).toEqual({
      success: false,
      error: {
        code: "VALIDATION_ERROR",
        message: expect.any(String),
        details: expect.any(Array),
      },
    });
  });
});
