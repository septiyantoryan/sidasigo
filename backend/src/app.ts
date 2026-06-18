import cors from "cors";
import path from "node:path";
import express from "express";
import morgan from "morgan";
import { toNodeHandler } from "better-auth/node";
import adminRoutes from "./modules/admin/admin.routes";
import { auth } from "./lib/auth";
import { authLimiter, globalLimiter } from "./lib/rate-limit";
import { errorHandler } from "./middleware/error";
import fileRoutes from "./modules/files/file.routes";
import inovasiDaerahRoutes from "./modules/inovasi-daerah/inovasi-daerah.routes";
import krenovaRoutes from "./modules/krenova/krenova.routes";
import risetRoutes from "./modules/riset/riset.routes";
import beritaRoutes from "./modules/berita/berita.routes";
import downloadRoutes from "./modules/download/download.routes";
import settingRoutes from "./modules/settings/setting.routes";
import uploadRoutes from "./modules/upload/upload.routes";
import userRoutes from "./modules/users/user.routes";
import { error } from "./utils/response";
import { ensureUploadDirs } from "./utils/file";

const DEFAULT_CORS_ORIGINS = [
  "http://localhost:5173",
  "http://127.0.0.1:5173",
];

function resolveAllowedOrigins() {
  const fromEnv = (process.env.CORS_ORIGIN ?? "")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);

  return Array.from(new Set([...fromEnv, ...DEFAULT_CORS_ORIGINS]));
}

export function createApp() {
  const app = express();

  // HTTP request logging (skip during tests to keep output clean).
  if (process.env.NODE_ENV !== "test") {
    app.use(morgan(process.env.NODE_ENV === "production" ? "combined" : "dev"));
  }

  // Ensure upload directories exist even on fresh clones (upload/ is gitignored).
  ensureUploadDirs();

  const allowedOrigins = resolveAllowedOrigins();

  app.use(
    cors({
      origin: (origin, callback) => {
        if (!origin) {
          callback(null, true);
          return;
        }

        if (allowedOrigins.includes(origin)) {
          callback(null, true);
          return;
        }

        callback(new Error(`CORS origin ${origin} not allowed`));
      },
      credentials: true,
    }),
  );

  // User self-service routes live under /api/auth/user but must be registered
  // BEFORE the better-auth catch-all so they are not swallowed by it. They get
  // their own JSON parser since better-auth is mounted before express.json.
  app.use("/api/auth/user", authLimiter, express.json(), userRoutes);

  // Better Auth handler must be mounted BEFORE express.json so that the
  // body is not consumed by the JSON parser.
  app.all("/api/auth/*splat", authLimiter, toNodeHandler(auth));

  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Global rate limiter for all /api/* routes.
  app.use("/api", globalLimiter);

  app.use("/api/admin", adminRoutes);
  app.use("/api/inovasi-daerah", inovasiDaerahRoutes);
  app.use("/api/krenova", krenovaRoutes);
  app.use("/api/riset", risetRoutes);
  app.use("/api/berita", beritaRoutes);
  app.use("/api/download", downloadRoutes);
  app.use("/api/settings", settingRoutes);
  app.use("/api/upload", uploadRoutes);
  app.use("/api/files", fileRoutes);

  app.use(
    "/api/public-files",
    express.static(path.join(process.cwd(), "uploads", "public")),
  );

  app.get("/health", (_req, res) => {
    res.json({ ok: true });
  });

  app.use((_req, res) => {
    error(res, "NOT_FOUND", "Route not found", 404);
  });

  app.use(errorHandler);

  return app;
}
