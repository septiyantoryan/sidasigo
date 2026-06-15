import { z } from "zod";

export const beritaCreateSchema = z.object({
  posterPath: z.string().min(1, "Poster wajib diunggah"),
  caption: z.string().min(1, "Caption wajib diisi"),
});

export type BeritaCreateInput = z.infer<typeof beritaCreateSchema>;
