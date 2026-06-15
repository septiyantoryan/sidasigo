import { describe, expect, it } from "vitest";
import { createPrismaClient } from "../lib/prisma";

describe("prisma schema smoke", () => {
  it("has required tables", async () => {
    const prisma = createPrismaClient();
    const result = (await prisma.$queryRawUnsafe("SHOW TABLES")) as Record<string, string>[];
    const tableNames = result
      .map((row) => Object.values(row)[0])
      .filter((value): value is string => typeof value === "string")
      .map((value) => value.toLowerCase());

    expect(tableNames).toEqual(
      expect.arrayContaining([
        "user",
        "inovasidaerah",
        "indikatorinovasidaerah",
        "krenova",
      ]),
    );

    await prisma.$disconnect();
  });
});
