import { z } from "zod";

const base = {
  judul: z.string().min(1, "Judul wajib diisi"),
  filePath: z.string().min(1, "File wajib diunggah"),
};

export const createDownloadSchema = z.object(base);

export const updateDownloadSchema = z
  .object(base)
  .partial()
  .refine((obj) => Object.keys(obj).length > 0, {
    message: "Tidak ada data untuk diperbarui",
  });

export type CreateDownloadInput = z.infer<typeof createDownloadSchema>;
export type UpdateDownloadInput = z.infer<typeof updateDownloadSchema>;
