import { z } from "zod";

export const downloadCreateSchema = z.object({
  judul: z.string().min(1, "Judul wajib diisi"),
  filePath: z.string().min(1, "File wajib diunggah"),
});

export type DownloadCreateInput = z.infer<typeof downloadCreateSchema>;
