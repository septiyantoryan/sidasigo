import { z } from "zod";

const currentYear = new Date().getFullYear();

export const risetCreateSchema = z.object({
  judulKajian: z.string().min(1, "Judul kajian wajib diisi"),
  timPeneliti: z.string().min(1, "Tim peneliti wajib diisi"),
  tahunPublikasi: z
    .number({ error: "Tahun publikasi wajib diisi" })
    .int("Tahun publikasi harus berupa angka")
    .min(1900, "Tahun publikasi tidak valid")
    .max(currentYear + 1, "Tahun publikasi tidak valid"),
  abstrak: z.string().min(1, "Abstrak wajib diisi"),
  filePath: z.string().min(1, "File wajib diunggah"),
  jenis: z.enum(["RisetKajian", "Penelitian", "PolicyBrief"]),
});

export type RisetCreateInput = z.infer<typeof risetCreateSchema>;
