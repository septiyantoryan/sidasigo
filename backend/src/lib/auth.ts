import { betterAuth } from "better-auth";
import { APIError, createAuthMiddleware } from "better-auth/api";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { username as usernamePlugin } from "better-auth/plugins";
import bcrypt from "bcryptjs";
import { prisma } from "./prisma";

const trustedOriginsFromEnv = (process.env.CORS_ORIGIN ?? "")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

const trustedOrigins = Array.from(
  new Set([
    ...trustedOriginsFromEnv,
    "http://localhost:5173",
    "http://127.0.0.1:5173",
  ]),
);

const NON_OAUTH_SIGN_IN_PATHS = new Set([
  "/sign-in/email",
  "/sign-in/username",
]);

const SOCIAL_SIGN_IN_PATHS = new Set([
  "/sign-in/social",
  "/callback/google",
  "/sign-in/google",
]);

async function findUserSummary(input: { email?: string | null; username?: string | null }) {
  if (input.email) {
    const byEmail = await prisma.user.findUnique({
      where: { email: input.email },
      select: { id: true, role: true },
    });
    if (byEmail) return byEmail;
  }

  if (input.username) {
    const byUsername = await prisma.user.findUnique({
      where: { username: input.username },
      select: { id: true, role: true },
    });
    if (byUsername) return byUsername;
  }

  return null;
}

export const auth = betterAuth({
  baseURL: process.env.BETTER_AUTH_URL ?? "http://localhost:3000",
  secret: process.env.BETTER_AUTH_SECRET ?? "dev-secret-replace-me",
  database: prismaAdapter(prisma, {
    provider: "mysql",
  }),
  trustedOrigins,
  emailAndPassword: {
    enabled: true,
    autoSignIn: true,
    password: {
      hash: (password: string) => Promise.resolve(bcrypt.hashSync(password, 10)),
      verify: ({ password, hash }: { password: string; hash: string }) =>
        Promise.resolve(bcrypt.compareSync(password, hash)),
    },
  },
  socialProviders:
    process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_ID !== "replace-me"
      ? {
        google: {
          clientId: process.env.GOOGLE_CLIENT_ID,
          clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
        },
      }
      : undefined,
  user: {
    additionalFields: {
      role: {
        type: ["Admin", "OPD", "Masyarakat"],
        required: false,
        defaultValue: "Masyarakat",
        input: false,
      },
    },
  },
  advanced: {
    cookiePrefix: "sidasi-go",
  },
  hooks: {
    before: createAuthMiddleware(async (ctx) => {
      const path = ctx.path;

      // Block Masyarakat from credential-based sign-in.
      if (NON_OAUTH_SIGN_IN_PATHS.has(path)) {
        const body = (ctx.body ?? {}) as {
          email?: string;
          username?: string;
        };
        const target = await findUserSummary({
          email: body.email,
          username: body.username,
        });
        if (target?.role === "Masyarakat") {
          throw new APIError("FORBIDDEN", {
            message:
              "Akun Masyarakat hanya dapat masuk melalui Google Sign-In.",
          });
        }
      }

      // Block Admin/OPD from logging in via Google.
      // NOTE: at /sign-in/social the email is not yet known and at
      // /callback/google the body is empty, so this body-based check is a
      // best-effort early guard only. The authoritative enforcement lives in
      // the databaseHooks.session.create.before hook below, which runs once
      // the user is resolved during the OAuth callback.
      if (SOCIAL_SIGN_IN_PATHS.has(path)) {
        const body = (ctx.body ?? {}) as {
          provider?: string;
          email?: string;
        };
        const provider = body.provider;
        if (provider && provider !== "google") {
          // we only restrict google guard; other providers proceed normally.
          return;
        }
        const email = body.email;
        if (email) {
          const target = await findUserSummary({ email });
          if (target && target.role !== "Masyarakat") {
            throw new APIError("FORBIDDEN", {
              message:
                "Akun Admin/OPD harus masuk menggunakan username & password.",
            });
          }
        }
      }
    }),
  },
  databaseHooks: {
    session: {
      create: {
        before: async (session, ctx) => {
          // Authoritative guard: block Admin/OPD from obtaining a session via
          // the Google OAuth callback. Credential logins use other paths and
          // are unaffected.
          const path = ctx?.path ?? "";
          const isGoogleCallback =
            path.includes("/callback/google") || path.includes("/callback/:id");
          if (!isGoogleCallback) return;

          const user = await prisma.user.findUnique({
            where: { id: session.userId },
            select: { role: true },
          });
          if (user && user.role !== "Masyarakat") {
            throw new APIError("FORBIDDEN", {
              message:
                "Akun Admin/OPD harus masuk menggunakan username & password.",
            });
          }
        },
      },
    },
  },
  plugins: [
    usernamePlugin({
      minUsernameLength: 3,
      maxUsernameLength: 64,
      usernameValidator: (value) => /^[a-z0-9]+$/.test(value),
    }),
  ],
});

export type AuthType = typeof auth;
