import { z } from "zod";

const base = {
  posterPath: z.string().min(1, "Poster wajib diunggah"),
  caption: z.string().min(1, "Caption wajib diisi"),
};

export const createBeritaSchema = z.object(base);

export const updateBeritaSchema = z
  .object(base)
  .partial()
  .refine((obj) => Object.keys(obj).length > 0, {
    message: "Tidak ada data untuk diperbarui",
  });

export type CreateBeritaInput = z.infer<typeof createBeritaSchema>;
export type UpdateBeritaInput = z.infer<typeof updateBeritaSchema>;
