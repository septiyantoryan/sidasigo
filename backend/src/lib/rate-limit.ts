import rateLimit from "express-rate-limit";

const MESSAGE = {
  success: false,
  error: {
    code: "TOO_MANY_REQUESTS",
    message: "Terlalu banyak permintaan, coba lagi nanti.",
    details: [],
  },
};

/**
 * Limiter umum untuk semua /api/* routes.
 * 100 permintaan per 15 menit per IP.
 */
export const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: MESSAGE,
});

/**
 * Limiter ketat untuk endpoint auth (login, ganti password, ganti username).
 * 50 permintaan per 15 menit per IP — mencegah brute force.
 */
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 50,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: MESSAGE,
});
